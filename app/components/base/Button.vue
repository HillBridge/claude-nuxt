<script setup lang="ts">
  // app/components/base/Button.vue
  // Base 层 - 原子组件，无业务逻辑，高复用
  // 命名规则：<BaseButton /> 自动注册

  type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link'
  type Size = 'xs' | 'sm' | 'md' | 'lg'

  interface Props {
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    // 渲染为 <a> 标签
    href?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    type: 'button',
  })

  const emit = defineEmits<{
    click: [event: MouseEvent]
  }>()

  // 样式映射表（Tailwind 类名需完整写出，不能动态拼接）
  const variantClasses: Record<Variant, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    link: 'bg-transparent text-indigo-600 hover:underline focus:ring-indigo-500 p-0',
  }

  const sizeClasses: Record<Size, string> = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const classes = computed(() => [
    'inline-flex items-center justify-center gap-2 font-medium rounded-md',
    'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variantClasses[props.variant],
    props.variant !== 'link' ? sizeClasses[props.size] : '',
  ])

  const isDisabled = computed(() => props.disabled || props.loading)

  function handleClick(event: MouseEvent) {
    if (!isDisabled.value) {
      emit('click', event)
    }
  }
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : type"
    :disabled="isDisabled"
    :class="classes"
    @click="handleClick"
  >
    <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
    <slot />
  </component>
</template>
