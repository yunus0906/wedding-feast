import { getSessionUser } from '../utils/auth'

export default defineEventHandler(event => {
  const path = getRequestURL(event).pathname
  const isNuxtAsset = path.startsWith('/_nuxt/') || path === '/favicon.ico' || path === '/robots.txt'
  if (path === '/login' || path.startsWith('/api/') || isNuxtAsset) return

  if (!getSessionUser(event)) {
    return sendRedirect(event, '/login', 302)
  }
})
