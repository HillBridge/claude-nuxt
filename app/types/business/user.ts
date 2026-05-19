// app/types/business/user.ts
// 用户业务类型 - 作为示例展示 Business Types 的组织方式

export type UserRole = 'admin' | 'manager' | 'member' | 'guest'
export type UserStatus = 'active' | 'inactive' | 'banned'

export interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  phone?: string
  bio?: string
  settings: UserSettings
}

export interface UserSettings {
  language: string
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
}

// 登录
export interface LoginParams {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  user: User
  expiresIn: number
}

// 注册
export interface RegisterParams {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// 用户查询
export interface UserQueryParams {
  keyword?: string
  role?: UserRole
  status?: UserStatus
  page?: number
  pageSize?: number
}
