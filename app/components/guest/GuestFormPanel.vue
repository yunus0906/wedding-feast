<template>
  <BaseModal @close="$emit('close')">
    <div class="panel" style="border:0;box-shadow:none;padding:0;background:transparent">
      <div class="toolbar" style="justify-content:space-between;margin-bottom:12px">
        <h3 style="margin:0;font-size:24px">{{ mode === 'create' ? '新增宾客' : '编辑宾客' }}</h3>
        <button class="btn soft" @click="$emit('close')">关闭</button>
      </div>

      <div class="field-grid">
        <input v-model="form.name" class="input full" placeholder="姓名" />
        <select v-model="form.category" class="select">
          <option value="亲戚">亲戚</option>
          <option value="好友">好友</option>
          <option value="同学">同学</option>
        </select>
        <select v-model="form.side" class="select">
          <option value="groom">男方</option>
          <option value="bride">女方</option>
        </select>
        <input v-model="form.phone" class="input full" placeholder="联系电话" />
        <input v-model="form.companions" class="input full" placeholder="同行人，英文逗号分隔" />
        <input v-model.number="form.childrenCount" class="input" type="number" min="0" placeholder="儿童人数" />
        <input v-model="form.relationTag" class="input" placeholder="关系标签，英文逗号分隔" />
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
import type { GuestCategory, GuestSide } from '~/types/guest'

const props = defineProps<{
  mode: 'create' | 'edit'
  modelValue: {
    name: string
    category: GuestCategory
    side: GuestSide
    phone: string
    companions: string
    childrenCount: number
    relationTag: string
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
