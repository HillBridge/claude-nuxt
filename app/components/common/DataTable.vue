<script setup lang="ts">
  // app/components/common/DataTable.vue
  // Common 层 - 通用数据表格，组合多个 Base 组件
  // 命名规则：<CommonDataTable />

  import type { Pagination } from '~/types'

  interface Column<T = Record<string, unknown>> {
    key: string
    title: string
    width?: string | number
    sortable?: boolean
    // 自定义渲染（配合 slot）
    slot?: string
    // 数据格式化（无需 slot 时使用）
    formatter?: (value: unknown, row: T) => string
  }

  interface Props<T = Record<string, unknown>> {
    columns: Column<T>[]
    data: T[]
    loading?: boolean
    // 选中行（支持多选）
    selectedKeys?: (string | number)[]
    rowKey?: string
    // 分页
    pagination?: Pagination | null
    // 空状态提示
    emptyText?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    rowKey: 'id',
    emptyText: '暂无数据',
  })

  const emit = defineEmits<{
    'update:selectedKeys': [keys: (string | number)[]]
    'row-click': [row: Record<string, unknown>]
    'sort-change': [field: string, order: 'asc' | 'desc' | null]
    'page-change': [page: number]
    'page-size-change': [pageSize: number]
  }>()

  // 排序状态
  const sortField = ref('')
  const sortOrder = ref<'asc' | 'desc' | null>(null)

  function handleSort(field: string) {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : sortOrder.value === 'desc' ? null : 'asc'
    } else {
      sortField.value = field
      sortOrder.value = 'asc'
    }
    emit('sort-change', sortField.value, sortOrder.value)
  }

  // 全选
  const allKeys = computed(() =>
    props.data.map((row) => (row as Record<string, unknown>)[props.rowKey!] as string | number),
  )
  const isAllSelected = computed(
    () => allKeys.value.length > 0 && allKeys.value.every((k) => props.selectedKeys?.includes(k)),
  )

  function toggleAll() {
    emit('update:selectedKeys', isAllSelected.value ? [] : allKeys.value)
  }

  function toggleRow(key: string | number) {
    const keys = props.selectedKeys ?? []
    const next = keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]
    emit('update:selectedKeys', next)
  }

  function getCellValue(row: Record<string, unknown>, col: Column): string {
    const value = row[col.key]
    return col.formatter ? col.formatter(value, row) : String(value ?? '')
  }
</script>

<template>
  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <!-- 表格 -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-gray-50">
          <tr>
            <!-- 全选 -->
            <th v-if="selectedKeys !== undefined" class="relative px-7 sm:w-12 sm:px-6">
              <input
                type="checkbox"
                class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600"
                :checked="isAllSelected"
                @change="toggleAll"
              >
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="{ width: col.width }"
              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              :class="{ 'cursor-pointer select-none hover:bg-gray-100': col.sortable }"
              @click="col.sortable && handleSort(col.key)"
            >
              <div class="flex items-center gap-1">
                {{ col.title }}
                <span v-if="col.sortable" class="text-gray-400">
                  <span v-if="sortField === col.key && sortOrder === 'asc'">↑</span>
                  <span v-else-if="sortField === col.key && sortOrder === 'desc'">↓</span>
                  <span v-else>↕</span>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <!-- Loading 骨架屏 -->
          <template v-if="loading">
            <tr v-for="i in 5" :key="i">
              <td v-if="selectedKeys !== undefined" class="px-7 sm:w-12 sm:px-6">
                <div class="h-4 w-4 rounded bg-gray-200 animate-pulse" />
              </td>
              <td v-for="col in columns" :key="col.key" class="px-3 py-4">
                <div class="h-4 rounded bg-gray-200 animate-pulse" :style="{ width: `${Math.random() * 40 + 40}%` }" />
              </td>
            </tr>
          </template>

          <!-- 空状态 -->
          <tr v-else-if="!data.length">
            <td :colspan="columns.length + (selectedKeys !== undefined ? 1 : 0)" class="py-12 text-center text-sm text-gray-500">
              {{ emptyText }}
            </td>
          </tr>

          <!-- 数据行 -->
          <template v-else>
            <tr
              v-for="row in data"
              :key="(row as Record<string, unknown>)[rowKey!] as string"
              class="hover:bg-gray-50 cursor-pointer"
              :class="{ 'bg-indigo-50': selectedKeys?.includes((row as Record<string, unknown>)[rowKey!] as string | number) }"
              @click="emit('row-click', row as Record<string, unknown>)"
            >
              <td v-if="selectedKeys !== undefined" class="relative px-7 sm:w-12 sm:px-6">
                <input
                  type="checkbox"
                  class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600"
                  :checked="selectedKeys.includes((row as Record<string, unknown>)[rowKey!] as string | number)"
                  @click.stop
                  @change="toggleRow((row as Record<string, unknown>)[rowKey!] as string | number)"
                >
              </td>
              <td v-for="col in columns" :key="col.key" class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <!-- 自定义 slot -->
                <slot v-if="col.slot" :name="col.slot" :row="row" :value="(row as Record<string, unknown>)[col.key]" />
                <!-- 默认渲染 -->
                <span v-else>{{ getCellValue(row as Record<string, unknown>, col) }}</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="pagination" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <p class="text-sm text-gray-700">
        共 <span class="font-medium">{{ pagination.total }}</span> 条，
        第 <span class="font-medium">{{ pagination.page }}</span> /
        <span class="font-medium">{{ pagination.totalPages }}</span> 页
      </p>
      <div class="flex gap-2">
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="pagination.page <= 1"
          @click="emit('page-change', pagination.page - 1)"
        >
          上一页
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="pagination.page >= pagination.totalPages"
          @click="emit('page-change', pagination.page + 1)"
        >
          下一页
        </BaseButton>
      </div>
    </div>
  </div>
</template>
