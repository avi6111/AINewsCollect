<template>
  <button @click="show = true">打开弹窗</button>

  <Teleport to="body">
    <div v-if="show" class="mask" @click.self="show=false">
      <div class="popup" @click.stop>
        弹窗内容
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import {ref} from 'vue'
const show = ref(false)
</script>

<style>
.mask {
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.3);
  display:flex;
  align-items:center;
  justify-content:center;
}
.popup{
  background:white;
  padding:20px;
}
</style>
