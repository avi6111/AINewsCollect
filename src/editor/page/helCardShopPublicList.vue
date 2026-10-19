<template>
<Teleport to="body">
  <div  class="mask" @click.self="$emit('close')"><!-- 这里show===ref(false)无用，在 外面控制-->
  <!-- 最外层：文件夹外壳（全部复古背景在这里） -->
  <div class="folder-shell">
    <!-- 多层草纸容器 -->
    <div class="paper-wrap">
      <div class="editor-wrap">
        <!-- ========== 原有全部内容不变 ========== -->
        <!-- Banner上传区域 -->
        <div class="banner-area" @click="handleBannerUploadClick">
          <input
            ref="bannerFileRef"
            type="file"
            accept="image/*"
            style="display:none"
            @change="onBannerFileChange"
          />
          <div v-if="formData.bannerImgPath" class="banner-preview">
            <img :src="previewBannerUrl" alt="banner" />
            <div class="banner-path-tip">图片绝对路径：{{ formData.bannerImgPath }}</div>
          </div>
          <div v-else class="banner-empty">
            点击上传Banner图片（后端保存至 E:\photoDB\CardShopPublic\）
          </div>
        </div>

        <div class="action-bar">
          <button @click="addItem">➕新增条目</button>
          <button @click="exportCsv">📤导出CSV</button>
          <label class="import-btn">
            📥导入CSV
            <input ref="csvFileRef" type="file" accept=".csv" style="display:none" @change="importCsv" />
          </label>
          <button @click="uuidCsv">Read_Uuid</button>
        </div>

        <!-- 列表容器，滚动触底无限加载 -->
        <div class="list-container" ref="listScrollRef" @scroll="onScroll">
          <div class="list-item" v-for="item in showList" :key="item.id">
            <div class="item-id">关联ID: {{ item.id }}</div>
            <div class="item-field">
              <label>Title</label>
              <input v-model="item.title" @input="updateItemTime(item)" />
            </div>
            <div class="item-field">
              <label>Content</label>
              <textarea v-model="item.content" @input="updateItemTime(item)"></textarea>
            </div>
            <div class="item-time">
              <div>创建：{{ item.createTime }}</div>
              <button class="del-btn" @click="deleteItem(item.id)">删除</button>
              <!-- <div>最后更改：{{ item.updateTime }}</div> -->
            </div>
            <!-- <div class="item-btn-group">
              <button class="tropy-btn" @click="openTropy(item.imgpPath)">Tropy打开图片</button>
              <button class="del-btn" @click="deletepItem(item.id)">删除</button>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <helCardShopMenuTool @click-open-unity="handleOpenUnity"/>
  </div> <!-- 关闭mask -->  
  
</Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted,nextTick, provide,inject ,getCurrentInstance} from 'vue'
import { selectTropyItem,selectPhoto,getPhoto,getProxyPhoto,uuid,dataProject } from './helper/fetch.js'
import helCardShopMenuTool from './helCardShopMenuTool.vue';
// 声明接收 :initData 
const props = defineProps({
  initData: {
    type: Object,
    default: null
  },
  project_spec_name:{type:String,default:''}
})
const emit = defineEmits(['close']) //外面写< @close="">
console.log(":initData===",props)
//provide('fullname', props.project_spec_name)//经过 helper/csvImporter.js 转换了，这个已经是短name!!

const currentShop = inject('currentShop', ref(null))//就是ref ;就是ref ;就是ref ;

const photoMeta = ref(null)
// 主数据：banner图片路径 + 条目列表
const formData = reactive({
  bannerImgPath: '', // Banner图绝对路径 E:\photoDB\CardShopPublic\xxx.jpg
  list: []
})
const { proxy } = getCurrentInstance()

const bannerFileRef = ref(null)
const csvFileRef = ref(null)
const listScrollRef = ref(null)
const previewBannerUrl = ref('')

// 无限滚动配置
const pageSize = 10
const page = ref(1)
const showList = computed(() => formData.list.slice(0, page.value * pageSize))
async function handleOpenUnity(){
  const projectPath = currentShop.value.fullName
  console.log(proxy.$serviceCros)
  console.log(projectPath)
  console.log(currentShop)
  const ret = await fetch(`${proxy.$serviceCros.value}/newapi/tools/open_unity/${projectPath}`,{method:'GET'})
  //const data =await ret.json()
  console.log(ret)
}
// 获取下一个自增ID（和projectList的item.id关联）
function getNextId() {
  if (formData.list.length === 0) return 1
  return Math.max(...formData.list.map(i => i.id)) + 1
}

// 新增一条
function addItem() {
  const now = new Date().toLocaleString()
  const newItem = {
    id: getNextId(),
    title: '',
    content: '',
    imgPath: '', // 当前条目对应的图片绝对路径（用于tropy打开）
    createTime: now,
    updateTime: now
  }
  formData.list.push(newItem)
}

// 修改内容自动更新最后更改时间
function updateItemTime(item) {
  item.updateTime = new Date().toLocaleString()
}

// 删除条目
function deleteItem(delId) {
  const idx = formData.list.findIndex(x => x.id === delId)
  if (idx > -1) formData.list.splice(idx, 1)
}

// 滚动触底加载更多
function onScroll(e) {
  const el = e.target
  const bottom = el.scrollHeight - el.scrollTop - el.clientHeight
  if (bottom < 50) {
    page.value += 1
  }
}

// ================= Banner 图片上传 =================
function handleBannerUploadClick() {
  bannerFileRef.value.click()
}
// 按钮点击事件
const handleOpenTropyItem = async (id) => {
  try {
    const result = await selectTropyItem(id)
    if(result.ok){
      console.log('✅ Tropy已选中条目', id)
    }
  } catch (e) {
    alert(e.message)
  }
}
//#region -------------- 上传项目 Banner 图片 ////////////////////////////
async function onBannerFileChange(ev) {
  const file = ev.target.files[0]
  if (!file) return

  // 本地预览用
  previewBannerUrl.value = URL.createObjectURL(file)

  // ======【这里调用后端上传接口】======
  // 后端接收file，保存到 E:\photoDB\CardShopPublic\
  // 后端返回绝对路径字符串，例如 E:\photoDB\CardShopPublic\banner123.jpg
  try {
    const fd = new FormData()
    fd.append('file', file) // 不要手动设置 Content-Type，浏览器会自动加 boundary
    const res = await fetch('/newapi/photos/create/', { method: 'POST', body: fd })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    formData.bannerImgPath = data.url
    console.log('Banner 上传成功', data.url)
  } catch (e) {
    console.error('Banner 上传失败', e)
    alert('Banner 上传失败：' + e.message)
    return
  }
  //测试 Tropy 的 projectUuid ???
  //const projectUuid = "eb212d20-c2c2-11f1-8d16-b9b5ce43c528";
  //const itemId = 1;
  // setTimeout(() => {
  //   // 一定要encodeURIComponent编码，UUID带横杠，防止解析出错
  //   //const uri = `tropy://open?project=${encodeURIComponent(projectUuid)}&item=${encodeURIComponent(itemId)}`
  //   //const uri = `tropy://open?project=${encodeURIComponent(projectUuid)}`
  //   const uri = `tropy://project/current/items/17/18`
  //   window.open(uri)
  // }, 0)

  //可打印：
  //const result = await getProxyPhoto(2)
  //console.log(result)

  //测试 Tropy 显示 Json: meta 数据：
  // const res = await fetch(`/tropy-api/project/photos/${photoId}`)
  // if (!res.ok) throw new Error(`HTTP ${res.status}`)
  // photoMeta.value = await res.json()

  //测试 Tropy x2
  // const photoId = 2
  // const obj = computed(() => `/tropy-api/project/photos/${photoId}/file.jpg`)
  // console.log(obj)
  // previewBannerUrl.value = obj



  
}

// ================= Tropy唤起 =================
function openTropy(absPath) {
  if (!absPath) {
    alert('该条目没有图片路径')
    return
  }
  const encodedPath = encodeURIComponent(absPath)
  const tropyUri = `tropy://open?path=${encodedPath}`
  window.open(tropyUri)
}

// ================= CSV导出 =================
function exportCsv() {
  // 首行存储banner图片路径
  let csvText = `"bannerImgPath","${formData.bannerImgPath}"\n`
  // 表头
  csvText += `"id","title","content","imgPath","createTime","updateTime"\n`

  // 转义CSV双引号、逗号
  const escape = (str) => `"${String(str ?? '').replace(/"/g, '""')}"`

  formData.list.forEach(item => {
    const row = [
      escape(item.id),
      escape(item.title),
      escape(item.content),
      escape(item.imgPath),
      escape(item.createTime),
      escape(item.updateTime)
    ].join(',')
    csvText += row + '\n'
  })

  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'helCardShopPublicData.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ================= CSV导入 =================
function importCsv(ev) {
  const file = ev.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    const text = e.target.result
    const rows = text.split('\n').filter(r => r.trim())
    if (!rows.length) return

    // 读取banner路径
    const bannerLine = rows[0].replace(/^"bannerImgPath","/, '').replace(/"$/, '')
    formData.bannerImgPath = bannerLine

    console.log(formData.bannerImgPath)
    //await 好像必须 await fetch(`{fromData.bannerImgPath}`)
    previewBannerUrl.value = computed(() => `${formData.bannerImgPath}`).value

    // 跳过表头，读取数据行
    const dataRows = rows.slice(2)
    formData.list = []
    dataRows.forEach(line => {
      if (!line.trim()) return
      const cells = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
      if (!cells) return
      const item = {
        id: Number(cells[0].replace(/"/g, '')),
        title: cells[1].replace(/"/g, ''),
        content: cells[2].replace(/"/g, ''),
        imgPath: cells[3].replace(/"/g, ''),
        createTime: cells[4].replace(/"/g, ''),
        updateTime: cells[5].replace(/"/g, '')
      }
      formData.list.push(item)
    })
    page.value = 1
  }
  reader.readAsText(file)
}
async function uuidCsv() {
  console.log(')(**&*^&^%%^^6……………………*&……——（*)',props.project_spec_name)
  if(props.project_spec_name==null || props.project_spec_name=='') 
  {
    console.log("没有传入 props.project_spec_name. 请检查，没有项目名字！！")
    return
  }
  const res = await fetch('/newapi/data/project/', {
    method: 'POST',
    body: (() => { const fd = new FormData(); fd.append('project_name', props.project_spec_name); return fd; })()
  })
  const data = await res.json();
  console.log('Uuid===',data.uuid);
}
onMounted(() => {
  page.value = 1
  // 默认读取csv
  let nameS = props.project_spec_name
  if(props.project_spec_name=='')
  {
    console.warn(`props.project_spec_name is empty 没传参数(换成 ${currentShop.value.name})`)
    nameS = currentShop.value.name
  }
  uuid(nameS).then(uuid => {
    dataProject(uuid).then(d => {
      formData.bannerImgPath = d.banner
      previewBannerUrl.value = d.banner

      console.log('Data from dataProject:', d)
      formData.list = d.data || []
    })
  })


})
</script>

<style scoped>
/* === 弹出窗口 ===============*/
.mask {
  position:fixed;
  z-index:100;
  inset:0;
  background:rgba(0,0,0,0.3);
  display:flex;
  align-items:center;
  justify-content:center;
}
.popup{
  background:white;
  padding:20px;
}
/* ===== 文件夹外壳【组件内】 ===== */
.folder-shell{
  background: #b88646;
  padding: 30px 20px 40px 20px;
  border-radius: 6px 12px 12px 6px;
  box-shadow: 0 8px 24px #0004;
  position:relative;
  transform: rotate(-1deg);
}
/* 文件夹翻边小三角装饰 */
.folder-shell::before{
  content:"";
  position:absolute;
  top:0;
  left:12px;
  width:90px;
  height:22px;
  background:#c99756;
  border-radius:4px 4px 0 0;
  transform: translateY(-12px);
}
/* 多张草纸堆叠效果 */
.paper-wrap{
  background: #faf6e9;
  padding:24px;
  border:1px solid #ddd6c4;
  border-radius:2px;
  box-shadow:
    2px 2px 4px #0002,
    -1px -1px 2px #fff8 inset;
  position:relative;
  min-width:860px;
  max-width:90vw;
  max-height:85vh;
  overflow:auto;
}
/* 叠在下面第二层纸 偏移一点点 */
.paper-wrap::before{
  content:"";
  position:absolute;
  inset:-4px -2px -2px 4px;
  background:#f7f2e4;
  z-index:-1;
  transform:rotate(0.6deg);
  border:1px solid #e2ddce;
  border-radius:2px;
}
/* 第三层纸 */
.paper-wrap::after{
  content:"";
  position:absolute;
  inset:-7px -4px -4px 7px;
  background:#f3efe0;
  z-index:-2;
  transform:rotate(-0.4deg);
  border:1px solid #e8e3d3;
  border-radius:2px;
}

.editor-wrap {
  padding: 0;
  max-width: 100%;
  background: transparent;
  color:#2b261f;
}
.banner-area {
  border: 2px dashed #998c77;
  border-radius: 4px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 16px;
  overflow: hidden;
  background:#fffcf688;
}
.banner-empty {
  color: #6b6052;
}
.banner-preview img {
  max-height: 180px;
  max-width: 100%;
  object-fit: contain;
}
.banner-path-tip {
  font-size: 12px;
  color: #726859;
  margin-top: 4px;
  word-break: break-all;
}
.action-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}
.action-bar button, .import-btn{
  background:#f0e9da;
  border:1px solid #b9a992;
  color:#332c20;
  border-radius:3px;
  cursor:pointer;
}
.import-btn {
  padding: 4px 8px;
}
.list-container {
  height: 500px;
  overflow-y: auto;
  border: 1px solid #c9beaa;
  padding: 8px;
  background:#fffcf677;
}
.list-item {
  border: 1px solid #d9cfbc;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  background:#fffdf899;
}
.item-id {
  font-weight: bold;
  color: #2b261f;
  margin-bottom: 4px;
}
.item-field {
  margin: 6px 0;
}
.item-field label {
  display: block;
  font-size: 13px;
  color: #524a3c;
}
.item-field input,
.item-field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 4px;
  border:1px solid #b9a992;
  background:#fffffd;
  color:#2b261f;
}
.item-time {
  font-size: 12px;
  color: #645a4c;
  margin: 4px 0;
  display: flex;
  /*display: inline-block;   行内不换行，同时支持宽高和 margin */
}
.item-btn-group {
  display: flex;
  gap:8px;
  margin-top:6px;
}
.tropy-btn {
  color:#224460;
}
.del-btn {
  color: #9c3838;
}
</style>
