// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // ============================================================
  // 开发工具
  // ============================================================
  devtools: { enabled: true },

  // ============================================================
  // 源码目录 - 统一放在 app/ 下，server/ 单独管理
  // ============================================================
  srcDir: 'app/',
  serverDir: 'server',

  // ============================================================
  // Nuxt Layers - 按业务域拆分模块
  // ============================================================
  extends: ['./layers/auth', './layers/admin'],

  // ============================================================
  // 模块
  // ============================================================
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
  ],

  // ============================================================
  // 自动导入 - 扩展默认扫描目录
  // ============================================================
  imports: {
    dirs: ['stores/**', 'composables/**', 'utils/**'],
  },

  // ============================================================
  // 组件自动发现 - 按目录前缀命名，避免冲突
  // ============================================================
  components: [
    { path: '~/components/base', prefix: 'Base' },
    { path: '~/components/common', prefix: 'Common' },
    { path: '~/components/business', prefix: '' },
    { path: '~/components/layout', prefix: 'Layout' },
  ],

  // ============================================================
  // 路由规则 - 混合渲染策略
  // ============================================================
  routeRules: {
    // 首页需要 auth 判断，不适合静态预渲染
    '/': { ssr: true },
    // 服务端渲染（需要 SEO 的页面）
    '/blog/**': { ssr: true },
    // SPA 模式（纯交互页面，无 SEO 需求）
    '/dashboard/**': { ssr: true },
    // ISR - 增量静态再生
    '/products/**': { isr: 3600 },
    // 服务端 API 代理
    '/api/proxy/**': { proxy: { to: process.env.NUXT_API_BASE_URL + '/**' } },
  },

  // ============================================================
  // 运行时配置
  // 规则: 公开配置放 public，私密配置放顶层
  // ============================================================
  runtimeConfig: {
    // 仅服务端可访问
    apiSecret: '',
    databaseUrl: '',
    // 客户端 + 服务端均可访问
    public: {
      apiBaseUrl: '/api',
      appName: 'Nuxt Enterprise',
      appVersion: '1.0.0',
    },
  },

  // ============================================================
  // CSS 全局样式
  // ============================================================
  css: ['~/assets/css/tailwind.css', '~/assets/css/variables.css', '~/assets/css/global.css'],

  // ============================================================
  // PostCSS
  // ============================================================
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // ============================================================
  // TypeScript
  // ============================================================
  typescript: {
    strict: true,
    // 类型检查通过 pnpm type-check 单独运行，避免拖慢 dev server 启动
    typeCheck: false,
  },

  // ============================================================
  // i18n
  // ============================================================
  i18n: {
    locales: [
      { code: 'zh', file: 'zh.json', name: '中文' },
      { code: 'en', file: 'en.json', name: 'English' },
    ],
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    lazy: true,
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  // ============================================================
  // Nitro 服务端配置
  // ============================================================
  nitro: {
    // 压缩响应
    compressPublicAssets: true,
    // 服务端路由规则
    routeRules: {
      '/api/**': {
        headers: { 'cache-control': 'no-store' },
      },
    },
  },

  // ============================================================
  // Vite 构建优化
  // ============================================================
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
          },
        },
      },
    },
  },

  // ============================================================
  // 实验性功能
  // ============================================================
  experimental: {
    // 组件懒加载元数据
    componentIslands: true,
    // 视图过渡 API
    viewTransition: true,
  },

  compatibilityDate: '2025-01-01',
})
