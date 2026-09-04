<template>
  <BaseModal @close="$emit('close')">
    <div class="panel" style="border:0;box-shadow:none;padding:0;background:transparent">
      <div class="toolbar" style="justify-content:space-between;margin-bottom:12px">
        <h3 style="margin:0;font-size:24px">{{ title }}</h3>
        <button class="btn soft" @click="$emit('close')">关闭</button>
      </div>
      <div class="field-grid">
        <input v-model="form.name" class="input full" placeholder="桌子名称" />
        <input v-model.number="form.capacity" class="input" type="number" min="6" max="12" placeholder="桌子人数" />
        <input v-model.number="form.x" class="input" type="number" placeholder="X" />
        <input v-model.number="form.y" class="input" type="number" placeholder="Y" />
      </div>
      <div class="toolbar" style="justify-content:flex-end;margin-top:14px">
        <button class="btn warning" v-if="allowDelete" @click="$emit('delete')">删除</button>
        <button class="btn" @click="$emit('close')">取消</button>
        <button class="btn primary" @click="submit">保存</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  allowDelete?: boolean
  modelValue: { name: string; capacity: number; x: number; y: number }
}>()

const emit = defineEmits<{
  close: []
  delete: []
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
