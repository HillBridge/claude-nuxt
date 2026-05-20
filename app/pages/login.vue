<script setup lang="ts">
  // app/pages/login.vue
  // 登录页 - 展示页面如何使用 Layout、Store、Repository

  import { encryptText, decryptText } from '~/utils/crypto'

  definePageMeta({
    layout: 'auth',
    // 已登录用户访问登录页，重定向到首页
    middleware: [
      () => {
        const auth = useAuthStore()
        if (auth.isLoggedIn) return navigateTo('/dashboard/users')
      },
    ],
  })

  const authStore = useAuthStore()
  const route = useRoute()
  const { notify } = useNotify()

  const REMEMBER_KEY = 'login_remember'

  const form = reactive({
    email: '',
    password: '',
    remember: false,
  })

  onMounted(async () => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY)
      if (!saved) return
      const { email, encryptedPassword } = JSON.parse(saved)
      form.email = email ?? ''
      form.password = await decryptText(encryptedPassword)
      form.remember = true
    } catch {
      localStorage.removeItem(REMEMBER_KEY)
    }
  })

  const errors = reactive({
    email: '',
    password: '',
  })

  const { mutate: login, loading } = useMutation({
    mutationFn: (params: typeof form) => authStore.login(params),
    onSuccess: async () => {
      if (form.remember) {
        const encryptedPassword = await encryptText(form.password)
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email: form.email, encryptedPassword }))
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      const redirect = route.query.redirect as string | undefined
      notify.success('登录成功')
      navigateTo(redirect ?? '/dashboard/users')
    },
    onError: (error) => {
      notify.error(error.message)
    },
  })

  function validate(): boolean {
    errors.email = ''
    errors.password = ''
    if (!form.email) {
      errors.email = '请输入邮箱'
      return false
    }
    if (!form.password) {
      errors.password = '请输入密码'
      return false
    }
    return true
  }

  async function handleSubmit() {
    if (!validate()) return
    await login(form)
  }
</script>

<template>
  <div>
    <h2 class="mb-8 text-center text-2xl font-bold text-gray-900">登录账号</h2>
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="form.email"
        label="邮箱"
        type="email"
        autocomplete="username"
        placeholder="your@email.com"
        :error="errors.email"
        required
      />
      <BaseInput
        v-model="form.password"
        label="密码"
        type="password"
        autocomplete="current-password"
        placeholder="••••••••"
        :error="errors.password"
        required
      />
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input v-model="form.remember" type="checkbox" class="rounded border-gray-300">
          记住我
        </label>
        <NuxtLink to="/forgot-password" class="text-sm text-indigo-600 hover:underline">
          忘记密码？
        </NuxtLink>
      </div>
      <BaseButton type="submit" class="w-full" :loading="loading"> 登录 </BaseButton>
    </form>
  </div>
</template>
