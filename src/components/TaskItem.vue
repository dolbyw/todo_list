<template>
  <div
    class="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    :class="{
      'opacity-60': task.status === 'completed'
    }"
  >
    <!-- 复选框 -->
    <button
      @click="toggleStatus"
      class="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-blue-500 transition-colors"
      :class="{
        'bg-blue-500 border-blue-500': task.status === 'completed'
      }"
    >
      <Check
        v-if="task.status === 'completed'"
        class="w-3 h-3 text-white"
      />
    </button>

    <!-- 任务内容 -->
    <div class="flex-1 min-w-0">
      <input
        v-if="isEditing"
        ref="editInput"
        v-model="editTitle"
        @blur="saveEdit"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
        class="w-full bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 text-sm"
        :class="{
          'line-through': task.status === 'completed'
        }"
      />
      <p
        v-else
        @dblclick="startEdit"
        class="text-sm text-gray-900 dark:text-gray-100 cursor-pointer truncate"
        :class="{
          'line-through': task.status === 'completed'
        }"
      >
        {{ task.title }}
      </p>
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <!-- 编辑按钮 -->
      <button
        v-if="!isEditing"
        @click="startEdit"
        class="p-1 text-gray-400 hover:text-blue-500 transition-colors"
        title="编辑任务"
      >
        <Edit2 class="w-4 h-4" />
      </button>

      <!-- 删除按钮 -->
      <button
        @click="deleteTask"
        class="p-1 text-gray-400 hover:text-red-500 transition-colors"
        title="删除任务"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Check, Edit2, Trash2 } from 'lucide-vue-next'
import type { Task } from '../types'

interface Props {
  task: Task
}

interface Emits {
  toggleStatus: [taskId: string]
  updateTask: [taskId: string, title: string]
  deleteTask: [taskId: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 编辑状态
const isEditing = ref(false)
const editTitle = ref('')
const editInput = ref<HTMLInputElement>()

/**
 * 切换任务状态
 */
const toggleStatus = () => {
  emit('toggleStatus', props.task.id)
}

/**
 * 开始编辑任务
 */
const startEdit = async () => {
  if (props.task.status === 'completed') return
  
  isEditing.value = true
  editTitle.value = props.task.title
  
  await nextTick()
  editInput.value?.focus()
  editInput.value?.select()
}

/**
 * 保存编辑
 */
const saveEdit = () => {
  if (!isEditing.value) return
  
  const newTitle = editTitle.value.trim()
  if (newTitle && newTitle !== props.task.title) {
    emit('updateTask', props.task.id, newTitle)
  }
  
  isEditing.value = false
}

/**
 * 取消编辑
 */
const cancelEdit = () => {
  isEditing.value = false
  editTitle.value = props.task.title
}

/**
 * 删除任务
 */
const deleteTask = () => {
  emit('deleteTask', props.task.id)
}
</script>