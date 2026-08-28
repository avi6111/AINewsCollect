<template>
  <div class="retro-desktop floating-div" @click.self="clearSelection">
    <!-- 图标区域 -->
    <div class="icon-grid">
      <DesktopIcon
        v-for="icon in icons"
        :key="icon.id"
        :emoji="icon.emoji"
        :label="icon.label"
        :app-id="icon.id"
        @open-app="openApp"
        @select="selectIcon"
      />
    </div>

    <!-- 弹窗 -->
    <div v-if="activeApp" class="window">
      <div class="window-titlebar">
        <span class="window-title">{{ activeAppTitle }}</span>
        <button class="window-close" @click.stop="closeApp">✕</button>
      </div>
      <div class="window-body">
        <p>{{ activeAppContent }}</p>
      </div>
    </div>
    <div v-if="activeWebBrowser" class="window" >
        <FakeBrowser @close="closeFakeBrowser"/>
    </div>
    <div v-if="activeFileViewer" class="window" >
        <FakePhotoViewer @close="closeFakePhotoViewer"/>
    </div>
    <!-- 任务栏 -->
    <div class="taskbar">
      <button class="start-btn">
        <span class="start-flag">🪟</span> 开始
      </button>
      <div class="taskbar-clock">{{ currentTime }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DesktopIcon from './ClassicDesktopIcon.vue'
import FakeBrowser from './FakeBrowser.vue'
import FakePhotoViewer from './FakePhotoViewer.vue'
// 桌面图标数据
const icons = [
  { id: 'my-computer', emoji: '🖥️', label: '我的电脑' },
  { id: 'recycle-bin', emoji: '🗑️', label: '回收站' },
  { id: 'my-documents', emoji: '📂', label: '我的文档' },
  { id: 'internet', emoji: '🌐', label: 'Internet Explorer' },
//   { id: 'notepad', emoji: '📝', label: '记事本' },
//   { id: 'paint', emoji: '🎨', label: '画图' },
//   { id: 'calculator', emoji: '🔢', label: '计算器' },
//   { id: 'games', emoji: '🎮', label: '扫雷' }
]

// 应用内容映射
const appContents = {
  'my-computer': '本地磁盘 (C:)  本地磁盘 (D:)  可移动磁盘 (E:)',
  'recycle-bin': '回收站空。但还有一个文件依稀的影子。被删了又删。大概有6000字。是。。大概2天不眠不休写的小作文',
  'my-documents': '欢迎使用我的文档！这里存放着你的重要文件。',
  'internet': '正在连接到 Internet...\n无法显示该网页。',
  'notepad': '无标题 - 记事本\n\n在这里输入文字...',
  'paint': '🎨 画图程序已启动\n画布大小: 640 x 480',
  'calculator': '0\n\n[7][8][9][÷]\n[4][5][6][×]\n[1][2][3][-]\n[0][.][=][+]',
  'games': '💣 扫雷\n\n难度: 初级\n时间: 000\n剩余雷数: 010'
}

const appTitles = {
  'my-computer': '我的电脑',
  'recycle-bin': '回收站',
  'my-documents': '我的文档',
  'internet': 'Internet Explorer',
  'notepad': '无标题 - 记事本',
  'paint': '无标题 - 画图',
  'calculator': '计算器',
  'games': '扫雷'
}

const activeApp = ref(null)
const selectedIcon = ref(null)
const currentTime = ref('')
//const selectedId = ref(null)
const activeWebBrowser =ref(null)
const activeFileViewer =ref(null)
const activeAppTitle = computed(() => {
  return activeApp.value ? appTitles[activeApp.value] : ''
})

const activeAppContent = computed(() => {
  return activeApp.value ? appContents[activeApp.value] : ''
})

function openApp(appId) {
    activeApp.value = null
    activeWebBrowser.value = null
    activeFileViewer.value = null
    if(appId=='internet'){
        activeWebBrowser.value = appId
        
    }else if(appId=='my-documents'){
        activeFileViewer.value = appId
    }else
    {
        activeApp.value = appId
    }
  
  
}

function closeApp() {
  activeApp.value = null
}
function closeFakeBrowser() {
  activeWebBrowser.value = null
}
function closeFakePhotoViewer() {
  activeFileViewer.value = null
}
function selectIcon(appId) {
  selectedIcon.value = appId
 // selectedId.value = appId
}

function clearSelection() {
  selectedIcon.value = null
 // selectedId.value = null
}

// 时钟
let timer = null

function updateTime() {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${h}:${m}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.retro-desktop {
  width: 100vw;
  height: 100vh;
  /*background: linear-gradient(135deg, #008080 0%, #006060 100%);*/
  position: relative;
  overflow: hidden;
  font-family: 'MS Sans Serif', 'Microsoft YaHei', Tahoma, sans-serif;
}

/* 图标网格 */
.icon-grid {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-content: flex-start;
  gap: 4px;
  padding: 12px;
  height: calc(100vh - 36px);
}

/* 弹窗 - 经典 Windows 风格 */
.window {
  position: absolute;
  top: 80px;
  left: 120px;
  width: 420px;
  background: #c0c0c0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  box-shadow: 1px 1px 0 #000;
  z-index: 100;
}

.window-titlebar {
  background: linear-gradient(90deg, #000080, #1084d0);
  color: #fff;
  padding: 3px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
}

.window-close {
  background: #c0c0c0;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
  border-right: 1px solid #404040;
  border-bottom: 1px solid #404040;
  width: 16px;
  height: 14px;
  font-size: 9px;
  line-height: 14px;
  text-align: center;
  cursor: pointer;
  padding: 0;
  color: #000;
}

.window-close:active {
  border-top: 1px solid #404040;
  border-left: 1px solid #404040;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #fff;
}

.window-body {
  padding: 16px;
  font-size: 12px;
  color: #000;
  min-height: 120px;
  background: #fff;
  margin: 4px;
  border: 1px inset #808080;
  white-space: pre-wrap;
}

/* 任务栏 */
.taskbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  background: #c0c0c0;
  border-top: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px;
  z-index: 200;
}

.start-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #c0c0c0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  font-family: 'MS Sans Serif', 'Microsoft YaHei', Tahoma, sans-serif;
}

.start-btn:active {
  border-top: 2px solid #404040;
  border-left: 2px solid #404040;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
}

.start-flag {
  font-size: 16px;
}

.taskbar-clock {
  background: #c0c0c0;
  border: 1px inset #808080;
  padding: 2px 8px;
  font-size: 11px;
  color: #000;
}

.floating-div {
  position: fixed;
  top: 20px;       /*// 距离顶部距离，按需调整 */
  left: 50%;       /*// 水平居中示例 */
  transform: translateX(-50%);
  z-index: 9999;   /*// 确保层级足够高 */
  pointer-events: none; /* 父浮层盒子：事件穿透，下层可以点 */
}
/* 浮层里面所有交互元素恢复鼠标事件 */
.floating-div .btn,
.floating-div .close,
.floating-div button {
  pointer-events: auto;
}

</style>