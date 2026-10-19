<!-- 依赖tailwindCSS -->
<template>
  <Teleport to="body" @click.self="closePanel">
    <!-- 遮罩 -->
    <div v-if="visible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]" @click.self="closePanel">
      <!-- 主面板 2/3宽度，帕夏风格木纹UI -->
      <div class="bg-[#6b4423] border-[8px] border-[#d4b478] rounded-2xl p-4 text-[#fff8e8] shadow-lg w-[66vw] max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 顶部工具栏 -->
        <div class="flex justify-between items-center mb-3 px-3 py-2">
          <h2 class="text-xl font-bold">餐厅员工排班表</h2>
          <div class="flex gap-3">
            <button @click="openStats" class="bg-[#d4b478] text-gray-900 px-3 py-1 rounded hover:bg-amber-200">查看工时统计</button>
            <button @click="resetSchedule" class="bg-[#d4b478] text-gray-900 px-3 py-1 rounded hover:bg-amber-200">重置排班</button>
          </div>
        </div>

        <!-- 排班表格滚动区域 -->
        <div class="overflow-auto flex-1">
          <div class="grid" style="grid-template-columns: 120px repeat(24, minmax(44px, 1fr));">
            <!-- 表头 -->
            <div class="font-bold p-2 border border-amber-700">员工</div>
            <div v-for="hour in 24" :key="hour" class="text-center p-1 border border-amber-700 text-sm">
              {{ hour }}时
            </div>

            <!-- 员工排班行 -->
            <template v-for="(staff, idx) in staffList" :key="staff.name">
              <div class="p-2 border border-amber-700 font-medium">{{ staff.name }}</div>
              <div
                v-for="hour in 24"
                :key="hour"
                class="h-8 border border-amber-700 cursor-pointer hover:bg-amber-700/40"
                :class="{
                  'bg-amber-500/60': staff.schedule[hour] === '早',
                  'bg-orange-600/60': staff.schedule[hour] === '中',
                  'bg-indigo-600/60': staff.schedule[hour] === '晚',
                  'bg-slate-700/60': staff.schedule[hour] === '通宵',
                }"
                @click="toggleShift(staff, hour)"
              ></div>
            </template>
          </div>
        </div>

        <!-- 底部简易汇总 -->
        <div class="mt-3 p-3 bg-black/20 rounded-lg">
          <div class="font-bold mb-2">📊 工时汇总</div>
          <div v-for="staff in staffList" :key="staff.name" class="flex gap-4 text-sm">
            <span>{{ staff.name }}：{{ calcHour(staff) }} h</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
const emit = defineEmits(['update:visible'])
// ✅ 状态【封装在组件内部】，不在父组件
const visible = ref(false)
// 对外暴露打开方法，给父组件调用
const open = () => {
  visible.value = true
}
// ✅ 暴露方法给父组件通过ref调用
defineExpose({ open })
// ⭕ 关闭弹窗
const closePanel = () => {
  visible.value = false
}

// 班次循环切换：空 → 早 → 中 → 晚 → 通宵 → 空
const shiftTypes = [null, '早', '中', '晚', '通宵']
const staffList = ref([
  { name: "张三", schedule: Array(24).fill(null) },
  { name: "李四", schedule: Array(24).fill(null) },
  { name: "王五", schedule: Array(24).fill(null) },
  { name: "赵六", schedule: Array(24).fill(null) },
])

// 点击格子切换班次
const toggleShift = (staff, hourIndex) => {
  const current = staff.schedule[hourIndex]
  const idx = shiftTypes.indexOf(current)
  staff.schedule[hourIndex] = shiftTypes[(idx + 1) % shiftTypes.length]
}

// 计算单人总工时
const calcHour = (staff) => {
  return staff.schedule.filter(h => !!h).length
}

// 打开统计弹窗（你可以接入另一个统计组件）
const openStats = () => {
  console.log('打开工时统计面板')
}

// 重置排班
const resetSchedule = () => {
  staffList.value.forEach(s => s.schedule.fill(null))
}
</script>
