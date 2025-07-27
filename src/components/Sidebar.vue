<template>
  <div class="h-full flex flex-col bg-white/50 dark:bg-black/50 border-r border-gray-200 dark:border-gray-700">
    <!-- 头部区域 -->
    <div class="relative p-4 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- 内容层 -->
      <div class="relative z-10">
        <h1 class="text-xl font-bold mb-4 cursor-default select-none" ref="titleElement" :style="titleStyle">
          待办清单
        </h1>
        
        <!-- 添加新列表输入框 -->
        <div class="relative">
          <input
            ref="newListInput"
            v-model="newListName"
            type="text"
            placeholder="新建列表..."
            class="liquid-glass liquid-input w-full pl-3 pr-12 py-2 rounded-lg text-white placeholder-gray-300 transition-all duration-200"
            @keyup.enter="handleAddList"
            @input="clearError"
            maxlength="50"
          />
          <button
            @click="handleAddList"
            :disabled="isAddingList"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-white/10"
            title="添加列表"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>
      
        <!-- 错误提示 -->
        <div v-if="errorMessage" class="mt-2 text-sm text-red-500 dark:text-red-400">
          {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- 列表区域 -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- 空状态 -->
      <div v-if="lists.length === 0" class="text-center py-8">
        <div class="text-gray-100">
          <FolderPlus class="w-12 h-12 mx-auto mb-3 opacity-60" />
          <p class="text-sm font-medium text-white">还没有列表</p>
          <p class="text-xs mt-1 text-gray-200">创建第一个列表开始吧！</p>
        </div>
      </div>
      
      <!-- 列表项 -->
      <div v-else class="space-y-2">
        <div
          v-for="list in lists"
          :key="list.id"
          class="liquid-glass group relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm"
          :class="getListItemClasses(list.id)"
          @click="handleSelectList(list.id)"
        >
          <!-- 编辑模式 -->
          <div v-if="editingListId === list.id" class="space-y-3" @click.stop>
            <input
              ref="editInput"
              v-model="editListName"
              type="text"
              class="liquid-glass liquid-input w-full px-3 py-2 text-sm rounded-md text-white placeholder-gray-300 transition-all duration-200"
              @keyup.enter="handleSaveEdit(list.id)"
              @keyup.escape="handleCancelEdit"
              @blur="handleSaveEdit(list.id)"
            />
            <div class="flex gap-2">
              <button
                @click="handleSaveEdit(list.id)"
                :disabled="isSavingEdit"
                class="liquid-glass liquid-button flex-1 px-3 py-1.5 text-xs text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSavingEdit ? '保存中...' : '保存' }}
              </button>
              <button
                @click="handleCancelEdit"
                :disabled="isSavingEdit"
                class="liquid-glass liquid-button flex-1 px-3 py-1.5 text-xs text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-red-500/20 border-red-400/30 hover:bg-red-500/30"
              >
                取消
              </button>
            </div>
            <!-- 编辑错误提示 -->
            <div v-if="editErrorMessage" class="text-xs text-red-500 dark:text-red-400">
              {{ editErrorMessage }}
            </div>
          </div>
          
          <!-- 显示模式 -->
          <div v-else class="relative">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <Folder class="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-white truncate" :title="list.name">
                    {{ list.name }}
                  </h3>
                  <p class="text-sm text-gray-100">
                    {{ getTaskCountText(list.id) }}
                  </p>
                </div>
              </div>
              
              <!-- 操作按钮 - 只在非编辑状态下显示 -->
              <div v-if="editingListId !== list.id" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" @click.stop>
                <button
                  @click="handleStartEdit(list)"
                  :disabled="editingListId !== null"
                  class="liquid-glass liquid-button p-1.5 text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                  title="编辑列表名称"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
                  @click="handleDeleteList(list.id)"
                  :disabled="isDeletingList || lists.length <= 1"
                  class="liquid-glass liquid-button p-1.5 text-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed rounded-md bg-red-500/20 border-red-400/30 hover:bg-red-500/30"
                  :title="lists.length <= 1 ? '至少需要保留一个列表' : '删除列表'"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <!-- 创建时间 -->
            <div class="mt-2 text-right">
              <p class="text-xs text-gray-200">
                {{ formatTime(list.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部统计信息 -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <div class="text-sm text-gray-100">
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-white">{{ progressLabel }}</span>
          <span class="font-mono text-white">{{ completionPercentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
        <div class="mt-2 text-xs text-gray-200">
          {{ getProgressDetails() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { Plus, Folder, FolderPlus, Edit2, Trash2 } from 'lucide-vue-next'
import { useStore } from '../composables/useStore'
import type { TaskList } from '../types'

// Store 实例
const store = useStore()
const { lists, currentList, tasks, createList, updateList, deleteList, setCurrentList, settings } = store

// 模板引用
const newListInput = ref<HTMLInputElement>()
const editInput = ref<HTMLInputElement>()
const titleElement = ref<HTMLElement>()

// 响应式状态
const newListName = ref('')
const editingListId = ref<string | null>(null)
const editListName = ref('')
const errorMessage = ref('')
const editErrorMessage = ref('')
const isAddingList = ref(false)
const isSavingEdit = ref(false)
const isDeletingList = ref(false)

// 标题霓虹灯效果相关状态
const titleStyle = ref({})
let colorChangeInterval: number | null = null

// 霓虹灯颜色数组
const neonColors = [
  { color: '#ff0080', shadow: '0 0 10px #ff0080, 0 0 20px #ff0080, 0 0 30px #ff0080' },
  { color: '#00ff80', shadow: '0 0 10px #00ff80, 0 0 20px #00ff80, 0 0 30px #00ff80' },
  { color: '#8000ff', shadow: '0 0 10px #8000ff, 0 0 20px #8000ff, 0 0 30px #8000ff' },
  { color: '#ff8000', shadow: '0 0 10px #ff8000, 0 0 20px #ff8000, 0 0 30px #ff8000' },
  { color: '#0080ff', shadow: '0 0 10px #0080ff, 0 0 20px #0080ff, 0 0 30px #0080ff' },
  { color: '#ff4080', shadow: '0 0 10px #ff4080, 0 0 20px #ff4080, 0 0 30px #ff4080' },
  { color: '#80ff40', shadow: '0 0 10px #80ff40, 0 0 20px #80ff40, 0 0 30px #80ff40' },
  { color: '#4080ff', shadow: '0 0 10px #4080ff, 0 0 20px #4080ff, 0 0 30px #4080ff' }
]

/**
 * 随机更改标题颜色和霓虹灯效果
 */
const changeNeonColor = () => {
  const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)]
  titleStyle.value = {
    color: randomColor.color,
    textShadow: randomColor.shadow,
    transition: 'all 0.5s ease-in-out'
  }
}

/**
 * 初始化霓虹灯效果
 */
const initNeonEffect = () => {
  // 立即设置一个颜色
  changeNeonColor()
  
  // 每3-5秒随机更改颜色
  const setRandomColorInterval = () => {
    const interval = Math.random() * 2000 + 3000 // 3-5秒
    colorChangeInterval = window.setTimeout(() => {
      changeNeonColor()
      setRandomColorInterval()
    }, interval)
  }
  
  setRandomColorInterval()
}

/**
 * 清理所有效果
 */
const cleanupEffects = () => {
  // 清理霓虹灯效果
  if (colorChangeInterval) {
    clearTimeout(colorChangeInterval)
    colorChangeInterval = null
  }
}

/**
 * 计算完成百分比
 * 根据设置决定显示全部任务还是当前列表任务的进度
 */
const completionPercentage = computed(() => {
  const scope = settings.value.progressScope || 'current'
  
  let targetTasks
  if (scope === 'all') {
    targetTasks = tasks.value
  } else {
    targetTasks = currentList.value 
      ? tasks.value.filter(task => task.listId === currentList.value!.id)
      : []
  }
  
  if (targetTasks.length === 0) return 0
  const completedTasks = targetTasks.filter(task => task.status === 'completed').length
  return Math.round((completedTasks / targetTasks.length) * 100)
})

/**
 * 进度标签
 */
const progressLabel = computed(() => {
  const scope = settings.value.progressScope || 'current'
  return scope === 'all' ? '全部任务进度' : '当前列表进度'
})

/**
 * 获取列表项的CSS类
 */
const getListItemClasses = (listId: string) => {
  const isSelected = currentList.value?.id === listId
  const isEditing = editingListId.value === listId
  
  return {
    'bg-white dark:bg-gray-800 shadow-sm ring-2 ring-blue-500 ring-opacity-50 border-blue-200 dark:border-blue-700': isSelected && !isEditing,
    'bg-gray-100 dark:bg-gray-800/50': !isSelected && !isEditing,
    'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600': isEditing
  }
}

/**
 * 清除错误信息
 */
const clearError = () => {
  errorMessage.value = ''
}

/**
 * 清除编辑错误信息
 */
const clearEditError = () => {
  editErrorMessage.value = ''
}

/**
 * 验证列表名称
 */
const validateListName = (name: string, excludeId?: string): string | null => {
  const trimmedName = name.trim()
  
  if (!trimmedName) {
    return '列表名称不能为空'
  }
  
  if (trimmedName.length > 50) {
    return '列表名称不能超过50个字符'
  }
  
  const existingList = lists.value.find(list => 
    list.id !== excludeId && list.name.toLowerCase() === trimmedName.toLowerCase()
  )
  
  if (existingList) {
    return `列表名称 "${trimmedName}" 已存在，请使用其他名称`
  }
  
  return null
}

/**
 * 处理添加新列表
 */
const handleAddList = async () => {
  if (isAddingList.value) return
  
  const validationError = validateListName(newListName.value)
  if (validationError) {
    errorMessage.value = validationError
    await nextTick()
    newListInput.value?.focus()
    return
  }
  
  try {
    isAddingList.value = true
    clearError()
    
    const trimmedName = newListName.value.trim()
    const now = new Date()
    
    await createList({
      id: crypto.randomUUID(),
      name: trimmedName,
      createdAt: now,
      updatedAt: now
    })
    
    newListName.value = ''
    await nextTick()
    newListInput.value?.focus()
  } catch (error) {
    console.error('添加列表失败:', error)
    errorMessage.value = '添加列表失败，请重试'
  } finally {
    isAddingList.value = false
  }
}

/**
 * 处理选择列表
 */
const handleSelectList = (listId: string) => {
  if (editingListId.value === null && !isDeletingList.value) {
    setCurrentList(listId)
  }
}

/**
 * 开始编辑列表名称
 */
const handleStartEdit = async (list: TaskList) => {
  if (editingListId.value !== null) return
  
  editingListId.value = list.id
  editListName.value = list.name
  clearEditError()
  
  // 等待DOM更新完成
  await nextTick()
  
  // 添加额外的延迟确保input元素完全渲染
  setTimeout(() => {
    const inputElement = editInput.value
    if (inputElement && typeof inputElement.focus === 'function') {
      inputElement.focus()
      inputElement.select()
    }
  }, 50)
}

/**
 * 保存编辑
 */
const handleSaveEdit = async (listId: string) => {
  if (isSavingEdit.value) return
  
  const validationError = validateListName(editListName.value, listId)
  if (validationError) {
    editErrorMessage.value = validationError
    await nextTick()
    
    // 添加延迟确保input元素可用
    setTimeout(() => {
      const inputElement = editInput.value
      if (inputElement && typeof inputElement.focus === 'function') {
        inputElement.focus()
        inputElement.select()
      }
    }, 50)
    return
  }
  
  try {
    isSavingEdit.value = true
    clearEditError()
    
    const trimmedName = editListName.value.trim()
    await updateList(listId, { name: trimmedName })
    
    handleCancelEdit()
  } catch (error) {
    console.error('保存列表名称失败:', error)
    editErrorMessage.value = '保存失败，请重试'
  } finally {
    isSavingEdit.value = false
  }
}

/**
 * 取消编辑
 */
const handleCancelEdit = () => {
  editingListId.value = null
  editListName.value = ''
  clearEditError()
}

/**
 * 处理删除列表
 */
const handleDeleteList = async (listId: string) => {
  if (isDeletingList.value || lists.value.length <= 1) return
  
  const listToDelete = lists.value.find(list => list.id === listId)
  if (!listToDelete) {
    console.error('要删除的列表不存在:', listId)
    return
  }
  
  const taskCount = getTaskCount(listId)
  let confirmMessage = `确定要删除列表 "${listToDelete.name}" 吗？`
  
  if (taskCount > 0) {
    confirmMessage += `\n\n该列表包含 ${taskCount} 个任务，删除后将无法恢复！`
  }
  
  if (!confirm(confirmMessage)) {
    return
  }
  
  try {
    isDeletingList.value = true
    await deleteList(listId)
  } catch (error) {
    console.error('删除列表失败:', error)
    alert('删除列表失败，请重试')
  } finally {
    isDeletingList.value = false
  }
}

/**
 * 获取任务数量
 */
const getTaskCount = (listId: string): number => {
  return tasks.value.filter(task => task.listId === listId).length
}

/**
 * 获取任务数量文本
 */
const getTaskCountText = (listId: string): string => {
  const count = getTaskCount(listId)
  const completedCount = tasks.value.filter(task => task.listId === listId && task.status === 'completed').length
  
  if (count === 0) {
    return '暂无任务'
  }
  
  return `${completedCount}/${count} 个任务`
}

/**
 * 获取进度详情
 */
const getProgressDetails = (): string => {
  const scope = settings.value.progressScope || 'current'
  
  let targetTasks
  if (scope === 'all') {
    targetTasks = tasks.value
  } else {
    targetTasks = currentList.value 
      ? tasks.value.filter(task => task.listId === currentList.value!.id)
      : []
  }
  
  const completedTasks = targetTasks.filter(task => task.status === 'completed').length
  const totalTasks = targetTasks.length
  
  if (totalTasks === 0) {
    return scope === 'all' ? '暂无任务' : '当前列表暂无任务'
  }
  
  return `已完成 ${completedTasks} / ${totalTasks} 个任务`
}

/**
 * 格式化时间显示
 * 今天显示"今天"，昨天显示"昨天"，其他显示具体日期
 */
const formatTime = (date: Date | string): string => {
  const targetDate = new Date(date)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
  
  if (targetDay.getTime() === today.getTime()) {
    return '今天'
  } else if (targetDay.getTime() === yesterday.getTime()) {
    return '昨天'
  } else {
    const month = targetDate.getMonth() + 1
    const day = targetDate.getDate()
    const hour = targetDate.getHours()
    const minute = targetDate.getMinutes()
    return `${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }
}

// 监听编辑状态变化，自动清除错误信息
watch(editingListId, () => {
  if (editingListId.value === null) {
    clearEditError()
  }
})

// 监听新列表名称变化，自动清除错误信息
watch(newListName, () => {
  if (errorMessage.value) {
    clearError()
  }
})

// 生命周期钩子
onMounted(() => {
  // 延迟初始化效果，确保DOM已渲染
  nextTick(() => {
    setTimeout(() => {
      initNeonEffect()
    }, 500)
  })
})

onUnmounted(() => {
  cleanupEffects()
})
</script>

<style scoped>
</style>