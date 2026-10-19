<!-- proCardTempSlidePanel.vue
 改在proCardParent.vue作为入口了，不再调用这个 -->
<template>
  <!-- 外层悬浮容器 -->
  <div class="slide-panel building-select-panel" :class="{ collapsed: isCollapse }">
    <!-- 收起/展开触发器 -->
    <div class="toggle-btn" @click="isCollapse = !isCollapse">
      {{ isCollapse ? '▶' : '◀' }}
    </div>
    <!-- 面板主体 -->
    <div class="panel-body">
      <div class="panel-title">✅ 已选中建筑 ({{ list.length }})</div>
      <button class="clear-btn" @click="handleClear">清空选择</button>
      <div class="list-wrap">
        <div v-if="list.length === 0" class="empty">按住Shift+拖拽框选地图建筑</div>
        <div
          v-for="item in list"
          :key="item.id"
          class="shop-item"
          @click="openDetail(item)"
        >
          <span>{{ item.name }}</span>
          <div class="item-right">
            <span class="tag">{{ item.buildingType }}</span>
            <button class="old-btn" @click.stop="openInfo(item)">旧</button>
          </div>
        </div>
        <div v-if="list.length == 1">
          <proCardTempSlideNavRect />
        </div>
      </div>
    </div>
    <!-- 详情弹窗 -->
    <div v-if="detailVisible" class="modal-mask" @click.self="detailVisible=false">
      <div class="modal-card">
        <h2>{{ currentShop.name }}</h2>
        <div class="info-row">类型：{{ currentShop.buildingType }}</div>
        <div class="info-row">网格坐标：行{{currentShop.gridRow}},列{{currentShop.gridCol}}</div>
        <div class="info-row">描述：{{ currentShop.desc }}</div>
        <button class="close-btn" @click="detailVisible=false">关闭</button>
      </div>
  
    </div>
    <!-- <div v-if="infoVisible" class="modal-mask-default" @click.self="infoVisible=false"> -->
    <div v-if="infoVisible">  
      <HelCardShopPublicList @close="closeModel" :init-data="modalInitData" :project_spec_name="projectSpecName" />
    </div>
    
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, provide } from 'vue'
import HelCardShopPublicList from './helCardShopPublicList.vue'
import proCardTempSlideNavRect from './proCardTempSlideNavRect.vue'
const props = defineProps({
  selectedList: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['clear-select'])

const modalInitData = ref("sss")
const projectSpecName = ref("")
const list = ref([])
watch(()=>props.selectedList, (v)=>{
  list.value = v
}, {deep:true, immediate:true})

const isCollapse = ref(false) // 面板收起状态
const detailVisible = ref(false)
const currentShop = ref(null)
provide('currentShop', currentShop);

const infoVisible = ref(false)
function handleClear() {
  emit('clear-select')
}

function closeModel(payload)
{
  console.log('closemodel',payload)
  infoVisible.value = false
}
function openDetail(shop) {
  currentShop.value = shop
  detailVisible.value = true
}
function openInfo(item) {
  // 这里写打开另一个Vue页面逻辑，item就是当前点击这一行的数据
  console.log('打开旧信息面板', item.fullName,item);
  currentShop.value = item;
  // 例如：router.push / 打开弹窗等
  infoVisible.value = true; 
  projectSpecName.value = item.name;

  
}
</script>

<style scoped>
/* 悬浮定位：固定在页面右侧 */
.slide-panel {
  position: fixed;
  top: 80px;
  right: 0;
  display: flex;
  z-index: 99;
  transition: transform 0.3s ease;
}
/* 收起：向右侧滑出屏幕 */
.slide-panel.collapsed {
  transform: translateX(calc(100% - 24px));
}

.toggle-btn {
  width:24px;
  background: #4096ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  user-select: none;
}

.panel-body{
  width: 280px;
  border:1px solid #ccc;
  background:#fff;
  padding:12px;
  box-sizing:border-box;
  height: 650px;
  overflow: hidden;
}
.panel-title{
  font-weight:bold;
  font-size:16px;
  margin-bottom:8px;
}
.clear-btn{
  margin-bottom:8px;
  padding:4px 8px;
}
.list-wrap{
  max-height:480px;
  overflow:auto;
}
.shop-item{
  padding:6px 8px;
  border-bottom:1px solid #eee;
  cursor:pointer;
  display:flex;
  justify-content:space-between;
}
.shop-item:hover{
  background:#eef6ff;
}
.tag{
  color:#666;
  font-size:12px;
}
.empty{
  color:#888;
  padding:10px;
  font-size:13px;
}
.modal-mask-default {
  /* 只保留浮窗居中能力，去掉黑色遮罩 background */
  position: fixed;
  inset: 0;
  /* 完全去掉深色背景，只做容器+事件拦截层 */
  /* background:rgba(0,0,0,0.25); */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  /* 重要：捕获鼠标事件，拦截底层交互 */
  pointer-events: auto;
  /* 可选：增加一层淡淡的暗化，如果需要一点点遮罩就打开下面这行 */
  /* background:rgba(0,0,0,0.25); */
}
.modal-mask{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.4);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:999;
}
.modal-card{
  background:white;
  padding:20px;
  border-radius:8px;
  width:340px;
}
.info-row{
  margin:8px 0;
}
.close-btn{
  margin-top:12px;
  padding:6px 12px;
}

/**追加--------------旧字样式 */
.shop-item{
  padding:6px 8px;
  border-bottom:1px solid #eee;
  cursor:pointer;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.item-right{
  display:flex;
  gap:8px;
  align-items:center;
}
.old-btn{
  font-size:12px;
  padding:2px 6px;
  background:#f5f5f5;
  border:1px solid #ddd;
  border-radius:3px;
  cursor:pointer;
}
.old-btn:hover{
  background:#e8e8e8;
}


.building-select-panel {
  
  padding: 16px;
  overflow-x: hidden;
  box-sizing: border-box;
}
</style>
