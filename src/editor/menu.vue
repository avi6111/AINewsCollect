<template>
  <div class="menu-container">
    <!-- 折叠开关 -->
    <div class="collapse-btn" @click="isCollapse = !isCollapse">
      {{ isCollapse ? "展开" : "收起" }}
    </div>

    <ul class="menu-list" :class="{ collapse: isCollapse }">
      <li v-for="item in menuList" :key="item.id" class="menu-item">
        <!-- 一级菜单 -->
        <div
          class="menu-title"
          :class="{ active: activeId === item.id }"
          @click="handleMenuClick(item)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span v-if="!isCollapse" class="menu-text">{{ item.label }}</span>
          <span v-if="item.children && !isCollapse" class="arrow">
            {{ item.expand ? "−" : "+" }}
          </span>
        </div>

        <!-- 二级子菜单 -->
        <ul
          v-if="item.children && item.expand && !isCollapse"
          class="sub-menu"
        >
          <li
            v-for="sub in item.children"
            :key="sub.id"
            class="sub-item"
            :class="{ active: activeId === sub.id }"
            @click="handleMenuClick(sub)"
          >
            {{ sub.label }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

// 是否折叠菜单
const isCollapse = ref(false);
// 当前选中菜单id
const activeId = ref(1);

// 菜单数据源
const menuList = ref([
  {
    id: 1,
    label: "首页",
    icon: "🏠",
    expand: false,
  },
  {
    id: 2,
    label: "系统管理",
    icon: "⚙️",
    expand: true,
    children: [
      { id: 21, label: "用户管理" },
      { id: 22, label: "角色管理" },
      { id: 23, label: "菜单管理" },
    ],
  },
  {
    id: 3,
    label: "数据中心",
    icon: "📊",
    expand: false,
    children: [
      { id: 31, label: "数据统计" },
      { id: 32, label: "报表导出" },
    ],
  },
  {
    id:4,
    label:"个人中心",
    icon:"👤",
    expand:false,
    path:"/user-center"
  }
]);
const router = useRouter();
// 菜单点击事件
const handleMenuClick = (item) => {
  // 如果有子菜单，切换展开收起
  if (item.children) {
    item.expand = !item.expand;
  } else {
    //叶子菜单设置选中
    activeId.value = item.id;
    console.log("点击菜单：", item);
    // 这里可以emit事件，通知父组件跳转路由

  if('path' in item){
    processLink(item);
  }
  
};

const processLink=(item)=>{
  router.push(item.path);
  console.log("menu 路由跳转到：", item.path);
}
const processFunc=(item)=>{
  eval(`${item.func}()`);
}
const fnExportGlb=()=>{
  console.log("导出glb")
}
</script>

<style scoped>
.menu-container {
  width: 220px;
  height: 100vh;
  background-color: #2f3542;
  color: #fff;
  overflow: hidden;
  transition: width 0.3s;
}
.menu-container.collapse {
  width: 64px;
}

.collapse-btn {
  height: 48px;
  line-height: 48px;
  text-align: center;
  background: #222732;
  cursor: pointer;
  border-bottom: 1px solid #444;
}

.menu-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.menu-item {
  width: 100%;
}
.menu-title {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  cursor: pointer;
  gap: 10px;
}
.menu-title:hover {
  background-color: #404756;
}
.menu-title.active {
  background-color: #1e90ff;
}

.menu-icon {
  font-size:18px;
  flex-shrink:0;
}
.menu-text {
  flex: 1;
}
.arrow {
  flex-shrink:0;
}

.sub-menu {
  list-style: none;
  padding: 0;
  margin:0;
  background-color:#262b36;
}
.sub-item {
  height:40px;
  line-height:40px;
  padding-left:44px;
  cursor:pointer;
}
.sub-item:hover {
  background-color:#383e4c;
}
.sub-item.active {
  color:#1e90ff;
}
</style>
