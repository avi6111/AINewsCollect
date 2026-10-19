<template>
  <div class="restaurant-nav">
    <!-- <h2 class="nav-title">操作导航</h2> -->
    
    <!-- 活字印章按钮组：食 排 设 银 -->
    <div class="stamp-btn-group">
      <div class="stamp-btn" @click="handleStampClick('货')">货</div>
      <div class="stamp-btn" @click="handleStampClick('排')">排</div>
      <div class="stamp-btn" @click="handleStampClick('银')">银</div>
      <div class="stamp-btn" @click="handleStampClick('设')">设</div>
    </div>
    <p class="nav-desc">餐厅拥有的区域</p>
    <!-- 区域Icon卡片组 -->
    <div class="card-group">
      <!-- 甜品站 -->
      <div class="area-card" @click="handleCardClick('甜品站')">
        <div class="card-icon sweet-icon">
          <span>🍦</span>
        </div>
        <div class="card-label">甜品站</div>
      </div>
      <!-- 儿童乐园 -->
      <div class="area-card" @click="handleCardClick('儿童乐园')">
        <div class="card-icon kid-icon">
          <!-- <span>🎠</span> -->
          <!-- <span>🥞</span> -->
          <span>🏝️</span>
          
        </div>
        <div class="card-label">儿童乐园</div>
      </div>
      <!-- 咖啡区域 -->
      <div class="area-card" @click="handleCardClick('咖啡区域')">
        <div class="card-icon coffee-icon">
          <span>☕</span>
        </div>
        <div class="card-label">咖啡区域</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定义向外抛出事件，通知父组件点击了哪个按钮/卡片
const emit = defineEmits(['stamp-click', 'card-click'])

const handleStampClick = (val) => {
  emit('stamp-click', val)
}
const handleCardClick = (areaName) => {
  emit('card-click', areaName)
}
</script>

<style scoped>
/* .restaurant-nav {
  background-color: #f0f1f3;
  border-radius: 20px;
  padding: 32px;
  margin-top: 16px;
} */
/* 自动宽度，追加 导航样式 */
.restaurant-nav {
  width: 100%;
  box-sizing: border-box;
  background-color: #f0f1f3;
  border-radius: 20px;
  padding: clamp(16px, 4vw, 18px);
  margin-top: 36px;
}
.nav-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #222;
}
.nav-desc {
  font-size: 20px;
  color: #555;
  margin: 0 0 8px;
}

/* 活字印章按钮容器 */
.stamp-btn-group {
  width:100%;
  display: flex;
  gap: clamp(8px,2vw,16px);
  background: #ffffff;
  padding: clamp(12px,3vw,20px);
  border-radius: 16px;
  margin-bottom: clamp(16px,3vw,24px);
  box-sizing: border-box;
}
.stamp-btn {
  flex: 1;
  aspect-ratio: 1 / 1;
  background: #193464;
  color: #fff;
  font-size: clamp(24px, 12vw, 64px);
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #193464;
  cursor: pointer;
  transition: transform 0.12s ease;
}
.stamp-btn:active {
  transform: scale(0.97);
}

/* 三个区域卡片 */
/* ==========重点修改卡片网格========== */
.card-group {
  width:100%;
  box-sizing: border-box;
  display: grid;
  /* 把最小宽度调小到130px，适配拖动面板变窄的场景 */
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: clamp(12px,2vw,20px);
}
.area-card {
  width:100%;
  box-sizing: border-box;
  background: #fff;
  border-radius: 16px;
  padding: clamp(16px,3vw,24px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.area-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}
.card-icon {
  width: clamp(80px, 15vw, 140px);
  height: clamp(80px, 15vw, 140px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(32px, 8vw, 64px);
}
.sweet-icon {
  background: linear-gradient(135deg, #ffddcd, #e84860);
}
.kid-icon {
  background: linear-gradient(135deg, #80c9ff, #ffd648);
}
.coffee-icon {
  background: linear-gradient(135deg, #b48867, #784b30);
}
.card-label {
  font-size: clamp(16px,3vw,24px);
  font-weight: 600;
}

</style>
