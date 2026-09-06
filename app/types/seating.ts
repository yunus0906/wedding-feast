export type LayoutItemType = 'stage' | 't_stage'
export type SeatRole = 'regular' | 'host' | 'cohost'

export interface WeddingTable {
  id: string
  name: string
  capacity: number
  x: number
  y: number
  createdAt: string
  updatedAt: string
}

export interface Seat {
  id: string
  guestId: string
  tableId: string
  seatIndex: number
  role: SeatRole
  createdAt: string
}

export interface LayoutItem {
  id: string
  type: LayoutItemType
  x: number
  y: number
  width: number
  height: number
  rotation: number
}
