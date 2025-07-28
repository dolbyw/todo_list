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
      value: 'System' as FontFamily,
      label: '系统默认',
      description: '跟随操作系统设置'
    },
    {
      value: 'MiSans' as FontFamily,
      label: 'MiSans',
      description: '小米定制字体，清晰优雅'
    }
  ]

  /**
   * 获取字体CSS变量值
   */
  const getFontFamilyCSS = (fontFamily: FontFamily): string => {
    switch (fontFamily) {
      case 'MiSans':
        return "'MiSans', system-ui, Avenir, Helvetica, Arial, sans-serif"
      case 'System':
        return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      default:
        return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
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