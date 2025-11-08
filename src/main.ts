import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createHead } from '@unhead/vue/client'

import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'

import router from './router'
import '@/styles/reset.css'
import 'virtual:uno.css'
import '@/styles/element.scss'

import '@/styles/index.scss'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(createPinia())
const head = createHead()
app.use(head)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
