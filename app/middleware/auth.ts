// app/middleware/auth.ts
// 路由守卫 - 保护需要登录的页面

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // 未登录跳转到登录页，并记录原始目标路径（登录后跳回）
  if (!authStore.isLoggedIn) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
