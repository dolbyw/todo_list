import { ref, computed, watch } from 'vue'

let theme = ref<'light' | 'dark'>('light')

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    theme.value = savedTheme
  }
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