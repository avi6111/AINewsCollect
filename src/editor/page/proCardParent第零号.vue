<template>
<!-- <div class="slide-panel"> 已经放在外面: proCardParent.vue-->
  <!-- 【父外层容器：控制边界、overflow，解决横向溢出】 -->
  <div class="building-select-panel">
    <!-- 上方选中信息区域 -->
    <div class="select-header">
      <div class="select-title">
        <span class="check-icon">✓</span>
        已选中建筑 ({{ selectedBuildings.length }})
      </div>
      <button class="btn-clear" @click="handleClearSelect">清空选择</button>

      <!-- 选中项列表 -->
      
        <div
          v-for="item in selectedBuildings"
          :key="item.id"
          
          class="selected-item"
        >
          <span>{{ item.name }}</span>
          <span class="tag-type">{{ item.type }}</span>
          <span class="tag-old" role="button" tabindex="0"
            @click="handleClick(item)" @keydown.enter="handleClick(item)">旧</span>
        </div>
      
    </div>

    <!-- 子组件：单选才渲染 -->
    <proCardTempSlideNavRect v-if="selectedBuildings.length ==1"
      
      @stamp-click="onStampClick"
      @card-click="onCardClick"
    />

    <!-- 测试按钮：快速切换单选 / 多选 / 空，方便调试 -->
    <!-- <div class="test-buttons">
      <button @click="setSingle">【单选】绿色寺庙</button>
      <button @click="setMulti">【多选】2个建筑</button>
      <button @click="handleClearSelect">【清空】无选中</button>
    </div>-->
  </div> 
<!-- </div> -->
<!-- slide-panel -->

    <div v-if="infoVisible">  
      <HelCardShopPublicList @close="handleClose"/>
    </div>
    <div v-if="inventoryVisible">
      <HelInventorySheet @close="handleCloseInventory"/>
    </div>
    <helSchedulePage ref="helScheduleRef"></helSchedulePage>
    <helCardFacilityButSchedule ref="helCardFacilityButScheduleRef"></helCardFacilityButSchedule>  
    <helCardCashMachine ref="helCardCashMachineRef"></helCardCashMachine> 
</template>

<script setup>
import HelInventorySheet from './helInventorySheet.vue'
import { ref,inject,provide } from 'vue'
import proCardTempSlideNavRect from './proCardTempSlideNavRect.vue'
import HelCardShopPublicList from './HelCardShopPublicList.vue'
import helSchedulePage from './helSchedulePage.vue'
import helCardFacilityButSchedule from './helCardFacilityButSchedule.vue'
import helCardCashMachine from './helCardCashMachine.vue'

const currentShop = ref(null)
provide('currentShop', currentShop);
const infoVisible = ref(false)
const inventoryVisible = ref(false)
//const scheduleVisible = ref(false)
const helScheduleRef = ref(null)
const helCardFacilityButScheduleRef = ref(null)
const helCardCashMachineRef = ref(null)
//const list = inject('list', ref([]))
// 选中建筑数组
const selectedBuildings = inject('shop_list', ref([]))

// 清空选择
const handleClearSelect = () => {
  selectedBuildings.value = []
}
const handleClick = (item) => {
  console.log('点击旧标签', item)
  currentShop.value = item;
  infoVisible.value = true; 
}
function handleClose()
{
  infoVisible.value = false
}
function handleCloseInventory()
{
  inventoryVisible.value = false
}

// 测试：单选
const setSingle = () => {
  selectedBuildings.value = [
    { name: '绿色寺庙', type: 'temple' }
  ]
}
// 测试：多选
const setMulti = () => {
  selectedBuildings.value = [
    { name: '建筑A', type: 'A' },
    { name: '建筑B', type: 'B' }
  ]
}

// 接收子组件事件
const onStampClick = (val) => {
  console.log('点击印章按钮：', val)
  if(val=='货')
  {
    inventoryVisible.value = true
  }else  if(val=="排")
    helScheduleRef.value?.open()
  else if(val=="设")
    helCardFacilityButScheduleRef.value?.open()
  else if(val=="银")
    helCardCashMachineRef.value?.open()
}
const onCardClick = (areaName) => {
  console.log('点击区域卡片：', areaName)
}
</script>

<style scoped>
/* 悬浮定位：固定在页面右侧 */
/* .slide-panel {
  position: fixed;
  top: 80px;
  right: 0;
  display: flex;
  z-index: 99;
  transition: transform 0.3s ease;
} */


.building-select-panel {
  width: 100%;
  /* 核心：盒模型，padding不会撑宽 */
  box-sizing: border-box;
  padding: 16px;
  /* 阻止内部横向溢出，不出现页面横向滚动条 */
  overflow-x: hidden;
}

.select-title {
  display: flex;
  align-items: center;
  font-size: 32px;
  font-weight: bold;
  gap: 8px;
  margin-bottom:12px;
}
.check-icon {
  background: #28b947;
  color:#fff;
  width:36px;
  height:36px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.btn-clear {
  padding:8px 20px;
  font-size:22px;
  border: 2px solid #888;
  background:#eee;
  border-radius:4px;
  cursor:pointer;
  margin-bottom:16px;
}
.selected-item {
  display:flex;
  align-items:center;
  gap:12px;
  font-size:34px;
  padding-bottom:8px;
  border-bottom:1px solid #ddd;
  margin-bottom:16px;
  /* 商店列表(行 Row) */
  cursor:pointer;
  /* display:flex; */
  /* justify-content:space-between; */
}

/* .shop-item{
  padding:6px 8px;
  border-bottom:1px solid #eee;
  cursor:pointer;
  display:flex;
  justify-content:space-between;
} */
.selected-item:hover{
  background:#eef6ff;
}

.tag-type {
  color:#888;
}
.tag-old {
  font-size:20px;
  border:1px solid #ccc;
  padding:4px 10px;
  border-radius:4px;
  color:#444;
}

.test-buttons {
  margin-top:20px;
  display:flex;
  gap:8px;
}
.test-buttons button {
  padding:6px 12px;
  cursor:pointer;
}
</style>
