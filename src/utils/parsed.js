const {readFileSync} = require('fs')
const path = require('path')
const VueTemplateCompiler = require('vue-template-compiler')
const glob = require('glob')
const globBasePlugin = require('glob-base')
const {getRouteName} = require('./index')

//解析vue文件
exports.parsedVueTemplate = path => {
  let _result = {}

  const fileStr = readFileSync(path, 'utf-8')
  const parsed = VueTemplateCompiler.parseComponent(fileStr)
  //获取自定义信息
  const routeConfigBlock = parsed.customBlocks.find(b => b.type === 'route-config')

  if (routeConfigBlock) {
    try {
      _result = JSON.parse(routeConfigBlock.content)
    } catch (err) {
      _result = {}
    }
  }
  return _result
}

//匹配路径
exports.parsedGlobPattern = ({pages, layouts, dynamicImport, dynamicRoute, layoutName, pageImportPrefix, layoutImportPrefix}) => {
  const patternPath = (pattern, type) => {
    let _result = []
    if (!pattern) return _result

    return glob.sync(pattern).map(item => {
      const globBase = globBasePlugin(pattern).base
      const isLayout = type === 'layout'
      const prefix = isLayout ? layoutImportPrefix : pageImportPrefix

      const relativePath = path.relative(globBase, item).split(path.sep).join('/').replace(/\/?index.vue/, '')

      return {
        type,
        name: getRouteName((relativePath ? relativePath : 'index') + (isLayout ? '/layout' : '')),
        importPath: prefix + (relativePath ? `/${relativePath}` : ''),
        realPath: item,
        routePath: `/${relativePath.replace(/_/g, ':')}`,
        attrs: {...{dynamicImport, dynamicRoute, layoutName}, ...exports.parsedVueTemplate(item)}
      }
    })
  }
  return patternPath(pages, 'page').concat(patternPath(layouts, 'layout'))
}
