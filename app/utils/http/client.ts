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
// 刷新 token 防并发：同时只有一个 refresh 请求
// ============================================================
let refreshPromise: Promise<void> | null = null

async function doRefreshToken(): Promise<void> {
  const runtimeConfig = useRuntimeConfig()
  // 刷新接口由服务端负责读旧 cookie、写新 cookie，客户端无需传参
  await ofetch(`${runtimeConfig.public.apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
}

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
      const res = response._data as ApiResponse
      if (res.code !== BusinessCode.SUCCESS) {
        throw new HttpError(res.code, res.message, res.data)
      }
      // 只返回 data 字段，简化业务代码
      response._data = res.data
    },

    // ---- 错误拦截 ----
    async onResponseError({ response }) {
      // 401 - 尝试 refresh token
      // 刷新成功后服务端会 Set-Cookie 新 auth_token，后续重试自动携带
      if (response.status === 401) {
        try {
          if (!refreshPromise) {
            refreshPromise = doRefreshToken().finally(() => {
              refreshPromise = null
            })
          }
          await refreshPromise
          // 重试由 ofetch 调用方负责（返回不抛出即表示可以重试）
          return
        } catch {
          await navigateTo('/login')
        }
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
