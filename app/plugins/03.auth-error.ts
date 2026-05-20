// app/plugins/03.auth-error.ts
// 兜底：捕获 SSR runWithContext 失败时抛出的 fatal 401，补一次重定向
// 正常路径：client.ts onResponseError 通过 runWithContext + navigateTo 直接处理

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', async (error: unknown) => {
    const statusCode = (error as { statusCode?: number })?.statusCode
    if (statusCode === 401) {
      await navigateTo('/login', { redirectCode: 302 })
    }
  })
})
