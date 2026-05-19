// app/repositories/user.repository.ts
// 用户 Repository - 展示如何继承 BaseRepository 扩展业务方法

import { BaseRepository } from '~/utils/http/base-repository'
import type {
  User,
  UserProfile,
  LoginParams,
  LoginResult,
  RegisterParams,
  UserQueryParams,
} from '~/types'

export class UserRepository extends BaseRepository<User, RegisterParams, Partial<User>, UserQueryParams> {
  constructor() {
    super('/users')
  }

  // ---- Auth 相关（不在 CRUD 范围内的独立方法）----

  async login(params: LoginParams): Promise<LoginResult> {
    return this.http<LoginResult>('/auth/login', {
      method: 'POST',
      body: params,
    })
  }

  async logout(): Promise<void> {
    await this.http('/auth/logout', { method: 'POST' })
  }

  async refreshToken(refreshToken: string): Promise<LoginResult> {
    return this.http<LoginResult>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    })
  }

  // ---- 用户信息 ----

  async getProfile(): Promise<UserProfile> {
    return this.http<UserProfile>('/users/me')
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.http<UserProfile>('/users/me', {
      method: 'PATCH',
      body: data,
    })
  }

  async changePassword(params: {
    oldPassword: string
    newPassword: string
  }): Promise<void> {
    await this.http('/users/me/password', {
      method: 'POST',
      body: params,
    })
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const result = await this.upload(file, undefined)
    return { url: result.url }
  }
}

// 单例导出（避免重复实例化）
export const userRepository = new UserRepository()
