// server/api/users/index.get.ts
// GET /api/users - 用户列表
// 文件命名规则：[method].ts 自动绑定 HTTP 方法

import { paginatedResponse } from '../../utils/response'
import { getAuthUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // 验证认证
  await getAuthUser(event)

  // 解析查询参数
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Math.min(Number(query.pageSize) || 20, 100)
  const _keyword = String(query.keyword || '')

  // TODO: 替换为真实数据库查询
  // const users = await db.user.findMany({ ... })
  const mockUsers = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: 'member',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))

  return paginatedResponse(mockUsers, mockUsers.length, page, pageSize)
})
