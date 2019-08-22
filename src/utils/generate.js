const {getComponentName, getRouteName} = require('./index')

//生成import
exports.generateImports = imports => {
  return imports.map(({attrs: {dynamicImport, webpackChunkName}, routePath, realPath, importPath}) => {
    const componentName = getComponentName(realPath)
    if (dynamicImport) {
      return `const ${componentName} = () => import(/* webpackChunkName: "${webpackChunkName || routePath}" */ '${importPath}')`
    } else {
      return `import ${componentName} from '${importPath}'`
    }
  })
}

//生成路由对象
exports.generateRouteObjects = objects => {
  return objects.map(({realPath, name, routePath, type, attrs: {meta, path, redirect, alias}}) => {
    const componentName = getComponentName(realPath)
    const isLayout = type === 'layout'

    const _redirect = redirect ? `,\n redirect: '${redirect}'` : ''
    const _alias = alias ? `,\n alias: '${alias}'` : ''
    const _meta = meta ? `,\n meta: ${JSON.stringify(meta)}` : ''

    return `export const ${name} = {
      name: ${componentName}.name,
      path: '${isLayout ? '' : (path ? path : routePath)}',
      component: ${componentName}${_redirect}${_alias}${_meta}
     }`
  })
}

// 生成导出路由数组
const generateImportRoutes = (pageArr, isDynamicRoute = false) => {
  //得到layout
  const layoutArr = pageArr.filter(({type}) => type === 'layout')
  //得到没有layout的路由
  const noLayoutPageArr = pageArr.filter(({attrs: {layoutName, dynamicRoute}, type}) => ((!layoutName && dynamicRoute === isDynamicRoute) && type === 'page'))
  //得到有layout的路由数组
  const layoutPageArr = pageArr.filter(({attrs: {layoutName, dynamicRoute}, type}) => ((!!layoutName && dynamicRoute === isDynamicRoute) && type === 'page'))

  let _result = noLayoutPageArr.map(({name}) => name)

  if (!layoutPageArr.length) {
    //如果没有布局的页面直接返回
    return _result;
  }

  layoutArr.forEach(({name, attrs: {meta, redirect, alias}}) => {
    let childrenArr = []
    layoutPageArr.forEach(({name: pageName, attrs: {layoutName}}) => {
      if (name === getRouteName(`/${layoutName}/layout`)) {
        childrenArr.push(pageName)
      }
    })
    if (childrenArr.length) {
      const _redirect = redirect ? `,\n redirect: ${name}.redirect` : ''
      const _alias = alias ? `,\n alias: ${name}.alias` : ''
      const _meta = meta ? `,\n meta: ${name}.meta` : ''
      const _children = `,\n children: [${childrenArr}]`

      _result.push(`{
        name: ${name}.name,
        path: ${name}.path,
        component: ${name}.component${_redirect}${_alias}${_meta}${_children}
      }`)
    }
  })

  return _result
}

//生成默认的路由对象
exports.generateDefaultRoute = pageArr => generateImportRoutes(pageArr, false)

// 生成异步的路由对象
exports.generateAsyncRoute = pageArr => generateImportRoutes(pageArr, true)
