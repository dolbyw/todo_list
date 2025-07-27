import { ref, computed, watch } from 'vue'

let theme = ref<'light' | 'dark'>('dark')

// 初始化主题 - 默认夜间模式
const initTheme = () => {
  // 强制设置为夜间模式，不再从localStorage读取
  theme.value = 'dark'
  localStorage.setItem('theme', 'dark')
}

export const useTheme = () => {
  const isDark = computed(() => {
    return theme.value === 'dark'
  })

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }

  // Apply theme to document
  watch(
    isDark,
    (dark) => {
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    { immediate: true }
  )

  return {
    theme,
    isDark,
    setTheme
  }
}

// 初始化主题
initTheme()