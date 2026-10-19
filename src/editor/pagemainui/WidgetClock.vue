<template>
  <div class="clock-widget bg-[#d4b478] text-gray-900 px-3 py-1 rounded-lg whitespace-nowrap">
    🕒 {{ timeText }}
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const timeText = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  timeText.value = now.toLocaleString('zh-CN', {
    hour:'2-digit',
    minute:'2-digit',
    //second:'2-digit'
  })
}

onMounted(()=>{
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onUnmounted(()=>{
  clearInterval(timer)
})
</script>
