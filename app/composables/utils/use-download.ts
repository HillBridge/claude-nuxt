// app/composables/utils/use-download.ts
// 文件下载 Composable

export function useDownload() {
  const loading = ref(false)

  async function download(url: string, filename?: string) {
    loading.value = true
    try {
      const response = await $fetch.raw(url, { responseType: 'blob' })
      const blob = response._data as Blob
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename ?? extractFilename(response.headers) ?? 'download'
      a.click()
      URL.revokeObjectURL(objectUrl)
    } finally {
      loading.value = false
    }
  }

  function extractFilename(headers: Headers): string | null {
    const disposition = headers.get('content-disposition')
    if (!disposition) return null
    const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"'\n]+)["']?/i)
    return match ? decodeURIComponent(match[1] ?? '') : null
  }

  return { download, loading }
}
