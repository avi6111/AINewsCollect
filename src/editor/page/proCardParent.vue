<template>

  <div class="slide-panel" :style="{transform: panelTransform}">
    
    <!-- 拖动把手：在面板最左边，用来拉宽/收窄面板 -->
    <div class="drag-bar" @mousedown="startDrag"></div>
   
    <!-- 内容区域：Parent.vue 放在这里，宽度可拖拽修改 -->
    <div class="panel-content" :style="{width: contentWidth + 'px'}">
      <div class="scale-wrapper">
       <ParentZero />
      </div>
    </div><!--end scale-wrapper-->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ParentZero from './proCardParent第零号.vue'

// 面板宽度初始值、最小、最大限制
const contentWidth = ref(420)
const minWidth = ref(280)
const maxWidth = ref(700)

const panelTransform = ref('translateX(0)')

let isDragging = false
let startX = 0
let startWidth = 0

const startDrag = (e) => {
  isDragging = true
  startX = e.clientX
  startWidth = contentWidth.value
  document.body.style.cursor = 'ew-resize'
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopDrag)
}

const onMouseMove = (e) => {
  if (!isDragging) return
  // 向右拖动 = 内容变宽；向左拖动 = 内容变窄
  const deltaX = startX - e.clientX
  let newWidth = startWidth + deltaX
  // 限制最大最小宽度
  newWidth = Math.max(minWidth.value, Math.min(maxWidth.value, newWidth))
  contentWidth.value = newWidth
}

const stopDrag = () => {
  isDragging = false
  document.body.style.cursor = ''
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', stopDrag)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.scale-wrapper {
  /* 整体缩小到原来的 2/3 */
  transform: scale(0.67);
  /* 锚点：top right 右上角 */
  transform-origin: top right;
  /* 缩放后会腾出空间，用这个补回去，避免布局塌陷 */
  width: 150%;
  /*height: 150%; 也不需要限制高度 150%
   缩放0.67，原来100%宽，视觉只占67%；多出来33%空白，向左偏移填满，贴向drag-bar */
  margin-left: calc(-33% / 0.67);
}
.slide-panel {
  position: fixed;
  top: 80px;
  right: 0;
  display: flex;
  z-index: 99;
  transition: transform 0.3s ease;
  /* ❗不要给slide-panel设置width，由内部panel-content决定 */
}

/* 拖动把手，贴在内容区左侧 */
.drag-bar {
  width: 6px;
  background: #ddd;
  cursor: ew-resize;
  /* 鼠标悬浮变明显 ????*/
  flex-shrink: 0;
}
.drag-bar:hover {
  background: #666;
}

.panel-content {
  height: calc(100vh - 80px);
  overflow-y: auto; /* 内容过长纵向滚动 */
  /*overflow-x: hidden;  禁止横向溢出，解决你之前自适应溢出问题 */
  /* 这里必须改成 visible，不然scale往左收缩内容会被裁掉 */
  overflow-x: visible;
  background: #fff;
}
</style>
