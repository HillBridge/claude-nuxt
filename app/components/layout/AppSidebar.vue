<script setup lang="ts">
  // app/components/layout/AppSidebar.vue
  // 侧边栏导航 - 从 store 读取折叠状态

  interface NavItem {
    label: string
    to: string
    icon: string
    children?: NavItem[]
    permission?: string
  }

  const NAV_ITEMS: NavItem[] = [
    { label: '仪表盘', to: '/dashboard', icon: '📊' },
    {
      label: '用户管理',
      to: '/dashboard/users',
      icon: '👥',
      permission: 'users:read',
    },
    {
      label: '系统设置',
      to: '/dashboard/settings',
      icon: '⚙️',
      permission: 'settings:read',
      children: [
        { label: '基础设置', to: '/dashboard/settings/basic', icon: '' },
        { label: '权限设置', to: '/dashboard/settings/permissions', icon: '' },
      ],
    },
  ]

  const appStore = useAppStore()
  const authStore = useAuthStore()
  const route = useRoute()

  // 过滤无权限菜单
  const visibleNavItems = computed(() =>
    NAV_ITEMS.filter((item) => !item.permission || authStore.can(item.permission)),
  )

  function isActive(item: NavItem) {
    return route.path === item.to || route.path.startsWith(item.to + '/')
  }
</script>

<template>
  <aside
    class="flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300"
    :class="appStore.sidebarCollapsed ? 'w-16' : 'w-64'"
  >
    <!-- Logo -->
    <div class="flex h-16 shrink-0 items-center px-4 border-b border-gray-200">
      <img v-if="!appStore.sidebarCollapsed" src="~/assets/images/logo.svg" alt="Logo" class="h-8 w-auto" >
      <img v-else src="~/assets/images/logo-icon.svg" alt="Logo" class="h-8 w-8" >
    </div>

    <!-- 导航 -->
    <nav class="flex-1 overflow-y-auto px-2 py-4">
      <ul class="space-y-1">
        <li v-for="item in visibleNavItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="isActive(item) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'"
          >
            <span class="text-lg shrink-0">{{ item.icon }}</span>
            <span v-if="!appStore.sidebarCollapsed" class="truncate">{{ item.label }}</span>
          </NuxtLink>

          <!-- 子菜单 -->
          <ul v-if="item.children && !appStore.sidebarCollapsed && isActive(item)" class="mt-1 ml-6 space-y-1">
            <li v-for="child in item.children" :key="child.to">
              <NuxtLink
                :to="child.to"
                class="block rounded-md px-3 py-1.5 text-sm transition-colors"
                :class="route.path === child.to ? 'text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'"
              >
                {{ child.label }}
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <!-- 折叠按钮 -->
    <div class="border-t border-gray-200 p-2">
      <BaseButton variant="ghost" class="w-full" @click="appStore.toggleSidebar()">
        {{ appStore.sidebarCollapsed ? '→' : '←' }}
      </BaseButton>
    </div>
  </aside>
</template>
