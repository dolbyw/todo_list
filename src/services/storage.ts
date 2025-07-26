import type { Task, TaskList, AppSettings } from '../types'

/**
 * IndexedDB数据库管理类
 * 负责本地数据的存储和检索
 */
class StorageService {
  private dbName = 'TodoAppDB'
  private version = 1
  private db: IDBDatabase | null = null

  /**
   * 初始化数据库连接
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建任务表
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
          taskStore.createIndex('listId', 'listId', { unique: false })
          taskStore.createIndex('status', 'status', { unique: false })
        }

        // 创建列表表
        if (!db.objectStoreNames.contains('lists')) {
          db.createObjectStore('lists', { keyPath: 'id' })
        }

        // 创建设置表
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      }
    })
  }

  /**
   * 获取所有任务
   */
  async getTasks(): Promise<Task[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly')
      const store = transaction.objectStore('tasks')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  /**
   * 根据列表ID获取任务
   */
  async getTasksByListId(listId: string): Promise<Task[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly')
      const store = transaction.objectStore('tasks')
      const index = store.index('listId')
      const request = index.getAll(listId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  /**
   * 保存任务
   */
  async saveTask(task: Task): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite')
      const store = transaction.objectStore('tasks')
      const request = store.put(task)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite')
      const store = transaction.objectStore('tasks')
      const request = store.delete(taskId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * 获取所有列表
   */
  async getLists(): Promise<TaskList[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['lists'], 'readonly')
      const store = transaction.objectStore('lists')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  /**
   * 保存列表
   */
  async saveList(list: TaskList): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['lists'], 'readwrite')
      const store = transaction.objectStore('lists')
      const request = store.put(list)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * 删除列表
   */
  async deleteList(listId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['lists'], 'readwrite')
      const store = transaction.objectStore('lists')
      const request = store.delete(listId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * 获取应用设置
   */
  async getSettings(): Promise<AppSettings | null> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly')
      const store = transaction.objectStore('settings')
      const request = store.get('app-settings')

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result?.value || null)
    })
  }

  /**
   * 保存应用设置
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')
      const request = store.put({ key: 'app-settings', value: settings })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * 清空所有数据
   */
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const transaction = this.db.transaction(['tasks', 'lists', 'settings'], 'readwrite')
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('tasks').clear()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('lists').clear()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('settings').clear()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    ])
  }
}

export const storageService = new StorageService()