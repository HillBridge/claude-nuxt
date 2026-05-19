// layers/admin/nuxt.config.ts
// Admin Layer - 后台管理相关功能

export default defineNuxtConfig({
  // admin 路由规则
  routeRules: {
    '/admin/**': { ssr: false },
  },
})
