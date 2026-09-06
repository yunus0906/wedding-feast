import type { Guest } from './guest'
import type { LayoutItem, Seat, WeddingTable } from './seating'
import type { Wedding } from './wedding'

export interface WeddingStatePayload {
  wedding: Wedding
  guests: Guest[]
  tables: WeddingTable[]
  seats: Seat[]
  layoutItems: LayoutItem[]
}
