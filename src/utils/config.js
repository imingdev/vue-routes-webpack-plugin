/**
 * @intro: 配置.
 */
const path = require('path')

const resolve = dir => path.resolve(__dirname, '../..', dir)

module.exports = {
  //页面glob
  pages: resolve('src/pages/**/index.vue'),
  //布局glob
  layouts: resolve('src/layouts/**/index.vue'),
  //布局名称
  layoutName: null,
  //导入前缀
  importPrefix: 'src',
  //是否是异步加载路由
  dynamicImport: false,
  //是否是动态路由，动态路由不导出默认设置
  dynamicRoute: false
}
