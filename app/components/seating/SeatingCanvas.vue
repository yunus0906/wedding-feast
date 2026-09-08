<template>
  <div ref="canvasRef" class="canvas-shell">
    <div v-if="guideLine" class="guide-line" :class="guideLine.orientation" :style="guideStyle" />

    <div
      v-for="table in tables"
      :key="table.id"
      class="table-node"
      :class="{ dragging: draggingId === table.id }"
      :style="{ left: `${table.x}px`, top: `${table.y}px` }"
      @pointerdown="startDrag('table', table.id, $event)"
      @dblclick="$emit('edit-table', table.id)"
      @dragover.prevent
      @drop.stop.prevent="$emit('drop-guest', table.id)"
    >
      <div class="table-core">{{ table.name }}<br>{{ table.capacity }}人</div>
      <div
        v-for="seat in getSeatPositions(table.capacity)"
        :key="seat.index"
        class="seat-dot"
        :class="[seatRole(table.id, seat.index), { filled: !!seatGuest(table.id, seat.index) }]"
        :style="{ left: `${seat.left}px`, top: `${seat.top}px` }"
        @click.stop="$emit('seat-click', { tableId: table.id, seatIndex: seat.index })"
      >
        {{ guestSeatLabel(table.id, seat.index) || seat.index + 1 }}
      </div>
    </div>

    <div
      v-for="item in layoutItems"
      :key="item.id"
      class="layout-node"
      :class="{ dragging: draggingId === item.id }"
      :style="{
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${item.width}px`,
        height: `${item.height}px`,
        transform: `rotate(${item.rotation}deg)`
      }"
      @pointerdown="startDrag('layout', item.id, $event)"
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

type DragKind = 'table' | 'layout'

const SNAP_DISTANCE = 12

const props = defineProps<{
  tables: WeddingTable[]
  seats: Seat[]
  layoutItems: LayoutItem[]
  guestMap: Map<string, Guest>
}>()

const emit = defineEmits<{
  moveTable: [payload: { id: string; x: number; y: number }]
  moveLayout: [payload: { id: string; x: number; y: number }]
  endMove: []
  'edit-table': [id: string]
  'edit-layout': [id: string]
  'seat-click': [payload: { tableId: string; seatIndex: number }]
  'drop-guest': [tableId: string]
  'drag-history-start': [kind: DragKind, id: string]
}>()

const canvasRef = ref<HTMLElement | null>(null)
const draggingId = ref('')
const guideLine = ref<null | { orientation: 'vertical' | 'horizontal'; value: number }>(null)

const guideStyle = computed(() => {
  if (!guideLine.value) return {}
  return guideLine.value.orientation === 'vertical'
    ? { left: `${guideLine.value.value}px` }
    : { top: `${guideLine.value.value}px` }
})

function seatGuest(tableId: string, seatIndex: number) {
  const seat = props.seats.find(item => item.tableId === tableId && item.seatIndex === seatIndex)
  return seat ? props.guestMap.get(seat.guestId) ?? null : null
}

function seatRole(tableId: string, seatIndex: number) {
  return props.seats.find(item => item.tableId === tableId && item.seatIndex === seatIndex)?.role ?? 'regular'
}

function guestSeatLabel(tableId: string, seatIndex: number) {
  const name = seatGuest(tableId, seatIndex)?.name ?? ''
  return name ? name.slice(-1) : ''
}

function getBoundsFor(kind: DragKind, id: string) {
  if (kind === 'table') {
    const table = props.tables.find(item => item.id === id)
    if (!table) return null
    return { x: table.x, y: table.y, width: 160, height: 160 }
  }
  const item = props.layoutItems.find(node => node.id === id)
  if (!item) return null
  return { x: item.x, y: item.y, width: item.width, height: item.height }
}

function computeSnap(kind: DragKind, id: string, x: number, y: number) {
  const bounds = getBoundsFor(kind, id)
  if (!bounds) return { x, y, guideLine: null as typeof guideLine.value }

  const anchorsX = [
    0,
    360,
    720,
    ...props.tables.filter(item => item.id !== id).map(item => item.x),
    ...props.layoutItems.filter(item => item.id !== id).map(item => item.x)
  ]
  const anchorsY = [
    0,
    280,
    560,
    ...props.tables.filter(item => item.id !== id).map(item => item.y),
    ...props.layoutItems.filter(item => item.id !== id).map(item => item.y)
  ]

  let snappedX = x
  let snappedY = y
  let activeGuide: typeof guideLine.value = null

  for (const anchor of anchorsX) {
    if (Math.abs(anchor - x) <= SNAP_DISTANCE) {
      snappedX = anchor
      activeGuide = { orientation: 'vertical', value: anchor }
      break
    }
    if (Math.abs(anchor - (x + bounds.width / 2)) <= SNAP_DISTANCE) {
      snappedX = anchor - bounds.width / 2
      activeGuide = { orientation: 'vertical', value: anchor }
      break
    }
  }

  for (const anchor of anchorsY) {
    if (Math.abs(anchor - y) <= SNAP_DISTANCE) {
      snappedY = anchor
      activeGuide = { orientation: 'horizontal', value: anchor }
      break
    }
    if (Math.abs(anchor - (y + bounds.height / 2)) <= SNAP_DISTANCE) {
      snappedY = anchor - bounds.height / 2
      activeGuide = { orientation: 'horizontal', value: anchor }
      break
    }
  }

  return { x: snappedX, y: snappedY, guideLine: activeGuide }
}

function startDrag(kind: DragKind, id: string, event: PointerEvent) {
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  draggingId.value = id
  emit('drag-history-start', kind, id)

  const startX = event.clientX
  const startY = event.clientY
  const bounds = getBoundsFor(kind, id)
  if (!bounds) return
  const startLeft = bounds.x
  const startTop = bounds.y

  const onMove = (moveEvent: PointerEvent) => {
    const dx = moveEvent.clientX - startX
    const dy = moveEvent.clientY - startY
    const next = computeSnap(kind, id, Math.max(0, startLeft + dx), Math.max(0, startTop + dy))
    guideLine.value = next.guideLine
    if (kind === 'table') {
      emit('moveTable', { id, x: next.x, y: next.y })
    } else {
      emit('moveLayout', { id, x: next.x, y: next.y })
    }
  }

  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    draggingId.value = ''
    guideLine.value = null
    emit('endMove')
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp, { once: true })
}
</script>
