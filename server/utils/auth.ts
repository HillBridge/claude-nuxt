// server/utils/auth.ts
// 服务端认证工具 - 验证 JWT token

import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.NUXT_API_SECRET ?? 'dev-secret')

export interface JwtPayload {
  sub: number        // user id
  email: string
  role: string
  iat: number
  exp: number
}

export async function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload as unknown as JwtPayload
}

// 从请求头提取并验证 token
export async function getAuthUser(event: Parameters<typeof getHeader>[0]): Promise<JwtPayload> {
  const authorization = getHeader(event, 'authorization')
  if (!authorization?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: '未提供认证信息' })
  }
  const token = authorization.slice(7)
  try {
    return await verifyToken(token)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'token 无效或已过期' })
  }
}
