<template>
  <section class="login-panel">
    <div class="brand login-brand">
      <div class="brand-badge">W</div>
      <div>
        <p class="eyebrow">Wedding Feast</p>
        <h1>婚礼排桌</h1>
      </div>
    </div>

    <form class="login-form" @submit.prevent="submit">
      <label>
        <span>账号</span>
        <input v-model="username" class="input" autocomplete="username" required />
      </label>
      <label>
        <span>密码</span>
        <input v-model="password" class="input" type="password" autocomplete="current-password" required />
      </label>
      <p v-if="error" class="login-error" role="alert">{{ error }}</p>
      <button class="btn primary" type="submit" :disabled="submitting">
        {{ submitting ? '正在登录...' : '登录系统' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login } = useAuth()
const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function submit() {
  submitting.value = true
  error.value = ''
  try {
    await login(username.value, password.value)
    await navigateTo('/')
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? '登录失败，请稍后重试。'
  } finally {
    submitting.value = false
  }
}
</script>
