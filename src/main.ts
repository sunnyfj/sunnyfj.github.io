// Element Plus
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
// Pinia
import { createPinia } from 'pinia'
// Vue
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 引入 unocss 样式
import '@/styles/reset.css'
import 'virtual:uno.css'
import '@/styles/element.scss'
import '@/styles/index.scss'

// 实例化 Vue 应用
const app = createApp(App)

// 全局注册 插件
app.use(router)
app.use(ElementPlus)
app.use(createPinia())

// 全局注册 Element Plus 图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载 Vue 应用
app.mount('#app')
