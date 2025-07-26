import { createClient } from 'webdav'
import type { WebDAVClient } from 'webdav'
import type { Task, TaskList, WebDAVConfig } from '../types'

/**
 * WebDAV同步服务类
 * 负责与WebDAV服务器进行数据同步
 */
class WebDAVService {
  private client: WebDAVClient | null = null
  private config: WebDAVConfig | null = null
  private readonly dataFileName = 'todoapp-data.json'

  /**
   * 配置WebDAV客户端
   */
  configure(config: WebDAVConfig): void {
    this.config = config
    if (config.enabled && config.url && config.username && config.password) {
      this.client = createClient(config.url, {
        username: config.username,
        password: config.password
      })
    } else {
      this.client = null
    }
  }

  /**
   * 测试WebDAV连接
   */
  async testConnection(): Promise<boolean> {
    if (!this.client || !this.config?.enabled) {
      throw new Error('WebDAV not configured')
    }

    try {
      await this.client.getDirectoryContents('/')
      return true
    } catch (error) {
      console.error('WebDAV connection test failed:', error)
      return false
    }
  }

  /**
   * 上传数据到WebDAV服务器
   */
  async uploadData(tasks: Task[], lists: TaskList[]): Promise<void> {
    if (!this.client || !this.config?.enabled) {
      throw new Error('WebDAV not configured')
    }

    const data = {
      tasks: tasks.map(task => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      })),
      lists: lists.map(list => ({
        ...list,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString()
      })),
      lastSync: new Date().toISOString()
    }

    try {
      await this.client.putFileContents(
        `/${this.dataFileName}`,
        JSON.stringify(data, null, 2),
        { overwrite: true }
      )
    } catch (error) {
      console.error('Failed to upload data to WebDAV:', error)
      throw new Error('同步上传失败')
    }
  }

  /**
   * 从WebDAV服务器下载数据
   */
  async downloadData(): Promise<{ tasks: Task[], lists: TaskList[] } | null> {
    if (!this.client || !this.config?.enabled) {
      throw new Error('WebDAV not configured')
    }

    try {
      const exists = await this.client.exists(`/${this.dataFileName}`)
      if (!exists) {
        return null
      }

      const content = await this.client.getFileContents(`/${this.dataFileName}`, { format: 'text' })
      const data = JSON.parse(content as string)

      return {
        tasks: data.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        })),
        lists: data.lists.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt)
        }))
      }
    } catch (error) {
      console.error('Failed to download data from WebDAV:', error)
      throw new Error('同步下载失败')
    }
  }

  /**
   * 检查是否已配置WebDAV
   */
  isConfigured(): boolean {
    return this.client !== null && this.config?.enabled === true
  }

  /**
   * 获取当前配置
   */
  getConfig(): WebDAVConfig | null {
    return this.config
  }

  /**
   * 同步数据（上传本地数据到服务器）
   */
  async syncUp(tasks: Task[], lists: TaskList[]): Promise<void> {
    await this.uploadData(tasks, lists)
  }

  /**
   * 同步数据（从服务器下载数据）
   */
  async syncDown(): Promise<{ tasks: Task[], lists: TaskList[] } | null> {
    return await this.downloadData()
  }

  /**
   * 双向同步（简单的最后写入者优先策略）
   */
  async sync(localTasks: Task[], localLists: TaskList[]): Promise<{ tasks: Task[], lists: TaskList[] }> {
    try {
      // 先尝试下载远程数据
      const remoteData = await this.downloadData()
      
      if (!remoteData) {
        // 如果远程没有数据，直接上传本地数据
        await this.uploadData(localTasks, localLists)
        return { tasks: localTasks, lists: localLists }
      }

      // 简单的合并策略：使用远程数据（最后写入者优先）
      // 在实际应用中，这里可以实现更复杂的冲突解决策略
      await this.uploadData(remoteData.tasks, remoteData.lists)
      return remoteData
    } catch (error) {
      console.error('Sync failed:', error)
      throw error
    }
  }
}

export const webdavService = new WebDAVService()