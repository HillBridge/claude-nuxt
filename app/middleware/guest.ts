// app/middleware/guest.ts
// 访客守卫 - 已登录用户访问登录等公开页时重定向到后台

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (authStore.isLoggedIn) return navigateTo('/dashboard/users')
})
