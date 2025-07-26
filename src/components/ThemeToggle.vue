<template>
  <button
    @click="toggleTheme"
    class="relative p-2 rounded-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
    :class="{
      'bg-yellow-100 dark:bg-gray-700 text-yellow-600 dark:text-yellow-400': theme === 'light',
      'bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400': theme === 'dark'
    }"
    :title="getThemeTitle()"
  >
    <!-- 太阳图标 (浅色主题) -->
    <Sun 
      v-if="theme === 'light'"
      class="w-5 h-5 transition-all duration-300 transform group-hover:rotate-12"
    />
    
    <!-- 月亮图标 (深色主题) -->
    <Moon 
      v-else
      class="w-5 h-5 transition-all duration-300 transform group-hover:-rotate-12"
    />
    

    
    <!-- 主题切换动画效果 -->
    <div 
      class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"
      :class="{
        'bg-yellow-400': theme === 'light',
        'bg-blue-400': theme === 'dark'
      }"
    ></div>
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'

const { theme, setTheme } = useTheme()

/**
 * 切换主题
 * 在浅色和深色主题之间切换
 */
const toggleTheme = () => {
  if (theme.value === 'light') {
    setTheme('dark')
  } else {
    setTheme('light')
  }
}

/**
 * 获取主题提示文本
 */
const getThemeTitle = (): string => {
  switch (theme.value) {
    case 'light':
      return '当前：浅色主题，点击切换到深色主题'
    case 'dark':
      return '当前：深色主题，点击切换到浅色主题'
    default:
      return '切换主题'
  }
}
</script>