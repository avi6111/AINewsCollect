<template>
    
    <Menu />
    <div> 
        <!--
        <p>fffff</p>
         <button @click="handleClick">点我打印</button> -->
    </div>
    
</template>
<script setup>
import Menu from './menuToolbar.vue'
console.log('index.vue被加载了')
const handleClick = () => {
  console.log('按钮被点击了')
}
</script>