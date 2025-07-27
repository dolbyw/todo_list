import { createApp } from 'vue'
import './style.css'
import './styles/liquid-glass.css'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

// 注册Service Worker以启用PWA离线功能
const updateSW = registerSW({
  onNeedRefresh() {
    // 当有新版本可用时，可以在这里添加提示用户更新的逻辑
    console.log('新版本可用，请刷新页面获取最新版本')
  },
  onOfflineReady() {
    // 当应用准备好离线使用时
    console.log('应用已准备好离线使用')
  },
})

// 创建Vue应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')
