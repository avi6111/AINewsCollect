<template>
  <div class="fake-browser">
    <!-- 浏览器地址栏 -->
    <div class="browser-toolbar">
      <div class="toolbar-btns">
        <span class="btn">←</span>
        <span class="btn">→</span>
        <span class="btn">⟳</span>
      </div>
      <div class="address-bar">
        🔒 www.renren.com/u/19870315
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 个人主页 -->
      <div class="profile-card">
        <!-- <div class="avatar">😎</div> -->
         
          <img src="/Snipaste_2026-08-29_04-29-59.png" alt="头像" class="avatar-head"/>
        
        <div class="profile-info">
          <h3>甜甜</h3>
          <p class="school">🎓 北京电影学院 · 表演系 2007级</p>
          <p class="bio">这个人很懒，什么都没写...</p>
          <div class="meta">
            <span>📍 北京海淀</span>
            <span>🎂 1990-03-15</span>
          </div>
        </div>
      </div>

      <!-- 最近动态 -->
      <div class="recent-posts">
        <h4>最近动态</h4>
        <div class="post">
          <p>今天天气真好，适合去图书馆自习~ 📚</p>
          <span class="post-time">3小时前</span>
        </div>
        <div class="post">
          <p>期末考试终于考完了！解放！🎉</p>
          <span class="post-time">昨天</span>
        </div>
      </div>
    <div class="greeting-area">
    <input
        v-model="greeting"
        type="text"
        class="greeting-input"
        placeholder="写一句问候话吧...你好，我是割割"
        maxlength="30"
    />
    </div>
      <!-- 加好友按钮 -->
      <button
        class="add-friend-btn"
        :class="{ rejected: isRejected }"
        @click.stop="addFriend"
      >
        {{ isRejected ? '❌ 已被拒绝' : '➕ 加为好友' }}
      </button>

      <!-- 拒绝通知弹窗 -->
      <div v-if="showNotification" class="notification">
        <div class="notification-header">
          <span>⚠️ 系统通知</span>
          <span class="close-nobtn" @click.stop="closeWindow">✕</span>
        </div>
        <div class="notification-body">
          <p>人人网拒绝了你的好友请求。</p>
          <p class="reason">原因：对方已关闭陌生人添加好友功能</p>
          <!-- 显示用户填写的问候语 -->
          <div v-if="greeting" class="greeting-preview">
          <p class="greeting-label">你发送的问候：</p>
          <p class="greeting-text">「{{ greeting }}」</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const greeting = ref('')
const isRejected = ref(false)
const showNotification = ref(false)

const emit = defineEmits(['close'])


function addFriend(e) {    
  e.stopPropagation()
  if (isRejected.value) return
  
  // 模拟网络延迟
  setTimeout(() => {
    isRejected.value = true
    showNotification.value = true
  }, 800)
}
function closeWindow(e) {
  showNotification.value = false
  emit('close')  // 向父组件发送 close 事件，需要写 <FakeBrowser @close="func" /> 才能触发父组件的 closeFakeBrowser 方法
}
</script>

<style scoped>
.fake-browser {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Microsoft YaHei', Tahoma, sans-serif;
  font-size: 12px;
}

/* 地址栏 */
.browser-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f0f0f0;
  border-bottom: 1px solid #ccc;
}

.toolbar-btns {
  display: flex;
  gap: 2px;
}

.toolbar-btns .btn {
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  cursor: pointer;
  border-radius: 2px;
}

.toolbar-btns .btn:hover {
  background: #ddd;
}

.address-bar {
  flex: 1;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 11px;
  color: #333;
}

/* 页面内容 */
.page-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #e8f0fe;
}

.profile-card {
  display: flex;
  gap: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 12px;
}

.avatar {
  font-size: 48px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 4px; 

}
.avatar-head{
    width: 64px;
    height: 64px;
    border-radius: 50%;   /* 宽高相等时，50% 就是正圆 */
    object-fit: cover;    /* 图片等比缩放填满，不变形 */
    object-position: calc(50% - 3px) calc(50% + 2px);
    /*                      ↑ x轴右移10px      ↑ y轴下移5px */
}

.profile-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  color: #1a73e8;
}

.profile-info .school {
  margin: 2px 0;
  color: #555;
}

.profile-info .bio {
  margin: 4px 0;
  color: #888;
  font-style: italic;
}

.meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  color: #666;
  font-size: 11px;
}

/* 动态 */
.recent-posts {
  background: #fff;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 12px;
}

.recent-posts h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #333;
}

.post {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.post p {
  margin: 0;
  color: #333;
}

.post-time {
  font-size: 10px;
  color: #aaa;
}

/* 加好友按钮 */
.add-friend-btn {
  display: block;
  width: 100%;
  padding: 8px;
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 12px;
  
  pointer-events: auto; /* 确保按钮可以点击 */
}

.add-friend-btn:hover {
  background: #1557b0;
}

.add-friend-btn.rejected {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
}

/* 通知弹窗 */
.notification {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 260px;
  background: #fff;
  border: 1px solid #999;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
  z-index: 10;
}

.notification-header {
  background: linear-gradient(90deg, #000080, #1084d0);
  color: #fff;
  padding: 3px 6px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: bold;
}
.notification .close-nobtn {
  pointer-events: auto; /* 确保关闭按钮可以点击 */
}
.close-btn {
  cursor: pointer;
}

.notification-body {
  padding: 16px;
  text-align: center;
}

.notification-body p {
  margin: 4px 0;
}

.reason {
  font-size: 11px;
  color: #888;
}

.greeting-area {
  margin-bottom: 10px;
}

.greeting-input {
  pointer-events: auto; /* 确保输入框可以点击和输入 */
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 12px;
  box-sizing: border-box;
}

.greeting-input:focus {
  outline: none;
  border-color: #1a73e8;
}

.greeting-preview {
  margin-top: 10px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 3px;
  text-align: left;
}

.greeting-label {
  font-size: 10px;
  color: #999;
  margin: 0 0 4px;
}

.greeting-text {
  font-size: 12px;
  color: #333;
  margin: 0;
}
</style>