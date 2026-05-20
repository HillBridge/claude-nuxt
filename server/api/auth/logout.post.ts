// server/api/auth/logout.post.ts
// POST /api/auth/logout - 退出登录

import { successResponse } from '../../utils/response'

export default defineEventHandler((event) => {
  deleteCookie(event, 'auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  return successResponse(null)
})
