<template>
  <section class="page">
    <div class="hero">
      <div>
        <p class="eyebrow">Seating</p>
        <h2>桌次安排</h2>
        <p class="muted">创建桌子、拖动画布元素，并给未入座宾客安排座位。</p>
      </div>
      <div class="toolbar">
        <span v-if="store.dirty" class="tag">有未保存修改</span>
        <button class="btn primary" @click="save">保存</button>
      </div>
    </div>

    <div class="canvas-toolbar panel">
      <div class="toolbar">
        <button class="btn primary" @click="openCreateTable">新增桌子</button>
        <button class="btn soft" @click="store.addLayoutItem('stage')">舞台</button>
        <button class="btn soft" @click="store.addLayoutItem('t_stage')">T 型台</button>
      </div>
      <div class="muted">已入座 {{ store.seats.length }} / 未入座 {{ unassignedGuests.length }}</div>
    </div>

    <div class="two-col">
      <SeatingCanvas
        :tables="store.tables"
        :seats="store.seats"
        :layout-items="store.layoutItems"
        :guest-map="guestMap"
        @move-table="payload => store.moveTable(payload.id, payload.x, payload.y)"
        @move-layout="payload => store.updateLayoutItem(payload.id, { x: payload.x, y: payload.y })"
        @edit-table="openEditTable"
        @seat-click="handleSeatClick"
        @drop-guest="handleGuestDrop"
      />

      <UnassignedGuestList
        :guests="unassignedGuests"
        @drag-guest="draggingGuestId = $event"
        @pick-guest="openSeatDialog"
      />
    </div>

    <div class="panel">
      <h3 style="margin-top:0">已入座宾客</h3>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>宾客</th>
              <th>桌次</th>
              <th>座位</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="seat in store.seats" :key="seat.id">
              <td>{{ guestMap.get(seat.guestId)?.name || '-' }}</td>
              <td>{{ tableMap.get(seat.tableId)?.name || '-' }}</td>
              <td>{{ seat.seatIndex + 1 }}</td>
              <td><button class="btn warning" @click="store.unseatGuest(seat.guestId)">移除座位</button></td>
            </tr>
            <tr v-if="!store.seats.length">
              <td colspan="4" class="muted">暂无已入座宾客。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <TableDialog
      v-if="tableDialogVisible"
      :title="editingTableId ? '编辑桌子' : '新增桌子'"
      :allow-delete="!!editingTableId"
      :model-value="tableForm"
      @close="tableDialogVisible = false"
      @delete="deleteEditingTable"
      @save="saveTable"
    />

    <SeatGuestDialog
      v-if="seatDialogVisible"
      :guest="selectedGuest"
      :tables="store.tables"
      :seats="store.seats"
      @close="seatDialogVisible = false"
      @assign="assignSelectedGuest"
    />
  </section>
</template>

<script setup lang="ts">
const guestStore = useGuestStore()
const store = useSeatingStore()

const tableDialogVisible = ref(false)
const editingTableId = ref<string | null>(null)
const tableForm = reactive({ name: '', capacity: 10, x: 180, y: 180 })

const seatDialogVisible = ref(false)
const selectedGuestId = ref<string | null>(null)
const pendingSeat = ref<{ tableId: string; seatIndex: number } | null>(null)
const draggingGuestId = ref<string | null>(null)

const guestMap = computed(() => new Map(guestStore.guests.map(guest => [guest.id, guest])))
const tableMap = computed(() => new Map(store.tables.map(table => [table.id, table])))
const assignedGuestIds = computed(() => new Set(store.seats.map(seat => seat.guestId)))
const unassignedGuests = computed(() => guestStore.guests.filter(guest => !assignedGuestIds.value.has(guest.id)))
const selectedGuest = computed(() => selectedGuestId.value ? guestMap.value.get(selectedGuestId.value) ?? null : null)

onMounted(() => {
  if (!store.tables.length) {
    store.addTable({ name: '1号桌', capacity: 10, x: 220, y: 220 })
    store.addTable({ name: '2号桌', capacity: 10, x: 460, y: 300 })
    store.markSaved()
  }
})

function openCreateTable() {
  editingTableId.value = null
  Object.assign(tableForm, {
    name: `${store.tables.length + 1}号桌`,
    capacity: 10,
    x: 240,
    y: 240
  })
  tableDialogVisible.value = true
}

function openEditTable(id: string) {
  const table = store.tables.find(item => item.id === id)
  if (!table) return
  editingTableId.value = id
  Object.assign(tableForm, {
    name: table.name,
    capacity: table.capacity,
    x: table.x,
    y: table.y
  })
  tableDialogVisible.value = true
}

function saveTable(value: typeof tableForm) {
  const payload = {
    name: value.name || `${store.tables.length + 1}号桌`,
    capacity: Math.min(12, Math.max(6, Number(value.capacity || 10))),
    x: Number(value.x || 180),
    y: Number(value.y || 180)
  }
  if (editingTableId.value) {
    store.updateTable(editingTableId.value, payload)
  } else {
    store.addTable(payload)
  }
  tableDialogVisible.value = false
}

function deleteEditingTable() {
  if (!editingTableId.value) return
  if (!confirm('确定删除该桌子吗？该桌座位也会被移除。')) return
  store.removeTable(editingTableId.value)
  tableDialogVisible.value = false
}

function openSeatDialog(guestId: string) {
  selectedGuestId.value = guestId
  pendingSeat.value = null
  seatDialogVisible.value = true
}

function handleSeatClick(payload: { tableId: string; seatIndex: number }) {
  const firstGuest = unassignedGuests.value[0]
  if (!firstGuest) return
  selectedGuestId.value = firstGuest.id
  pendingSeat.value = payload
  seatDialogVisible.value = true
}

function handleGuestDrop(tableId: string) {
  if (!draggingGuestId.value) return
  const ok = store.assignGuest(draggingGuestId.value, tableId)
  if (!ok) {
    alert('该桌已满')
  }
  draggingGuestId.value = null
}

function assignSelectedGuest(payload: { tableId: string; seatIndex?: number }) {
  if (!selectedGuestId.value) return
  const tableId = pendingSeat.value?.tableId ?? payload.tableId
  const seatIndex = pendingSeat.value?.seatIndex ?? payload.seatIndex
  const ok = store.assignGuest(selectedGuestId.value, tableId, seatIndex)
  if (!ok) {
    alert('该桌已满或座位已被占用')
    return
  }
  seatDialogVisible.value = false
}

function save() {
  store.save()
  alert('已保存')
}
</script>
