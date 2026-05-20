// server/api/users/me.get.ts
// GET /api/users/me - 获取当前登录用户信息

import { getAuthUser } from '../../utils/auth'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const jwtUser = await getAuthUser(event)

  // TODO: 查询数据库获取完整用户信息
  // const user = await db.user.findUnique({ where: { id: jwtUser.sub } })

  return successResponse({
    id: jwtUser.sub,
    email: jwtUser.email,
    name: 'Admin',
    role: jwtUser.role,
    status: 'active',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
})
