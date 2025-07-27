<script setup lang="ts">
import { onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import TaskList from '../components/TaskList.vue'
import ResizablePanel from '../components/ResizablePanel.vue'
import { useStore } from '../composables/useStore'

const { isInitialized, initApp } = useStore()

/**
 * 组件挂载时初始化应用
 */
onMounted(async () => {
  await initApp()
})
</script>

<template>
  <div class="h-screen relative">
    <!-- 可调整大小的面板布局 -->
    <ResizablePanel 
      :initial-left-width="280"
      :min-left-width="200"
      :max-left-width="500"
      class="relative z-20"
    >
      <!-- 左侧侧边栏 -->
      <template #left>
        <Sidebar />
      </template>
      
      <!-- 右侧主内容区 -->
      <template #right>
        <TaskList />
      </template>
    </ResizablePanel>

    <!-- 加载状态 -->
    <div 
      v-if="!isInitialized" 
      class="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-200">正在加载应用...</p>
      </div>
    </div>
  </div>
</template>
