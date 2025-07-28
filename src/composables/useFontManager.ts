import { watch } from 'vue'
import type { FontFamily } from '../types'

/**
 * 字体管理组合函数
 */
export function useFontManager() {
  /**
   * 字体选项配置
   */
  const fontOptions = [
    {
      value: 'MiSans' as FontFamily,
      label: 'MiSans',
      description: '小米兰亭字体，现代简洁'
    },
    {
      value: 'System' as FontFamily,
      label: '系统字体',
      description: '使用系统默认字体'
    }
  ]

  /**
   * 获取字体CSS变量值
   */
  const getFontFamilyCSS = (fontFamily: FontFamily): string => {
    switch (fontFamily) {
      case 'MiSans':
        return "'MiSans', Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
      case 'Inter':
        return "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
      case 'System':
        return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      default:
        return "'MiSans', Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
    }
  }

  /**
   * 应用字体到文档
   */
  const applyFont = (fontFamily: FontFamily) => {
    const fontCSS = getFontFamilyCSS(fontFamily)
    document.documentElement.style.setProperty('--font-family-sans', fontCSS)
    
    // 同时更新body的字体，确保立即生效
    document.body.style.fontFamily = fontCSS
  }

  /**
   * 监听字体设置变化
   */
  const watchFontSettings = (fontFamily: any) => {
    watch(
      () => fontFamily.value,
      (newFont: FontFamily) => {
        applyFont(newFont)
      },
      { immediate: true }
    )
  }

  return {
    fontOptions,
    getFontFamilyCSS,
    applyFont,
    watchFontSettings
  }
}