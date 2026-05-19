// app.config.ts - 客户端运行时配置（不含敏感信息，会打包进客户端）
// 与 runtimeConfig 的区别：app.config 支持热更新，适合主题、UI 配置
export default defineAppConfig({
  // 应用元信息
  app: {
    name: 'Nuxt Enterprise',
    description: '企业级 Nuxt 应用',
    logo: '/images/logo.svg',
  },

  // UI 主题配置
  ui: {
    // 主色调
    primaryColor: 'indigo',
    // 圆角级别: 'none' | 'sm' | 'md' | 'lg' | 'full'
    borderRadius: 'md',
    // 暗色模式: 'system' | 'light' | 'dark'
    defaultTheme: 'system',
  },

  // 分页配置
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Toast 通知配置
  toast: {
    position: 'top-right' as const,
    duration: 3000,
  },
})
