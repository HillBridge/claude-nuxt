// app/plugins/02.error-handler.client.ts
// 客户端全局错误处理（.client.ts 只在客户端执行）

export default defineNuxtPlugin((nuxtApp) => {
  const { notify } = useNotify()

  // Vue 组件级错误
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('[Vue Error]', error, info)
    notify.error('页面出现异常，请刷新重试')
  }

  // 未捕获的 Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    // HttpError 已在 http client 中处理，这里处理其他情况
    console.error('[Unhandled Rejection]', event.reason)
  })
})
