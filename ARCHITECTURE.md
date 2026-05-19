# Nuxt Enterprise 架构文档

> 适用于 5-10 人前端团队的企业级 Nuxt 3 项目架构

---

## 目录结构总览

```
cluade-nuxt/
├── app/                          # 前端源码目录 (srcDir: 'app/')
│   ├── assets/
│   │   ├── css/
│   │   │   ├── tailwind.css      # Tailwind 入口
│   │   │   ├── variables.css     # CSS 变量（主题 token）
│   │   │   └── global.css        # 全局样式
│   │   ├── fonts/
│   │   └── images/
│   │
│   ├── components/               # 组件（原子设计分层）
│   │   ├── base/                 # 原子组件 → <BaseButton />
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Select.vue
│   │   │   ├── Modal.vue
│   │   │   └── ...
│   │   ├── common/               # 分子/通用组件 → <CommonDataTable />
│   │   │   ├── DataTable.vue
│   │   │   ├── PageHeader.vue
│   │   │   ├── ToastContainer.vue
│   │   │   ├── ConfirmDialog.vue
│   │   │   └── ...
│   │   ├── business/             # 业务组件（无前缀）→ <UserCard />
│   │   │   ├── UserCard.vue
│   │   │   └── ...
│   │   └── layout/               # 布局组件 → <LayoutAppSidebar />
│   │       ├── AppSidebar.vue
│   │       ├── AppHeader.vue
│   │       └── ...
│   │
│   ├── composables/              # Vue Composables（自动导入）
│   │   ├── api/
│   │   │   ├── use-list.ts       # 通用列表（分页+搜索+排序）
│   │   │   └── use-mutation.ts   # 通用增删改
│   │   ├── ui/
│   │   │   ├── use-notify.ts     # 全局通知
│   │   │   └── use-confirm.ts    # 确认对话框
│   │   └── utils/
│   │       └── use-download.ts   # 文件下载
│   │
│   ├── layouts/
│   │   ├── default.vue           # 后台管理布局（有侧边栏）
│   │   └── auth.vue              # 认证页布局（无侧边栏）
│   │
│   ├── locales/                  # i18n 翻译文件
│   │   ├── zh.json
│   │   └── en.json
│   │
│   ├── middleware/               # 路由中间件
│   │   ├── auth.ts               # 认证守卫
│   │   └── permission.ts         # 权限检查
│   │
│   ├── pages/                    # 路由页面（基于文件的路由）
│   │   ├── index.vue             # /
│   │   ├── login.vue             # /login
│   │   └── dashboard/
│   │       ├── index.vue         # /dashboard
│   │       └── users/
│   │           ├── index.vue     # /dashboard/users
│   │           └── [id].vue      # /dashboard/users/:id
│   │
│   ├── plugins/                  # Nuxt 插件（有序执行）
│   │   ├── 01.auth-init.ts       # 初始化认证状态
│   │   └── 02.error-handler.client.ts
│   │
│   ├── repositories/             # API Repository（数据访问层）
│   │   └── user.repository.ts
│   │
│   ├── stores/                   # Pinia 状态管理
│   │   ├── auth.store.ts
│   │   ├── app.store.ts
│   │   └── index.ts              # 统一出口
│   │
│   ├── types/                    # TypeScript 类型定义
│   │   ├── common/index.ts       # 分页、响应等通用类型
│   │   ├── api/http.ts           # HTTP 相关类型
│   │   ├── business/user.ts      # 业务类型（按领域拆分）
│   │   └── index.ts              # 统一出口
│   │
│   ├── utils/                    # 工具函数
│   │   └── http/
│   │       ├── client.ts         # HTTP 客户端（ofetch 封装）
│   │       └── base-repository.ts # Repository 基类
│   │
│   └── app.vue                   # 根组件
│
├── layers/                       # Nuxt Layers（按业务域模块化）
│   ├── auth/                     # 认证模块
│   │   ├── components/
│   │   │   └── AuthGuard.vue
│   │   └── nuxt.config.ts
│   └── admin/                    # 管理后台模块
│       └── nuxt.config.ts
│
├── server/                       # Nitro 服务端
│   ├── api/                      # API 路由
│   │   ├── auth/
│   │   │   └── login.post.ts     # POST /api/auth/login
│   │   └── users/
│   │       └── index.get.ts      # GET /api/users
│   ├── middleware/               # 服务端中间件
│   │   └── 01.cors.ts
│   └── utils/                    # 服务端工具
│       ├── response.ts           # 统一响应格式
│       └── auth.ts               # JWT 工具
│
├── tests/
│   ├── e2e/                      # Playwright E2E 测试
│   │   └── auth.spec.ts
│   ├── unit/                     # Vitest 单元测试
│   │   ├── composables/
│   │   └── utils/
│   └── setup.ts                  # 全局测试配置
│
├── .vscode/                      # VSCode 配置
├── app.config.ts                 # 应用配置（客户端可访问）
├── nuxt.config.ts                # Nuxt 主配置
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

---

## 核心设计原则

### 1. 分层架构

```
Pages / Components
       ↓
  Composables          ← 业务逻辑聚合层
       ↓
  Repositories         ← 数据访问抽象层
       ↓
  HTTP Client          ← 基础设施层（ofetch）
       ↓
  Server API           ← 服务端（Nitro）
```

**规则：每层只能调用下层，不允许跨层调用。**

### 2. 组件分层（原子设计）

| 层级 | 目录 | 前缀 | 职责 |
|------|------|------|------|
| 原子 | `components/base/` | `Base` | 无业务逻辑，纯 UI 原子 |
| 分子 | `components/common/` | `Common` | 组合多个 Base，通用场景 |
| 有机体 | `components/business/` | 无 | 与业务强绑定 |
| 模板 | `components/layout/` | `Layout` | 页面布局骨架 |

### 3. Repository 模式

所有 API 调用必须通过 Repository，**禁止在 Page/Store 中直接使用 `$fetch`**。

```ts
// ✅ 正确
const users = await userRepository.list({ page: 1 })

// ❌ 禁止
const users = await $fetch('/api/users')
```

### 4. Composable 复用策略

- `useList` —— 所有列表页使用，消除 80% 样板代码
- `useMutation` —— 所有增删改操作使用，统一 loading/error 处理
- `useNotify` —— 禁止直接操作 DOM，统一通过此 composable 发通知

---

## 团队协作规范

### 新增业务页面标准流程

```
1. 在 app/types/business/ 下定义类型
2. 在 app/repositories/ 下创建 Repository（继承 BaseRepository）
3. 在 app/pages/ 对应目录下创建页面
4. 使用 useList / useMutation 处理数据
5. 在 definePageMeta 中声明 layout、middleware、permission
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserCard.vue` |
| Composable | camelCase + use 前缀 | `useUserList.ts` |
| Store | camelCase + Store 后缀 | `auth.store.ts` |
| Repository | PascalCase + Repository 后缀 | `UserRepository` |
| 类型/接口 | PascalCase | `UserProfile` |
| 常量 | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE` |
| CSS 类名 | kebab-case（Tailwind 为主） | - |

### Git 提交规范

```
feat: 新功能
fix: Bug 修复
refactor: 重构
perf: 性能优化
test: 测试
docs: 文档
chore: 构建/工具链
```

---

## 权限系统设计

### 三级权限控制

```
1. 路由级（middleware）
   definePageMeta({ middleware: ['auth', 'permission'], permission: 'users:read' })

2. 组件级（AuthGuard 组件）
   <AuthGuard permission="users:write">
     <BaseButton>删除</BaseButton>
   </AuthGuard>

3. 逻辑级（authStore.can()）
   if (authStore.can('reports:export')) { ... }
```

---

## 混合渲染策略

```ts
// nuxt.config.ts routeRules
'/'           → prerender    // 纯静态，CDN 分发
'/blog/**'    → ssr: true    // 服务端渲染（SEO）
'/dashboard/**' → ssr: false // CSR（无 SEO 需求，节省服务器资源）
'/products/**'  → isr: 3600  // 增量静态再生（高流量+SEO）
```

---

## 性能优化清单

- [x] **代码分割**：`manualChunks` 分离 vendor 包
- [x] **图片优化**：`@nuxt/image` 自动 WebP、懒加载
- [x] **组件懒加载**：Nuxt 路由级自动懒加载 + `defineAsyncComponent`
- [x] **请求缓存**：`useAsyncData` 内置去重，防止 SSR/CSR 重复请求
- [x] **SVG 优化**：`nuxt-svgo` 内联压缩 SVG
- [x] **CSS 优化**：Tailwind PurgeCSS 剔除未用样式
- [x] **预压缩**：Nitro `compressPublicAssets` 静态资源 gzip/br
