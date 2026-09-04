<template>
  <section class="page">
    <div class="hero">
      <div>
        <p class="eyebrow">Guests</p>
        <h2>宾客名单</h2>
        <p class="muted">管理婚礼宾客信息、统计人数，并导入导出名单。</p>
      </div>
      <button class="btn primary" @click="openCreate">新增宾客</button>
    </div>

    <div class="grid-4">
      <div class="stat">
        <label>出席总人数</label>
        <strong>{{ store.stats.headCount }}</strong>
      </div>
      <div class="stat">
        <label>大人</label>
        <strong>{{ store.stats.adultCount }}</strong>
      </div>
      <div class="stat">
        <label>儿童</label>
        <strong>{{ store.stats.childCount }}</strong>
      </div>
      <div class="stat">
        <label>男方 / 女方</label>
        <strong>{{ store.stats.groomCount }} / {{ store.stats.brideCount }}</strong>
      </div>
    </div>

    <div class="panel">
      <div class="toolbar">
        <input v-model="keyword" class="input" style="max-width:320px" placeholder="搜索姓名" />
        <label class="btn soft">
          导入 CSV
          <input type="file" accept=".csv,.txt" style="display:none" @change="handleImport" />
        </label>
        <button class="btn soft" @click="downloadCsv">导出 CSV</button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>分类</th>
              <th>所属</th>
              <th>电话</th>
              <th>同行</th>
              <th>儿童</th>
              <th>桌次</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="guest in filteredGuests" :key="guest.id">
              <td><strong>{{ guest.name }}</strong></td>
              <td><span class="tag">{{ guest.category }}</span></td>
              <td><span class="tag" :class="guest.side">{{ sideLabel(guest.side) }}</span></td>
              <td>{{ guest.phone || '-' }}</td>
              <td>{{ guest.companionCount }}</td>
              <td>{{ guest.childrenCount }}</td>
              <td>{{ tableNameByGuest(guest.id) }}</td>
              <td>
                <button class="btn soft" @click="openEdit(guest.id)">编辑</button>
                <button class="btn warning" style="margin-left:8px" @click="removeGuest(guest.id)">删除</button>
              </td>
            </tr>
            <tr v-if="!filteredGuests.length">
              <td colspan="8" class="muted">暂无匹配宾客。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <GuestFormPanel
      v-if="formVisible"
      :mode="editingId ? 'edit' : 'create'"
      :model-value="formValue"
      @close="formVisible = false"
      @save="saveGuest"
    />
  </section>
</template>

<script setup lang="ts">
import type { GuestSide } from '~/types/guest'
import { exportGuestCsv, parseGuestCsv } from '~/utils/excel'

const store = useGuestStore()
const seatingStore = useSeatingStore()
const keyword = ref('')
const formVisible = ref(false)
const editingId = ref<string | null>(null)

const emptyForm = {
  name: '',
  category: '亲戚',
  side: 'groom' as GuestSide,
  phone: '',
  companionCount: 0,
  childrenCount: 0,
  note: ''
}

const formValue = reactive({ ...emptyForm })

const filteredGuests = computed(() => {
  const value = keyword.value.trim()
  return value ? store.guests.filter(guest => guest.name.includes(value)) : store.guests
})

function sideLabel(side: GuestSide) {
  return side === 'groom' ? '男方' : '女方'
}

function tableNameByGuest(guestId: string) {
  const seat = seatingStore.seats.find(item => item.guestId === guestId)
  const table = seat ? seatingStore.tables.find(item => item.id === seat.tableId) : null
  return table ? `${table.name} / ${seat!.seatIndex + 1}号位` : '未安排'
}

function openCreate() {
  editingId.value = null
  Object.assign(formValue, emptyForm)
  formVisible.value = true
}

function openEdit(id: string) {
  const guest = store.guests.find(item => item.id === id)
  if (!guest) return
  editingId.value = id
  Object.assign(formValue, {
    name: guest.name,
    category: guest.category,
    side: guest.side,
    phone: guest.phone,
    companionCount: guest.companionCount,
    childrenCount: guest.childrenCount,
    note: guest.note
  })
  formVisible.value = true
}

function saveGuest(value: typeof emptyForm) {
  if (!value.name.trim()) return
  if (editingId.value) {
    store.updateGuest(editingId.value, value)
  } else {
    store.addGuest(value)
  }
  formVisible.value = false
}

function removeGuest(id: string) {
  if (!confirm('确定删除该宾客吗？删除后无法恢复。')) return
  store.deleteGuest(id)
  seatingStore.unseatGuest(id)
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const text = await file.text()
  const rows = parseGuestCsv(text)
  if (!rows.length) {
    alert('没有可导入的数据')
    return
  }
  if (confirm(`解析到 ${rows.length} 位宾客，确认导入？`)) {
    store.importGuests(rows)
  }
  input.value = ''
}

function downloadCsv() {
  const csv = exportGuestCsv(
    store.guests.map(guest => ({
      ...guest,
      side: sideLabel(guest.side)
    }))
  )
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'guests.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>
