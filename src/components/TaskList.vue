<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-800">
    <!-- 头部 -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ currentList?.name || '选择一个列表' }}
        </h2>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ currentTasks.length }} 个任务 / {{ completedTasks }} 已完成
          </span>
          <button
            @click="showHelp = !showHelp"
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors"
            title="帮助"
          >
            <HelpCircle class="w-5 h-5" />
          </button>
          <button
            @click="showSettings = !showSettings"
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors"
            title="设置"
          >
            <Settings class="w-5 h-5" />
          </button>
          <!-- 主题切换按钮 -->
          <ThemeToggle />
        </div>
      </div>

      <!-- 帮助信息 -->
      <div v-if="showHelp" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">键盘快捷键</h3>
        <div class="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <div><kbd class="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">Ctrl + [</kbd> 缩小侧边栏</div>
          <div><kbd class="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">Ctrl + ]</kbd> 扩大侧边栏</div>
          <div><kbd class="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">Ctrl + 0</kbd> 重置侧边栏宽度</div>
        </div>
      </div>

      <!-- 设置面板弹窗 -->
      <div v-if="showSettings" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- 遮罩层 -->
        <div 
          class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          @click="showSettings = false"
        ></div>
        <!-- 设置面板容器 -->
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="p-6">
            <SettingsPanel @close="showSettings = false" />
          </div>
        </div>
      </div>

      <!-- 添加任务 -->
      <form @submit.prevent="addTask" class="flex gap-2">
        <input
          v-model="newTaskTitle"
          type="text"
          placeholder="添加新任务..."
          class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <select
          v-model="newTaskPriority"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option :value="TaskPriority.MEDIUM">中优先级</option>
          <option :value="TaskPriority.HIGH">高优先级</option>
          <option :value="TaskPriority.LOW">低优先级</option>
        </select>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="添加任务"
        >
          <Plus class="w-5 h-5" />
        </button>
      </form>
    </div>

    <!-- 筛选和排序 -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap gap-2">
        <select
          v-model="filterBy"
          class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部任务</option>
          <option value="pending">未完成</option>
          <option value="completed">已完成</option>
        </select>
        
        <select
          v-model="sortBy"
          class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
          <option value="createdAt">创建时间</option>
          <option value="completedAt">完成时间</option>
        </select>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="filteredAndSortedTasks.length === 0" class="text-center py-12">
        <div class="text-gray-400 dark:text-gray-500">
          <CheckCircle class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p class="text-lg font-medium mb-2">{{ currentTasks.length === 0 ? '还没有任务' : '没有符合条件的任务' }}</p>
          <p class="text-sm">{{ currentTasks.length === 0 ? '添加第一个任务开始吧！' : '尝试调整筛选条件' }}</p>
        </div>
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="task in filteredAndSortedTasks"
          :key="task.id"
          class="group p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          :class="{
            'opacity-60': task.status === 'completed',
            'border-l-4 border-l-red-500': task.priority === 'high',
            'border-l-4 border-l-yellow-500': task.priority === 'medium',
            'border-l-4 border-l-green-500': task.priority === 'low'
          }"
        >
          <div class="flex items-start gap-3">
            <!-- 完成状态 -->
            <button
              @click="toggleTask(task.id)"
              class="mt-1 flex-shrink-0 transition-all duration-200 hover:scale-110"
            >
              <div
                :class="{
                  'bg-green-500 border-green-500': task.status === 'completed',
                  'bg-transparent border-gray-300 dark:border-gray-600': task.status === 'pending'
                }"
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
              >
                <CheckCircle
                  v-if="task.status === 'completed'"
                  class="w-3 h-3 text-white"
                />
              </div>
            </button>

            <!-- 任务内容 -->
            <div class="flex-1 min-w-0">
              <!-- 编辑模式 -->
              <div v-if="editingTaskId === task.id" class="space-y-2">
                <input
                  :data-task-id="task.id"
                  v-model="editTaskTitle"
                  type="text"
                  placeholder="任务标题"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  @keyup.enter="saveTaskEdit(task.id)"
                  @keyup.escape="cancelTaskEdit"
                />
                <textarea
                  v-model="editTaskContent"
                  placeholder="任务内容描述（可选）"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white resize-none"
                  @keyup.escape="cancelTaskEdit"
                ></textarea>
                <div class="flex gap-2">
                  <button
                    @click="saveTaskEdit(task.id)"
                    class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    @click="cancelTaskEdit"
                    class="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
              
              <!-- 显示模式 -->
              <div v-else>
                <h3
                  class="font-medium text-gray-900 dark:text-white"
                  :class="{ 'line-through': task.status === 'completed' }"
                >
                  {{ task.title }}
                </h3>
                <!-- 任务内容 -->
                <div v-if="task.content && task.content.trim()" class="mt-2">
                  <p
                    class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap"
                    :class="{ 'line-through': task.status === 'completed' }"
                  >
                    {{ task.content }}
                  </p>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="{
                      'bg-red-500 text-white': task.priority === 'high',
                      'bg-yellow-500 text-white': task.priority === 'medium',
                      'bg-green-500 text-white': task.priority === 'low'
                    }"
                  >
                    {{ getPriorityText(task.priority) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div v-if="editingTaskId !== task.id" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                @click="startEditTask(task)"
                class="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200 hover:scale-110"
                title="编辑任务"
              >
                <Edit2 class="w-4 h-4" />
              </button>
              <button
                @click="deleteTask(task.id)"
                class="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 hover:scale-110"
                title="删除任务"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <!-- 时间标记 -->
          <div class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-600 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>创建: {{ formatDate(task.createdAt) }}</span>
            <span v-if="task.status === 'completed' && task.completedAt">完成: {{ formatDate(task.completedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Plus, CheckCircle, Edit2, Trash2, HelpCircle, Settings } from 'lucide-vue-next'
import { useStore } from '../composables/useStore'
import { TaskPriority } from '../types'
import SettingsPanel from './SettingsPanel.vue'
import ThemeToggle from './ThemeToggle.vue'

const store = useStore()
const { currentList, currentTasks, createTask, updateTask, deleteTask, toggleTaskStatus } = store

// 响应式数据
const newTaskTitle = ref('')
const newTaskPriority = ref(TaskPriority.MEDIUM)
const filterBy = ref('all')
const sortBy = ref('createdAt')
const showHelp = ref(false)
const showSettings = ref(false)
const editingTaskId = ref<string | null>(null)
const editTaskTitle = ref('')
const editTaskContent = ref('')
// 移除有问题的 ref，改用 DOM 查询

// 计算属性
const completedTasks = computed(() => currentTasks.value.filter(task => task.status === 'completed').length)

// 筛选和排序后的任务
const filteredAndSortedTasks = computed(() => {
  let filtered = currentTasks.value.filter(task => {
    switch (filterBy.value) {
      case 'pending':
        return task.status === 'pending'
      case 'completed':
        return task.status === 'completed'
      case 'high':
        return task.priority === TaskPriority.HIGH
      case 'medium':
        return task.priority === TaskPriority.MEDIUM
      case 'low':
        return task.priority === TaskPriority.LOW
      default:
        return true
    }
  })

  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'high':
        return a.priority === TaskPriority.HIGH ? -1 : b.priority === TaskPriority.HIGH ? 1 : 0
      case 'medium':
        return a.priority === TaskPriority.MEDIUM ? -1 : b.priority === TaskPriority.MEDIUM ? 1 : 0
      case 'low':
        return a.priority === TaskPriority.LOW ? -1 : b.priority === TaskPriority.LOW ? 1 : 0
      case 'completedAt':
        if (!a.completedAt && !b.completedAt) return 0
        if (!a.completedAt) return 1
        if (!b.completedAt) return -1
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      case 'createdAt':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
})

// 方法
/**
 * 添加新任务，包含重名检查
 */
const addTask = () => {
  const trimmedTitle = newTaskTitle.value.trim()
  if (!trimmedTitle || !currentList.value) return
  
  // 检查当前列表中是否有同名任务
  const existingTask = currentTasks.value.find(task => 
    task.title.toLowerCase() === trimmedTitle.toLowerCase()
  )
  if (existingTask) {
    alert('当前列表中已存在同名任务，请使用其他名称')
    return
  }
  
  createTask({
    title: trimmedTitle,
    priority: newTaskPriority.value,
    listId: currentList.value.id
  })
  newTaskTitle.value = ''
  newTaskPriority.value = TaskPriority.MEDIUM
}

const toggleTask = (taskId: string) => {
  toggleTaskStatus(taskId)
}

const startEditTask = async (task: any) => {
  editingTaskId.value = task.id
  editTaskTitle.value = task.title
  editTaskContent.value = task.content || ''
  await nextTick()
  // 使用 DOM 查询来获取当前编辑的 input 元素
  const inputElement = document.querySelector(`input[data-task-id="${task.id}"]`) as HTMLInputElement
  if (inputElement) {
    inputElement.focus()
    inputElement.select()
  }
}

/**
 * 保存任务编辑，包含重名检查
 */
const saveTaskEdit = (taskId: string) => {
  const trimmedTitle = editTaskTitle.value.trim()
  if (!trimmedTitle) {
    cancelTaskEdit()
    return
  }
  
  // 检查当前列表中是否有同名任务（排除当前编辑的任务）
  const existingTask = currentTasks.value.find(task => 
    task.id !== taskId && 
    task.title.toLowerCase() === trimmedTitle.toLowerCase()
  )
  if (existingTask) {
    alert('当前列表中已存在同名任务，请使用其他名称')
    return
  }
  
  const trimmedContent = editTaskContent.value.trim()
  updateTask(taskId, { 
    title: trimmedTitle,
    content: trimmedContent || undefined
  })
  cancelTaskEdit()
}

const cancelTaskEdit = () => {
  editingTaskId.value = null
  editTaskTitle.value = ''
  editTaskContent.value = ''
}

const getPriorityText = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH:
      return '高优先级'
    case TaskPriority.MEDIUM:
      return '中优先级'
    case TaskPriority.LOW:
      return '低优先级'
    default:
      return '中优先级'
  }
}

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '今天'
  if (diffDays === 2) return '昨天'
  if (diffDays <= 7) return `${diffDays}天前`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric'
  })
}
</script>