// tests/unit/composables/use-list.test.ts
// useList composable 单元测试

import { describe, it, expect, vi } from 'vitest'

import { useList } from '~/composables/api/use-list'

const mockFetcher = vi.fn().mockResolvedValue({
  list: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ],
  pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
})

describe('useList', () => {
  it('初始化时应自动发起请求', async () => {
    const { list, loading } = useList({ fetcher: mockFetcher })
    expect(loading.value).toBe(true)
    await vi.waitUntil(() => !loading.value)
    expect(list.value).toHaveLength(2)
    expect(mockFetcher).toHaveBeenCalledOnce()
  })

  it('search() 应重置到第一页并重新请求', async () => {
    const { search, params } = useList({
      fetcher: mockFetcher,
      initialParams: { page: 3 },
    })
    await vi.waitUntil(() => mockFetcher.mock.calls.length >= 1)
    mockFetcher.mockClear()

    search({ keyword: 'alice' })
    expect(params.value.page).toBe(1)
    expect(mockFetcher).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'alice', page: 1 }))
  })

  it('当请求失败时应设置 error 状态', async () => {
    const failFetcher = vi.fn().mockRejectedValue(new Error('网络错误'))
    const { error } = useList({ fetcher: failFetcher })
    await vi.waitUntil(() => error.value !== null)
    expect(error.value).toBe('网络错误')
  })
})
