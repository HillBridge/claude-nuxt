// app/composables/api/use-list.ts
// 通用列表请求 Composable - 封装分页、搜索、排序逻辑
// 消除 80% 的列表页样板代码

import { ref, computed, watch } from 'vue'

import type { PaginatedResult, QueryParams, Pagination } from '~/types'

interface UseListOptions<TParams extends QueryParams> {
  fetcher: (params: TParams) => Promise<PaginatedResult<unknown>>
  initialParams?: Partial<TParams>
  immediate?: boolean
  watchParams?: boolean
  // 提供此 key 时启用 SSR 模式：useAsyncData 负责首屏数据，payload 序列化到 HTML
  ssrKey?: string
}

export async function useList<TEntity, TParams extends QueryParams = QueryParams>(
  options: UseListOptions<TParams>,
) {
  const { fetcher, initialParams = {}, immediate = true, watchParams = true } = options

  // ---- 状态 ----
  const list = ref<TEntity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  // ---- 查询参数（用 Record 中间类型绕过泛型赋值限制）----
  const params = ref<Record<string, unknown>>({
    page: 1,
    pageSize: 20,
    ...initialParams,
  })

  // ---- 是否有数据 ----
  const isEmpty = computed(() => !loading.value && list.value.length === 0)
  const hasMore = computed(
    () => pagination.value.page < pagination.value.totalPages,
  )

  // ---- 核心请求 ----
  async function fetch(resetPage = false) {
    if (resetPage) {
      params.value = { ...params.value, page: 1 }
    }
    loading.value = true
    error.value = null
    try {
      const result = await fetcher(params.value as TParams)
      list.value = result.list as TEntity[]
      pagination.value = result.pagination
    } catch (e) {
      error.value = e instanceof Error ? e.message : '请求失败'
    } finally {
      loading.value = false
    }
  }

  function setPage(page: number) {
    params.value = { ...params.value, page }
    fetch()
  }

  function setPageSize(pageSize: number) {
    params.value = { ...params.value, pageSize, page: 1 }
    fetch()
  }

  function search(newParams?: Partial<TParams>) {
    params.value = { ...params.value, ...newParams, page: 1 }
    fetch()
  }

  function reset() {
    params.value = { page: 1, pageSize: 20, ...initialParams }
    fetch()
  }

  // ---- 监听参数变化自动搜索（用于 filter 联动场景）----
  if (watchParams) {
    const watchKeys = Object.keys(initialParams).filter(
      (k) => !['page', 'pageSize'].includes(k),
    )
    if (watchKeys.length > 0) {
      watch(
        () => watchKeys.map((k) => (params.value as Record<string, unknown>)[k]),
        () => fetch(true),
      )
    }
  }

  // ---- 初始加载 ----
  if (options.ssrKey) {
    // await 确保 setup() 在数据就绪后才返回，Vue SSR 渲染时 list.value 已有值
    const { data, pending, error: fetchError } = await useAsyncData(
      options.ssrKey,
      () => fetcher(params.value as TParams),
    )

    // 同步写入，setup() 返回前 list 已填充
    if (data.value) {
      list.value = data.value.list as TEntity[]
      pagination.value = data.value.pagination
    }
    loading.value = pending.value

    // 后续客户端翻页/搜索触发的响应式更新
    watch(data, (val) => {
      if (val) {
        list.value = val.list as TEntity[]
        pagination.value = val.pagination
      }
    })
    watch(pending, (val) => { loading.value = val })
    watch(fetchError, (val) => { error.value = val?.message ?? null })
  } else if (immediate) {
    fetch()
  }

  return {
    list,
    loading,
    error,
    pagination,
    params,
    isEmpty,
    hasMore,
    fetch,
    search,
    setPage,
    setPageSize,
    reset,
  }
}
