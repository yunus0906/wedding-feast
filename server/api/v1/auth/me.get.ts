import { getSessionUser } from '../../../utils/auth'

export default defineEventHandler(event => ({ user: getSessionUser(event) }))
