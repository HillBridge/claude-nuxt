// app/middleware/permission.ts
// 权限中间件 - 检查页面级权限
// 使用：definePageMeta({ middleware: ['auth', 'permission'], permission: 'users:write' })

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const requiredPermission = to.meta.permission as string | undefined

  if (requiredPermission && !authStore.can(requiredPermission)) {
    throw createError({ statusCode: 403, statusMessage: '没有访问权限' })
  }
})
