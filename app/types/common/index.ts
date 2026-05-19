// app/types/common/index.ts
// 通用基础类型 - 全项目共用

// ============================================================
// 分页
// ============================================================
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResult<T> {
  list: T[]
  pagination: Pagination
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

// ============================================================
// API 响应结构
// ============================================================
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

export type ApiListResponse<T> = ApiResponse<PaginatedResult<T>>

// ============================================================
// 请求状态
// ============================================================
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  status: RequestStatus
  error: string | null
}

// ============================================================
// 选项类型（用于下拉框等）
// ============================================================
export interface SelectOption<T = string | number> {
  label: string
  value: T
  disabled?: boolean
  [key: string]: unknown
}

// ============================================================
// 树形结构
// ============================================================
export interface TreeNode<T = Record<string, unknown>> {
  id: string | number
  label: string
  children?: TreeNode<T>[]
  data?: T
}

// ============================================================
// 键值对
// ============================================================
export type Dict<T = string> = Record<string, T>

// ============================================================
// 排序
// ============================================================
export type SortOrder = 'asc' | 'desc'

export interface SortParams {
  sortField?: string
  sortOrder?: SortOrder
}

// ============================================================
// 通用查询参数
// ============================================================
export interface QueryParams extends PaginationParams, SortParams {
  keyword?: string
  [key: string]: unknown
}
