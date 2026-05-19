// server/api/auth/login.post.ts
// POST /api/auth/login - 登录接口

import { z } from 'zod'

import { signToken } from '~/server/utils/auth'
import { successResponse } from '~/server/utils/response'

// Zod schema - 服务端输入验证
const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码不能少于6位'),
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

  const { email, password } = parsed.data

  // TODO: 查询数据库验证密码
  // const user = await db.user.findUnique({ where: { email } })
  // if (!user || !bcrypt.compareSync(password, user.passwordHash)) { ... }

  // 模拟用户（开发阶段）
  if (email !== 'admin@example.com' || password !== '123456') {
    throw createError({ statusCode: 401, statusMessage: '邮箱或密码错误' })
  }

  const mockUser = { id: 1, email, name: 'Admin', role: 'admin' as const, status: 'active' as const, avatar: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }

  const accessToken = await signToken({
    sub: mockUser.id,
    email: mockUser.email,
    role: mockUser.role,
  })

  return successResponse({
    accessToken,
    refreshToken: `refresh_${crypto.randomUUID()}`,
    user: mockUser,
    expiresIn: 7 * 24 * 60 * 60,
  })
})
