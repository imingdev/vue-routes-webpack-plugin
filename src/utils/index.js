const hash = require('hash-sum')

const getObjectType = obj => Object.prototype.toString.call(obj).slice(8, -1)

/**
 * 判断是否是对象
 * @param obj
 * @returns {boolean}
 */
exports.isObject = obj => !!obj && getObjectType(obj) === 'Object'
/**
 * 判断是否是数组
 * @param obj
 * @returns {boolean}
 */
exports.isArray = obj => !!obj && getObjectType(obj) === 'Array'
/**
 * 判断是否是字符串
 * @param obj
 * @returns {boolean}
 */
exports.isString = obj => !!obj && getObjectType(obj) === 'String'

//根据路径获取路由名称
exports.getRouteName = (path) => {
  if (path === '/') path = 'index'
  path = `/${path}`
  return path
    .replace(new RegExp('/(\\w)', 'g'), str => str.slice(1).toUpperCase())
    .replace(new RegExp('_(\\w)', 'g'), str => str.slice(1).toUpperCase())
    .replace(/\//g, '')
}

//获取组件名称
exports.getComponentName = path => `_${hash(path)}`
