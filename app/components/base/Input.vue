<script setup lang="ts">
  // app/components/base/Input.vue
  // Base 层 - 输入框原子组件，支持双向绑定 v-model

  defineOptions({ inheritAttrs: false })

  interface Props {
    modelValue?: string | number
    type?: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    error?: string
    label?: string
    hint?: string
    required?: boolean
    prefix?: string
    suffix?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    blur: [event: FocusEvent]
    focus: [event: FocusEvent]
  }>()

  const inputId = useId()

  const inputClasses = computed(() => [
    'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset',
    'placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
    'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
    props.error
      ? 'ring-red-300 focus:ring-red-500'
      : 'ring-gray-300 focus:ring-indigo-600',
    props.prefix ? 'pl-10' : 'px-3',
    props.suffix ? 'pr-10' : '',
  ])
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium leading-6 text-gray-900">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative mt-1">
      <div v-if="prefix" class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span class="text-gray-400 text-sm">{{ prefix }}</span>
      </div>
      <input
        :id="inputId"
        v-bind="$attrs"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      >
      <div v-if="suffix" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <span class="text-gray-400 text-sm">{{ suffix }}</span>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>
