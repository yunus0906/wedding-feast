import type { Seat, WeddingTable } from '~/types/seating'

export function getSeatPositions(capacity: number, radius = 64) {
  return Array.from({ length: capacity }, (_, index) => {
    const angle = (-Math.PI / 2) + ((Math.PI * 2) / capacity) * index
    return {
      index,
      left: 80 + Math.cos(angle) * radius,
      top: 80 + Math.sin(angle) * radius
    }
  })
}

export function getTableSeatMap(tableId: string, seats: Seat[]) {
  return seats.filter(seat => seat.tableId === tableId).sort((a, b) => a.seatIndex - b.seatIndex)
}

export function findNextSeatIndex(table: WeddingTable, seats: Seat[]) {
  const occupied = new Set(getTableSeatMap(table.id, seats).map(seat => seat.seatIndex))
  for (let index = 0; index < table.capacity; index += 1) {
    if (!occupied.has(index)) {
      return index
    }
  }
  return -1
}
