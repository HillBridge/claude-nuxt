<script setup lang="ts">
  // app/pages/dashboard/users/index.vue
  // 用户列表页 - 展示 useList、DataTable、权限控制的最佳实践

  import { userRepository } from '~/repositories/user.repository'
  import type { User, UserQueryParams } from '~/types'

  definePageMeta({
    middleware: ['auth', 'permission'],
    permission: 'users:read',
    title: '用户管理',
  })

  // ---- 列表数据 ----
  const { list, loading, pagination, search, setPage, fetch } = useList<User, UserQueryParams>({
    fetcher: (p) => userRepository.list(p),
    initialParams: { pageSize: 20 },
  })

  // ---- 表格列配置 ----
  const columns = [
    { key: 'name', title: '姓名' },
    { key: 'email', title: '邮箱' },
    { key: 'role', title: '角色', formatter: (v: unknown) => roleLabels[v as string] ?? String(v) },
    { key: 'status', title: '状态', slot: 'status' },
    { key: 'createdAt', title: '创建时间', formatter: (v: unknown) => formatDate(String(v)) },
    { key: 'actions', title: '操作', slot: 'actions' },
  ]

  const roleLabels: Record<string, string> = {
    admin: '管理员',
    manager: '经理',
    member: '成员',
    guest: '访客',
  }

  // ---- 删除 ----
  const { confirm } = useConfirm()
  const { mutate: deleteUser, loading: deleting } = useMutation({
    mutationFn: (id: number) => userRepository.remove(id),
    successMessage: '删除成功',
    onSuccess: () => fetch(),
  })

  async function handleDelete(user: User) {
    const confirmed = await confirm({
      title: '确认删除',
      content: `确认删除用户 "${user.name}"？此操作不可撤销。`,
      type: 'danger',
      confirmText: '删除',
    })
    if (confirmed) await deleteUser(user.id)
  }

  // ---- 搜索 ----
  const keyword = ref('')
  function handleSearch() {
    search({ keyword: keyword.value })
  }

  // ---- 工具函数 ----
  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  const authStore = useAuthStore()
</script>

<template>
  <div>
    <CommonPageHeader
      title="用户管理"
      description="管理系统中的所有用户账号"
      :breadcrumbs="[{ label: '首页', to: '/dashboard' }, { label: '用户管理' }]"
    >
      <template #actions>
        <BaseButton
          v-if="authStore.can('users:write')"
          @click="navigateTo('/dashboard/users/create')"
        >
          新增用户
        </BaseButton>
      </template>
    </CommonPageHeader>

    <!-- 搜索栏 -->
    <div class="mb-4 flex gap-3">
      <BaseInput
        v-model="keyword"
        placeholder="搜索姓名或邮箱..."
        class="w-64"
        @keyup.enter="handleSearch"
      />
      <BaseButton variant="secondary" @click="handleSearch">搜索</BaseButton>
    </div>

    <!-- 数据表格 -->
    <CommonDataTable
      :columns="columns"
      :data="list as unknown as Record<string, unknown>[]"
      :loading="loading"
      :pagination="pagination"
      @page-change="setPage"
    >
      <!-- 状态列 -->
      <template #status="{ value }">
        <span
          class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
          :class="value === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
        >
          {{ value === 'active' ? '正常' : '禁用' }}
        </span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <div class="flex gap-2">
          <BaseButton
            variant="ghost"
            size="xs"
            @click.stop="navigateTo(`/dashboard/users/${(row as unknown as User).id}`)"
          >
            编辑
          </BaseButton>
          <AuthGuard permission="users:write" role="admin">
            <BaseButton
              variant="ghost"
              size="xs"
              class="text-red-600"
              :loading="deleting"
              @click.stop="handleDelete(row as unknown as User)"
            >
              删除
            </BaseButton>
            <template #fallback>
              <span class="text-xs text-gray-300">—</span>
            </template>
          </AuthGuard>
        </div>
      </template>
    </CommonDataTable>
  </div>
</template>
