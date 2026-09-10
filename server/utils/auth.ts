import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const sessionCookieName = 'wedding_feast_session'
const sessionDurationSeconds = 60 * 60 * 24

export interface AuthUser {
  id: string
  username: string
  displayName: string
  role: 'super_admin'
}

interface SessionPayload extends AuthUser {
  expiresAt: number
}

function sessionSecret() {
  // Nuxt may parse an all-numeric value in .env as a number. Node's HMAC
  // requires a string or binary key, so normalize the runtime config here.
  const configuredSecret = useRuntimeConfig().authSessionSecret
  if (configuredSecret === undefined || configuredSecret === null || configuredSecret === '') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication is not configured. Set NUXT_AUTH_SESSION_SECRET.'
    })
  }
  return String(configuredSecret)
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url')
}

function encodeSession(user: AuthUser) {
  const payload: SessionPayload = {
    ...user,
    expiresAt: Date.now() + sessionDurationSeconds * 1000
  }
  const value = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${value}.${sign(value)}`
}

export function hashPassword(password: string) {
  return createHash('md5').update(password).digest('hex')
}

export function getSessionUser(event: H3Event): AuthUser | null {
  const token = getCookie(event, sessionCookieName)
  if (!token) return null

  const [value, signature] = token.split('.')
  if (!value || !signature) return null

  const expectedSignature = sign(value)
  const received = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null

  try {
    const payload = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as SessionPayload
    if (!payload.id || !payload.username || payload.role !== 'super_admin' || payload.expiresAt <= Date.now()) return null
    return {
      id: payload.id,
      username: payload.username,
      displayName: payload.displayName,
      role: payload.role
    }
  } catch {
    return null
  }
}

export function requireAuth(event: H3Event) {
  const user = getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '请先登录后再访问。' })
  }
  return user
}

export function setAuthSession(event: H3Event, user: AuthUser) {
  setCookie(event, sessionCookieName, encodeSession(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: sessionDurationSeconds,
    path: '/'
  })
}

export function clearAuthSession(event: H3Event) {
  deleteCookie(event, sessionCookieName, { path: '/' })
}
