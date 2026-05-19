// app/utils/http/client.ts
// HTTP 客户端 - 封装 ofetch，统一处理认证、错误、loading
// 这是整个 API 层的基础，业务代码不应直接使用，应通过 repository 访问

import { ofetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'

import { HttpError, BusinessCode } from '~/types/api/http'
import type { ApiResponse, RequestConfig } from '~/types'

// ============================================================
// Token 管理（使用 cookie 实现 SSR 兼容）
// ============================================================
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

function getToken(): string | null {
  if (import.meta.server) return null
  return useCookie(TOKEN_KEY).value ?? null
}

function setToken(token: string, refreshToken?: string): void {
  const accessTokenCookie = useCookie(TOKEN_KEY, { maxAge: 7 * 24 * 60 * 60 })
  accessTokenCookie.value = token
  if (refreshToken) {
    const refreshTokenCookie = useCookie(REFRESH_TOKEN_KEY, { maxAge: 30 * 24 * 60 * 60 })
    refreshTokenCookie.value = refreshToken
  }
}

function clearToken(): void {
  useCookie(TOKEN_KEY).value = null
  useCookie(REFRESH_TOKEN_KEY).value = null
}

// ============================================================
// 刷新 token 防并发：同时只有一个 refresh 请求
// ============================================================
let refreshPromise: Promise<string> | null = null

async function doRefreshToken(): Promise<string> {
  const refreshToken = useCookie(REFRESH_TOKEN_KEY).value
  if (!refreshToken) throw new HttpError(401, '登录已过期，请重新登录')

  const result = await ofetch<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    '/auth/refresh',
    { method: 'POST', body: { refreshToken } },
  )
  setToken(result.data.accessToken, result.data.refreshToken)
  return result.data.accessToken
}

// ============================================================
// 创建 HTTP 实例
// ============================================================
export function createHttpClient(config: RequestConfig = {}) {
  const runtimeConfig = useRuntimeConfig()
  const baseURL = config.baseURL ?? runtimeConfig.public.apiBaseUrl

  const options: FetchOptions = {
    baseURL,
    timeout: config.timeout ?? 15000,

    // ---- 请求拦截 ----
    async onRequest({ options }) {
      const token = getToken()
      if (token && config.auth !== false) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }
      // 添加请求 ID，方便链路追踪
      options.headers = {
        ...options.headers,
        'X-Request-ID': crypto.randomUUID(),
        'X-App-Version': runtimeConfig.public.appVersion,
      }
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
    async onResponseError({ response, options: fetchOptions }) {
      // 401 - 尝试 refresh token
      if (response.status === 401) {
        try {
          if (!refreshPromise) {
            refreshPromise = doRefreshToken().finally(() => {
              refreshPromise = null
            })
          }
          const newToken = await refreshPromise
          // 用新 token 重试一次
          fetchOptions.headers = {
            ...fetchOptions.headers,
            Authorization: `Bearer ${newToken}`,
          }
          return
        } catch {
          clearToken()
          await navigateTo('/login')
        }
      }

      const msg = (response._data as ApiResponse)?.message ?? response.statusText
      throw new HttpError(response.status, msg, response._data)
    },
  }

  return ofetch.create(options)
}

// 默认客户端实例（单例）
let _client: ReturnType<typeof createHttpClient> | null = null

export function useHttpClient() {
  if (!_client) {
    _client = createHttpClient()
  }
  return _client
}
