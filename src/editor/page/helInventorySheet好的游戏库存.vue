<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
      @click.self="$emit('close')"
    >
      <!-- 库存盘点面板主体 -->
      <div class="bg-[#6b4423] border-[8px] border-[#d4b478] rounded-2xl p-4 text-[#fff8e8] shadow-lg max-w-[1600px] w-[90vw] max-h-[90vh] overflow-hidden">
        <!-- 头部标题 -->
        <div class="flex justify-between items-center mb-3 px-3 py-2 text-[clamp(24px,3vw,38px)] font-bold text-[#fff9dd]">
          <div class="flex items-center gap-2">
            <span>📋</span>
            <span>库存盘点 <span class="text-[0.7em] opacity-80">INVENTORY</span></span>
          </div>
          <div class="flex items-center gap-3">
            <span>✦</span>
            <span>✦</span>
            <span>✦</span>
            <span>🪙</span>
          </div>
        </div>

        <!-- 表头 -->
        <div class="grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr] bg-[#e8d4b0] text-[#442b16] p-3 rounded-lg font-bold text-center">
          <div>品名</div>
          <div>日用量</div>
          <div>预估天数</div>
          <div>需求量</div>
          <div>当前存量</div>
          <div>在途</div>
          <div>订货量</div>
        </div>

        <!-- 列表滚动区域 -->
        <div class="max-h-[450px] overflow-y-auto my-2 pr-2">
          <div
            v-for="(item, idx) in inventoryList"
            :key="idx"
            class="grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr_2.8fr] items-center gap-2 my-3 p-3 rounded-xl border-2"
            :class="[item.status === 'urgent' ? 'bg-[#602020] border-[#ff5555]' : 'bg-[#204828] border-[#4ed46c]']"
          >
            <!-- 品名 -->
            <div class="flex items-center gap-2 text-xl">
              <span class="text-3xl">{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </div>
            <!-- 日用量 -->
            <div class="text-center text-lg">{{ item.dayUsage }}</div>
            <!-- 预估天数 -->
            <div class="text-center text-lg">{{ item.estDay }}天</div>
            <!-- 需求量 -->
            <div class="text-center text-lg">{{ item.needTotal }}</div>
            <!-- 状态+进度条 -->
            <div class="flex flex-col gap-1">
              <div class="text-3xl font-bold text-center">{{ item.statusText }}!!</div>
              <div class="w-full h-4 bg-black/60 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :class="[item.status === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-green-500 to-green-400']"
                  :style="{ width: item.percent + '%' }"
                ></div>
              </div>
              <div class="text-sm text-right opacity-90">{{ item.progressText }}</div>
            </div>
          </div>
        </div>

        <!-- 底部汇总栏 -->
        <div class="flex justify-between items-center pt-3 border-t border-[#bb9460]">
          <div class="flex gap-6">
            <span>合计需补</span>
            <span>7550份</span>
            <span>可用金币 24800</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-xl">🪙 24800</span>
            <button class="px-6 py-3 rounded-xl text-2xl font-bold border-[3px] border-[#ffb070] bg-[#d46b29] text-white">补货</button>
            <button class="px-6 py-3 rounded-xl text-2xl font-bold border-[3px] border-[#78e0aa] bg-[#329c62] text-white">调度</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
// const props = defineProps({
//   show: {
//     type: Boolean,
//     default: false
//   }
// })
const emit = defineEmits(['close'])

const inventoryList = [
  {
    icon: "🍗",
    name: "麦辣鸡腿肉",
    dayUsage: "280份/天",
    estDay: 1.2,
    needTotal: "3360份",
    status: "urgent",
    statusText: "告急",
    percent: 12,
    progressText: "存量/需求量 410/3360 短缺 2950份"
  },
  {
    icon: "🍔",
    name: "香辣鸡腿堡",
    dayUsage: "190份/天",
    estDay: 1.8,
    needTotal: "3420份",
    status: "urgent",
    statusText: "告急",
    percent: 36,
    progressText: "存量/需求量 920/2520 短缺 2500份"
  },
  {
    icon: "🍟",
    name: "薯条",
    dayUsage: "350份/天",
    estDay: 1.5,
    needTotal: "2100份",
    status: "ok",
    statusText: "正常",
    percent: 46,
    progressText: "存量/需求量 980/2120"
  },
  {
    icon: "🥔",
    name: "土豆",
    dayUsage: "400份/天",
    estDay: 2.1,
    needTotal: "2820份",
    status: "ok",
    statusText: "正常",
    percent: 73,
    progressText: "存量/需求量 1860/2520"
  },
  {
    icon: "🛢️",
    name: "炸油",
    dayUsage: "65升/天",
    estDay: 2.4,
    needTotal: "156升",
    status: "ok",
    statusText: "正常",
    percent: 58,
    progressText: "存量/需求量 92/156"
  }
]
</script>

<style scoped>
/* 自定义滚动条，游戏面板风格 */
.bg-\[\#6b4423\] ::-webkit-scrollbar {
  width: 8px;
}
.bg-\[\#6b4423\] ::-webkit-scrollbar-track {
  background: #4a3018;
  border-radius: 4px;
}
.bg-\[\#6b4423\] ::-webkit-scrollbar-thumb {
  background: #d4b478;
  border-radius: 4px;
}
</style>
