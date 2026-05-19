<script setup lang="ts">
  // app/layouts/auth.vue
  // 认证布局 - 登录/注册页使用，无侧边栏
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <img src="~/assets/images/logo.svg" alt="Logo" class="h-12 w-auto mx-auto" >
      </div>
      <div class="bg-white shadow-md rounded-lg px-8 py-10">
        <slot />
      </div>
    </div>
  </div>
</template>
