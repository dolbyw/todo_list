<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import { useTheme } from './composables/useTheme'
import { useFontManager } from './composables/useFontManager'
import { useStore } from './composables/useStore'
import InstallPrompt from './components/InstallPrompt.vue'

const { isDark } = useTheme()
const { settings } = useStore()
const { watchFontSettings } = useFontManager()

// 初始化字体管理
watchFontSettings(computed(() => settings.value.fontFamily))

// 雪花特效相关状态
const snowCanvas = ref<HTMLCanvasElement>()
const canvasWidth = ref(0)
const canvasHeight = ref(0)
let snowEffectActive = false
let snowAnimationFrame: number | null = null

// 雪花参数（可控制）
const snowParams = ref({
  speed: 1.0,
  size: 2.0,
  count: 150
})

/**
 * 更新画布尺寸
 */
const updateCanvasSize = () => {
  canvasWidth.value = window.innerWidth
  canvasHeight.value = window.innerHeight
  if (snowCanvas.value) {
    snowCanvas.value.width = window.innerWidth
    snowCanvas.value.height = window.innerHeight
  }
}

/**
 * 初始化高级雪花特效
 */
const initAdvancedSnowEffect = () => {
  if (!snowCanvas.value) return
  
  const canvas = snowCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 雪花参数
  const snowflakes: Array<{ x: number; y: number; radius: number; speed: number; wind: number; opacity: number; angle: number; }> = []
  const maxSnowflakes = snowParams.value.count
  
  // 创建雪花
  for (let i = 0; i < maxSnowflakes; i++) {
    snowflakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * snowParams.value.size + 0.5,
      speed: (Math.random() * 1 + 0.3) * snowParams.value.speed,
      wind: Math.random() * 0.8 - 0.4,
      opacity: Math.random() * 0.8 + 0.2,
      angle: Math.random() * Math.PI * 2
    })
  }
  
  // 动画循环
  const animate = () => {
    if (!snowEffectActive) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    snowflakes.forEach(flake => {
      // 更新位置
      flake.y += flake.speed
      flake.x += flake.wind
      flake.angle += 0.01
      
      // 边界检查
      if (flake.y > canvas.height) {
        flake.y = -10
        flake.x = Math.random() * canvas.width
      }
      if (flake.x > canvas.width) {
        flake.x = 0
      } else if (flake.x < 0) {
        flake.x = canvas.width
      }
      
      // 绘制雪花
      ctx.save()
      ctx.globalAlpha = flake.opacity
      ctx.translate(flake.x, flake.y)
      ctx.rotate(flake.angle)
      
      ctx.beginPath()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = Math.max(1, flake.radius * 0.3)
      
      for (let i = 0; i < 6; i++) {
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -flake.radius * 2)
        ctx.moveTo(0, -flake.radius)
        ctx.lineTo(-flake.radius * 0.5, -flake.radius * 1.5)
        ctx.moveTo(0, -flake.radius)
        ctx.lineTo(flake.radius * 0.5, -flake.radius * 1.5)
        ctx.rotate(Math.PI / 3)
      }
      
      ctx.stroke()
      ctx.restore()
    })
    
    snowAnimationFrame = requestAnimationFrame(animate)
  }
  
  snowEffectActive = true
  animate()
}

/**
 * 重新初始化雪花特效
 * 当参数改变时调用
 */
const reinitSnowEffect = () => {
  cleanupEffects()
  setTimeout(() => {
    initAdvancedSnowEffect()
  }, 100)
}

/**
 * 监听雪花参数更新事件
 */
const handleSnowEffectUpdate = (event: CustomEvent) => {
  const { speed, size, count } = event.detail
  snowParams.value.speed = speed
  snowParams.value.size = size
  snowParams.value.count = count
  
  // 重新初始化雪花效果
  reinitSnowEffect()
}

const cleanupEffects = () => {
  snowEffectActive = false
  if (snowAnimationFrame) {
    cancelAnimationFrame(snowAnimationFrame)
    snowAnimationFrame = null
  }
}

const handleResize = () => {
  updateCanvasSize()
}

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      updateCanvasSize()
      initAdvancedSnowEffect()
      window.addEventListener('resize', handleResize)
      // 监听雪花控制事件
      window.addEventListener('updateSnowEffect', handleSnowEffectUpdate as EventListener)
    }, 500)
  })
})

onUnmounted(() => {
  cleanupEffects()
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('updateSnowEffect', handleSnowEffectUpdate as EventListener)
})

</script>

<template>
  <div :class="{ dark: isDark }">
    <canvas 
      ref="snowCanvas" 
      id="snow-effect-canvas"
      class="fixed inset-0 pointer-events-none z-50"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
    <div class="relative z-20">
      <RouterView />
    </div>
    <Toaster 
      position="top-right"
      :theme="isDark ? 'dark' : 'light'"
      rich-colors
      :duration="3000"
    />
    <InstallPrompt />
  </div>
</template>

<style scoped>
</style>