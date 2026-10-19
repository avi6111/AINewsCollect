<template>
  <div
    class="shop-status-label px-3 py-1 rounded-lg whitespace-nowrap"
    :class="isOpen ? 'bg-green-500 text-white' : 'bg-red-600 text-white'"
  >
    {{ isOpen ? '🟢 运行中' : '🔴 未开启' }}
  </div>
</template>

<script setup>
import { ref,inject } from 'vue'
// const props = defineProps({
//   isOpen:{
//     type:Boolean,
//     default:false
//   }
// })
const isOpen = inject('backend_service_open',ref(false))

</script>
