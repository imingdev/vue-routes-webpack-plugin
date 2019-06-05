const {getComponentName, getRouteName} = require('./index')

//生成import
exports.generateImports = imports => {
  return imports.map(({attrs: {dynamicImport, webpackChunkName}, routePath, realPath, relativePath}) => {
    const componentName = getComponentName(realPath)
    if (dynamicImport) {
      return `const ${componentName} = () => import(/* webpackChunkName: "${webpackChunkName || routePath}" */ '${relativePath}')`
    } else {
      return `import ${componentName} from '${relativePath}'`
    }
  })
}

//生成路由对象
exports.generateRouteObjects = objects => {
  return objects.map(({realPath, name, routePath, type, attrs: {meta}}) => {
    const componentName = getComponentName(realPath)
    const _meta = meta ? `,\n meta: ${JSON.stringify(meta)}` : ''

    return `export const ${name} = {
      name: ${componentName}.name,
      path: '${type === 'layout' ? '' : routePath}',
      component: ${componentName}${_meta}
     }`
  })
}

//生成默认的路由对象
exports.generateDefaultRoute = pageArr => {
  let _result = []
  //得到layout
  const layoutArr = pageArr.filter(({type}) => type === 'layout')
  //得到没有layout的路由
  const noLayoutPageArr = pageArr.filter(({attrs: {layoutName}, type}) => (!layoutName && type === 'page'))
  //得到有layout的路由数组
  const layoutPageArr = pageArr.filter(({attrs: {layoutName}, type}) => (!!layoutName && type === 'page'))


  _result = noLayoutPageArr.map(({name}) => name)

  if (!layoutPageArr.length) {
    //如果没有布局的页面直接返回
    return _result
  }

  layoutArr.forEach(({name, attrs: {meta}}) => {
    let childrenArr = []
    layoutPageArr.forEach(({name: pageName, attrs: {layoutName}}) => {
      if (name === getRouteName(`/${layoutName}/layout`)) {
        childrenArr.push(pageName)
      }
    })
    if (childrenArr.length) {
      const _meta = meta ? `,\n meta: ${name}.meta` : ''
      const _children = `,\n children: [${childrenArr}]`

      _result.push(`{
        name: ${name}.name,
        path: ${name}.path,
        component: ${name}.component${_meta}${_children}
      }`)
    }
  })

  return _result
}
