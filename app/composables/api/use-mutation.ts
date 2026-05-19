// app/composables/api/use-mutation.ts
// 增删改操作 Composable - 封装 loading、错误、成功回调

interface UseMutationOptions<TResult, TParams> {
  mutationFn: (params: TParams) => Promise<TResult>
  onSuccess?: (result: TResult, params: TParams) => void
  onError?: (error: Error, params: TParams) => void
  // 成功时的 toast 提示文本
  successMessage?: string
}

export function useMutation<TResult = void, TParams = void>(
  options: UseMutationOptions<TResult, TParams>,
) {
  const { mutationFn, onSuccess, onError, successMessage } = options
  const { notify } = useNotify()

  const loading = ref(false)
  const error = ref<string | null>(null)

  async function mutate(params: TParams): Promise<TResult | null> {
    loading.value = true
    error.value = null
    try {
      const result = await mutationFn(params)
      if (successMessage) {
        notify.success(successMessage)
      }
      onSuccess?.(result, params)
      return result
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err.message
      onError?.(err, params)
      return null
    } finally {
      loading.value = false
    }
  }

  return { mutate, loading, error }
}
