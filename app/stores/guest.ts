import type { Guest, GuestCategory, GuestImportRow } from '~/types/guest'
import { createId } from '~/utils/id'

export const guestCategories = ['亲戚', '好友', '同学'] as const

function companionCount(guest: Guest) {
  const legacyGuest = guest as Guest & { companionCount?: number }
  return guest.companions
    ? guest.companions.split(',').map(name => name.trim()).filter(Boolean).length
    : legacyGuest.companionCount ?? 0
}

function normalizeCategory(category: string): GuestCategory {
  return guestCategories.includes(category as GuestCategory)
    ? category as GuestCategory
    : '亲戚'
}

function normalizeGuest(guest: Guest): Guest {
  return {
    ...guest,
    category: normalizeCategory(guest.category),
    companions: guest.companions ?? '',
    relationTag: guest.relationTag ?? '',
    childrenCount: guest.childrenCount ?? 0,
    note: guest.note ?? '',
    phone: guest.phone ?? '',
    updatedAt: guest.updatedAt ?? new Date().toISOString(),
    createdAt: guest.createdAt ?? new Date().toISOString()
  }
}

function normalizeGuests(guests: Guest[]) {
  return guests
    ? guests.map(normalizeGuest)
    : []
}

const seedGuests: Guest[] = [
  {
    id: createId(),
    name: '张三',
    category: '亲戚',
    side: 'groom',
    phone: '13800000001',
    companions: '王小三,张小三',
    childrenCount: 1,
    relationTag: '新郎大学同学,男方父母亲友',
    note: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: createId(),
    name: '李四',
    category: '好友',
    side: 'bride',
    phone: '13800000002',
    companions: '',
    childrenCount: 0,
    relationTag: '新娘表姐',
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
      const guests = normalizeGuests(state.guests)
      const adultCount = guests.reduce((total, guest) => total + 1 + companionCount(guest), 0)
      const childCount = guests.reduce((total, guest) => total + guest.childrenCount, 0)
      return {
        totalGuests: guests.length,
        adultCount,
        childCount,
        groomCount: guests.filter(guest => guest.side === 'groom').length,
        brideCount: guests.filter(guest => guest.side === 'bride').length,
        headCount: adultCount + childCount
      }
    }
  },
  actions: {
    normalizePersistedGuests() {
      this.guests = normalizeGuests(this.guests)
    },
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
        category: normalizeCategory(row.category),
        side: row.side,
        phone: row.phone || '',
        companions: row.companions || '',
        childrenCount: row.childrenCount ?? 0,
        relationTag: row.relationTag || '',
        note: row.note || '',
        createdAt: now,
        updatedAt: now
      }))
      this.guests.unshift(...next)
    }
  },
  persist: true
})
