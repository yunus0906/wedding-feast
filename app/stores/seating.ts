import type { LayoutItem, LayoutItemType, Seat, WeddingTable } from '~/types/seating'
import { createId } from '~/utils/id'
import { findNextSeatIndex } from '~/utils/seating'

function now() {
  return new Date().toISOString()
}

export const useSeatingStore = defineStore('seating-store', {
  state: () => ({
    tables: [] as WeddingTable[],
    seats: [] as Seat[],
    layoutItems: [] as LayoutItem[],
    dirty: false
  }),
  getters: {
    unassignedGuestIds: state => {
      const assigned = new Set(state.seats.map(seat => seat.guestId))
      return assigned
    }
  },
  actions: {
    markDirty() {
      this.dirty = true
    },
    markSaved() {
      this.dirty = false
    },
    addTable(payload: { name: string; capacity: number; x?: number; y?: number }) {
      this.tables.push({
        id: createId(),
        name: payload.name,
        capacity: payload.capacity,
        x: payload.x ?? 180,
        y: payload.y ?? 180,
        createdAt: now(),
        updatedAt: now()
      })
      this.markDirty()
    },
    updateTable(id: string, payload: Partial<Pick<WeddingTable, 'name' | 'capacity' | 'x' | 'y'>>) {
      const table = this.tables.find(item => item.id === id)
      if (!table) return
      Object.assign(table, payload, { updatedAt: now() })
      this.markDirty()
    },
    removeTable(id: string) {
      this.tables = this.tables.filter(table => table.id !== id)
      this.seats = this.seats.filter(seat => seat.tableId !== id)
      this.markDirty()
    },
    moveTable(id: string, x: number, y: number) {
      this.updateTable(id, { x, y })
    },
    addLayoutItem(type: LayoutItemType, payload?: Partial<LayoutItem>) {
      this.layoutItems.push({
        id: createId(),
        type,
        x: payload?.x ?? 420,
        y: payload?.y ?? 180,
        width: payload?.width ?? (type === 'stage' ? 220 : 160),
        height: payload?.height ?? (type === 'stage' ? 80 : 180),
        rotation: payload?.rotation ?? 0
      })
      this.markDirty()
    },
    updateLayoutItem(id: string, payload: Partial<Omit<LayoutItem, 'id' | 'type'>>) {
      const item = this.layoutItems.find(node => node.id === id)
      if (!item) return
      Object.assign(item, payload)
      this.markDirty()
    },
    removeLayoutItem(id: string) {
      this.layoutItems = this.layoutItems.filter(item => item.id !== id)
      this.markDirty()
    },
    assignGuest(guestId: string, tableId: string, seatIndex?: number) {
      const table = this.tables.find(item => item.id === tableId)
      if (!table) return false

      const nextSeatIndex = seatIndex ?? findNextSeatIndex(table, this.seats)
      if (nextSeatIndex < 0 || nextSeatIndex >= table.capacity) {
        return false
      }

      this.seats = this.seats.filter(seat => seat.guestId !== guestId)
      const exists = this.seats.some(seat => seat.tableId === tableId && seat.seatIndex === nextSeatIndex)
      if (exists) return false

      this.seats.push({
        id: createId(),
        guestId,
        tableId,
        seatIndex: nextSeatIndex,
        createdAt: now()
      })
      this.markDirty()
      return true
    },
    unseatGuest(guestId: string) {
      this.seats = this.seats.filter(seat => seat.guestId !== guestId)
      this.markDirty()
    },
    save() {
      this.markSaved()
    }
  },
  persist: {
    pick: ['tables', 'seats', 'layoutItems']
  }
})
