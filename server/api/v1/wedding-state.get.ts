import {
  fromGuestRow,
  fromLayoutItemRow,
  fromSeatRow,
  fromTableRow,
  fromWeddingRow
} from '../../utils/state-mapper'
import { useServerSupabase } from '../../utils/supabase'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async event => {
  requireAuth(event)
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const weddingId = String(query.weddingId || config.public.defaultWeddingId)
  const supabase = useServerSupabase()

  const [
    weddingResult,
    guestsResult,
    tablesResult,
    seatsResult,
    layoutItemsResult
  ] = await Promise.all([
    supabase.from('weddings').select('*').eq('id', weddingId).maybeSingle(),
    supabase.from('guests').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: false }),
    supabase.from('wedding_tables').select('*').eq('wedding_id', weddingId).order('created_at'),
    supabase.from('seats').select('*, wedding_tables!inner(wedding_id)').eq('wedding_tables.wedding_id', weddingId).order('created_at'),
    supabase.from('layout_items').select('*').eq('wedding_id', weddingId).order('id')
  ])

  const error = weddingResult.error || guestsResult.error || tablesResult.error || seatsResult.error || layoutItemsResult.error
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const now = new Date().toISOString()
  return {
    wedding: weddingResult.data
      ? fromWeddingRow(weddingResult.data)
      : { id: weddingId, name: 'Wedding Feast', updatedAt: now },
    guests: (guestsResult.data ?? []).map(fromGuestRow),
    tables: (tablesResult.data ?? []).map(fromTableRow),
    seats: (seatsResult.data ?? []).map(fromSeatRow),
    layoutItems: (layoutItemsResult.data ?? []).map(fromLayoutItemRow)
  }
})
