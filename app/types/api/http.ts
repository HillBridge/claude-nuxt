// app/types/api/http.ts
// HTTP 客户端相关类型

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestConfig {
  baseURL?: string
  headers?: Record<string, string>
  timeout?: number
  // 是否携带 token
  auth?: boolean
  // 是否显示全局 loading
  loading?: boolean
  // 是否显示错误 toast
  showError?: boolean
}

export interface UploadConfig extends RequestConfig {
  onProgress?: (percent: number) => void
}

// HTTP 错误
export class HttpError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

// 业务错误码
export const enum BusinessCode {
  SUCCESS = 0,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  SERVER_ERROR = 500,
}
