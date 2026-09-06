export type GuestSide = 'groom' | 'bride'
export type GuestCategory = '亲戚' | '好友' | '同学'

export interface Guest {
  id: string
  name: string
  category: GuestCategory
  side: GuestSide
  phone: string
  companions: string
  childrenCount: number
  relationTag: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface GuestImportRow {
  name: string
  category: GuestCategory
  side: GuestSide
  phone?: string
  companions?: string
  childrenCount?: number
  relationTag?: string
  note?: string
}
