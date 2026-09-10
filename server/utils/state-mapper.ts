import type { Guest } from '~/types/guest'
import type { LayoutItem, Seat, WeddingTable } from '~/types/seating'
import type { Wedding } from '~/types/wedding'

export interface WeddingStatePayload {
  wedding: Wedding
  guests: Guest[]
  tables: WeddingTable[]
  seats: Seat[]
  layoutItems: LayoutItem[]
}

export function toWeddingRow(wedding: Wedding, userId: string) {
  return {
    id: wedding.id,
    name: wedding.name,
    created_by: userId,
    updated_by: userId
  }
}

export function toGuestRow(guest: Guest, weddingId: string, userId: string) {
  return {
    id: guest.id,
    wedding_id: weddingId,
    name: guest.name,
    category: guest.category,
    side: guest.side,
    phone: guest.phone,
    companions: guest.companions,
    children_count: guest.childrenCount,
    relation_tag: guest.relationTag,
    note: guest.note,
    created_by: userId,
    updated_by: userId
  }
}

export function toTableRow(table: WeddingTable, weddingId: string, userId: string) {
  return {
    id: table.id,
    wedding_id: weddingId,
    name: table.name,
    capacity: table.capacity,
    x: table.x,
    y: table.y,
    created_by: userId,
    updated_by: userId
  }
}

export function toSeatRow(seat: Seat, userId: string) {
  return {
    id: seat.id,
    guest_id: seat.guestId,
    table_id: seat.tableId,
    seat_index: seat.seatIndex,
    role: seat.role,
    created_by: userId,
    updated_by: userId
  }
}

export function toLayoutItemRow(item: LayoutItem, weddingId: string, userId: string) {
  return {
    id: item.id,
    wedding_id: weddingId,
    type: item.type,
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    rotation: item.rotation,
    config: {},
    created_by: userId,
    updated_by: userId
  }
}

export function fromWeddingRow(row: Record<string, any>): Wedding {
  return {
    id: row.id,
    name: row.name,
    updatedAt: row.updated_at
  }
}

export function fromGuestRow(row: Record<string, any>): Guest {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    side: row.side,
    phone: row.phone ?? '',
    companions: row.companions ?? '',
    childrenCount: row.children_count ?? 0,
    relationTag: row.relation_tag ?? '',
    note: row.note ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function fromTableRow(row: Record<string, any>): WeddingTable {
  return {
    id: row.id,
    name: row.name,
    capacity: row.capacity,
    x: Number(row.x),
    y: Number(row.y),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function fromSeatRow(row: Record<string, any>): Seat {
  return {
    id: row.id,
    guestId: row.guest_id,
    tableId: row.table_id,
    seatIndex: row.seat_index,
    role: row.role ?? 'regular',
    createdAt: row.created_at
  }
}

export function fromLayoutItemRow(row: Record<string, any>): LayoutItem {
  return {
    id: row.id,
    type: row.type,
    x: Number(row.x),
    y: Number(row.y),
    width: Number(row.width),
    height: Number(row.height),
    rotation: Number(row.rotation)
  }
}
