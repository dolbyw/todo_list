<template>
  <div class="relative">
    <!-- 雪花控制按钮 -->
    <button
      @click="showPanel = !showPanel"
      class="liquid-glass liquid-button p-2 text-white rounded-lg transition-colors"
      title="雪花效果设置"
    >
      <Snowflake class="w-5 h-5" />
    </button>

    <!-- 雪花控制面板 -->
    <div v-if="showPanel" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩层 -->
      <div 
        class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        @click="showPanel = false"
      ></div>
      
      <!-- 控制面板 -->
      <div class="relative liquid-glass p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">雪花效果设置</h3>
          <button
            @click="showPanel = false"
            class="liquid-glass liquid-button p-1 text-white rounded transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        
        <div class="space-y-4">
          <!-- 雪花速度控制 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Snowflake class="w-4 h-4 text-blue-400" />
                <span class="text-sm text-white font-medium">速度</span>
              </div>
              <span class="text-xs text-gray-300">{{ snowSpeed.toFixed(1) }}</span>
            </div>
            <input
              v-model.number="snowSpeed"
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              class="liquid-glass w-full h-2 rounded-lg appearance-none cursor-pointer slider"
              @input="updateSnowEffectWithSave"
            />
          </div>
          
          <!-- 雪花大小控制 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Circle class="w-4 h-4 text-blue-400" />
                <span class="text-sm text-white font-medium">大小</span>
              </div>
              <span class="text-xs text-gray-300">{{ snowSize.toFixed(1) }}</span>
            </div>
            <input
              v-model.number="snowSize"
              type="range"
              min="0.5"
              max="8"
              step="0.1"
              class="liquid-glass w-full h-2 rounded-lg appearance-none cursor-pointer slider"
              @input="updateSnowEffectWithSave"
            />
          </div>
          
          <!-- 雪花数量控制 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Hash class="w-4 h-4 text-blue-400" />
                <span class="text-sm text-white font-medium">数量</span>
              </div>
              <span class="text-xs text-gray-300">{{ snowCount }}</span>
            </div>
            <input
              v-model.number="snowCount"
              type="range"
              min="50"
              max="300"
              step="10"
              class="liquid-glass w-full h-2 rounded-lg appearance-none cursor-pointer slider"
              @input="updateSnowEffectWithSave"
            />
          </div>
        </div>
        
        <!-- 重置按钮 -->
        <div class="mt-6 flex justify-center">
          <button
            @click="resetToDefaults"
            class="liquid-glass liquid-button px-4 py-2 text-sm text-white rounded-lg transition-colors"
          >
            重置为默认值
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Snowflake, Circle, Hash, X } from 'lucide-vue-next'

// 面板显示状态
const showPanel = ref(false)

// 雪花控制参数
const snowSpeed = ref(1.0)
const snowSize = ref(2.0)
const snowCount = ref(150)

// 默认值
const defaultValues = {
  speed: 1.0,
  size: 2.0,
  count: 150
}

/**
 * 更新雪花特效参数
 * 通过自定义事件通知App.vue更新雪花效果
 */
const updateSnowEffect = () => {
  // 发送自定义事件到window，让App.vue监听
  window.dispatchEvent(new CustomEvent('updateSnowEffect', {
    detail: {
      speed: parseFloat(snowSpeed.value.toString()),
      size: parseFloat(snowSize.value.toString()),
      count: parseInt(snowCount.value.toString())
    }
  }))
}

/**
 * 组件挂载时初始化参数
 */
onMounted(() => {
  // 从localStorage读取保存的设置
  const savedSpeed = localStorage.getItem('snowSpeed')
  const savedSize = localStorage.getItem('snowSize')
  const savedCount = localStorage.getItem('snowCount')
  
  if (savedSpeed) snowSpeed.value = parseFloat(savedSpeed)
  if (savedSize) snowSize.value = parseFloat(savedSize)
  if (savedCount) snowCount.value = parseInt(savedCount)
  
  // 初始化时也要更新雪花效果
  setTimeout(() => {
    updateSnowEffect()
  }, 1000)
})

// 监听参数变化并保存到localStorage
const saveSettings = () => {
  localStorage.setItem('snowSpeed', snowSpeed.value.toString())
  localStorage.setItem('snowSize', snowSize.value.toString())
  localStorage.setItem('snowCount', snowCount.value.toString())
}

// 每次更新时保存设置
const updateSnowEffectWithSave = () => {
  updateSnowEffect()
  saveSettings()
}

// 重置为默认值
const resetToDefaults = () => {
  snowSpeed.value = defaultValues.speed
  snowSize.value = defaultValues.size
  snowCount.value = defaultValues.count
  updateSnowEffectWithSave()
}
</script>

<style scoped>
/* 滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.slider::-webkit-slider-track {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  transition: all 0.2s ease;
}

.dark .slider::-webkit-slider-track {
  background: #374151;
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
}

.dark .slider::-moz-range-track {
  background: #374151;
}
</style>