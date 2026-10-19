<template>
  <div class="menu-toolbar">
    <button class="toolbar-btn" @click="handleBtn1">
      打开Unity
    </button>
    <button class="toolbar-btn" @click="handleBtn2">
      重置排班
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['clickOpenUnity', 'clickReset'])

const handleBtn1 = () => {
  emit('clickOpenUnity')
}
const handleBtn2 = () => {
  emit('clickReset')
}
</script>

<style scoped>
.menu-toolbar {
  display: flex;
  gap: 12px;
  padding: 10px 16px;
  background: #6b4423;
  border-radius: 10px;
}
.toolbar-btn {
  padding: 6px 14px;
  background: #d4b478;
  border: none;
  border-radius: 6px;
  color: #222;
  cursor: pointer;
}
.toolbar-btn:hover {
  background: #e6c88b;
}
</style>
