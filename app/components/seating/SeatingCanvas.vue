<template>
  <div ref="viewportRef" class="canvas-viewport" @pointerdown.capture="startViewportGesture" @pointermove="moveViewportGesture" @pointerup="endViewportGesture" @pointercancel="endViewportGesture">
    <div ref="canvasRef" class="canvas-shell" :style="canvasTransform">
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
  mobileMode?: 'pan' | 'edit'
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
const viewportRef = ref<HTMLElement | null>(null)
const draggingId = ref('')
const guideLine = ref<null | { orientation: 'vertical' | 'horizontal'; value: number }>(null)
const scale = ref(1)
const offset = reactive({ x: 0, y: 0 })
const isMobileViewport = ref(false)
const pointers = new Map<number, { x: number; y: number }>()
let panStart: { x: number; y: number; offsetX: number; offsetY: number } | null = null
let pinchStart: { distance: number; scale: number } | null = null

const canvasTransform = computed(() => ({
  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale.value})`
}))

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
  if (isMobileViewport.value && props.mobileMode !== 'edit') return
  event.stopPropagation()
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
    const dx = (moveEvent.clientX - startX) / scale.value
    const dy = (moveEvent.clientY - startY) / scale.value
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

function distanceBetweenPointers() {
  const [first, second] = [...pointers.values()]
  return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0
}

function startViewportGesture(event: PointerEvent) {
  if (!isMobileViewport.value) return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  if (pointers.size === 2) {
    pinchStart = { distance: distanceBetweenPointers(), scale: scale.value }
    panStart = null
  } else if (props.mobileMode === 'pan') {
    panStart = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y }
  }
}

function moveViewportGesture(event: PointerEvent) {
  if (!isMobileViewport.value || !pointers.has(event.pointerId)) return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (pointers.size >= 2 && pinchStart) {
    const distance = distanceBetweenPointers()
    if (pinchStart.distance) scale.value = Math.min(1.5, Math.max(0.35, pinchStart.scale * distance / pinchStart.distance))
    return
  }
  if (panStart && props.mobileMode === 'pan') {
    offset.x = panStart.offsetX + event.clientX - panStart.x
    offset.y = panStart.offsetY + event.clientY - panStart.y
  }
}

function endViewportGesture(event: PointerEvent) {
  pointers.delete(event.pointerId)
  if (pointers.size < 2) pinchStart = null
  if (!pointers.size) panStart = null
}

function resetView() {
  scale.value = isMobileViewport.value ? 0.5 : 1
  offset.x = 0
  offset.y = 0
}

function updateViewport() {
  isMobileViewport.value = window.matchMedia('(max-width: 768px)').matches
  resetView()
}

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
})

onBeforeUnmount(() => window.removeEventListener('resize', updateViewport))

defineExpose({ resetView })
</script>
