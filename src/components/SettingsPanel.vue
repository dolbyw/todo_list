<template>
  <div class="space-y-6">
    <!-- 头部 -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-white">
        设置
      </h2>
      <button
        @click="emit('close')"
        class="p-2 text-gray-200 hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- WebDAV设置 -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-white">
          WebDAV 同步
        </h3>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="localSettings.webdav.enabled"
            type="checkbox"
            class="sr-only peer"
          />
          <div class="liquid-toggle w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div v-if="localSettings.webdav.enabled" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-200 mb-2">
            服务器地址
          </label>
          <input
            v-model="localSettings.webdav.url"
            type="url"
            placeholder="https://your-webdav-server.com/dav"
            class="liquid-glass liquid-input w-full px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-200 mb-2">
            用户名
          </label>
          <input
            v-model="localSettings.webdav.username"
            type="text"
            placeholder="用户名"
            class="liquid-glass liquid-input w-full px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-200 mb-2">
            密码
          </label>
          <input
            v-model="localSettings.webdav.password"
            type="password"
            placeholder="密码"
            class="liquid-glass liquid-input w-full px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <!-- 连接测试 -->
        <div class="flex items-center gap-3">
          <button
            @click="testConnection"
            :disabled="isTestingConnection || !canTestConnection"
            class="liquid-glass liquid-button flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Wifi 
              class="w-4 h-4" 
              :class="{ 'animate-pulse': isTestingConnection }"
            />
            {{ isTestingConnection ? '测试中...' : '测试连接' }}
          </button>
          
          <div v-if="connectionTestResult !== null" class="flex items-center gap-2">
            <CheckCircle v-if="connectionTestResult" class="w-5 h-5 text-green-500" />
            <XCircle v-else class="w-5 h-5 text-red-500" />
            <span class="text-sm" :class="{
              'text-green-600 dark:text-green-400': connectionTestResult,
              'text-red-600 dark:text-red-400': !connectionTestResult
            }">
              {{ connectionTestResult ? '连接成功' : '连接失败' }}
            </span>
          </div>
        </div>

        <!-- 自动同步 -->
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-gray-200">
              自动同步
            </div>
            <div class="text-xs text-gray-300">
              应用启动时自动同步数据
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="localSettings.autoSync"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="liquid-toggle w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- 显示设置 -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-white">
        显示设置
      </h3>
      
      <!-- 字体设置 -->
      <div class="space-y-3">
        <div class="text-sm font-medium text-gray-200">
          字体选择
        </div>
        <div class="space-y-2">
          <div 
            v-for="font in fontOptions" 
            :key="font.value"
            @click="localSettings.fontFamily = font.value"
            class="liquid-glass flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105"
            :class="{
              'liquid-button': localSettings.fontFamily === font.value,
              'opacity-60': localSettings.fontFamily !== font.value
            }"
          >
            <div class="flex flex-col">
              <span class="text-sm font-medium text-white">{{ font.label }}</span>
              <span class="text-xs text-gray-300">{{ font.description }}</span>
            </div>
            <div 
              v-if="localSettings.fontFamily === font.value"
              class="w-2 h-2 bg-blue-500 rounded-full"
            ></div>
          </div>
        </div>
        <div class="text-xs text-gray-300">
          选择应用的默认字体，更改后立即生效
        </div>
      </div>
      
      <!-- 完成进度显示范围 -->
      <div class="space-y-3">
        <div class="text-sm font-medium text-gray-200">
          完成进度显示范围
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="localSettings.progressScope = 'current'"
            class="liquid-glass flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-105 text-white"
            :class="{
              'liquid-button': localSettings.progressScope === 'current',
              'opacity-60': localSettings.progressScope !== 'current'
            }"
          >
            <span class="text-sm font-medium">当前列表</span>
          </button>
          <button
            @click="localSettings.progressScope = 'all'"
            class="liquid-glass flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-200 hover:scale-105 text-white"
            :class="{
              'liquid-button': localSettings.progressScope === 'all',
              'opacity-60': localSettings.progressScope !== 'all'
            }"
          >
            <span class="text-sm font-medium">全部任务</span>
          </button>
        </div>
        <div class="text-xs text-gray-300">
          选择在侧边栏底部显示当前列表还是全部任务的完成进度
        </div>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-white">
        数据管理
      </h3>
      
      <div class="space-y-3">
        <button
          @click="exportData"
          class="liquid-glass liquid-button w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <Download class="w-4 h-4" />
          导出数据
        </button>
        
        <button
          @click="importData"
          class="liquid-glass liquid-button w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <Upload class="w-4 h-4" />
          导入数据
        </button>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="emit('close')"
        class="liquid-glass liquid-button px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
      >
        取消
      </button>
      <button
        @click="saveSettings"
        class="liquid-glass liquid-button px-4 py-2 text-white rounded-lg transition-colors"
      >
        保存设置
      </button>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { X, Wifi, CheckCircle, XCircle, Download, Upload } from 'lucide-vue-next'
import type { AppSettings } from '../types'
import { useStore } from '../composables/useStore'
import { useFontManager } from '../composables/useFontManager'
import { storageService } from '../services/storage'
import { toast } from 'vue-sonner'

interface Emits {
  close: []
}

const emit = defineEmits<Emits>()

const {
  settings,
  tasks,
  lists,
  updateSettings,
  testWebDAVConnection
} = useStore()

// 字体管理
const { fontOptions, applyFont } = useFontManager()

// 本地设置副本
const localSettings = reactive<AppSettings>({
  ...settings.value
})

// 监听字体设置变化，实时预览
watch(
  () => localSettings.fontFamily,
  (newFont) => {
    applyFont(newFont)
  }
)

// 连接测试状态
const isTestingConnection = ref(false)
const connectionTestResult = ref<boolean | null>(null)
const fileInput = ref<HTMLInputElement>()

// 计算属性
const canTestConnection = computed(() => {
  return localSettings.webdav.url && 
         localSettings.webdav.username && 
         localSettings.webdav.password
})

/**
 * 测试WebDAV连接
 */
const testConnection = async () => {
  if (!canTestConnection.value) {
    toast.error('请填写完整的WebDAV配置')
    return
  }

  isTestingConnection.value = true
  connectionTestResult.value = null

  try {
    // 临时更新设置以测试连接
    await updateSettings({ webdav: localSettings.webdav })
    const result = await testWebDAVConnection()
    connectionTestResult.value = result
    
    if (result) {
      toast.success('WebDAV连接测试成功')
    } else {
      toast.error('WebDAV连接测试失败')
    }
  } catch (error) {
    console.error('Connection test error:', error)
    connectionTestResult.value = false
    toast.error('连接测试失败')
  } finally {
    isTestingConnection.value = false
  }
}

/**
 * 保存设置
 * 创建纯对象副本以避免reactive对象序列化问题
 */
const saveSettings = async () => {
  // 创建纯对象副本，避免reactive对象序列化问题
  const settingsToSave: AppSettings = {
    theme: localSettings.theme,
    webdav: {
      url: localSettings.webdav.url,
      username: localSettings.webdav.username,
      password: localSettings.webdav.password,
      enabled: localSettings.webdav.enabled
    },
    autoSync: localSettings.autoSync,
    progressScope: localSettings.progressScope,
    fontFamily: localSettings.fontFamily
  }
  
  try {
    await updateSettings(settingsToSave)
    emit('close')
  } catch (error) {
    console.error('Save settings failed:', error)
    toast.error('保存设置失败，请重试')
  }
}

/**
 * 导出数据
 */
const exportData = () => {
  const data = {
    tasks: tasks.value,
    lists: lists.value,
    settings: settings.value,
    exportTime: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  toast.success('数据导出成功')
}

/**
 * 导入数据
 */
const importData = () => {
  fileInput.value?.click()
}

/**
 * 处理文件导入
 */
const handleFileImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    if (!data.tasks || !data.lists) {
      throw new Error('Invalid backup file format')
    }

    // 确认导入
    if (!confirm('导入数据将覆盖当前所有数据，确定要继续吗？')) {
      return
    }

    // 清空现有数据
    await storageService.clearAll()
    
    // 导入新数据
    await Promise.all([
      ...data.tasks.map((task: any) => storageService.saveTask({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      })),
      ...data.lists.map((list: any) => storageService.saveList({
        ...list,
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt)
      }))
    ])

    if (data.settings) {
      await updateSettings(data.settings)
    }

    toast.success('数据导入成功，请刷新页面')
    
    // 刷新页面以重新加载数据
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('Import error:', error)
    toast.error('数据导入失败，请检查文件格式')
  }

  // 清空文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>