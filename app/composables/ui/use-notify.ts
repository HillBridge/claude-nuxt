// app/composables/ui/use-notify.ts
// 全局通知 Composable

export type NotifyType = 'success' | 'error' | 'warning' | 'info'

export interface NotifyOptions {
  message: string
  type: NotifyType
  duration?: number
  title?: string
}

// 通过事件总线实现，解耦通知组件和调用方
const _listeners: Array<(options: NotifyOptions) => void> = []

export function useNotify() {
  function emit(options: NotifyOptions) {
    _listeners.forEach((listener) => listener(options))
  }

  const notify = {
    success: (message: string, title?: string) =>
      emit({ message, type: 'success', ...(title && { title }) }),
    error: (message: string, title?: string) =>
      emit({ message, type: 'error', ...(title && { title }) }),
    warning: (message: string, title?: string) =>
      emit({ message, type: 'warning', ...(title && { title }) }),
    info: (message: string, title?: string) =>
      emit({ message, type: 'info', ...(title && { title }) }),
  }

  // 注册监听器（在 Toast 组件中调用）
  function onNotify(listener: (options: NotifyOptions) => void) {
    _listeners.push(listener)
    onUnmounted(() => {
      const index = _listeners.indexOf(listener)
      if (index > -1) _listeners.splice(index, 1)
    })
  }

  return { notify, onNotify }
}
