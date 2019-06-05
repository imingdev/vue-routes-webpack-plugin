const path = require('path')
const {existsSync, readFileSync, writeFileSync} = require('fs')
const {isString} = require('./utils')
const defaultConfig = require('./utils/config')
const GenerateRoutes = require('./route')
const hash = require('hash-sum')
const watch = require('watch')
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
    if (compiler.hooks) {
      // Support Webpack >= 4
      compiler.hooks.run.tap(name, generate)
      compiler.hooks.watchRun.tap(name, generate)
    } else {
      // Support Webpack < 4
      compiler.plugin('run', generate)
      compiler.plugin("watch-run", generate)
    }

    process.env.NODE_ENV === 'development' && Promise.resolve()
      .then(() => {
        watch.createMonitor(globBasePlugin(this.config.pages).base, monitor => {
          monitor.on('created', () => {
            generate(null, null)
          })
        })
      })
  }

  generate(compilation, callback) {
    const code = GenerateRoutes(this.config)
    const output = this.config.output

    if (!existsSync(output) || hash(readFileSync(output, 'utf8')) !== hash(code)) {
      writeFileSync(output, code, {encoding: 'utf8'})
    }

    callback && callback()
  }
}
