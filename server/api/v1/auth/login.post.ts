import { hashPassword, setAuthSession } from '../../../utils/auth'
import { useServerSupabase } from '../../../utils/supabase'

export default defineEventHandler(async event => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = body.username?.trim()
  const password = body.password ?? ''

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入账号和密码。' })
  }

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('app_users')
    .select('id, username, display_name, role, password_md5')
    .eq('username', username)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data || data.password_md5 !== hashPassword(password)) {
    throw createError({ statusCode: 401, statusMessage: '账号或密码错误。' })
  }

  const user = {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    role: data.role as 'super_admin'
  }
  setAuthSession(event, user)
  return { user }
})
