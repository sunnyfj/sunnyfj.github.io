import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createHead } from '@unhead/vue/client'

import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'

import router from './router'

import 'dayjs/locale/zh-cn'

import 'element-plus/dist/index.css'
import '@/styles/reset.css'

import '@/styles/index.css'
import './styles/prose.css'
import './styles/markdown.css'

import 'virtual:uno.css'

const app = createApp(App)

app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.use(createPinia())
const head = createHead()
app.use(head)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
