const path = require('path')
const {existsSync, readFileSync, writeFileSync} = require('fs')
const {isString} = require('./utils')
const defaultConfig = require('./utils/config')
const GenerateRoutes = require('./route')
const hash = require('hash-sum')
const chokidar = require('chokidar')
const globBasePlugin = require('glob-base')

const resolve = dir => path.resolve(__dirname, '../..', dir)

module.exports = class VueRoutesAutoWebpack {
  constructor(options) {
    if (isString(options)) options = {pages: options}
    this.config = {
      ...defaultConfig,
      //路由配置导出路径
      output: resolve('src/router/vue-auto-routes.js'),
      ...options
    }
  }

  /**
   * webpack插件调用
   * @param compiler
   */
  apply(compiler) {
    const generate = this.generate.bind(this)
    const name = this.constructor.name
    const {pages, layouts} = this.config
    const pagesBase = globBasePlugin(pages).base
    const layoutsBase = layouts ? globBasePlugin(layouts).base : null
    const isDevelopment = (process.env.NODE_ENV || 'development') === 'development'

    if (compiler.hooks) {
      // Support Webpack >= 4
      compiler.hooks.run.tap(name, generate)
    } else {
      // Support Webpack < 4
      compiler.plugin('run', generate)
    }

    //监听文件改变重新生成
    isDevelopment && Promise.resolve()
      .then(() => {
        chokidar
          .watch(layoutsBase ? [pagesBase, layoutsBase] : pagesBase, {ignoreInitial: true})
          .on('add', generate)
          .on('change', generate)
          .on('unlink', generate)
      })
  }

  generate(compilation, callback) {
    const code = GenerateRoutes(this.config)
    const output = this.config.output
    const encoding = 'utf8'

    if (!existsSync(output) || hash(readFileSync(output, encoding)) !== hash(code)) {
      writeFileSync(output, code, {encoding})
    }

    callback && callback()
  }
}
