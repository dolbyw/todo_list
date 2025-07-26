<template>
  <div 
    v-if="showHelp"
    class="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-fade-in"
  >
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">面板调整快捷键</h3>
      <button 
        @click="hideHelp"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
    
    <div class="space-y-2 text-xs text-gray-600 dark:text-gray-400">
      <div class="flex items-center justify-between">
        <span>缩小面板</span>
        <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl + [</kbd>
      </div>
      <div class="flex items-center justify-between">
        <span>放大面板</span>
        <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl + ]</kbd>
      </div>
      <div class="flex items-center justify-between">
        <span>重置宽度</span>
        <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl + 0</kbd>
      </div>
      <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
        <span class="text-gray-500 dark:text-gray-500">拖拽中间分割线也可调整大小</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

const showHelp = ref(false)

/**
 * 显示帮助
 */
const showHelpDialog = () => {
  showHelp.value = true
  // 5秒后自动隐藏
  setTimeout(() => {
    showHelp.value = false
  }, 5000)
}

/**
 * 隐藏帮助
 */
const hideHelp = () => {
  showHelp.value = false
}

// 暴露方法给父组件
defineExpose({
  showHelpDialog
})

// 组件挂载后延迟显示帮助
onMounted(() => {
  setTimeout(() => {
    showHelpDialog()
  }, 2000)
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}
</style>