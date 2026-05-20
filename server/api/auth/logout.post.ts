// server/api/auth/logout.post.ts
// POST /api/auth/logout - 退出登录

import { successResponse } from '../../utils/response'

export default defineEventHandler((event) => {
  const cookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
  deleteCookie(event, 'auth_token', cookieBase)
  deleteCookie(event, 'refresh_token', cookieBase)
  return successResponse(null)
})
