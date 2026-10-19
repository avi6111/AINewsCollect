<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]" @click.self="closePanel">
      <!-- 主面板 2/3宽，同木纹样式 -->
      <div class="bg-[#6b4423] border-[8px] border-[#d4b478] rounded-2xl p-4 text-[#fff8e8] shadow-lg w-[66vw] max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 顶部标题栏 -->
        <div class="flex justify-between items-center mb-3 px-3 py-2">
          <h2 class="text-xl font-bold">收银台</h2>
          <button @click="closePanel" class="bg-[#d4b478] text-gray-900 px-3 py-1 rounded hover:bg-amber-200">关闭</button>
        </div>

        <!-- 主体左右布局 -->
        <div class="flex gap-4 flex-1 overflow-hidden">
          <!-- 左侧：商品菜单 -->
          <div class="w-1/2 overflow-auto pr-2">
            <h3 class="text-lg mb-2 border-b border-amber-600 pb-1">商品菜单</h3>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="item in goodsList"
                :key="item.id"
                @click="addGoods(item)"
                class="bg-[#d4b478] text-gray-900 p-2 rounded-lg text-left hover:bg-amber-200"
              >
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-sm">¥{{ item.price }}</div>
              </button>
            </div>
          </div>

          <!-- 右侧：购物清单 + 金额 -->
          <div class="w-1/2 flex flex-col">
            <h3 class="text-lg mb-2 border-b border-amber-600 pb-1">已点清单</h3>
            <div class="flex-1 overflow-auto">
              <div v-if="orderList.length === 0" class="opacity-60 py-6 text-center">暂无商品</div>
              <div v-for="(row, idx) in orderList" :key="idx" class="flex items-center justify-between py-1 border-b border-amber-700/40">
                <span>{{ row.name }}</span>
                <div class="flex items-center gap-2">
                  <button @click="changeCount(row, -1)" class="w-6 h-6 rounded bg-amber-700">-</button>
                  <span class="w-6 text-center">{{ row.count }}</span>
                  <button @click="changeCount(row, 1)" class="w-6 h-6 rounded bg-amber-700">+</button>
                  <span class="ml-2 w-16 text-right">¥{{ (row.price * row.count).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- 金额汇总区域 -->
            <div class="mt-4 p-3 bg-black/20 rounded-lg">
              <div class="flex justify-between text-lg">
                <span>合计：</span>
                <span class="font-bold text-amber-200">¥{{ totalAmount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="flex gap-3 mt-4">
              <button @click="clearOrder" class="flex-1 bg-gray-500 p-2 rounded-lg hover:bg-gray-400">清空</button>
              <button @click="checkout" class="flex-1 bg-green-600 p-2 rounded-lg hover:bg-green-500">结算</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
// const props = defineProps({
//   visible: {
//     type: Boolean,
//     default: false
//   }
// })
// ✅ 状态【封装在组件内部】，不在父组件
const emit = defineEmits(['update:visible', 'checkout'])
//const emit = defineEmits(['update:visible'])
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

// 商品库
const goodsList = ref([
  { id:1, name:"汉堡", price:18 },
  { id:2, name:"薯条", price:9 },
  { id:3, name:"可乐", price:6 },
  { id:4, name:"甜筒", price:4 },
  { id:5, name:"麦辣鸡翅", price:12 },
  { id:6, name:"咖啡", price:8 },
])

// 当前订单
const orderList = ref([])

// 添加商品
const addGoods = (goods) => {
  const findItem = orderList.value.find(o => o.id === goods.id)
  if(findItem){
    findItem.count += 1
  }else{
    orderList.value.push({...goods, count:1})
  }
}

// 修改数量
const changeCount = (row, delta) => {
  row.count += delta
  if(row.count <=0){
    const index = orderList.value.indexOf(row)
    orderList.value.splice(index,1)
  }
}

// 总金额计算
const totalAmount = computed(()=>{
  return orderList.value.reduce((sum, item)=> sum + item.price * item.count, 0)
})

// 清空订单
const clearOrder = () => {
  orderList.value = []
}

// 结算，向外抛事件，父组件接收
const checkout = () => {
  emit('checkout', {
    list: [...orderList.value],
    total: totalAmount.value
  })
  // 结算后自动清空订单
  orderList.value = []
}
</script>
