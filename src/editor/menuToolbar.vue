<template>
  <div class="menu-toolbar">
    <ul class="toolbar-list">
      <li
        v-for="item in menuList"
        :key="item.id"
        class="toolbar-item"
        :class="{ active: activeId === item.id }"
        @mouseenter="handleMouseEnter(item)"
        @mouseleave="handleMouseLeave(item)"
      >
        <!-- 一级菜单项 -->
        <div class="toolbar-title" @click="handleClick(item)">
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
          <span v-if="item.children" class="caret">▼</span>
        </div>

        <!-- 下拉子菜单 -->
        <div v-if="item.children && showSubId === item.id" class="sub-dropdown">
          <div
            v-for="sub in item.children"
            :key="sub.id"
            class="sub-item"
            :class="{ active: activeId === sub.id }"
            @click.stop="handleClick(sub)"
          >
            {{ sub.label }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";
//import menuList from "./menuConfig.js";//@等价于 src目录; 默认导出不需要大括号；如果大括号名字必须是同名，没大括号等于可以改名；
import menuList from "/src/editor/menuConfig.js"; //绝对路径，必须以/开头
import router from '/src/router.js'

import { exportCurrentModelGLB,downloadBlob } from '/src/utils.js';
// 当前激活菜单id
const activeId = ref(1);
// 当前展开下拉菜单ID
const showSubId = ref(null);



// 鼠标移入，显示下拉
const handleMouseEnter = (item) => {
  if (item.children) {
    showSubId.value = item.id;
  }
};

// 鼠标移出，隐藏下拉
const handleMouseLeave = () => {
  showSubId.value = null;
};

// 菜单点击
const handleClick = (item) => {
  console.log("点击菜单项", item)
  // 有子菜单不触发选中，仅下拉
  if (!item.children) {
    activeId.value = item.id;
    // 可emit事件给父组件，或者 router.push(item.path)

    if('path' in item){
      processLink(item);
    }
    else if('func' in item){
      processFunc(item);
    }else if('page' in item){
      processPage(item);
    }
  }
};

const processLink=(item)=>{
  router.push(item.path);
  console.log("menu 路由跳转到：", item.path);
}
const processFunc=(item)=>{
  eval(`${item.func}()`);
}
const fnExportGlb=async ()=>{
  console.log("导出glb");
  
  //console.log(window.MyApp.threeVp);
  const target = window.MyApp.threeVp.boxMesh; // 假设有
  await exportCurrentModelGLB(target, downloadBlob);
}
const processPage=(item)=>{
  
  //并不是通过path 找到 component;
  //const routeUrl = router.resolve({ name:item.page, params:{id:123}});//这里是通过 name + id ，找Path
  const routeUrl = router.resolve({ path:item.page});//应该可以通过 path, 找Path
  const fullUrl = window.location.origin + routeUrl.href
  window.open(fullUrl, '_blank')
}
</script>

<style scoped>
.menu-toolbar {
  background: #2c3e50;
  color: #fff;
  height: 50px;
}

.toolbar-list {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
  height: 100%;
}

.toolbar-item {
  position: relative;
  height: 100%;
}

.toolbar-title {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  cursor: pointer;
  gap: 6px;
}

.toolbar-title:hover {
  background-color: #34495e;
}

.toolbar-item.active > .toolbar-title {
  background-color: #2980b9;
}

.caret {
  font-size: 10px;
}

/* 下拉子菜单 */
.sub-dropdown {
  position: absolute;
  top: 50px;
  left: 0;
  min-width: 140px;
  background: #fff;
  color: #333;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 999;
}

.sub-item {
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  cursor: pointer;
}

.sub-item:hover {
  background-color: #f5f7fa;
}

.sub-item.active {
  color: #2980b9;
  background-color: #ecf5fb;
}
</style>
