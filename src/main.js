import { createApp,ref } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import router from './router.js'

//两者都是 Vue 3 插件系统的标准用法：app.use(plugin, options) 会调用插件的 install 方法完成注册。

const app = createApp(App)//需要 App.vue 作为根组件，才能使用 vue-router 的 <router-view> 组件来显示路由内容。

// const app=createApp({
//     setup() {
//       const message = ref('Hello Vue 1111111111111')
//       return { message }
//     }
//   });

app.use(ElementPlus, { locale: zhCn });//UI 组件库	全局可用组件 + 中文显示
for (const [key, component] of Object.entries(ElementPlusIconsVue)) app.component(key, component)

app.use(router);//路由插件	启用页面跳转和路由视图
app.mount('#app');