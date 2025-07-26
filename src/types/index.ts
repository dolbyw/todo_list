// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

// 任务优先级枚举
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// 排序类型枚举
export type SortType = 'createdDate' | 'priority' | 'title'
export type FilterType = 'all' | 'pending' | 'completed' | 'highPriority'

// 任务接口
export interface Task {
  id: string
  title: string
  content?: string // 任务内容描述
  status: TaskStatus
  priority: TaskPriority
  createdAt: Date
  updatedAt: Date
  listId: string
  completedAt?: Date
}

// 任务列表接口
export interface TaskList {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// WebDAV配置接口
export interface WebDAVConfig {
  url: string
  username: string
  password: string
  enabled: boolean
}

// 应用设置接口
export interface AppSettings {
  theme: 'light' | 'dark'
  webdav: WebDAVConfig
  autoSync: boolean
  progressScope: 'all' | 'current' // 完成进度显示范围：全部任务或当前列表
}

// 同步状态枚举
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error'
}

// 应用状态接口
export interface AppState {
  tasks: Task[]
  lists: TaskList[]
  currentListId: string | null
  settings: AppSettings
  syncStatus: SyncStatus
  lastSyncTime: Date | null
}