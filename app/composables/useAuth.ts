import type { AuthUser } from '~/types/auth'

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)

  async function loadUser() {
    // During SSR, $fetch does not forward the browser's request headers to
    // internal API calls. useRequestFetch preserves the Cookie header so the
    // server can restore the HttpOnly session before rendering the page.
    const requestFetch = import.meta.server ? useRequestFetch() : $fetch
    const response = await requestFetch<{ user: AuthUser | null }>('/api/v1/auth/me')
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
