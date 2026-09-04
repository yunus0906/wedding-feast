<template>
  <div class="seat-panel">
    <div style="padding:16px">
      <h3 style="margin:0 0 8px;font-size:24px">未入座宾客</h3>
      <input v-model="keyword" class="input" placeholder="搜索姓名" />
    </div>
    <div style="padding: 0 16px 16px; max-height: 640px; overflow: auto">
      <div
        v-for="guest in filteredGuests"
        :key="guest.id"
        class="guest-chip unassigned"
        draggable="true"
        @dragstart="$emit('drag-guest', guest.id)"
        @click="$emit('pick-guest', guest.id)"
      >
        <strong>{{ guest.name }}</strong>
        <div class="muted">{{ guest.side === 'groom' ? '男方' : '女方' }} · {{ guest.category }}</div>
      </div>
      <p v-if="!filteredGuests.length" class="muted">没有未入座宾客。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Guest } from '~/types/guest'

const props = defineProps<{ guests: Guest[] }>()
defineEmits<{ 'drag-guest': [id: string]; 'pick-guest': [id: string] }>()

const keyword = ref('')
const filteredGuests = computed(() =>
  props.guests.filter(guest => guest.name.includes(keyword.value.trim()))
)
</script>
