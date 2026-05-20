<script setup lang="ts">
  import { userRepository } from '~/repositories/user.repository'

  definePageMeta({
    middleware: ['auth'],
    title: '仪表盘',
  })

  const authStore = useAuthStore()

  const stats = ref([
    { label: '总用户数', value: '—', icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: '活跃用户', value: '—', icon: '✅', color: 'bg-green-50 text-green-700' },
    { label: '管理员', value: '—', icon: '🔑', color: 'bg-purple-50 text-purple-700' },
    { label: '新增（本月）', value: '—', icon: '📈', color: 'bg-orange-50 text-orange-700' },
  ])

  const recentUsers = ref<{ name: string; email: string; role: string; createdAt: string }[]>([])
  const loadingStats = ref(true)

  onMounted(async () => {
    try {
      const res = await userRepository.list({ pageSize: 5, page: 1 })
      const users = res.list ?? []
      const total = res.total ?? users.length

      const active = users.filter((u) => u.status === 'active').length
      const admins = users.filter((u) => u.role === 'admin').length

      const now = new Date()
      const thisMonth = users.filter((u) => {
        const d = new Date(u.createdAt)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      }).length

      stats.value[0].value = String(total)
      stats.value[1].value = String(active)
      stats.value[2].value = String(admins)
      stats.value[3].value = String(thisMonth)

      recentUsers.value = users.map((u) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: new Date(u.createdAt).toLocaleDateString('zh-CN'),
      }))
    } catch {
      // 静默处理，保持 — 占位
    } finally {
      loadingStats.value = false
    }
  })

  const roleLabels: Record<string, string> = {
    admin: '管理员',
    manager: '经理',
    member: '成员',
    guest: '访客',
  }
</script>

<template>
  <div>
    <CommonPageHeader
      title="仪表盘"
      description="系统概览与数据统计"
      :breadcrumbs="[{ label: '仪表盘' }]"
    />

    <!-- 统计卡片 -->
    <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
          <span
            class="flex h-10 w-10 items-center justify-center rounded-full text-lg"
            :class="stat.color"
          >{{ stat.icon }}</span>
        </div>
        <p class="mt-3 text-3xl font-bold text-gray-900">
          <span v-if="loadingStats" class="animate-pulse text-gray-300">—</span>
          <span v-else>{{ stat.value }}</span>
        </p>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-if="authStore.can('users:read')"
        to="/dashboard/users"
        class="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-2xl">👥</span>
        <div>
          <p class="font-semibold text-gray-900">用户管理</p>
          <p class="text-sm text-gray-500">管理系统账号与权限</p>
        </div>
      </NuxtLink>

      <NuxtLink
        v-if="authStore.can('settings:read')"
        to="/dashboard/settings"
        class="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-2xl">⚙️</span>
        <div>
          <p class="font-semibold text-gray-900">系统设置</p>
          <p class="text-sm text-gray-500">配置基础参数与权限规则</p>
        </div>
      </NuxtLink>
    </div>

    <!-- 最近用户 -->
    <div v-if="authStore.can('users:read')" class="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 class="text-base font-semibold text-gray-900">最近用户</h2>
        <NuxtLink to="/dashboard/users" class="text-sm text-indigo-600 hover:text-indigo-700">
          查看全部 →
        </NuxtLink>
      </div>
      <div v-if="loadingStats" class="flex items-center justify-center py-12 text-gray-400">
        加载中…
      </div>
      <ul v-else-if="recentUsers.length" class="divide-y divide-gray-50">
        <li
          v-for="user in recentUsers"
          :key="user.email"
          class="flex items-center justify-between px-6 py-3"
        >
          <div>
            <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
            <p class="text-xs text-gray-500">{{ user.email }}</p>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-xs text-gray-500">{{ roleLabels[user.role] ?? user.role }}</span>
            <span class="text-xs text-gray-400">{{ user.createdAt }}</span>
          </div>
        </li>
      </ul>
      <p v-else class="px-6 py-8 text-center text-sm text-gray-400">暂无数据</p>
    </div>
  </div>
</template>
