// app/utils/http/client.ts
// HTTP 客户端 - 封装 ofetch，统一处理认证、错误、loading
// 这是整个 API 层的基础，业务代码不应直接使用，应通过 repository 访问
//
// 认证方案：HttpOnly Cookie（auth_token）
//   SSR：useRequestHeaders 透传浏览器 cookie → 后端 getCookie 读取
//   CSR：浏览器自动携带同源 cookie，无需客户端处理

import { ofetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'

import { HttpError, BusinessCode } from '~/types/api/http'
import type { ApiResponse, RequestConfig } from '~/types'

// ============================================================
// 创建 HTTP 实例
// ============================================================
export function createHttpClient(config: RequestConfig = {}) {
  const runtimeConfig = useRuntimeConfig()
  const path = config.baseURL ?? runtimeConfig.public.apiBaseUrl

  // Node.js fetch 不支持相对 URL，SSR 必须拼完整地址
  const baseURL = import.meta.server ? `${useRequestURL().origin}${path}` : path

  const options: FetchOptions = {
    baseURL,
    timeout: config.timeout ?? 15000,

    // ---- 请求拦截 ----
    async onRequest({ options }) {
      const existing = options.headers ?? new Headers()
      const headersObj: Record<string, string> = Object.fromEntries(existing)
      headersObj['X-Request-ID'] = crypto.randomUUID()
      headersObj['X-App-Version'] = runtimeConfig.public.appVersion

      if (import.meta.server) {
        // SSR：透传浏览器原始 cookie，useRequestHeaders 通过 AsyncLocalStorage 获取当前请求上下文
        const { cookie } = useRequestHeaders(['cookie'])
        if (cookie) headersObj['cookie'] = cookie
      }
      // CSR：浏览器自动携带 HttpOnly cookie，无需手动处理

      options.headers = new Headers(headersObj)
    },

    // ---- 响应拦截 ----
    async onResponse({ response }) {
      if (!response.ok) return
      const res = response._data as ApiResponse
      if (res.code !== BusinessCode.SUCCESS) {
        throw new HttpError(res.code, res.message, res.data)
      }
      response._data = res.data
    },

    // ---- 错误拦截 ----
    async onResponseError({ response }) {
      if (response.status === 401) {
        if (import.meta.client) {
          // window.location 绕过 Vue Router，避免 guest middleware 因 store 未清空而弹回 dashboard
          // 同时防止 initialize() 阶段的 401 触发死循环
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login'
          }
        } else {
          try {
            const nuxtApp = useNuxtApp()
            await nuxtApp.runWithContext(async () => {
              // 先清状态，确保 guest middleware 不会把 302 跳转再弹回来
              useAuthStore().$patch({ user: null })
              await navigateTo('/login', { redirectCode: 302 })
            })
          } catch {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized', fatal: true })
          }
        }
        throw new HttpError(401, 'Unauthorized', null)
      }

      const msg = (response._data as ApiResponse)?.message ?? response.statusText
      throw new HttpError(response.status, msg, response._data)
    },
  }

  return ofetch.create(options)
}

// 默认客户端实例
// CSR：单例复用；SSR：每次请求新建，避免跨请求共享上下文
let _client: ReturnType<typeof createHttpClient> | null = null

export function useHttpClient() {
  if (import.meta.server) {
    return createHttpClient()
  }
  if (!_client) {
    _client = createHttpClient()
  }
  return _client
}
