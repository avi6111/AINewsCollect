<template>
  <ClassicDesktopRetro/>
  <div class="pc-container">  
    <!-- 网吧桌面背景 CRT扫描线滤镜 -->
    <div class="desktop-bg"></div>
    <div class="crt-overlay"></div>
    <!-- 复古QQ广告弹窗，弹出时触发shake动画 -->
    <div
      class="qq-popup"
      :class="{ shake: showPopup }"
      :style="{ left: popPos.x + 'px', top: popPos.y + 'px' }"
      v-if="showPopup"
    >
      <!-- 窗口标题栏 -->
      <div class="title-bar" @mousedown="startDrag">
        <span class="title-text">QQ消息 - 系统广播</span>
        <div class="window-btns">
          <span class="btn min">_</span>
          <!-- 关闭按钮 如果用@click.stop 真能关闭，-->
          <span class="btn close" @click="closePopup">×</span>
          
        </div>
      </div>
      <!-- 广告内容区 -->
      <div class="popup-body">
        <div class="ad-header">✨QQ飞车新版本 女神代言✨</div>
        <div class="ad-content">
          <div class="ad-pic">
            <div class="fake-poster">
              <div class="girl-placeholder">
                <!-- 替换这里为图片 <img src="/1206607768_-103739220_19483_sPhoto.jpg" alt="女明星" />-->
                <!-- <div class="girl-text">纯欲风女明星<br/>代言海报</div> -->
                <img :src="randomImgSrc" alt="随机图片" />
              </div>
            </div>
          </div>
          <div class="ad-desc">
            <p>🏎️漂移竞速，酷炫跑车</p>
            <p>🎁注册领女神限定套装</p>
            <p>💎海量时装免费拿</p>
            <p class="tip">※怀旧模拟广告，非真实商业</p>
          </div>
        </div>
        <div class="popup-footer">
          <button class="old-btn">立即下载游戏</button>
          <button class="old-btn">稍后再说</button>
        </div>
      </div>
    </div>
    <!-- 任务栏 -->
    <div class="task-bar">
      <div class="qq-task-item" :class="{flash: showPopup}">极品 白月光</div>
    </div>
    <!--下面好像public 有文件，就有文件夹图标，现在和 ClassicDesktopRetro 冲突-->
  </div>
  

</template>


<script setup>
import { ref, onMounted, onUnmounted,nextTick,watch } from 'vue'
import ClassicDesktopRetro from './ClassicDesktopRetro.vue'
const showPopup = ref(false)
setTimeout(() => {
  showPopup.value = true
  playDidiSound()//第一次弹出窗口，没呻吟，必须+声音；
}, 1500) // 1500ms = 1.5秒

// 弹窗位置
const popPos = ref({ x: 120, y: 80 })
const drag = ref({ isDrag: false, offsetX: 0, offsetY: 0 })
// 防重复点击锁
const isTriggering = ref(false)

// QQ滴滴提示音 Web Audio 模拟滴滴滴滴
function playDidiSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const freq = 880
  const noteTime = 120
  for (let i = 0; i < 4; i++) {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.22, audioCtx.currentTime + i * noteTime / 1000)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (i * noteTime + noteTime - 15) / 1000)
    osc.start(audioCtx.currentTime + i * noteTime / 1000)
    osc.stop(audioCtx.currentTime + (i * noteTime + noteTime) / 1000)
  }
}
// public下的文件名列表 (随机图片)==========
const imgList = [
  '/1206607768_-103739220_19483_sPhoto.jpg',
  '/1206607775_-103739220_19616_sPhoto.jpg',
  '/1206607782_-103739220_19823_sPhoto.jpg',
  '/1206607788_-103739220_19932_sPhoto.jpg'
]
const randomImgSrc = ref('')
function getRandomImage() {
  const index = Math.floor(Math.random() * imgList.length)
  randomImgSrc.value = imgList[index]
}
watch(showPopup, (newVal)=>{// 监听v‑if控制变量
  if(newVal === true){
    getRandomImage() //弹窗打开，随机图片
  }
})

// 点击触发处理函数
function handleBodyClick() {
  console.log('handleBodyClick', showPopup.value, isTriggering.value)

  
  if(showPopup.value) 
  {
    //非常绕的逻辑，1.因为这个_BodyClick()下面要走声音，所以要=true（嘀嘀嘀声音）
    nextTick(() => {
      //所以2.再下一帧，设=flase , （窗口也关闭了）
      showPopup.value = false
      nextTick(() => {
        showPopup.value = true//3.再下下一帧率，设=true,(窗口重新打开，也震动了)
                  //4.总结，如果震动和声音同步，就没那么多事了，现在非常分布开来      
      })
    })
  //   console.log("handle")
  //   handleBodyClick()
  //   return
  }
  if(isTriggering.value) return
  

  isTriggering.value = true
  showPopup.value = true
  playDidiSound()

  setTimeout(()=>{
    isTriggering.value = false
  },300)
}
/**意外的实现了一个，不给屏幕点击的效果，窗口消息永远震动 */
onMounted(() => {
  //如果其他执行了@click= 会双重触发这个方法，必须 @click.stope=才不会传递造成双重触发
  document.body.addEventListener('click', handleBodyClick)
})

onUnmounted(()=>{
  //
  document.body.removeEventListener('click', handleBodyClick)
})

// 拖拽窗口
const startDrag = (e) => {
  drag.value.isDrag = true
  drag.value.offsetX = e.clientX - popPos.value.x
  drag.value.offsetY = e.clientY - popPos.value.y

  const move = (ev) => {
    if (!drag.value.isDrag) return
    popPos.value.x = ev.clientX - drag.value.offsetX
    popPos.value.y = ev.clientY - drag.value.offsetY
  }
  const up = () => {
    drag.value.isDrag = false
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

const closePopup = () => {
  console.log(" 关闭弹窗")
  showPopup.value = false
}
</script>

<style scoped>
.pc-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  user-select: none;
}

/* 老式网吧桌面背景 */
.desktop-bg {
  width: 100%;
  height: 100%;
  background: #184078;
  background-image: radial-gradient(#2758a8 1px, transparent 1px);
  background-size: 24px 24px;
}

/* CRT显示器扫描线滤镜 */
.crt-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px);
}

/* 弹窗震动动画 */
@keyframes shake {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-4px, 2px); }
  20% { transform: translate(4px, -2px); }
  30% { transform: translate(-3px, 1px); }
  40% { transform: translate(3px, -1px); }
  50% { transform: translate(-2px,0); }
  60% { transform: translate(2px,0); }
  70% { transform: translate(-1px,0); }
  80% { transform: translate(1px,0); }
  100% { transform: translate(0,0); }
}
.shake {
  animation: shake 0.4s ease-out;
}

/* QQ弹窗外壳，整体加宽 */
.qq-popup {
  width: 550px;
  height:350px;
  zoom: 1.5; /* 整体放大1.5倍，容器内所有标签、文字、按钮全部放大 */
  background: #ece9d8;
  border: 2px outset #ffffff;
  box-shadow: 3px 3px 10px #0005;
  position: absolute;
  font-family: SimSun, "Microsoft YaHei", monospace;
  font-size: 14px;
  z-index:10;
}
/* popup-body内部所有图片放大 */
.popup-body img {
  width: 220px;
  height: auto; /* auto保持图片原始比例，不要写死height */
}

/* 蓝色标题栏 */
.title-bar {
  height: 24px;
  background: #0055e5;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px;
  cursor: move;
}
.title-text {
  font-size:13px;
}
.window-btns .btn {
  width:18px;
  height:18px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:#ece9d8;
  color:#000;
  border:1px outset #fff;
  margin-left:2px;
  font-size:14px;
  cursor:pointer;
}

.popup-body {
  padding:16px;
}
.ad-header {
  text-align:center;
  font-weight:bold;
  font-size:18px;
  color:#c00;
  margin-bottom:12px;
}
.ad-content {
  display:flex;/*这个就会两个 <div> 并排显示，左边图片，右边文字*/
  gap:14px;
}
.fake-poste r {
  width:220px;
  height:180px;
  border:2px inset #777;
  overflow:hidden;
  background:#ffb8c8;
}
.girl-placeholder {
  width:100%;
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  text-align:center;
  font-weight:bold;
}
.ad-desc p {
  margin:8px 0;
  font-size:15px;
}
.tip {
  font-size:11px;
  color:#666;
  margin-top:8px;
}
.popup-footer {
  margin-top:18px;
  display:flex;
  justify-content:center;
  gap:18px;
}
/* 放大按钮尺寸 */
.old-btn {
  padding:7px 22px;
  font-size:15px;
  background:#ece9d8;
  border:2px outset #fff;
  cursor:pointer;
}
.old-btn:active {
  border-style:inset;
}

/* 底部任务栏 */
.task-bar {
  position:absolute;/*加了会正常 左下*/
  bottom:0;
  left:0;
  right:0;
  height:28px;
  background:#2458c7;
  border-top:2px outset #fff;
  display:flex;
  align-items:center;
  padding:0 8px;
  z-index:99;
}
.qq-task-item {
  background:#ece9d8;
  border:2px outset #fff;
  padding:2px 10px;
  font-size:12px;
}
.flash {
  animation: blink 0.6s infinite alternate;
}
@keyframes blink {
  from { background:#ffff00; }
  to { background:#ece9d8; }
}

</style>
