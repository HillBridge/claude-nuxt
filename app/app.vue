<script setup lang="ts">
  // app/app.vue - 根组件
</script>

<template>
  <NuxtLayout :key="String($route.meta.layout ?? 'default')">
    <NuxtPage />
  </NuxtLayout>
  <!-- 全局通知容器 -->
  <CommonToastContainer />
</template>
