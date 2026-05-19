// app/stores/auth.store.ts
// 认证 Store - 处理登录、登出、token、用户信息

import { defineStore } from 'pinia'

import { userRepository } from '~/repositories/user.repository'
import type { User, LoginParams } from '~/types'

interface AuthState {
  user: User | null
  isInitialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isInitialized: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    userRole: (state) => state.user?.role ?? 'guest',
    // 权限检查
    can: (state) => (permission: string) => {
      const rolePermissions: Record<string, string[]> = {
        admin: ['*'],
        manager: ['users:read', 'users:write', 'reports:read'],
        member: ['users:read'],
        guest: [],
      }
      const role = state.user?.role ?? 'guest'
      const perms = rolePermissions[role] ?? []
      return perms.includes('*') || perms.includes(permission)
    },
  },

  actions: {
    // ---- 登录 ----
    async login(params: LoginParams) {
      const result = await userRepository.login(params)
      // token 由 http client 拦截器处理写入 cookie
      this.user = result.user
      return result
    },

    // ---- 登出 ----
    async logout() {
      try {
        await userRepository.logout()
      } finally {
        this.user = null
        await navigateTo('/login')
      }
    },

    // ---- 初始化（app 启动时调用）----
    async initialize() {
      if (this.isInitialized) return
      try {
        this.user = await userRepository.getProfile()
      } catch {
        // 未登录或 token 过期，静默处理
        this.user = null
      } finally {
        this.isInitialized = true
      }
    },

    // ---- 刷新用户信息 ----
    async refreshProfile() {
      this.user = await userRepository.getProfile()
    },
  },

  // 持久化（使用 pinia-plugin-persistedstate 或 cookie）
  persist: {
    storage: piniaPluginPersistedstate.cookies({
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    }),
    pick: ['user'],
  },
})
