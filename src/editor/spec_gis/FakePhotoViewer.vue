<template>
  <div class="folder-window">
    <!-- 窗口标题栏（文件夹风格） -->
    <div class="window-titlebar">
      <span class="window-icon">📁</span>
      <span class="window-title">我的照片</span>
      <div class="window-controls">
        <span class="ctrl-btn min">─</span>
        <span class="ctrl-btn max">☐</span>
        <span class="ctrl-btn close" @click.stop="closeWindow">✕</span>
      </div>
    </div>

    <!-- 工具栏（地址/路径栏） -->
    <div class="folder-toolbar">
      <div class="nav-buttons">
        <span class="nav-btn">←</span>
        <span class="nav-btn">→</span>
        <span class="nav-btn">↑</span>
      </div>
      <div class="address-bar">
        📁 我的文档 › 全部
      </div>
      <div class="view-options">
        <span class="view-btn">▦</span>
        <span class="view-btn">☰</span>
      </div>
    </div>

    <!-- 图片网格（缩略图浏览） -->
    <div class="photo-grid">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="photo-item"
        :class="{ focused: focusedIndex === index }"
        @click="toggleFocus(index)"
      >
        <div class="photo-thumb">
          <img
            :src="photo.src"
            :alt="photo.alt"
            class="thumb-img"
            :class="{ blurred: focusedIndex !== null && focusedIndex !== index }"
          />
          <div class="photo-check" v-if="focusedIndex === index">✓</div>
        </div>
        <div class="photo-name">{{ photo.label }}</div>
        <div class="photo-meta">{{ photo.size }}</div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <span>{{ photos.length }} 个项目</span>
      <span v-if="focusedIndex !== null">
        已选: {{ photos[focusedIndex].label }}
      </span>
      <span v-else>就绪</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close'])

const photos = ref([
  { src: '/1206607768_-103739220_19483_sPhoto.jpg', alt: '照片 1', label: '校园风景', size: '2.4 MB' },
  { src: '/1206607775_-103739220_19616_sPhoto.jpg', alt: '照片 2', label: '图书馆一角', size: '1.8 MB' },
  { src: '/1206607782_-103739220_19823_sPhoto.jpg', alt: '照片 3', label: '操场夕阳', size: '3.1 MB' },
  { src: '/1206607788_-103739220_19932_sPhoto.jpg', alt: '照片 4', label: '教学楼', size: '2.0 MB' },
  { src: '/Snipaste_2026-08-29_04-29-59.png', alt: '照片 5', label: '食堂午餐', size: '1.5 MB' }
])

const focusedIndex = ref(null)

function toggleFocus(index) {
  focusedIndex.value = focusedIndex.value === index ? null : index
}

function closeWindow() {
  emit('close')
}
</script>

<style scoped>
/* ===== 整体窗口 ===== */
.folder-window {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', 'Microsoft YaHei', Tahoma, sans-serif;
  font-size: 12px;
  background: #f5f5f5;
  border: 2px solid #c0c0c0;
  box-sizing: border-box;
}

/* ===== 标题栏（文件夹风格） ===== */
.window-titlebar {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 100%);
  border-bottom: 1px solid #b0b0b0;
  flex-shrink: 0;
  user-select: none;
  gap: 6px;
}

.window-icon {
  font-size: 14px;
}

.window-title {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
}

.window-controls {
  display: flex;
  gap: 4px;
}

.ctrl-btn {
  pointer-events: auto;
  display: inline-block;
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  font-size: 10px;
  font-family: 'Segoe UI', sans-serif;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  color: #333;
}

.ctrl-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.ctrl-btn.close:hover {
  background: #e81123;
  color: #fff;
  border-color: #e81123;
}

/* ===== 工具栏 ===== */
.folder-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f0f0f0;
  border-bottom: 1px solid #d0d0d0;
  flex-shrink: 0;
}

.nav-buttons {
  display: flex;
  gap: 2px;
}

.nav-btn {
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 2px;
  font-size: 12px;
  user-select: none;
}

.nav-btn:hover {
  background: #d0d0d0;
}

.address-bar {
  flex: 1;
  background: #fff;
  border: 1px solid #c0c0c0;
  border-radius: 2px;
  padding: 2px 8px;
  font-size: 11px;
  color: #333;
  height: 22px;
  line-height: 18px;
}

.view-options {
  display: flex;
  gap: 2px;
}

.view-btn {
  padding: 2px 6px;
  cursor: pointer;
  border-radius: 2px;
  font-size: 12px;
  user-select: none;
}

.view-btn:hover {
  background: #d0d0d0;
}

/* ===== 图片网格 ===== */
.photo-grid {
  flex: 1;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px 14px;
  align-content: start;
  overflow-y: auto;
  background: #ffffff;
}

.photo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 8px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.2s;
  border: 1px solid transparent;
}

.photo-item:hover {
  background: #f0f4ff;
  border-color: #d0d8e8;
}

.photo-item.focused {
  background: #e8f0fe;
  border-color: #1a73e8;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.2);
}

/* ===== 缩略图 ===== */
.photo-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 4px;
  overflow: hidden;
  background: #e8e8e8;
  border: 1px solid #d0d0d0;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: filter 0.35s ease;
}

/* 🔥 高斯模糊：非聚焦时模糊 */
.thumb-img.blurred {
  filter: blur(47px);
}

/* 选中对勾 */
.photo-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #1a73e8;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  text-align: center;
  line-height: 20px;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* 文件名 & 大小 */
.photo-name {
  margin-top: 6px;
  font-size: 12px;
  color: #333;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-meta {
  font-size: 10px;
  color: #999;
  text-align: center;
}

/* ===== 底部状态栏 ===== */
.status-bar {
  flex-shrink: 0;
  padding: 4px 14px;
  background: #f0f0f0;
  border-top: 1px solid #d0d0d0;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #555;
}
</style>