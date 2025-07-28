<template>
  <div v-if="showPrompt" class="fixed bottom-4 right-4 z-50 p-4 bg-white rounded-lg shadow-lg flex items-center space-x-4 dark:bg-gray-800">
    <div class="flex-shrink-0">
      <img class="h-10 w-10" src="/pwa-192x192.png" alt="App Logo">
    </div>
    <div>
      <p class="font-semibold text-gray-900 dark:text-white">安装 Todo App</p>
      <p class="text-sm text-gray-500 dark:text-gray-300">将应用添加到主屏幕，享受离线使用体验。</p>
    </div>
    <div class="flex space-x-2">
      <button @click="installPWA" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        安装
      </button>
      <button @click="dismissPrompt" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
        稍后
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

/**
 * @description 控制安装提示是否显示的响应式变量
 */
const showPrompt = ref(false)

/**
 * @description 存储 'beforeinstallprompt' 事件的引用
 */
let deferredPrompt: any = null

/**
 * @description 组件挂载后，添加 'beforeinstallprompt' 事件监听器
 */
onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止浏览器默认的安装提示
    e.preventDefault()
    // 保存事件，以便稍后触发
    deferredPrompt = e
    // 显示我们的自定义安装提示
    showPrompt.value = true
    console.log('用户接受了安装提示')
  })
})

/**
 * @description 处理安装PWA的逻辑
 */
const installPWA = () => {
  // 隐藏我们的自定义安装提示
  showPrompt.value = false
  if (!deferredPrompt) {
    return
  }
  // 显示浏览器内置的安装提示
  deferredPrompt.prompt()
  // 等待用户的响应
  deferredPrompt.userChoice.then((choiceResult: any) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('用户接受了安装提示')
    } else {
      console.log('用户拒绝了安装提示')
    }
    deferredPrompt = null
  })
}

/**
 * @description 处理用户关闭安装提示的逻辑
 */
const dismissPrompt = () => {
  showPrompt.value = false
}
</script>