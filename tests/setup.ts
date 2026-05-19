// tests/setup.ts
// 全局测试 setup

import { vi } from 'vitest'

// Mock Nuxt 自动导入的 composables
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: 'http://localhost:3000/api',
      appName: 'Test App',
      appVersion: '1.0.0',
    },
  }),
  useNuxtApp: () => ({}),
  navigateTo: vi.fn(),
  useCookie: () => ({ value: null }),
}))
