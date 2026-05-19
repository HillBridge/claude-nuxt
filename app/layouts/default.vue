<script setup lang="ts">
  // app/layouts/default.vue
  // 默认布局 - 带侧边栏的后台管理布局
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <LayoutAppSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <LayoutAppHeader />
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
