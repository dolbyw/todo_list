<template>
  <div class="flex h-full relative">
    <!-- 左侧面板 -->
    <div 
      class="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-200"
      :style="{ width: `${leftPanelWidth}px` }"
    >
      <slot name="left" />
    </div>

    <!-- 可拖拽的分割线 -->
    <div 
      class="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-400 cursor-col-resize transition-all duration-200 relative group flex items-center justify-center"
      @mousedown="startResize"
    >
      <!-- 分割线指示器 -->
      <div class="w-0.5 h-8 bg-gray-400 dark:bg-gray-500 group-hover:bg-white transition-colors duration-200 rounded-full"></div>
      
      <!-- 拖拽提示图标 -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div class="w-5 h-5 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
          <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="flex-1 min-w-0">
      <slot name="right" />
    </div>

    <!-- 拖拽时的宽度提示 -->
    <div 
      v-if="isResizing"
      class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-3 py-1 rounded-lg text-sm font-medium z-50 pointer-events-none"
    >
      {{ leftPanelWidth }}px
    </div>

    <!-- 帮助提示 -->
    <ResizeHelp ref="helpRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ResizeHelp from './ResizeHelp.vue'

interface Props {
  initialLeftWidth?: number
  minLeftWidth?: number
  maxLeftWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialLeftWidth: 320,
  minLeftWidth: 200,
  maxLeftWidth: 600
})

// 响应式数据
const leftPanelWidth = ref(props.initialLeftWidth)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)
const helpRef = ref<InstanceType<typeof ResizeHelp> | null>(null)

/**
 * 开始拖拽调整大小
 */
const startResize = (event: MouseEvent) => {
  isResizing.value = true
  startX.value = event.clientX
  startWidth.value = leftPanelWidth.value
  
  // 添加全局事件监听
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  
  // 防止文本选择
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}

/**
 * 处理拖拽调整
 */
const handleResize = (event: MouseEvent) => {
  if (!isResizing.value) return
  
  const deltaX = event.clientX - startX.value
  const newWidth = startWidth.value + deltaX
  
  // 限制宽度范围
  leftPanelWidth.value = Math.max(
    props.minLeftWidth,
    Math.min(props.maxLeftWidth, newWidth)
  )
}

/**
 * 停止拖拽调整
 */
const stopResize = () => {
  isResizing.value = false
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  
  // 恢复默认样式
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  
  // 保存宽度到本地存储
  localStorage.setItem('leftPanelWidth', leftPanelWidth.value.toString())
}

/**
 * 从本地存储加载宽度设置
 */
const loadWidthFromStorage = () => {
  const savedWidth = localStorage.getItem('leftPanelWidth')
  if (savedWidth) {
    const width = parseInt(savedWidth, 10)
    if (width >= props.minLeftWidth && width <= props.maxLeftWidth) {
      leftPanelWidth.value = width
    }
  }
}

/**
 * 键盘快捷键处理
 */
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl + [ 缩小面板
  if (event.ctrlKey && event.key === '[') {
    event.preventDefault()
    const newWidth = Math.max(props.minLeftWidth, leftPanelWidth.value - 20)
    leftPanelWidth.value = newWidth
    localStorage.setItem('leftPanelWidth', newWidth.toString())
  }
  // Ctrl + ] 放大面板
  else if (event.ctrlKey && event.key === ']') {
    event.preventDefault()
    const newWidth = Math.min(props.maxLeftWidth, leftPanelWidth.value + 20)
    leftPanelWidth.value = newWidth
    localStorage.setItem('leftPanelWidth', newWidth.toString())
  }
  // Ctrl + 0 重置为默认宽度
  else if (event.ctrlKey && event.key === '0') {
    event.preventDefault()
    leftPanelWidth.value = props.initialLeftWidth
    localStorage.setItem('leftPanelWidth', props.initialLeftWidth.toString())
  }
}

// 组件挂载时加载保存的宽度
onMounted(() => {
  loadWidthFromStorage()
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 拖拽时的全局样式 */
.resizing {
  user-select: none;
  cursor: col-resize;
}

/* 分割线悬停效果 */
.cursor-col-resize:hover {
  background-color: rgb(59 130 246 / 0.5);
}

/* 平滑过渡效果 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>