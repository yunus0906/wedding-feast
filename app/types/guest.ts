export type GuestSide = 'groom' | 'bride'

export interface Guest {
  id: string
  name: string
  category: string
  side: GuestSide
  phone: string
  companionCount: number
  childrenCount: number
  note: string
  createdAt: string
  updatedAt: string
}

export interface GuestImportRow {
  name: string
  category: string
  side: GuestSide
  phone?: string
  companionCount?: number
  childrenCount?: number
  note?: string
}
