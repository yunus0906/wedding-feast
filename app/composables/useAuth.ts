import type { AuthUser } from '~/types/auth'

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)

  async function loadUser() {
    const response = await $fetch<{ user: AuthUser | null }>('/api/v1/auth/me')
    user.value = response.user
    return response.user
  }

  async function login(username: string, password: string) {
    const response = await $fetch<{ user: AuthUser }>('/api/v1/auth/login', {
      method: 'POST',
      body: { username, password }
    })
    user.value = response.user
    return response.user
  }

  async function logout() {
    await $fetch('/api/v1/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, loadUser, login, logout }
}
