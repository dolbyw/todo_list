import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Task, TaskList, AppSettings, AppState } from '../types'
import { SyncStatus, TaskStatus, TaskPriority } from '../types'
import { storageService } from '../services/storage'
import { webdavService } from '../services/webdav'
import { toast } from 'vue-sonner'

// 默认设置
const defaultSettings: AppSettings = {
  theme: 'light',
  webdav: {
    url: '',
    username: '',
    password: '',
    enabled: false
  },
  autoSync: false,
  progressScope: 'current' // 默认显示当前列表的完成进度
}

// 全局状态
const tasks = ref<Task[]>([])
const lists = ref<TaskList[]>([])
const currentListId = ref<string | null>(null)
const settings = useLocalStorage('todo-settings', defaultSettings)
const syncStatus = ref<SyncStatus>(SyncStatus.IDLE)
const lastSyncTime = ref<Date | null>(null)
const isInitialized = ref(false)

/**
 * 应用状态管理组合函数
 */
export function useStore() {
  /**
   * 初始化应用
   */
  const initApp = async () => {
    console.log('[useStore] initApp called')
    
    try {
      // 初始化存储服务
      console.log('[useStore] Initializing storage service...')
      await storageService.init()
      console.log('[useStore] Storage service initialized successfully')
      
      // 加载数据
      console.log('[useStore] Loading data...')
      const [loadedTasks, loadedLists, loadedSettings] = await Promise.all([
        storageService.getTasks(),
        storageService.getLists(),
        storageService.getSettings()
      ])
      
      console.log('[useStore] Data loaded:', {
        tasks: loadedTasks.length,
        lists: loadedLists.length,
        settings: loadedSettings
      })
      
      // 设置任务
      tasks.value = loadedTasks
      console.log('[useStore] Tasks set:', tasks.value.length)
      
      // 设置列表
      if (loadedLists.length === 0) {
        console.log('[useStore] No lists found, creating default list...')
        // 如果没有列表，创建默认列表
         const defaultList: TaskList = {
           id: generateId(),
           name: '我的任务',
           description: '默认任务列表',
           color: '#3b82f6',
           createdAt: new Date(),
           updatedAt: new Date()
         }
        
        await storageService.saveList(defaultList)
        lists.value = [defaultList]
        currentListId.value = defaultList.id
        console.log('[useStore] Default list created:', defaultList.id)
      } else {
        lists.value = loadedLists
        currentListId.value = loadedLists[0].id
        console.log('[useStore] Lists loaded, current list:', currentListId.value)
      }
      
      // 设置应用设置
      if (loadedSettings) {
        settings.value = { ...defaultSettings, ...loadedSettings }
        console.log('[useStore] Settings loaded')
      } else {
        console.log('[useStore] No settings found, using defaults')
      }
      
      // 配置WebDAV
      console.log('[useStore] Configuring WebDAV...')
      webdavService.configure(settings.value.webdav)
      
      isInitialized.value = true
      console.log('[useStore] App initialized successfully, isInitialized:', isInitialized.value)
      
      // 如果启用了自动同步，执行同步
      if (settings.value.autoSync && settings.value.webdav.enabled) {
        await syncData()
      }
    } catch (error) {
      console.error('[useStore] Failed to initialize app:', error)
      console.error('[useStore] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      isInitialized.value = false
      
      // 显示用户友好的错误信息
      toast.error('应用初始化失败，请刷新页面重试')
    }
  }

  /**
   * 创建默认列表（保留函数但不自动调用）
   */
  const createDefaultList = async () => {
    const defaultList: TaskList = {
      id: generateId(),
      name: '我的任务',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await createList(defaultList)
  }

  /**
   * 生成唯一ID
   */
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * 创建任务
   */
  const createTask = async (taskData: { title: string; content?: string; listId?: string; priority?: TaskPriority }) => {
    const targetListId = taskData.listId || currentListId.value
    if (!targetListId) {
      toast.error('请先选择一个列表')
      return
    }

    const task: Task = {
      id: generateId(),
      title: taskData.title.trim(),
      content: taskData.content?.trim() || undefined,
      status: TaskStatus.PENDING,
      priority: taskData.priority || TaskPriority.MEDIUM,
      createdAt: new Date(),
      updatedAt: new Date(),
      listId: targetListId
    }

    try {
      await storageService.saveTask(task)
      tasks.value.push(task)
      toast.success('任务已添加')
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('创建任务失败')
    }
  }

  /**
   * 更新任务
   */
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const taskIndex = tasks.value.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    const updatedTask = {
      ...tasks.value[taskIndex],
      ...updates,
      updatedAt: new Date()
    }

    try {
      await storageService.saveTask(updatedTask)
      tasks.value[taskIndex] = updatedTask
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('更新任务失败')
    }
  }

  /**
   * 删除任务
   */
  const deleteTask = async (taskId: string) => {
    try {
      await storageService.deleteTask(taskId)
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
      toast.success('任务已删除')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('删除任务失败')
    }
  }

  /**
   * 切换任务状态
   */
  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    const newStatus = task.status === TaskStatus.PENDING ? TaskStatus.COMPLETED : TaskStatus.PENDING
    const updates: Partial<Task> = { status: newStatus }
    
    // 如果任务完成，设置完成时间；如果取消完成，清除完成时间
    if (newStatus === TaskStatus.COMPLETED) {
      updates.completedAt = new Date()
    } else {
      updates.completedAt = undefined
    }
    
    await updateTask(taskId, updates)
  }

  /**
   * 创建列表
   */
  const createList = async (list: TaskList) => {
    try {
      await storageService.saveList(list)
      lists.value.push(list)
      toast.success('列表已创建')
    } catch (error) {
      console.error('Failed to create list:', error)
      toast.error('创建列表失败')
    }
  }

  /**
   * 更新列表
   */
  const updateList = async (listId: string, updates: Partial<TaskList>) => {
    const listIndex = lists.value.findIndex(l => l.id === listId)
    if (listIndex === -1) return

    const updatedList = {
      ...lists.value[listIndex],
      ...updates,
      updatedAt: new Date()
    }

    try {
      await storageService.saveList(updatedList)
      lists.value[listIndex] = updatedList
    } catch (error) {
      console.error('Failed to update list:', error)
      toast.error('更新列表失败')
    }
  }

  /**
   * 删除列表
   */
  const deleteList = async (listId: string) => {
    console.log(`[useStore] deleteList called with listId: ${listId}`)

    if (lists.value.length <= 1) {
      console.warn('[useStore] Cannot delete the last list.')
      toast.warning('至少需要保留一个列表')
      return
    }

    try {
      console.log(`[useStore] Deleting list ${listId} and its tasks...`)

      // 1. 从 IndexedDB 中删除列表本身
      await storageService.deleteList(listId)
      console.log(`[useStore] List ${listId} deleted from storage.`)

      // 2. 从 IndexedDB 中删除该列表下的所有任务
      const tasksToDelete = tasks.value.filter(t => t.listId === listId)
      console.log(`[useStore] Found ${tasksToDelete.length} tasks to delete.`)
      await Promise.all(tasksToDelete.map(task => storageService.deleteTask(task.id)))
      console.log(`[useStore] All associated tasks deleted from storage.`)

      // 3. 更新本地状态：移除任务
      tasks.value = tasks.value.filter(t => t.listId !== listId)
      console.log('[useStore] Local tasks state updated.')

      // 4. 更新本地状态：移除列表
      const listIndex = lists.value.findIndex(l => l.id === listId)
      if (listIndex > -1) {
        lists.value.splice(listIndex, 1)
        console.log('[useStore] Local lists state updated.')
      }

      // 5. 如果删除的是当前选中的列表，则切换到另一个列表
      if (currentListId.value === listId) {
        currentListId.value = lists.value.length > 0 ? lists.value[0].id : null
        console.log(`[useStore] Current list changed to: ${currentListId.value}`)
      }

      toast.success('列表已成功删除')
      console.log(`[useStore] List ${listId} successfully deleted.`)

    } catch (error) {
      console.error(`[useStore] Failed to delete list ${listId}:`, error)
      toast.error('删除列表失败，请检查控制台获取更多信息。')
    }
  }

  /**
   * 切换当前列表
   */
  const setCurrentList = (listId: string) => {
    currentListId.value = listId
  }

  /**
   * 更新设置
   */
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    
    try {
      // 创建纯对象副本以避免reactive对象序列化问题
      const settingsToSave = JSON.parse(JSON.stringify(settings.value))
      await storageService.saveSettings(settingsToSave)
      webdavService.configure(settings.value.webdav)
      toast.success('设置已保存')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('保存设置失败')
    }
  }

  /**
   * 测试WebDAV连接
   */
  const testWebDAVConnection = async (): Promise<boolean> => {
    try {
      return await webdavService.testConnection()
    } catch (error) {
      console.error('WebDAV connection test failed:', error)
      return false
    }
  }

  /**
   * 同步数据
   */
  const syncData = async () => {
    if (!webdavService.isConfigured()) {
      toast.error('请先配置WebDAV')
      return
    }

    syncStatus.value = SyncStatus.SYNCING
    
    try {
      const syncedData = await webdavService.sync(tasks.value, lists.value)
      
      // 更新本地数据
      tasks.value = syncedData.tasks
      lists.value = syncedData.lists
      
      // 保存到本地存储
      await Promise.all([
        ...syncedData.tasks.map(task => storageService.saveTask(task)),
        ...syncedData.lists.map(list => storageService.saveList(list))
      ])
      
      lastSyncTime.value = new Date()
      syncStatus.value = SyncStatus.SUCCESS
      toast.success('同步完成')
    } catch (error) {
      console.error('Sync failed:', error)
      syncStatus.value = SyncStatus.ERROR
      toast.error('同步失败')
    }
  }

  // 计算属性
  const currentList = computed(() => {
    return lists.value.find(l => l.id === currentListId.value) || null
  })

  const currentTasks = computed(() => {
    if (!currentListId.value) return []
    return tasks.value.filter(t => t.listId === currentListId.value)
  })

  const pendingTasks = computed(() => {
    return currentTasks.value.filter(t => t.status === 'pending')
  })

  const completedTasks = computed(() => {
    return currentTasks.value.filter(t => t.status === 'completed')
  })

  const taskStats = computed(() => {
    const total = currentTasks.value.length
    const completed = completedTasks.value.length
    const pending = pendingTasks.value.length
    
    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })

  return {
    // 状态
    tasks,
    lists,
    currentListId,
    settings,
    syncStatus,
    lastSyncTime,
    isInitialized,
    
    // 计算属性
    currentList,
    currentTasks,
    pendingTasks,
    completedTasks,
    taskStats,
    
    // 方法
    initApp,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    createList,
    updateList,
    deleteList,
    setCurrentList,
    updateSettings,
    testWebDAVConnection,
    syncData,
    generateId
  }
}