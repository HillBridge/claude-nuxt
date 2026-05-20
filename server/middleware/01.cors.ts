// server/middleware/01.cors.ts
// 服务端中间件 - CORS 处理（数字前缀控制顺序）

export default defineEventHandler((event) => {
  // 只对 API 路由添加 CORS 头
  if (!event.path.startsWith('/api/')) return

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000']
  const origin = getHeader(event, 'origin') ?? ''

  if (allowedOrigins.includes(origin)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
  }
  setHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type,X-Request-ID')
  setHeader(event, 'Access-Control-Allow-Credentials', 'true')
  setHeader(event, 'Access-Control-Max-Age', 86400)

  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
