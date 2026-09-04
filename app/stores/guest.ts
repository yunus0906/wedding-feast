import type { Guest, GuestImportRow } from '~/types/guest'
import { createId } from '~/utils/id'

const seedGuests: Guest[] = [
  {
    id: createId(),
    name: '张三',
    category: '亲戚',
    side: 'groom',
    phone: '13800000001',
    companionCount: 2,
    childrenCount: 1,
    note: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: createId(),
    name: '李四',
    category: '同学',
    side: 'bride',
    phone: '13800000002',
    companionCount: 0,
    childrenCount: 0,
    note: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const useGuestStore = defineStore('guest-store', {
  state: () => ({
    guests: seedGuests as Guest[]
  }),
  getters: {
    stats: state => {
      const adultCount = state.guests.reduce((total, guest) => total + 1 + guest.companionCount, 0)
      const childCount = state.guests.reduce((total, guest) => total + guest.childrenCount, 0)
      return {
        totalGuests: state.guests.length,
        adultCount,
        childCount,
        groomCount: state.guests.filter(guest => guest.side === 'groom').length,
        brideCount: state.guests.filter(guest => guest.side === 'bride').length,
        headCount: adultCount + childCount
      }
    }
  },
  actions: {
    addGuest(payload: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) {
      const now = new Date().toISOString()
      this.guests.unshift({
        ...payload,
        id: createId(),
        createdAt: now,
        updatedAt: now
      })
    },
    updateGuest(id: string, payload: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) {
      const index = this.guests.findIndex(guest => guest.id === id)
      if (index === -1) return
      this.guests[index] = {
        ...this.guests[index],
        ...payload,
        updatedAt: new Date().toISOString()
      }
    },
    deleteGuest(id: string) {
      this.guests = this.guests.filter(guest => guest.id !== id)
    },
    importGuests(rows: GuestImportRow[]) {
      const now = new Date().toISOString()
      const next = rows.map(row => ({
        id: createId(),
        name: row.name,
        category: row.category || '其他',
        side: row.side,
        phone: row.phone || '',
        companionCount: row.companionCount ?? 0,
        childrenCount: row.childrenCount ?? 0,
        note: row.note || '',
        createdAt: now,
        updatedAt: now
      }))
      this.guests.unshift(...next)
    }
  },
  persist: true
})
