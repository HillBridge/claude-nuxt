// server/api/auth/login.post.ts
// POST /api/auth/login - 登录接口

import { z } from 'zod'

import { signToken } from '../../utils/auth'
import { successResponse } from '../../utils/response'

// Zod schema - 服务端输入验证
const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码不能少于6位'),
  remember: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 输入验证
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: parsed.error.errors[0]?.message ?? '参数错误',
    })
  }

  const { email, password, remember } = parsed.data

  // TODO: 查询数据库验证密码
  // const user = await db.user.findUnique({ where: { email } })
  // if (!user || !bcrypt.compareSync(password, user.passwordHash)) { ... }

  // 模拟用户（开发阶段）
  if (email !== 'admin@example.com' || password !== '123456') {
    throw createError({ statusCode: 401, statusMessage: '邮箱或密码错误' })
  }

  const mockUser = {
    id: 1,
    email,
    name: 'Admin',
    role: 'admin' as const,
    status: 'active' as const,
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60  // 30 天
  const SESSION_MAX_AGE  =  7 * 24 * 60 * 60  //  7 天

  const cookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }

  const accessToken = await signToken(
    { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
    remember ? '30d' : '1d',
  )
  setCookie(event, 'auth_token', accessToken, {
    ...cookieBase,
    ...(remember ? { maxAge: REMEMBER_MAX_AGE } : {}),
  })

  // refresh_token 用于在 access token 过期后静默续期
  const refreshToken = await signToken(
    { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
    remember ? '60d' : '7d',
  )
  setCookie(event, 'refresh_token', refreshToken, {
    ...cookieBase,
    maxAge: remember ? REMEMBER_MAX_AGE * 2 : SESSION_MAX_AGE,
  })

  return successResponse({ user: mockUser })
})
