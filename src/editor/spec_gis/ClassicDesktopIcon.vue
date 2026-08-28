<template>
  <div
    class="desktop-icon btn"
    :class="{ selected: isSelected }"
    @click="handleClick"
    @dblclick="handleDblClick"
  >
    <div class="icon-image">{{ emoji }}</div>
    <span class="icon-label">{{ label }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  emoji: {
    type: String,
    default: '📁'
  },
  label: {
    type: String,
    required: true
  },
  appId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['open-app', 'select'])

const isSelected = ref(false)

function handleClick(e) {
  // 阻止向上冒泡到 body，handleBodyClick 就不会触发
  e.stopPropagation()
  isSelected.value = true
  emit('select', props.appId)
}

function handleDblClick(e) {
    // 阻止向上冒泡到 body，handleBodyClick 就不会触发
  e.stopPropagation()
  isSelected.value = false
  emit('open-app', props.appId)
}
</script>

<style scoped>
.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  padding: 6px 4px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  user-select: none;
}

.desktop-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.desktop-icon.selected {
  background: rgba(0, 0, 128, 0.4);
  border: 1px dotted #fff;
}

.icon-image {
  font-size: 40px;
  line-height: 1;
  margin-bottom: 4px;
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.5));
}

.icon-label {
  font-family: 'MS Sans Serif', 'Microsoft YaHei', Tahoma, sans-serif;
  font-size: 11px;
  color: #fff;
  text-align: center;
  text-shadow: 1px 1px 1px #000;
  word-break: break-all;
  line-height: 1.3;
}
</style>