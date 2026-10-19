<script setup>
import proCardTempSlidePanel from './proCardTempSlidePanel.vue'
import { ref, onMounted, watch } from 'vue'
import { handleCsvUpload } from './helper/csvImporter.js'
// 向外暴露选中集合，给外部panel组件使用
const selectedList = ref([])
const canvasRef = ref(null)
let ctx = null
const canvasW = 900
const canvasH = 650
const TILE_W = 80
const TILE_H = 40
const SCALE_THRESHOLD = 0.6
const roadList = ref([])// 保存所有道路：{name, worldX, worldY}
const projectList = ref([
  { id: 1, name: '天守城堡', gridRow: 3, gridCol: 4, buildingType:'castle', desc:'日式天守阁，城市地标，容纳大量游客' },
  { id: 2, name: '绿色寺庙', gridRow: 3, gridCol: 8, buildingType:'temple', desc:'古寺，静谧参拜场所' },
  { id: 3, name: '方盒子商店', gridRow: 7, gridCol: 3, buildingType:'squareBox', desc:'简约单层便民商店' },
  { id: 4, name: '联排商业街', gridRow: 6, gridCol: 9, buildingType:'shopRow', desc:'一排临街商铺，人流密集' },
])
// 回调函数，接收新增数据，更新列表
function onAppendProjects(newItems) {
  projectList.value.push(...newItems)
  console.log('导入成功，新增：', newItems)
  console.log(projectList)
}
const mapRows = 14
const mapCols = 14
// =========【修改】从数组改为对象存储，支持负/超大行号 =========
const mapData = ref({})
const camera = ref({
  x: 320,
  y: 80,
  scale: 1.0
})
const minScale = 0.2
const maxScale = 1.8
const scaleStep = 0.15
let isDrag = false
let dragStart = { x: 0, y: 0 }
const hoverKey = ref('')
// ========== 框选状态 ==========
const boxSelect = ref({
  active: false,
  startX:0, startY:0,
  endX:0, endY:0,
  shiftDown: false
})
// 键盘监听Shift
window.addEventListener('keydown', e=>{
  if(e.key === 'Shift') boxSelect.value.shiftDown = true
})
window.addEventListener('keyup', e=>{
  if(e.key === 'Shift') boxSelect.value.shiftDown = false
})
// 判断建筑是否在选中列表
function isSelected(build) {
  return selectedList.value.some(item => item.id === build.id)
}
// 单选：点击建筑
function selectSingle(build) {
  if(boxSelect.value.shiftDown) {
    // shift点击：反选追加
    const idx = selectedList.value.findIndex(i=>i.id===build.id)
    if(idx >=0) selectedList.value.splice(idx,1)
    else selectedList.value.push(build)
  } else {
    // 普通点击，单选覆盖
    selectedList.value = [build]
  }
}
// // 格子(row,col) → 世界坐标（无相机变换）
// function isoWorldX(row, col) {
//   return (col - row) * TILE_W / 2
// }
// function isoWorldY(row, col) {
//   return (col + row) * TILE_H / 2
// }
// 屏幕坐标 → 世界坐标（反向换算，框选用）
function screenToWorld(screenX, screenY) {
  const cam = camera.value
  const wx = (screenX - cam.x) / cam.scale
  const wy = (screenY - cam.y) / cam.scale
  return {wx, wy}
}
// 判断建筑中心点是否在框选矩形内
function isPointInRect(worldX, worldY, rect) {
  const minX = Math.min(rect.sx1, rect.sx2)
  const maxX = Math.max(rect.sx1, rect.sx2)
  const minY = Math.min(rect.sy1, rect.sy2)
  const maxY = Math.max(rect.sy1, rect.sy2)
  return worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY
}
// ========== 鼠标事件 ==========
function onMouseDown(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const screenX = e.clientX - rect.left
  const screenY = e.clientY - rect.top
  if(boxSelect.value.shiftDown) {
    // Shift按下：进入框选模式
    boxSelect.value.active = true
    boxSelect.value.startX = screenX
    boxSelect.value.startY = screenY
    boxSelect.value.endX = screenX
    boxSelect.value.endY = screenY
  } else {
    // 普通拖拽平移地图
    isDrag = true
    dragStart.x = e.clientX
    dragStart.y = e.clientY
  }
}
function onMouseMove(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const screenX = e.clientX - rect.left
  const screenY = e.clientY - rect.top
  if(boxSelect.value.active) {
    boxSelect.value.endX = screenX
    boxSelect.value.endY = screenY
  }else if(isDrag){
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    camera.value.x += dx
    camera.value.y += dy
    dragStart.x = e.clientX
    dragStart.y = e.clientY
    renderCanvas()
  }
}
function onMouseUp() {
  if(boxSelect.value.active) {
    // 框选结束，计算落在框内建筑
    const rectScreen = {
      sx1: boxSelect.value.startX,
      sy1: boxSelect.value.startY,
      sx2: boxSelect.value.endX,
      sy2: boxSelect.value.endY
    }
    const cam = camera.value
    const newSelected = []
    projectList.value.forEach(build=>{
      const wX = isoWorldX(build.gridRow, build.gridCol)
      const wY = isoWorldY(build.gridRow, build.gridCol)
      // 世界坐标转屏幕坐标判断是否在框内
      const sX = wX * cam.scale + cam.x
      const sY = wY * cam.scale + cam.y
      if(isPointInRect(sX, sY, rectScreen)) {
        newSelected.push(build)
      }
    })
    selectedList.value = newSelected
    boxSelect.value.active = false
  }
  isDrag = false
}
function hoverRestaurant(rest) {
  hoverKey.value = `${rest.gridRow},${rest.gridCol}`
}
function clearHover() {
  hoverKey.value = ''
}
// ========== 缩放、相机、渲染函数保持不变 ==========
function zoomIn() {
  camera.value.scale = Math.min(maxScale, camera.value.scale + scaleStep)
  renderCanvas()
}
function zoomOut() {
  camera.value.scale = Math.max(minScale, camera.value.scale - scaleStep)
  renderCanvas()
}
function resetCamera() {
  camera.value = { x: 320, y: 80, scale: 1.0 }
  renderCanvas()
}
function onWheel(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const mouseScreenX = e.clientX - rect.left
  const mouseScreenY = e.clientY - rect.top
  const cam = camera.value
  const worldX = (mouseScreenX - cam.x) / cam.scale
  const worldY = (mouseScreenY - cam.y) / cam.scale
  const delta = e.deltaY < 0 ? scaleStep : -scaleStep
  let newScale = cam.scale + delta
  newScale = Math.max(minScale, Math.min(maxScale, newScale))
  cam.x = mouseScreenX - worldX * newScale
  cam.y = mouseScreenY - worldY * newScale
  cam.scale = newScale
  renderCanvas()
}
// ========== 建筑路径函数，沿用之前带门窗版本 ==========
function isoWorldX(row, col) {
  return (col - row) * TILE_W / 2
}
function isoWorldY(row, col) {
  return (col + row) * TILE_H / 2
}
// 城堡
function buildCastleLeft(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const h = 44
  return `M ${x - halfW},${y} L ${x - halfW},${y - h} L ${x},${y - h - halfH} L ${x},${y - halfH} Z`
}
function buildCastleRight(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const h = 44
  return `M ${x + halfW},${y} L ${x + halfW},${y - h} L ${x},${y - h - halfH} L ${x},${y - halfH} Z`
}
function buildCastleRoof(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col) - 44
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  return `M ${x},${y - halfH} L ${x + halfW},${y} L ${x},${y + halfH} L ${x - halfW},${y} Z`
}
function buildCastleRoofSmall(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col) - 44
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const sx = x + halfW * 0.2
  const sy = y - halfH * 0.55
  const sw = halfW * 0.5
  const sh = halfH * 0.5
  return `M ${sx},${sy - sh} L ${sx + sw},${sy} L ${sx},${sy + sh} L ${sx - sw},${sy} Z`
}
function buildCastleDoor(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const h = 44
  return `M ${x - halfW * 0.22},${y} L ${x - halfW * 0.22},${y - h * 0.4} L ${x + halfW * 0.22},${y - h * 0.4} L ${x + halfW * 0.22},${y} Z`
}
//寺庙
function buildTempleLeft(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const h = 36
  return `M ${x - halfW},${y} L ${x - halfW},${y - h} L ${x},${y - h - halfH} L ${x},${y - halfH} Z`
}
function buildTempleRight(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const h = 36
  return `M ${x + halfW},${y} L ${x + halfW},${y - h} L ${x},${y - h - halfH} L ${x},${y - halfH} Z`
}
function buildTempleRoof(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col) - 36
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  return `M ${x},${y - halfH} L ${x + halfW},${y} L ${x},${y + halfH} L ${x - halfW},${y} Z`
}
function buildTempleRoofTop(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col) - 36
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const sx = x + halfW * 0.15
  const sy = y - halfH * 0.5
  const sw = halfW * 0.55
  const sh = halfH * 0.55
  return `M ${sx},${sy - sh} L ${sx + sw},${sy} L ${sx},${sy + sh} L ${sx - sw},${sy} Z`
}
function buildTempleDoor(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const h = 36
  return `M ${x - halfW * 0.18},${y} L ${x - halfW * 0.18},${y - h * 0.5} L ${x + halfW * 0.18},${y - h * 0.5} L ${x + halfW * 0.18},${y} Z`
}
function buildTempleWindowLeft(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const h = 36
  const wx = x - halfW * 0.55
  const wy = y - h * 0.55
  const ww = halfW * 0.28
  const wh = halfH * 0.35
  return `M ${wx},${wy - wh} L ${wx + ww},${wy} L ${wx},${wy + wh} L ${wx - ww},${wy} Z`
}
function buildTempleWindowRight(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const h = 36
  const wx = x + halfW * 0.55
  const wy = y - h * 0.55
  const ww = halfW * 0.28
  const wh = halfH * 0.35
  return `M ${wx},${wy - wh} L ${wx + ww},${wy} L ${wx},${wy + wh} L ${wx - ww},${wy} Z`
}
//方盒子
function buildBoxLeft(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const h = 24
  return `M ${x - halfW},${y} L ${x - halfW},${y - h} L ${x},${y - h - halfH} L ${x},${y - halfH} Z`
}
function buildBoxRight(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const h = 24
  return `M ${x + halfW},${y} L ${x + halfW},${y - h} L ${x},${y - h - halfH} L ${x},${y - halfH} Z`
}
function buildBoxTop(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col) - 24
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  return `M ${x},${y - halfH} L ${x + halfW},${y} L ${x},${y + halfH} L ${x - halfW},${y} Z`
}
function buildBoxDoor(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  return `M ${x - halfW * 0.2},${y} L ${x - halfW * 0.2},${y - 10} L ${x + halfW * 0.2},${y - 10} L ${x + halfW * 0.2},${y} Z`
}
function buildBoxWindow(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const wx = x + halfW * 0.4
  const wy = y - 14
  const ww = halfW * 0.25
  const wh = halfH * 0.3
  return `M ${wx},${wy - wh} L ${wx + ww},${wy} L ${wx},${wy + wh} L ${wx - ww},${wy} Z`
}
//联排商店
function buildShopLeft(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const h = 22
  return `M ${x - halfW},${y} L ${x - halfW},${y - h} L ${x},${y - h - halfH} L ${x},${y - halfH} Z`
}
function buildShopRight(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const h = 22
  return `M ${x + halfW},${y} L ${x + halfW},${y - h} L ${x},${y - h - halfH} L ${x},${y - halfH} Z`
}
function buildShopTop(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col) - 22
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  return `M ${x},${y - halfH} L ${x + halfW},${y} L ${x},${y + halfH} L ${x - halfW},${y} Z`
}
function buildShopAwning(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  return `M ${x - halfW},${y - 14} L ${x + halfW},${y - 14} L ${x + halfW * 0.7},${y - 8} L ${x - halfW * 0.7},${y - 8} Z`
}
function buildShopWindow1(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const wx = x - halfW * 0.5
  const wy = y - 12
  const ww = halfW * 0.3
  const wh = halfH * 0.35
  return `M ${wx},${wy - wh} L ${wx + ww},${wy} L ${wx},${wy + wh} L ${wx - ww},${wy} Z`
}
function buildShopWindow2(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  const halfH = TILE_H / 2
  const wx = x + halfW * 0.45
  const wy = y - 12
  const ww = halfW * 0.3
  const wh = halfH * 0.35
  return `M ${wx},${wy - wh} L ${wx + ww},${wy} L ${wx},${wy + wh} L ${wx - ww},${wy} Z`
}
function buildShopDoor(row, col) {
  const x = isoWorldX(row, col)
  const y = isoWorldY(row, col)
  const halfW = TILE_W / 2
  return `M ${x - halfW * 0.15},${y} L ${x - halfW * 0.15},${y - 9} L ${x + halfW * 0.15},${y - 9} L ${x + halfW * 0.15},${y} Z`
}
// ====================== 重写 initMap ======================
function initEmptyMapData(){
        // 1. 从 projectList 计算 width、height
    if (projectList.length === 0) {
    // 空列表兜底，最小地图 1x1
    var width = 1;
    var height = 1;
    } else {
    // 取出所有x，找最大x；取出所有y找最大y
    const xs = projectList.map(p => p.gridRow);
    const ys = projectList.map(p => p.gridCol);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    // 坐标从0开始，所以格子数量要 +1
    const width = maxX + 1;
    const height = maxY + 1;
    }

    // 2. 初始化二维数组，全部默认值 0 ✅
    const mapData = Array(height).fill().map(() => Array(width).fill(0));
    return mapData;
}
function initMap() {
  //mapData.value = {} // 清空为空白对象，不再是数组
  mapData.value = initEmptyMapData();
  roadList.value = [] // 清空道路名称
  projectList.value.forEach(item => {
    const r = item.gridRow
    const c = item.gridCol
    // 建筑格子标记为2
    if (!mapData.value[r]) mapData.value[r] = {}
    mapData.value[r][c] = 2
  })
  const buildings = projectList.value
  for (let i = 0; i < buildings.length - 1; i++) {
    const a = buildings[i]
    const b = buildings[i + 1]
    drawRoadLine(a.gridRow, a.gridCol, b.gridRow, b.gridCol)
  }
  renderCanvas()
}
//////////////////////////////// 道路逻辑(增加取道路中点) /////////////////////////////
function getRoadName(r0,c0,r1,c1){
  // 简单示例，你后续可以扩展
  const key = `${Math.min(r0,r1)},${Math.min(c0,c1)}_${Math.max(r0,r1)},${Math.max(c0,c1)}`
  const nameMap = {
    "3,4_3,8": "古寺大道",//3 4 3 8
    "3,8_6,9": "商业街南路",
    "6,9_7,3": "北门支路",
    "3,3_7,8"/*"3,8_7,3"*/: "鸽子商业街",//3 8 7 3
    "6,3_7,9"/*"7,3_6,9"*/: "北门向海路",//7 3 6 9
  }
  return nameMap[key] || null
}
// ===================== 修改后的 drawRoadLine 对象读写 =====================
function drawRoadLine(r0, c0, r1, c1) {
  const roadCells = []
  let dr = Math.abs(r1 - r0)
  let dc = Math.abs(c1 - c0)
  let sr = r0 < r1 ? 1 : -1
  let sc = c0 < c1 ? 1 : -1
  let err = dr - dc
  let r = r0
  let c = c0
  while (true) {
    // 对象方式读取格子
    const rowObj = mapData.value[r]
    const cellVal = rowObj?.[c]
    if (cellVal !== 2) {
      if (!mapData.value[r]) {
        mapData.value[r] = {}
      }
      mapData.value[r][c] = 1
    }
    roadCells.push({r,c})
    if (r === r1 && c === c1) break
    const e2 = 2 * err
    if (e2 > -dc) {
      err -= dc
      r += sr
    }
    if (e2 < dr) {
      err += dr
      c += sc
    }
  }
  // 没有道路格子直接返回
  if (roadCells.length === 0) return;
  // 道路起点、终点世界坐标
  const wx0 = isoWorldX(r0, c0)
  const wy0 = isoWorldY(r0, c0)
  const wx1 = isoWorldX(r1, c1)
  const wy1 = isoWorldY(r1, c1)
  // 取道路中间格子，生成路名
  const midIdx = Math.floor(roadCells.length / 2)
  const mid = roadCells[midIdx]
  const roadName = getRoadName(r0,c0,r1,c1)
  if(roadName){
    // 道路原中点
    const wx = isoWorldX(mid.r, mid.c)
    const wy = isoWorldY(mid.r, mid.c)
    const dx = wx1 - wx0
    const dy = wy1 - wy0
    let rad = Math.atan2(dy, dx)
    let deg = rad * 180 / Math.PI
    if (deg > 90) deg -= 180
    if (deg < -90) deg += 180
    roadList.value.push({
      name: roadName,
      x: wx,
      y: wy,
      angle: deg
    })
  }
}
// ===================== 修改 renderCanvas，遍历对象而不是固定二维数组 =====================
function renderCanvas() {
  ctx.clearRect(0, 0, canvasW, canvasH)
  const cam = camera.value
  // 遍历mapData的所有行key
  for (const rStr of Object.keys(mapData.value)) {
    const r = Number(rStr)
    const colObj = mapData.value[r]
    for (const cStr of Object.keys(colObj)) {
      const c = Number(cStr)
      const tileType = colObj[cStr]
      if (tileType === 0 || tileType === 1) {
        drawGroundTile(r, c, tileType, cam)
      }
    }
  }
}
function drawGroundTile(row, col, type, cam) {
  const worldX = isoWorldX(row, col)
  const worldY = isoWorldY(row, col)
  const sx = worldX * cam.scale + cam.x
  const sy = worldY * cam.scale + cam.y
  const halfW = (TILE_W / 2) * cam.scale
  const halfH = (TILE_H / 2) * cam.scale
  ctx.beginPath()
  ctx.moveTo(sx, sy - halfH)
  ctx.lineTo(sx + halfW, sy)
  ctx.lineTo(sx, sy + halfH)
  ctx.lineTo(sx - halfW, sy)
  ctx.closePath()
  if (type === 0) ctx.fillStyle = '#70b850'
  else ctx.fillStyle = '#999999'
  ctx.fill()
  ctx.strokeStyle = '#22222233'
  ctx.lineWidth = 1
  ctx.stroke()
}
onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  initMap()
})
watch(camera, () => renderCanvas(), { deep: true })
watch(projectList, () => initMap(), { deep: true })
// 把selectedList暴露出去给父组件
defineExpose({ selectedList })
</script>
