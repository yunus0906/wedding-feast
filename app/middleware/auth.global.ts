export default defineNuxtRouteMiddleware(async to => {
  if (to.path === '/login') return

  const { user, loadUser } = useAuth()
  if (user.value) return

  try {
    if (await loadUser()) return
  } catch {
    // The server-side guard remains the source of truth for protected pages.
  }

  return navigateTo('/login')
})
