<template>
  <div ref="canvasRef" class="canvas-shell">
    <div
      v-for="table in tables"
      :key="table.id"
      class="table-node"
      :style="{ left: `${table.x}px`, top: `${table.y}px` }"
      @pointerdown="startDrag($event, table.id)"
      @dblclick="$emit('edit-table', table.id)"
      @dragover.prevent
      @drop.stop.prevent="$emit('drop-guest', table.id)"
    >
      <div class="table-core">{{ table.name }}<br>{{ table.capacity }}人</div>
      <div
        v-for="seat in getSeatPositions(table.capacity)"
        :key="seat.index"
        class="seat-dot"
        :class="{ filled: !!seatGuest(table.id, seat.index) }"
        :style="{ left: `${seat.left}px`, top: `${seat.top}px` }"
        @click.stop="$emit('seat-click', { tableId: table.id, seatIndex: seat.index })"
      >
        {{ seatGuest(table.id, seat.index)?.name?.slice(0, 1) || seat.index + 1 }}
      </div>
    </div>

    <div
      v-for="item in layoutItems"
      :key="item.id"
      class="layout-node"
      :style="{
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${item.width}px`,
        height: `${item.height}px`,
        transform: `rotate(${item.rotation}deg)`
      }"
      @pointerdown="startLayoutDrag($event, item.id)"
      @dblclick="$emit('edit-layout', item.id)"
    >
      <slot name="layout" :item="item">
        <div style="display:grid;place-items:center;height:100%;font-weight:800">
          {{ item.type === 'stage' ? '舞台' : 'T 型台' }}
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Guest } from '~/types/guest'
import type { LayoutItem, Seat, WeddingTable } from '~/types/seating'
import { getSeatPositions } from '~/utils/seating'

const props = defineProps<{
  tables: WeddingTable[]
  seats: Seat[]
  layoutItems: LayoutItem[]
  guestMap: Map<string, Guest>
}>()

const emit = defineEmits<{
  moveTable: [payload: { id: string; x: number; y: number }]
  moveLayout: [payload: { id: string; x: number; y: number }]
  'edit-table': [id: string]
  'edit-layout': [id: string]
  'seat-click': [payload: { tableId: string; seatIndex: number }]
  'drop-guest': [tableId: string]
}>()

const canvasRef = ref<HTMLElement | null>(null)

function seatGuest(tableId: string, seatIndex: number) {
  const seat = props.seats.find(item => item.tableId === tableId && item.seatIndex === seatIndex)
  return seat ? props.guestMap.get(seat.guestId) ?? null : null
}

function dragHandler(kind: 'table' | 'layout', id: string) {
  return (event: PointerEvent) => {
    const target = event.currentTarget as HTMLElement
    target.setPointerCapture(event.pointerId)
    const startX = event.clientX
    const startY = event.clientY
    const startLeft = Number.parseFloat(target.style.left || '0')
    const startTop = Number.parseFloat(target.style.top || '0')

    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      const x = Math.max(0, startLeft + dx)
      const y = Math.max(0, startTop + dy)
      if (kind === 'table') {
        emit('moveTable', { id, x, y })
      } else {
        emit('moveLayout', { id, x, y })
      }
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
  }
}

function startDrag(event: PointerEvent, id: string) {
  dragHandler('table', id)(event)
}

function startLayoutDrag(event: PointerEvent, id: string) {
  dragHandler('layout', id)(event)
}
</script>
