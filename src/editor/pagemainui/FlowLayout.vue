<template>
  <div
    ref="wrapRef"
    class="float-ui fixed z-[9990] select-none"
    :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
    @mousedown="onDragStart"
  >
    <!-- 拖动头部 -->
    <div class="drag-header bg-[#6b4423] border-[4px] border-[#d4b478] rounded-t-lg px-3 py-1 text-[#fff8e8] font-bold cursor-move">
      浮动-数据中心状态
    </div>
    <!-- 自动布局容器：自动排布子组件，flex自动换行 -->
    <div class="layout-container bg-[#6b4423]/90 border-x-[4px] border-b-[4px] border-[#d4b478] rounded-b-lg p-2 flex flex-wrap gap-2">
      <!-- 插槽：用来放置时间、店铺状态等小组件 -->
      <slot>
        <WidgetClock/>
        <WidgetCenterStat/>

      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import WidgetCenterStat from './WidgetCenterStat.vue'
import WidgetClock from './WidgetClock.vue'
const wrapRef = ref(null)
const pos = ref({ x: 640, y: 10 })
const isDrag = ref(false)
const offset = ref({ x: 0, y: 0 })

const onDragStart = (e) => {
  // 只允许点头部拖动
  if (!e.target.closest('.drag-header')) return
  isDrag.value = true
  offset.value.x = e.clientX - pos.value.x
  offset.value.y = e.clientY - pos.value.y
}
const onMouseMove = (e) => {
  if (!isDrag.value) return
  pos.value.x = e.clientX - offset.value.x
  pos.value.y = e.clientY - offset.value.y
}
const onMouseUp = () => {
  isDrag.value = false
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>
