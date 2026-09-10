import type { WeddingStatePayload } from '../../utils/state-mapper'
import {
  toGuestRow,
  toLayoutItemRow,
  toSeatRow,
  toTableRow,
  toWeddingRow
} from '../../utils/state-mapper'
import { useServerSupabase } from '../../utils/supabase'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async event => {
  const currentUser = requireAuth(event)
  const body = await readBody<WeddingStatePayload>(event)
  const weddingId = body.wedding?.id

  if (!weddingId) {
    throw createError({ statusCode: 400, statusMessage: 'wedding.id is required.' })
  }

  const supabase = useServerSupabase()
  const weddingRow = toWeddingRow({
    ...body.wedding,
    updatedAt: new Date().toISOString()
  }, currentUser.id)

  const { error: weddingError } = await supabase.from('weddings').upsert(weddingRow)
  if (weddingError) throw createError({ statusCode: 500, statusMessage: weddingError.message })

  const [existingGuests, existingTables, existingLayoutItems] = await Promise.all([
    supabase.from('guests').select('id').eq('wedding_id', weddingId),
    supabase.from('wedding_tables').select('id').eq('wedding_id', weddingId),
    supabase.from('layout_items').select('id').eq('wedding_id', weddingId)
  ])

  const existingSeats = await supabase
    .from('seats')
    .select('id, wedding_tables!inner(wedding_id)')
    .eq('wedding_tables.wedding_id', weddingId)

  const preloadError = existingGuests.error || existingTables.error || existingLayoutItems.error || existingSeats.error
  if (preloadError) throw createError({ statusCode: 500, statusMessage: preloadError.message })

  const nextGuestIds = new Set(body.guests.map(item => item.id))
  const nextTableIds = new Set(body.tables.map(item => item.id))
  const nextLayoutItemIds = new Set(body.layoutItems.map(item => item.id))
  const nextSeatIds = new Set(body.seats.map(item => item.id))

  const staleGuestIds = (existingGuests.data ?? []).map(item => item.id).filter(id => !nextGuestIds.has(id))
  const staleTableIds = (existingTables.data ?? []).map(item => item.id).filter(id => !nextTableIds.has(id))
  const staleLayoutItemIds = (existingLayoutItems.data ?? []).map(item => item.id).filter(id => !nextLayoutItemIds.has(id))
  const staleSeatIds = (existingSeats.data ?? []).map(item => item.id).filter(id => !nextSeatIds.has(id))

  if (staleSeatIds.length) {
    const { error } = await supabase.from('seats').delete().in('id', staleSeatIds)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (staleGuestIds.length) {
    const { error } = await supabase.from('guests').delete().in('id', staleGuestIds)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (staleTableIds.length) {
    const { error } = await supabase.from('wedding_tables').delete().in('id', staleTableIds)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (staleLayoutItemIds.length) {
    const { error } = await supabase.from('layout_items').delete().in('id', staleLayoutItemIds)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const operations = [
    body.guests.length
      ? supabase.from('guests').upsert(body.guests.map(guest => toGuestRow(guest, weddingId, currentUser.id)))
      : Promise.resolve({ error: null }),
    body.tables.length
      ? supabase.from('wedding_tables').upsert(body.tables.map(table => toTableRow(table, weddingId, currentUser.id)))
      : Promise.resolve({ error: null }),
    body.layoutItems.length
      ? supabase.from('layout_items').upsert(body.layoutItems.map(item => toLayoutItemRow(item, weddingId, currentUser.id)))
      : Promise.resolve({ error: null })
  ]

  const results = await Promise.all(operations)
  const upsertError = results.find(result => result.error)?.error
  if (upsertError) throw createError({ statusCode: 500, statusMessage: upsertError.message })

  if (body.seats.length) {
    const { error } = await supabase.from('seats').upsert(body.seats.map(seat => toSeatRow(seat, currentUser.id)))
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    ok: true,
    savedAt: new Date().toISOString()
  }
})
