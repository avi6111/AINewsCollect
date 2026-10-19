<!-- 测试用，第一版，现在没用
主要 proCardTemp + Main.vue
主要 proCardTemp + Main.vue
主要 proCardTemp + Main.vue -->
<template>
  <div class="street-view">
    <!-- 顶部资源栏 -->
    <div class="top-bar">
      <div class="resource"><span class="icon">🪙</span><span class="value">57%</span></div>
      <div class="resource"><span class="icon">💎</span><span class="value">$75</span></div>
      <div class="resource"><span class="icon">👥</span><span class="value">14</span></div>
      <div class="resource"><span class="icon">⭐</span><span class="value">12</span></div>
      <div class="top-right">
        <button class="icon-btn">📋</button>
        <button class="icon-btn">📦</button>
        <button class="icon-btn">⚙️</button>
      </div>
    </div>

    <!-- 缩放控制 -->
    <div class="controls">
      <button @click="zoomIn">➕</button>
      <button @click="zoomOut">➖</button>
      <button @click="resetView">⟲</button>
      <span class="zoom-label">{{ (scale * 100).toFixed(0) }}%</span>
      <span class="mode-label">{{ isIconMode ? '📌 图标' : '🏪 3D' }}</span>
    </div>

    <!-- 等距画布容器 -->
    <div
      ref="viewport"
      class="viewport"
      @wheel.prevent="handleWheel"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
    >
      <div
        class="world"
        :style="{
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          transformOrigin: '0 0',
        }"
      >
        <!-- ========== 地面底板 (菱形底面，形成街区轮廓) ========== -->
        <div
          v-for="tile in groundTiles"
          :key="'g-' + tile.key"
          class="ground-tile"
          :style="{
            left: tile.screenX + 'px',
            top: tile.screenY + 'px',
            width: TILE_W + 'px',
            height: TILE_H + 'px',
            backgroundColor: tile.color,
          }"
        ></div>

        <!-- ========== 道路 (3D立体，有厚度) ========== -->
        <div
          v-for="road in roads"
          :key="road.key"
          class="iso-road"
          :style="{
            left: road.screenX + 'px',
            top: road.screenY + 'px',
            width: road.width + 'px',
            height: road.height + 'px',
            backgroundColor: road.color,
            transform: `translateZ(${road.elevation}px)`,
          }"
        >
          <div class="road-top" :style="{ backgroundColor: road.topColor }"></div>
          <div class="road-side-left" :style="{ backgroundColor: road.sideColor }"></div>
          <div class="road-side-right" :style="{ backgroundColor: road.sideColorDark }"></div>
        </div>

        <!-- ========== 商店 (3D立体盒子，有高度) ========== -->
        <div
          v-for="shop in shops"
          :key="shop.id"
          class="iso-shop-3d"
          :class="{ 'icon-mode': isIconMode }"
          :style="{
            left: shop.screenX + 'px',
            top: shop.screenY + 'px',
            width: shop.width + 'px',
            height: shop.height + 'px',
            '--shop-height': shop.height3D + 'px',
          }"
          @click="selectShop(shop)"
        >
          <!-- 顶面 -->
          <div
            class="shop-face shop-top"
            :style="{
              backgroundColor: shop.topColor,
              width: shop.width + 'px',
              height: shop.height + 'px',
              transform: `translateZ(${shop.height3D}px)`,
            }"
          >
            <span class="shop-roof-emoji">{{ shop.emoji }}</span>
          </div>

          <!-- 左侧面 (朝西南) -->
          <div
            class="shop-face shop-left"
            :style="{
              backgroundColor: shop.leftColor,
              width: shop.height3D + 'px',
              height: shop.height + 'px',
              transform: `rotateY(-90deg) translateZ(0px)`,
              transformOrigin: 'left center',
            }"
          ></div>

          <!-- 右侧面 (朝东南) -->
          <div
            class="shop-face shop-right"
            :style="{
              backgroundColor: shop.rightColor,
              width: shop.height3D + 'px',
              height: shop.height + 'px',
              transform: `rotateY(90deg) translateZ(${shop.width}px)`,
              transformOrigin: 'right center',
            }"
          ></div>

          <!-- 商店名称漂浮标签 -->
          <div
            v-if="!isIconMode"
            class="shop-name-tag"
            :style="{
              transform: `translateZ(${shop.height3D + 10}px)`,
            }"
          >
            {{ shop.name }}
          </div>

          <!-- 图标模式下的简单图标 -->
          <div
            v-if="isIconMode"
            class="shop-icon-simple"
            :style="{
              transform: `translateZ(${shop.height3D}px)`,
            }"
          >
            {{ shop.emoji }}
          </div>
        </div>

        <!-- 选中气泡 -->
        <div
          v-if="selectedShop && !isIconMode"
          class="shop-bubble-3d"
          :style="{
            left: selectedShop.screenX + selectedShop.width / 2 + 'px',
            top: selectedShop.screenY - 20 + 'px',
          }"
        >
          <div class="bubble-content">
            <strong>{{ selectedShop.name }}</strong>
            <p>今日营业中</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息栏 -->
    <div class="bottom-bar">
      <div class="time-display">
        <span>⏱</span><span>12:25 PM</span><span>📅</span><span>Day</span>
      </div>
      <div class="controls-right">
        <button class="ctrl-btn">⏸</button>
        <button class="ctrl-btn">▶</button>
        <button class="ctrl-btn">⏩</button>
        <button class="ctrl-btn">⏭</button>
      </div>
    </div>

    <!-- 缩略图 -->
    <div class="thumbnails">
      <div class="thumb" v-for="n in 4" :key="n">
        <div class="thumb-preview" :style="{ backgroundColor: n % 2 === 0 ? '#8B5A2B' : '#6B8E23' }"></div>
        <div class="thumb-play">▶</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IsoStreetShops3D',
  data() {
    return {
      // 等距格子尺寸 (2:1 比例)
      TILE_W: 64,
      TILE_H: 32,
      SHOP_HEIGHT: 40, // 房子3D高度

      scale: 0.85,
      offsetX: 400,
      offsetY: 150,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      startOffsetX: 0,
      startOffsetY: 0,

      selectedShop: null,

      projects: [
        { id: 1, name: '面包店', emoji: '🥐', date: '2024-01-05' },
        { id: 2, name: '花店', emoji: '🌸', date: '2024-01-08' },
        { id: 3, name: '咖啡馆', emoji: '☕', date: '2024-01-15' },
        { id: 4, name: '书店', emoji: '📚', date: '2024-02-03' },
        { id: 5, name: '服装店', emoji: '👗', date: '2024-02-10' },
        { id: 6, name: '玩具店', emoji: '🧸', date: '2024-02-18' },
        { id: 7, name: '糖果店', emoji: '🍬', date: '2024-02-22' },
        { id: 8, name: '水果店', emoji: '🍎', date: '2024-03-05' },
        { id: 9, name: '肉铺', emoji: '🥩', date: '2024-03-12' },
        { id: 10, name: '鱼店', emoji: '🐟', date: '2024-03-20' },
        { id: 11, name: '蔬菜店', emoji: '🥬', date: '2024-03-25' },
        { id: 12, name: '冰淇淋店', emoji: '🍦', date: '2024-04-02' },
        { id: 13, name: '披萨店', emoji: '🍕', date: '2024-04-10' },
        { id: 14, name: '寿司店', emoji: '🍣', date: '2024-04-18' },
        { id: 15, name: '茶馆', emoji: '🍵', date: '2024-05-01' },
        { id: 16, name: '蛋糕店', emoji: '🎂', date: '2024-05-08' },
        { id: 17, name: '珠宝店', emoji: '💎', date: '2024-05-15' },
        { id: 18, name: '乐器店', emoji: '🎸', date: '2024-05-22' },
      ],

      groundTiles: [],
      roads: [],
      shops: [],
      districts: [],
    };
  },
  computed: {
    isIconMode() {
      return this.scale < 0.5;
    },
  },
  mounted() {
    this.generateLayout();
  },
  methods: {
    // 等距坐标 -> 屏幕坐标
    // gx: 网格X轴 (西南方向)
    // gy: 网格Y轴 (东南方向)
    isoToScreen(gx, gy) {
      const x = (gx - gy) * (this.TILE_W / 2);
      const y = (gx + gy) * (this.TILE_H / 2);
      return { x, y };
    },

    // 生成布局
    generateLayout() {
      // 1. 按日期分组
      const groups = new Map();
      this.projects.forEach((proj) => {
        const date = new Date(proj.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const startOfYear = new Date(year, 0, 1);
        const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        const groupKey = `${year}-${month}-W${week}`;
        if (!groups.has(groupKey)) {
          groups.set(groupKey, { year, month, week, projects: [] });
        }
        groups.get(groupKey).projects.push(proj);
      });

      const sortedGroups = Array.from(groups.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      // 颜色主题 (每个区一组)
      const palettes = [
        { top: '#E8A87C', left: '#C38D6B', right: '#B87D5B', ground: '#F5E6D3', road: '#D9C4A9', roadTop: '#E8D5B8' },
        { top: '#95B8D1', left: '#7A9BB5', right: '#6A8BA5', ground: '#E8F0F5', road: '#C4D4E0', roadTop: '#D9E5EE' },
        { top: '#B8D4A3', left: '#9BB884', right: '#8BA874', ground: '#EDF5E8', road: '#C9DCB8', roadTop: '#D9E8CC' },
        { top: '#D4A5A5', left: '#B88A8A', right: '#A87A7A', ground: '#F5EDED', road: '#E0C4C4', roadTop: '#EED9D9' },
        { top: '#C9B1D9', left: '#A890B8', right: '#9880A8', ground: '#F0EAF5', road: '#D4C4E0', roadTop: '#E2D5EB' },
        { top: '#F0D58C', left: '#D4B870', right: '#C4A860', ground: '#F5F0E0', road: '#E0D4B8', roadTop: '#EEE5D0' },
        { top: '#8FC9B0', left: '#70A890', right: '#609880', ground: '#E5F2EC', road: '#B8D9C9', roadTop: '#CCE8DC' },
        { top: '#E8B4B8', left: '#C9989C', right: '#B9888C', ground: '#F5E8E9', road: '#E0C4C6', roadTop: '#EED9DB' },
      ];

      this.groundTiles = [];
      this.roads = [];
      this.shops = [];
      this.districts = [];

      // 2. 为每个区生成一个四边形街区
      // 每个街区以等距网格坐标为中心，向四周扩展
      sortedGroups.forEach(([groupKey, group], groupIndex) => {
        const { year, month, week, projects } = group;
        const palette = palettes[groupIndex % palettes.length];

        // 每个街区占据的网格范围 (四边形区域)
        // 街区中心放在对角线方向上，让不同街区沿等距网格两个轴扩展
        const blockSize = Math.ceil(Math.sqrt(projects.length)) + 1; // 街区边长
        const blockGx = groupIndex * (blockSize + 2); // 沿gx轴方向扩展
        const blockGy = groupIndex * (blockSize + 2); // 沿gy轴方向扩展

        // 生成街区的地面格子 (四边形区域)
        for (let dx = 0; dx < blockSize; dx++) {
          for (let dy = 0; dy < blockSize; dy++) {
            const gx = blockGx + dx;
            const gy = blockGy + dy;
            const screen = this.isoToScreen(gx, gy);
            this.groundTiles.push({
              key: `${groupKey}-${dx}-${dy}`,
              screenX: screen.x,
              screenY: screen.y,
              color: palette.ground,
            });
          }
        }

        // 生成街区的道路 (沿街区边缘，形成四边形轮廓)
        // 道路沿着等距网格的两个方向延伸，形成菱形街区的边界
        // 上边 (沿gx方向)
        for (let dx = 0; dx < blockSize; dx++) {
          const gx = blockGx + dx;
          const gy = blockGy - 1;
          const screen = this.isoToScreen(gx, gy);
          this.roads.push({
            key: `${groupKey}-road-top-${dx}`,
            screenX: screen.x + this.TILE_W / 2 - 8,
            screenY: screen.y + this.TILE_H / 2 - 4,
            width: this.TILE_W,
            height: this.TILE_H,
            elevation: 2,
            color: palette.road,
            topColor: palette.roadTop,
            sideColor: palette.road,
            sideColorDark: palette.road,
          });
        }
        // 左边 (沿gy方向)
        for (let dy = 0; dy < blockSize; dy++) {
          const gx = blockGx - 1;
          const gy = blockGy + dy;
          const screen = this.isoToScreen(gx, gy);
          this.roads.push({
            key: `${groupKey}-road-left-${dy}`,
            screenX: screen.x + this.TILE_W / 2 - 8,
            screenY: screen.y + this.TILE_H / 2 - 4,
            width: this.TILE_W,
            height: this.TILE_H,
            elevation: 2,
            color: palette.road,
            topColor: palette.roadTop,
            sideColor: palette.road,
            sideColorDark: palette.road,
          });
        }

        // 生成商店 (在街区内部，每个商店占一个格子)
        projects.forEach((proj, pIdx) => {
          // 在街区内排列商店，按行列分布
          const col = pIdx % (blockSize - 1);
          const row = Math.floor(pIdx / (blockSize - 1));
          const gx = blockGx + col;
          const gy = blockGy + row;
          const screen = this.isoToScreen(gx, gy);

          // 商店的3D高度根据项目顺序略有变化，增加立体感
          const height3D = this.SHOP_HEIGHT + (pIdx % 3) * 8;

          this.shops.push({
            id: proj.id,
            name: proj.name,
            emoji: proj.emoji,
            gx,
            gy,
            screenX: screen.x + this.TILE_W / 2,
            screenY: screen.y + this.TILE_H / 2,
            width: this.TILE_W - 4,
            height: this.TILE_H - 2,
            height3D: height3D,
            topColor: palette.top,
            leftColor: palette.left,
            rightColor: palette.right,
          });
        });

        this.districts.push({
          key: groupKey,
          label: `${year}年${month}月 第${week}周`,
          color: palette.top,
        });

        groupIndex++;
      });
    },

    selectShop(shop) {
      this.selectedShop = shop;
      clearTimeout(this._bubbleTimer);
      this._bubbleTimer = setTimeout(() => {
        this.selectedShop = null;
      }, 2000);
    },

    zoomIn() {
      this.scale = Math.min(2, this.scale + 0.15);
    },
    zoomOut() {
      this.scale = Math.max(0.25, this.scale - 0.15);
    },
    resetView() {
      this.scale = 0.85;
      this.offsetX = 400;
      this.offsetY = 150;
    },

    handleWheel(event) {
      const delta = event.deltaY > 0 ? -0.08 : 0.08;
      this.scale = Math.min(2, Math.max(0.25, this.scale + delta));
    },

    startDrag(event) {
      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.startOffsetX = this.offsetX;
      this.startOffsetY = this.offsetY;
    },
    onDrag(event) {
      if (!this.isDragging) return;
      this.offsetX = this.startOffsetX + (event.clientX - this.dragStartX);
      this.offsetY = this.startOffsetY + (event.clientY - this.dragStartY);
    },
    endDrag() {
      this.isDragging = false;
    },
  },
};
</script>

<style scoped>
.street-view {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #87CEEB 0%, #B0E0E6 40%, #F5E6D3 100%);
  overflow: hidden;
  position: relative;
  font-family: 'Segoe UI', 'Comic Sans MS', cursive, sans-serif;
  user-select: none;
}

/* 顶部资源栏 */
.top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50px;
  background: linear-gradient(180deg, #F5E6D3 0%, #E8D5B8 100%);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 25px;
  z-index: 100;
  border-bottom: 3px solid #C4A77D;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.resource {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255,255,255,0.7);
  padding: 4px 12px;
  border-radius: 20px;
  border: 2px solid #C4A77D;
  font-weight: bold;
  color: #5D4E37;
  font-size: 0.9rem;
}

.top-right {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.icon-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 2px solid #C4A77D;
  background: rgba(255,255,255,0.8);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.icon-btn:hover { transform: scale(1.1); background: white; }

/* 缩放控制 */
.controls {
  position: absolute;
  top: 60px; left: 20px;
  z-index: 100;
  display: flex;
  gap: 8px;
  align-items: center;
  background: rgba(255,255,255,0.85);
  padding: 8px 16px;
  border-radius: 30px;
  border: 2px solid #C4A77D;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}
.controls button {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 2px solid #8B6F47;
  background: #F5E6D3;
  color: #5D4E37;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.controls button:hover { background: #E8D5B8; transform: scale(1.1); }
.zoom-label, .mode-label {
  font-weight: bold;
  color: #5D4E37;
  font-size: 0.8rem;
  min-width: 45px;
  text-align: center;
}

/* 视口 */
.viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  cursor: grab;
  padding-top: 50px;
  perspective: 2000px;
}
.viewport:active { cursor: grabbing; }

.world {
  position: absolute;
  width: 6000px;
  height: 6000px;
  transform-origin: 0 0;
  transform-style: preserve-3d;
  transition: transform 0.05s linear;
}

/* ========== 地面 (菱形格子) ========== */
.ground-tile {
  position: absolute;
  transform: rotateX(60deg) rotateZ(45deg);
  transform-origin: 0 0;
  border: 1px solid rgba(0,0,0,0.04);
  border-radius: 2px;
  pointer-events: none;
}

/* ========== 3D道路 ========== */
.iso-road {
  position: absolute;
  transform: rotateX(60deg) rotateZ(45deg);
  transform-origin: 0 0;
  transform-style: preserve-3d;
  border-radius: 3px;
  pointer-events: none;
}

.road-top {
  position: absolute;
  inset: 0;
  border-radius: 3px;
  opacity: 0.9;
}

/* 道路两侧厚度 */
.road-side-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  transform: translateX(-6px) skewY(45deg);
  transform-origin: right center;
  opacity: 0.6;
  border-radius: 2px 0 0 2px;
}

.road-side-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  transform: translateX(6px) skewY(-45deg);
  transform-origin: left center;
  opacity: 0.6;
  border-radius: 0 2px 2px 0;
}

/* ========== 3D商店盒子 ========== */
.iso-shop-3d {
  position: absolute;
  transform: rotateX(60deg) rotateZ(45deg);
  transform-origin: 0 0;
  transform-style: preserve-3d;
  cursor: pointer;
  transition: transform 0.2s;
}

.iso-shop-3d:hover {
  transform: rotateX(60deg) rotateZ(45deg) translateZ(10px);
}

.shop-face {
  position: absolute;
  border-radius: 2px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

/* 顶面 */
.shop-top {
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.4);
}

.shop-roof-emoji {
  font-size: 1.1rem;
  filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.3));
}

/* 左侧面 (朝西南) */
.shop-left {
  top: 0;
  left: 0;
  transform-origin: left center;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 2px 0 0 2px;
}

/* 右侧面 (朝东南) */
.shop-right {
  top: 0;
  left: 0;
  transform-origin: right center;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 0 2px 2px 0;
}

/* 商店名称标签 */
.shop-name-tag {
  position: absolute;
  top: -20px;
  left: 50%;
  margin-left: -40px;
  width: 80px;
  text-align: center;
  font-size: 0.65rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  background: rgba(0,0,0,0.4);
  padding: 2px 4px;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  transform-origin: center bottom;
  backface-visibility: hidden;
}

/* 图标模式 */
.iso-shop-3d.icon-mode {
  transform: rotateX(60deg) rotateZ(45deg) scale(0.7);
}

.shop-icon-simple {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.2);
}

/* 气泡 */
.shop-bubble-3d {
  position: absolute;
  z-index: 50;
  animation: floatBubble 2s ease-out forwards;
  pointer-events: none;
}

.bubble-content {
  background: white;
  padding: 6px 12px;
  border-radius: 12px;
  border: 3px solid #8B6F47;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  font-size: 0.75rem;
  color: #5D4E37;
  white-space: nowrap;
}
.bubble-content strong { display: block; font-size: 0.85rem; }
.bubble-content p { margin: 0; font-size: 0.65rem; color: #8B6F47; }

@keyframes floatBubble {
  0% { opacity: 0; transform: translateY(10px); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(-5px); }
  100% { opacity: 0; transform: translateY(-15px); }
}

/* 底部信息栏 */
.bottom-bar {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 30px;
  background: rgba(255,255,255,0.9);
  padding: 8px 24px;
  border-radius: 30px;
  border: 3px solid #C4A77D;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  z-index: 100;
}
.time-display {
  display: flex; align-items: center; gap: 8px;
  font-weight: bold; color: #5D4E37; font-size: 0.9rem;
}
.controls-right { display: flex; gap: 8px; }
.ctrl-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 2px solid #8B6F47;
  background: #F5E6D3;
  color: #5D4E37;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.ctrl-btn:hover { background: #E8D5B8; transform: scale(1.1); }

/* 缩略图 */
.thumbnails {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 100;
}
.thumb {
  width: 80px; height: 50px;
  border-radius: 8px;
  border: 3px solid #C4A77D;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}
.thumb:hover { transform: scale(1.1); }
.thumb-preview { width: 100%; height: 100%; }
.thumb-play {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  color: white; font-size: 1.2rem;
  text-shadow: 0 0 5px black;
}
</style>