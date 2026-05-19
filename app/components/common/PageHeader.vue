<script setup lang="ts">
  // app/components/common/PageHeader.vue
  // 页面标题栏 - 统一各页面头部的标题、面包屑、操作按钮

  interface BreadcrumbItem {
    label: string
    to?: string
  }

  interface Props {
    title: string
    description?: string
    breadcrumbs?: BreadcrumbItem[]
  }

  defineProps<Props>()
</script>

<template>
  <div class="mb-6">
    <!-- 面包屑 -->
    <nav v-if="breadcrumbs?.length" class="mb-2 flex text-sm text-gray-500" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2">
        <li v-for="(item, index) in breadcrumbs" :key="index" class="flex items-center">
          <span v-if="index > 0" class="mx-2 text-gray-400">/</span>
          <NuxtLink v-if="item.to" :to="item.to" class="hover:text-gray-700 transition-colors">
            {{ item.label }}
          </NuxtLink>
          <span v-else class="text-gray-900 font-medium">{{ item.label }}</span>
        </li>
      </ol>
    </nav>

    <!-- 标题行 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold leading-7 text-gray-900">{{ title }}</h1>
        <p v-if="description" class="mt-1 text-sm leading-6 text-gray-600">{{ description }}</p>
      </div>
      <!-- 右侧操作按钮区（通过 slot 传入）-->
      <div v-if="$slots.actions" class="flex items-center gap-3">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
