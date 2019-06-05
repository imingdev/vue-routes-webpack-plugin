/**
 * @intro: 路由生成类.
 */
const {writeFileSync} = require('fs')
const beautifyJs = require('js-beautify').js
const defaultConfig = require('./utils/config')
const {isString} = require('./utils/index')
const {parsedGlobPattern} = require('./utils/parsed')
const {generateImports, generateRouteObjects, generateDefaultRoute} = require('./utils/generate')

module.exports = (options = {}) => {
  if (isString(options)) options = {pages: options}
  const config = {...defaultConfig, ...options}

  let pageArr = parsedGlobPattern(config)

  let importArr = generateImports(pageArr)

  let routeObjectArr = generateRouteObjects(pageArr)

  let defaultRoutes = generateDefaultRoute(pageArr)

  const outputStr = importArr.join('\n') + '\n\n' + routeObjectArr.join('\n') + '\n\nexport default [' + defaultRoutes + ']'
  return beautifyJs(outputStr, {indent_size: 2})
}
