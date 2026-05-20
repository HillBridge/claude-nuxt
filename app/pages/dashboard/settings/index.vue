<script setup lang="ts">
  definePageMeta({
    middleware: ['auth', 'permission'],
    permission: 'settings:read',
    title: '系统设置',
  })

  type TabKey = 'basic' | 'permissions'

  const activeTab = ref<TabKey>('basic')

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'basic', label: '基础设置' },
    { key: 'permissions', label: '权限设置' },
  ]

  // ---- 基础设置表单 ----
  const basicForm = reactive({
    siteName: '管理后台',
    siteDescription: '',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    pageSize: 20,
  })

  const basicSaving = ref(false)
  const basicSaved = ref(false)

  async function saveBasic() {
    basicSaving.value = true
    basicSaved.value = false
    try {
      // TODO: 接入真实 API
      await new Promise((r) => setTimeout(r, 600))
      basicSaved.value = true
      setTimeout(() => (basicSaved.value = false), 2000)
    } finally {
      basicSaving.value = false
    }
  }

  // ---- 权限设置 ----
  const roles = reactive([
    { key: 'manager', label: '经理', permissions: ['users:read', 'users:write', 'reports:read'] },
    { key: 'member', label: '成员', permissions: ['users:read'] },
    { key: 'guest', label: '访客', permissions: [] },
  ])

  const allPermissions = [
    { key: 'users:read', label: '查看用户' },
    { key: 'users:write', label: '编辑用户' },
    { key: 'reports:read', label: '查看报表' },
    { key: 'settings:read', label: '查看设置' },
    { key: 'settings:write', label: '编辑设置' },
  ]

  function togglePermission(roleKey: string, permKey: string) {
    const role = roles.find((r) => r.key === roleKey)
    if (!role) return
    const idx = role.permissions.indexOf(permKey)
    if (idx === -1) {
      role.permissions.push(permKey)
    } else {
      role.permissions.splice(idx, 1)
    }
  }

  const permSaving = ref(false)
  const permSaved = ref(false)

  async function savePermissions() {
    permSaving.value = true
    permSaved.value = false
    try {
      await new Promise((r) => setTimeout(r, 600))
      permSaved.value = true
      setTimeout(() => (permSaved.value = false), 2000)
    } finally {
      permSaving.value = false
    }
  }
</script>

<template>
  <div>
    <CommonPageHeader
      title="系统设置"
      description="配置系统基础参数与角色权限"
      :breadcrumbs="[{ label: '首页', to: '/dashboard' }, { label: '系统设置' }]"
    />

    <!-- Tab 切换 -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex space-x-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors"
          :class="
            activeTab === tab.key
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- 基础设置 -->
    <div v-if="activeTab === 'basic'" class="max-w-lg rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 class="mb-5 text-base font-semibold text-gray-900">基础参数</h2>

      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">站点名称</label>
          <BaseInput v-model="basicForm.siteName" class="w-full" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">站点描述</label>
          <BaseInput v-model="basicForm.siteDescription" class="w-full" placeholder="可留空" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">语言</label>
          <select
            v-model="basicForm.language"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="zh-CN">中文（简体）</option>
            <option value="en-US">English</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">时区</label>
          <select
            v-model="basicForm.timezone"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">默认每页条数</label>
          <BaseInput v-model.number="basicForm.pageSize" type="number" class="w-32" />
        </div>
      </div>

      <div class="mt-6 flex items-center gap-3">
        <BaseButton :loading="basicSaving" @click="saveBasic">保存设置</BaseButton>
        <span v-if="basicSaved" class="text-sm text-green-600">已保存 ✓</span>
      </div>
    </div>

    <!-- 权限设置 -->
    <div v-if="activeTab === 'permissions'" class="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div class="border-b border-gray-100 px-6 py-4">
        <h2 class="text-base font-semibold text-gray-900">角色权限矩阵</h2>
        <p class="mt-1 text-sm text-gray-500">管理员（admin）拥有所有权限，不可修改。</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left font-medium text-gray-500">权限</th>
              <th
                v-for="role in roles"
                :key="role.key"
                class="px-6 py-3 text-center font-medium text-gray-500"
              >
                {{ role.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="perm in allPermissions" :key="perm.key" class="hover:bg-gray-50">
              <td class="px-6 py-3 font-medium text-gray-700">{{ perm.label }}</td>
              <td
                v-for="role in roles"
                :key="role.key"
                class="px-6 py-3 text-center"
              >
                <input
                  type="checkbox"
                  :checked="role.permissions.includes(perm.key)"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  @change="togglePermission(role.key, perm.key)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center gap-3 border-t border-gray-100 px-6 py-4">
        <BaseButton :loading="permSaving" @click="savePermissions">保存权限</BaseButton>
        <span v-if="permSaved" class="text-sm text-green-600">已保存 ✓</span>
      </div>
    </div>
  </div>
</template>
