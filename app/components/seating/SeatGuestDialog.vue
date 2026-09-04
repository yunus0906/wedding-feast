<template>
  <BaseModal @close="$emit('close')">
    <div class="panel" style="border:0;box-shadow:none;padding:0;background:transparent">
      <div class="toolbar" style="justify-content:space-between;margin-bottom:12px">
        <h3 style="margin:0;font-size:24px">安排座位</h3>
        <button class="btn soft" @click="$emit('close')">关闭</button>
      </div>
      <p class="muted" style="margin-top:0">{{ guest?.name }} · {{ guest?.side === 'groom' ? '男方' : '女方' }}</p>

      <div class="field-grid">
        <select v-model="selectedTableId" class="select full">
          <option value="">请选择桌子</option>
          <option v-for="table in tables" :key="table.id" :value="table.id">
            {{ table.name }} / {{ table.capacity }}人
          </option>
        </select>

        <select v-if="selectedTable" v-model.number="selectedSeatIndex" class="select full">
          <option value="-1">自动分配座位</option>
          <option v-for="seat in seatOptions" :key="seat.index" :value="seat.index">
            座位 {{ seat.index + 1 }}
          </option>
        </select>
      </div>

      <div class="toolbar" style="justify-content:flex-end;margin-top:14px">
        <button class="btn" @click="$emit('close')">取消</button>
        <button class="btn primary" @click="submit">确认</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Guest } from '~/types/guest'
import type { Seat, WeddingTable } from '~/types/seating'
import { getSeatPositions } from '~/utils/seating'

const props = defineProps<{
  guest: Guest | null
  tables: WeddingTable[]
  seats: Seat[]
}>()

const emit = defineEmits<{
  close: []
  assign: [payload: { tableId: string; seatIndex?: number }]
}>()

const selectedTableId = ref('')
const selectedSeatIndex = ref(-1)

const selectedTable = computed(() => props.tables.find(table => table.id === selectedTableId.value) ?? null)
const seatOptions = computed(() => selectedTable.value ? getSeatPositions(selectedTable.value.capacity) : [])

watch(
  () => props.tables,
  tables => {
    if (!selectedTableId.value && tables[0]) {
      selectedTableId.value = tables[0].id
    }
  },
  { immediate: true }
)

function submit() {
  if (!selectedTableId.value) return
  emit('assign', {
    tableId: selectedTableId.value,
    seatIndex: selectedSeatIndex.value >= 0 ? selectedSeatIndex.value : undefined
  })
}
</script>
