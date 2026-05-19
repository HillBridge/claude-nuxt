<script setup lang="ts">
  // app/components/layout/AppHeader.vue
  // 顶部导航栏

  const authStore = useAuthStore()
  const appStore = useAppStore()
  const { notify } = useNotify()

  async function handleLogout() {
    await authStore.logout()
    notify.success('已退出登录')
  }
</script>

<template>
  <header class="h-16 flex items-center justify-between border-b border-gray-200 bg-white px-6">
    <div class="flex items-center gap-4">
      <slot name="left" />
    </div>

    <div class="flex items-center gap-4">
      <!-- 主题切换 -->
      <BaseButton variant="ghost" size="sm" @click="appStore.setTheme(appStore.isDark ? 'light' : 'dark')">
        {{ appStore.isDark ? '☀️' : '🌙' }}
      </BaseButton>

      <!-- 用户菜单 -->
      <div v-if="authStore.user" class="flex items-center gap-3">
        <span class="text-sm text-gray-700">{{ authStore.user.name }}</span>
        <BaseButton variant="ghost" size="sm" @click="handleLogout">退出</BaseButton>
      </div>
    </div>
  </header>
</template>
