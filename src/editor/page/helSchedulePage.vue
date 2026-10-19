<template>
 <Teleport to="body">
  <div v-if="visible" class="schedule-page fixed-inset-mask" @click.self="handleBgClose">

    <!-- 顶部栏 -->
    <div class="topbar">
      <div class="title">餐厅排班表</div>
      <button @click="handleOpen" class="btn-stats">查看统计</button>
    </div>
    <!-- 左侧排班主区域，开启左移动画 -->
    <div class="main-wrap" :class="{ 'panel-open': visible }">
      <div class="schedule-table">
        <!-- 表头：姓名 + 日期 -->
        <div class="schedule-head">
          <div class="col name">姓名</div>
          <div v-for="day in days" :key="day.date" class="col day">
            <div>{{ day.week }}</div>
            <div>{{ day.date }}</div>
          </div>
        </div>
        <!-- 员工排班行 -->
        <div v-for="emp in employees" :key="emp.id" class="schedule-row">
          <div class="col name">{{ emp.name }}</div>
          <div v-for="day in days" :key="day.date" class="col day">
            <div
              v-if="getShift(emp.id, day.date)"
              class="shift-tag"
              :class="getShift(emp.id, day.date).type"
            >
              {{ getShift(emp.id, day.date).name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Teleport 弹出层 -->
    <Teleport to="body">
      <transition name="slide-panel">
        <div v-if="visible" class="stats-portal-wrap">
          <!-- 遮罩点击关闭 -->
          <div class="stats-mask" @click="handleClose"></div>
          <!-- 右侧统计面板 -->
          <div class="stats-panel">
            <div class="panel-header">
              <span class="panel-title">工时统计汇总</span>
              <button @click="handleClose" class="close-btn">×</button>
            </div>
            <div class="panel-content">
              <div class="stat-card">
                <span class="label">总排班工时</span>
                <span class="value">{{ totalHours }}h</span>
              </div>
              <div class="stat-card">
                <span class="label">班次总数</span>
                <span class="value">{{ totalShifts }}</span>
              </div>
              <div class="stat-card">
                <span class="label">在岗人数</span>
                <span class="value">{{ coveredPeople }}</span>
              </div>
              <div class="stat-card">
                <span class="label">预估人力成本</span>
                <span class="value">¥{{ totalCost }}</span>
              </div>

              <div class="stat-section">
                <div class="section-title">岗位工时明细</div>
                <div v-for="item in positionStats" :key="item.position" class="stat-row">
                  <span>{{ item.position }}</span>
                  <span>{{ item.hours }} h</span>
                </div>
              </div>

              <div class="stat-section">
                <div class="section-title">每日工时消耗</div>
                <div v-for="item in dailyStats" :key="item.date" class="stat-row">
                  <span>{{ item.date }}</span>
                  <span>{{ item.hours }} h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ✅ 状态【封装在组件内部】，不在父组件
const visible = ref(false)
// 对外暴露打开方法，给父组件调用
const open = () => {
  visible.value = true
}

const emit = defineEmits(['update:visible'])
const handleBgClose=()=>{
    emit('update:visible', false)
}
// 打开面板：通知父组件设为 true
const handleOpen = () => {
  emit('update:visible', true)
}
// ✅ 关闭事件封装在当前组件
const handleClose = () => {
  visible.value = false
}

// ESC 按键关闭
const escHandler = (e) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}
onMounted(() => {
  window.addEventListener('keydown', escHandler)
  
})
onUnmounted(() => {
  window.removeEventListener('keydown', escHandler)
})
// ✅ 暴露方法给父组件通过ref调用
defineExpose({ open })

// 员工基础数据
const employees = ref([
  { id: '1', name: '张明', position: '领班', hourlyWage: 22 },
  { id: '2', name: '李娜', position: '服务员', hourlyWage: 18 },
  { id: '3', name: '王芳', position: '服务员', hourlyWage: 18 },
  { id: '4', name: '赵强', position: '后厨', hourlyWage: 20 },
  { id: '5', name: '陈静', position: '收银', hourlyWage: 19 }
])
// 日期列
const days = ref([
  { date: '09-20', week: '四' },
  { date: '09-21', week: '五' },
  { date: '09-22', week: '六' },
  { date: '09-23', week: '日' },
  { date: '09-24', week: '一' },
  { date: '09-25', week: '二' },
  { date: '09-26', week: '三' }
])
// 排班数据源
const schedule = ref([
  { empId: '1', date: '09-20', shift: '早班', type: 'morning', hours: 8 },
  { empId: '2', date: '09-20', shift: '中班', type: 'afternoon', hours: 9 },
  { empId: '4', date: '09-20', shift: '晚班', type: 'evening', hours: 10 },
  { empId: '1', date: '09-21', shift: '中班', type: 'afternoon', hours: 9 },
  { empId: '3', date: '09-21', shift: '早班', type: 'morning', hours: 8 },
  { empId: '5', date: '09-21', shift: '收银', type: 'cashier', hours: 8 },
  { empId: '2', date: '09-22', shift: '晚班', type: 'evening', hours: 10 },
  { empId: '4', date: '09-22', shift: '中班', type: 'afternoon', hours: 9 },
  { empId: '1', date: '09-23', shift: '休息', type: 'rest', hours: 0 }
])

function getShift(empId, date) {
  return schedule.value.find(s => s.empId === empId && s.date === date)
}

// ===== 统计计算 =====
const totalHours = computed(() => schedule.value.reduce((sum, s) => sum + s.hours, 0))
const totalShifts = computed(() => schedule.value.filter(s => s.hours > 0).length)
const coveredPeople = computed(() => {
  const empIds = new Set(schedule.value.filter(s => s.hours>0).map(s=>s.empId))
  return empIds.size
})
const totalCost = computed(() => {
  let cost = 0
  schedule.value.forEach(s=>{
    const emp = employees.value.find(e=>e.id === s.empId)
    if(emp) cost += s.hours * emp.hourlyWage
  })
  return cost
})
const positionStats = computed(()=>{
  const map = {}
  schedule.value.forEach(s=>{
    if(s.hours <= 0) return
    const emp = employees.value.find(e=>e.id === s.empId)
    if(!emp) return
    map[emp.position] = (map[emp.position] || 0) + s.hours
  })
  return Object.entries(map).map(([position, hours])=>({position, hours}))
})
const dailyStats = computed(()=>{
  return days.value.map(day=>{
    const h = schedule.value.filter(s=>s.date === day.date).reduce((sum,s)=>sum+s.hours,0)
    return {date: day.date, hours: h}
  })
})
</script>

<style scoped>
.fixed-inset-mask {
  position: fixed;
  inset: 0; /* top:0;right:0;bottom:0;left:0 */
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  max-width: 1600px;
  width: 90vw;
  max-height: 90vh;
}

.schedule-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f4ee; /* 土色页面底色 */
  position:fixed;
  /* inset-0 
  bg-black/60 
  flex 
  items-center 
  justify-center z-[9999] */
}
.topbar {
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background: #fffbf5;
  border-bottom: 1px solid #d9cbc0;
}
.title {
  font-size:16px;
  font-weight:600;
  color:#5c4b3e;
}
.btn-stats {
  padding: 8px 16px;
  background: #8c6d4f; /* 主棕色按钮 */
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-stats:hover {
  background: #70573f;
}
.main-wrap {
  flex: 1;
  overflow: auto;
  transition: margin-right 0.3s ease;
}
/* 打开面板，主排班区域左移（腾出右侧面板位置） */
.main-wrap.panel-open {
  margin-right: 340px;
}
.schedule-table {
  min-width: 900px;
  background: #fffbf5;
  border-radius:12px;
  margin:16px;
  padding:12px;
}
.schedule-head, .schedule-row {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  gap:8px;
  align-items:center;
}
.schedule-head {
  font-weight:600;
  color:#5c4b3e;
  padding-bottom:8px;
  border-bottom:1px solid #d9cbc0;
}
.schedule-row {
  padding:10px 0;
  border-bottom:1px solid #f0e8df;
}
.col.name { padding-left:8px; color:#5c4b3e; }
.col.day {
  background:#f0e8df;
  border-radius:8px;
  padding:8px;
  text-align:center;
  min-height:40px;
  color:#5c4b3e;
}
.shift-tag {
  padding:6px 8px;
  border-radius:6px;
  color:#fff;
  font-size:13px;
}
.shift-tag.morning { background:#8a9a5b; } /* 橄榄棕绿 */
.shift-tag.afternoon { background:#a17a54; }
.shift-tag.evening { background:#6b4c38; }
.shift-tag.cashier { background:#b48252; }
.shift-tag.rest { background:#c9b8a8; color:#5c4b3e; }
</style>

<style>
/* 全局样式，Teleport弹出层样式，土棕色调 */
.stats-portal-wrap {
  position: fixed;
  inset:0;
  z-index:999;
  display:flex;
  justify-content:flex-end;
}
.stats-mask {
  position:absolute;
  inset:0;
  background:rgba(45,35,28,0.4); /* 深色棕遮罩 */
}
.stats-panel {
  position:relative;
  width:320px;
  height:100%;
  background:#fffbf5;
  box-shadow:-4px 0 16px rgba(60,45,35,0.15);
  display:flex;
  flex-direction:column;
}
.panel-header {
  padding:16px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  border-bottom:1px solid #d9cbc0;
}
.panel-title {
  font-size:16px;
  font-weight:600;
  color:#5c4b3e;
}
.close-btn {
  border:none;
  background:transparent;
  font-size:22px;
  cursor:pointer;
  color:#8c6d4f;
}
.panel-content {
  flex:1;
  padding:16px;
  overflow-y:auto;
}
.stat-card {
  background:#efe5db;
  border-radius:10px;
  padding:12px;
  margin-bottom:10px;
  display:flex;
  justify-content:space-between;
}
.label { color:#70573f; font-size:14px; }
.value { font-size:18px; font-weight:700; color:#8c6d4f; }
.stat-section { margin-top:18px; }
.section-title {
  font-size:14px;
  font-weight:600;
  margin-bottom:8px;
  color:#5c4b3e;
}
.stat-row {
  display:flex;
  justify-content:space-between;
  padding:8px 12px;
  background:#f7f1e9;
  border-radius:8px;
  margin-bottom:6px;
  color:#5c4b3e;
}
/* slide 动画 */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.3s ease;
}
.slide-panel-enter-from .stats-panel,
.slide-panel-leave-to .stats-panel {
  transform: translateX(100%);
}
.slide-panel-enter-from .stats-mask,
.slide-panel-leave-to .stats-mask {
  opacity:0;
}
.slide-panel-enter-active .stats-mask,
.slide-panel-leave-active .stats-mask {
  transition: opacity 0.3s ease;
}
</style>
