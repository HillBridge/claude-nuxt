// app/plugins/01.auth-init.ts
// 插件命名规则：数字前缀控制执行顺序
// 01 最先执行 - 初始化认证状态（SSR/CSR 均需执行）

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  await authStore.initialize()
})
