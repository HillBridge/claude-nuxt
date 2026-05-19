// app/stores/app.store.ts
// 应用全局状态 - 主题、语言、全局 loading、侧边栏等

import { defineStore } from 'pinia'

type Theme = 'light' | 'dark' | 'system'

interface AppState {
  theme: Theme
  sidebarCollapsed: boolean
  globalLoading: boolean
  // 用于全局 loading 计数（多个并发请求时保持 loading 状态）
  loadingCount: number
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: 'system',
    sidebarCollapsed: false,
    globalLoading: false,
    loadingCount: 0,
  }),

  getters: {
    isDark: (state) => {
      if (state.theme === 'dark') return true
      if (state.theme === 'light') return false
      // system - 读取系统偏好
      return import.meta.client
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false
    },
  },

  actions: {
    setTheme(theme: Theme) {
      this.theme = theme
      if (import.meta.client) {
        document.documentElement.setAttribute('data-theme', theme)
      }
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    // loading 计数器方式，避免多请求闪烁
    showLoading() {
      this.loadingCount++
      this.globalLoading = true
    },

    hideLoading() {
      this.loadingCount = Math.max(0, this.loadingCount - 1)
      if (this.loadingCount === 0) {
        this.globalLoading = false
      }
    },
  },

  persist: {
    pick: ['theme', 'sidebarCollapsed'],
  },
})
