// server/api/auth/refresh.post.ts
// POST /api/auth/refresh - 静默续期
// 读 refresh_token cookie → 验证 → 签发新 auth_token 写回 cookie
// 客户端无需传任何参数，新 token 通过 Set-Cookie 下发

import { verifyToken, signToken } from '../../utils/auth'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')
  if (!refreshToken) {
    throw createError({ statusCode: 401, statusMessage: '登录已过期，请重新登录' })
  }

  let payload
  try {
    payload = await verifyToken(refreshToken)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'refresh token 无效或已过期' })
  }

  const newAccessToken = await signToken(
    { sub: payload.sub, email: payload.email, role: payload.role },
    '1d',
  )

  setCookie(event, 'auth_token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return successResponse(null)
})
