<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ close: [] }>()
</script>
