<template>
  <BaseModal @close="$emit('close')">
    <div class="panel" style="border:0;box-shadow:none;padding:0;background:transparent">
      <div class="toolbar" style="justify-content:space-between;margin-bottom:12px">
        <h3 style="margin:0;font-size:24px">{{ mode === 'create' ? '新增宾客' : '编辑宾客' }}</h3>
        <button class="btn soft" @click="$emit('close')">关闭</button>
      </div>

      <div class="field-grid">
        <input v-model="form.name" class="input full" placeholder="姓名" />
        <input v-model="form.category" class="input" placeholder="分类" />
        <select v-model="form.side" class="select">
          <option value="groom">男方</option>
          <option value="bride">女方</option>
        </select>
        <input v-model="form.phone" class="input full" placeholder="联系电话" />
        <input v-model.number="form.companionCount" class="input" type="number" min="0" placeholder="同行人数" />
        <input v-model.number="form.childrenCount" class="input" type="number" min="0" placeholder="儿童人数" />
        <textarea v-model="form.note" class="textarea full" rows="4" placeholder="备注" />
      </div>

      <div class="toolbar" style="justify-content:flex-end;margin-top:14px">
        <button class="btn" @click="$emit('close')">取消</button>
        <button class="btn primary" @click="submit">保存</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import type { GuestSide } from '~/types/guest'

const props = defineProps<{
  mode: 'create' | 'edit'
  modelValue: {
    name: string
    category: string
    side: GuestSide
    phone: string
    companionCount: number
    childrenCount: number
    note: string
  }
}>()

const emit = defineEmits<{
  close: []
  save: [value: typeof props.modelValue]
}>()

const form = reactive({ ...props.modelValue })

watch(
  () => props.modelValue,
  value => Object.assign(form, value),
  { deep: true }
)

function submit() {
  emit('save', { ...form })
}
</script>
