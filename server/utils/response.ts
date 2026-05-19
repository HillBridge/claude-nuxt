// server/utils/response.ts
// 服务端工具 - 统一 API 响应格式

export function successResponse<T>(data: T, message = 'success') {
  return {
    code: 0,
    message,
    data,
    timestamp: Date.now(),
  }
}

export function errorResponse(message: string, code = 500, data?: unknown) {
  return {
    code,
    message,
    data: data ?? null,
    timestamp: Date.now(),
  }
}

export function paginatedResponse<T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return successResponse({
    list,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  })
}
