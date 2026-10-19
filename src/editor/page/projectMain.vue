<template>
  <div class="progress-manager">
    <div class="header">
      <h2>项目进度管理器</h2>
      <button class="btn-add" @click="openModal()">➕ 创建新项目</button>
    </div>

    <!-- 网格卡片列表 -->
    <div class="grid-container">
      <div
        v-for="(item, index) in sortedProjectList"
        :key="item.id"
        class="project-card"
        :class="{ 'card-star': item.star, 'card-finish': item.progress === 100 }"
        draggable="true"
        @dragstart="handleDragStart($event, index)"
        @dragover.prevent
        @drop="handleDrop($event, index)"
      >
        <div class="card-header">
          <span class="title">{{ item.name }}</span>
          <div class="card-actions">
            <button class="btn-star" @click="toggleStar(item)">
              {{ item.star ? '⭐' : '☆' }}
            </button>
            <button class="btn-small" @click="openModal(item)">✏️</button>
            <button class="btn-small del" @click="handleDelete(item.id)">🗑️</button>
          </div>
        </div>
        <p class="desc">{{ item.desc || '无描述' }}</p>

        <!-- 进度条 -->
        <div class="progress-wrap">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: `${item.progress}%` }"></div>
          </div>
          <div class="progress-text">{{ item.progress }}%</div>
        </div>

        <!-- 修改进度 -->
        <div class="progress-input-wrap">
          <input
            v-model.number="item.progress"
            type="number"
            min="0"
            max="100"
            class="input-num"
            @change="saveToLocal()"
          />
          <span>%</span>
        </div>
        <div class="tag-tip">
          <span v-if="item.star" class="tag star-tag">星标</span>
          <span v-if="item.progress === 100" class="tag finish-tag">✅已完成</span>
        </div>
        <div class="tip">💡拖拽卡片可调整顺序，星标置顶，100%项目后置</div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="modalVisible" class="modal-mask" @click.self="closeModal()">
      <div class="modal">
        <h3>{{ editItem ? '编辑项目' : '新建项目' }}</h3>
        <div class="form-item">
          <label>项目名称</label>
          <input v-model="form.name" type="text" placeholder="输入项目名称" />
        </div>
        <div class="form-item">
          <label>项目描述</label>
          <textarea v-model="form.desc" rows="3" placeholder="简单描述"></textarea>
        </div>
        <div class="form-item">
          <label>初始进度(0‑100)</label>
          <input v-model.number="form.progress" type="number" min="0" max="100" />
        </div>
        <div class="modal-buttons">
          <button @click="closeModal">取消</button>
          <button class="btn-confirm" @click="submitForm">确认提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

// 存储key
const STORAGE_KEY = 'progress_manager_list'

// 从本地读取数据
const getLocalData = () => {
  const str = localStorage.getItem(STORAGE_KEY)
  if (!str) return []
  try {
    return JSON.parse(str)
  } catch (e) {
    return []
  }
}

// 保存到本地
const saveToLocal = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projectList.value))
}

// 项目列表
const projectList = ref(getLocalData())

// 【核心计算属性：星标在前，完成的放最后】
const sortedProjectList = computed(() => {
  const list = [...projectList.value]
  return list.sort((a, b) => {
    const aIsFinish = a.progress === 100
    const bIsFinish = b.progress === 100
    // 完成项直接压到最后
    if (aIsFinish && !bIsFinish) return 1
    if (!aIsFinish && bIsFinish) return -1
    // 都不是完成项：星标优先
    if (!aIsFinish && !bIsFinish) {
      if (a.star && !b.star) return -1
      if (!a.star && b.star) return 1
    }
    // 其余保留拖拽出来的原始顺序
    return 0
  })
})

// 切换星标
const toggleStar = (item) => {
  item.star = !item.star
  saveToLocal()
}

// 拖拽
let dragIndex = ref(null)
const handleDragStart = (e, index) => {
  dragIndex.value = index
  e.dataTransfer.effectAllowed = 'move'
}
const handleDrop = (e, targetIndex) => {
  const sourceIdx = dragIndex.value
  if (sourceIdx === null || sourceIdx === targetIndex) return
  // 注意：sortedProjectList是计算属性，要操作原始projectList
  const sourceRawItem = sortedProjectList.value[sourceIdx]
  const targetRawItem = sortedProjectList.value[targetIndex]
  const realSourceIdx = projectList.value.findIndex(i => i.id === sourceRawItem.id)
  const realTargetIdx = projectList.value.findIndex(i => i.id === targetRawItem.id)

  const temp = projectList.value[realSourceIdx]
  projectList.value.splice(realSourceIdx, 1)
  projectList.value.splice(realTargetIdx, 0, temp)

  saveToLocal()
  dragIndex.value = null
}

// 弹窗表单
const modalVisible = ref(false)
const editItem = ref(null)
const form = ref({
  name: '',
  desc: '',
  progress: 0
})

// 打开弹窗：编辑/新增
const openModal = (item = null) => {
  editItem.value = item
  if (item) {
    form.value = { ...item }
  } else {
    form.value = {
      name: '',
      desc: '',
      progress: 0
    }
  }
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  editItem.value = null
}

// 提交表单
const submitForm = () => {
  if (!form.value.name.trim()) return alert('请输入项目名称')
  if (editItem.value) {
    // 更新
    const idx = projectList.value.findIndex(p => p.id === editItem.value.id)
    if (idx > -1) {
      projectList.value[idx] = { ...form.value }
    }
  } else {
    // 创建，生成唯一id，默认star为false
    const newItem = {
      id: Date.now(),
      name: form.value.name,
      desc: form.value.desc,
      progress: Number(form.value.progress) || 0,
      star: false
    }
    projectList.value.push(newItem)
  }
  saveToLocal()
  closeModal()
}

// 删除
const handleDelete = (id) => {
  if (!confirm('确定删除该项目？')) return
  projectList.value = projectList.value.filter(p => p.id !== id)
  saveToLocal()
}

watch(projectList, () => {
  saveToLocal()
}, { deep: true })
</script>

<style scoped>
.progress-manager {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.btn-add {
  padding: 8px 16px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.project-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  cursor: grab;
  transition: 0.2s;
}
.project-card:active {
  cursor: grabbing;
}
.card-star {
  border-color: #f59e0b;
  box-shadow: 0 0 8px #f59e0b33;
}
.card-finish {
  opacity: 0.82;
  background-color: #f1f9f1;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-weight: 600;
  font-size: 16px;
}
.card-actions {
  display: flex;
  gap: 6px;
}
.btn-star {
  border: none;
  background: transparent;
  font-size:18px;
  cursor: pointer;
  padding:0 4px;
}
.btn-small {
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.btn-small.del {
  color: #ef4444;
}
.desc {
  color: #666;
  font-size: 13px;
  margin: 8px 0;
  min-height: 32px;
}
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin:12px 0;
}
.progress-bar-bg {
  flex:1;
  height:10px;
  background:#e5e7eb;
  border-radius: 999px;
  overflow:hidden;
}
.progress-bar-fill {
  height:100%;
  background:#22c55e;
  transition: width 0.2s;
}
.progress-text {
  width:40px;
  text-align:right;
  font-size:13px;
}
.progress-input-wrap {
  display:flex;
  align-items:center;
  gap:4px;
  margin-bottom:8px;
}
.input-num {
  width:60px;
  padding:4px;
}
.tag-tip {
  display:flex;
  gap:6px;
  margin-bottom:6px;
}
.tag {
  font-size:11px;
  padding:2px 6px;
  border-radius:4px;
}
.star-tag {
  background:#fef3c7;
  color:#d97706;
}
.finish-tag {
  background:#dcfce7;
  color:#16a34a;
}
.tip {
  font-size:11px;
  color:#999;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  inset:0;
  background:rgba(0,0,0,0.4);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:999;
}
.modal {
  background:#fff;
  padding:24px;
  border-radius:10px;
  width:420px;
}
.form-item {
  margin-bottom:14px;
}
.form-item label {
  display:block;
  margin-bottom:4px;
  font-size:14px;
}
.form-item input,
.form-item textarea {
  width:100%;
  box-sizing:border-box;
  border:1px solid #ccc;
  border-radius:6px;
  padding:8px;
}
.modal-buttons {
  display:flex;
  justify-content:flex-end;
  gap:10px;
  margin-top:16px;
}
.btn-confirm {
  background:#2563eb;
  color:white;
  border:none;
  padding:6px 14px;
  border-radius:6px;
  cursor:pointer;
}
</style>
