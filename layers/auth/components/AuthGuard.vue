<script setup lang="ts">
  // layers/auth/components/AuthGuard.vue
  // 权限守卫组件 - 用于模板中的条件渲染

  interface Props {
    permission?: string
    role?: string
    // 无权限时的降级展示
    fallback?: boolean
  }

  const props = defineProps<Props>()
  const authStore = useAuthStore()

  const hasAccess = computed(() => {
    if (props.permission && !authStore.can(props.permission)) return false
    if (props.role && authStore.userRole !== props.role) return false
    return true
  })
</script>

<template>
  <template v-if="hasAccess">
    <slot />
  </template>
  <template v-else-if="fallback">
    <slot name="fallback">
      <span class="text-gray-400 text-sm">无权限</span>
    </slot>
  </template>
</template>
