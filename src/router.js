import { createRouter, createWebHashHistory } from 'vue-router'
import layout from './layout.vue'
import editor from './editor/index.vue'
import menuList  from './editor/menuConfig.js'
import userCenter from './editor/comp/userCenter.vue'
const routes = [
  {
    path: '',
    component: layout,
    redirect: '/editor',
    children: [
      {
        name: 'editor',
        path: '/editor',
        component: editor
      }
    ]
   
  },
  {
    path: '/user-center',
    component: userCenter
  },
   ...genRoutes(menuList.value)//三个点... 是把数组展开成一个个的对象
]
// 参考写法：// router/index.js
// const routes = [
//   { path:'/', redirect:'/home' },
//   { path:'/home', component:()=>import('@/views/home.vue') },
//   { path:'/system/user', component:()=>import('@/views/system/user.vue') },
//   { path:'/system/role', component:()=>import('@/views/system/role.vue') },
//   { path:'/user-center', component:()=>import('@/views/userCenter.vue') },
//   { path: '/:pathMatch(.*)*', redirect: '/home' }
// ]
//  路由写法可以是 name + id;这里没用
// { 
//   path: '/home/:id',                    // ← 加 :id
//   name: 'Home',                         // ← 加 name
//   component: () => import('@/views/home.vue') 
// }

// 404兜底，如果是其他没有匹配到的路径，重定向到首页
routes.push({ path: '/:pathMatch(.*)*', redirect: '/' })

// // 打印一下
// routes.forEach(route => {
//   const path = route.path || '';
//   const component = route.component || '';
//   console.log('路由配置：', path, component)
// })
const router = createRouter({ history: createWebHashHistory(), routes })

// 递归把配置转成路由数组
function genRoutes(list) {
  let res = []
  list.forEach(item => {
    if(item.path && item.component){
      res.push({
        path: item.path,
        component: item.component
      })
    }
    if(item.page && item.component){
      res.push({
        path: item.page,
        component: item.component,
        })
    }
    //递归
    if(item.children){
      res.push(...genRoutes(item.children))
    }
  })
  return res
}

export default router
