<script setup lang="ts">
  // app/components/common/ToastContainer.vue
  // 全局 Toast 容器，在 app.vue 中挂载一次

  import type { NotifyOptions } from '~/composables/ui/use-notify'

  interface Toast extends NotifyOptions {
    id: string
  }

  const { onNotify } = useNotify()
  const toasts = ref<Toast[]>([])

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  const colorMap = {
    success: 'bg-green-50 text-green-800 ring-green-600/20',
    error: 'bg-red-50 text-red-800 ring-red-600/20',
    warning: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    info: 'bg-blue-50 text-blue-800 ring-blue-600/20',
  }

  onNotify((options) => {
    const id = crypto.randomUUID()
    toasts.value.push({ ...options, id })
    setTimeout(() => remove(id), options.duration ?? 3000)
  })

  function remove(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) toasts.value.splice(index, 1)
  }
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-full">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-start gap-3 rounded-lg p-4 shadow-md ring-1 cursor-pointer"
          :class="colorMap[toast.type]"
          @click="remove(toast.id)"
        >
          <span class="text-base font-bold">{{ iconMap[toast.type] }}</span>
          <div class="flex-1 min-w-0">
            <p v-if="toast.title" class="font-semibold text-sm">{{ toast.title }}</p>
            <p class="text-sm">{{ toast.message }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
</style>
