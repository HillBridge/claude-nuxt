// app/composables/ui/use-confirm.ts
// 确认对话框 Composable - 用 Promise 包装确认操作

interface ConfirmOptions {
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

// 全局确认框状态
const _state = ref<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null)

export function useConfirm() {
  // 在业务代码中调用：await confirm({ content: '确认删除？' })
  async function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      _state.value = { ...options, resolve }
    })
  }

  // 在 ConfirmDialog 组件中消费状态
  function useConfirmState() {
    function handleConfirm() {
      _state.value?.resolve(true)
      _state.value = null
    }
    function handleCancel() {
      _state.value?.resolve(false)
      _state.value = null
    }
    return { state: readonly(_state), handleConfirm, handleCancel }
  }

  return { confirm, useConfirmState }
}
