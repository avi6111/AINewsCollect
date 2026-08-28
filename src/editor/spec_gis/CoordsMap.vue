<!-- <!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Three.js GIS 演示项目</title>

</head>
<body>
<div id="info">Three.js GIS 演示｜鼠标拖拽旋转，滚轮缩放</div>

<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  }
}
</script>


</body>
</html> -->
<template>
  <div id="info">Three.js GIS 演示｜鼠标拖拽旋转，滚轮缩放</div>
  <div class="info">{{ infoText }}</div>
</template>
<script setup>
import { ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

//ref 响应式变量声明后，模板<template>直接写变量名	{{ infoText }}
const infoText = ref("等待接口返回...")//ref 是为了响应式更新，获得了RawImp ,有.value
console.log(infoText)
//=========================== python后端地址 ================================
const BASE_URL = "http://127.0.0.1:8000"
console.log("BASE_URL:", BASE_URL)
async function fetchHelloApi(route="api/hello") {
  try {
    const res = await fetch(`${BASE_URL}/${route}`)
    const json = await res.json()
    // json = {code:0, msg:"hello api"}
    //infoText.value = json.msg
    console.log("接口返回：", json.msg)
    return json.msg
  } catch(err) {
    infoText.value = "接口调用失败：" + err.message
    console.error(err)
  }
}
fetchHelloApi('api/hello').then(msg => {
  infoText.value = msg
})
// const coordGis = fetchHelloApi('api/shp2geojson?file=data/乐山市_gis_osm_water_a_free_1.shp')
// console.log("coordGis:", coordGis)

// ========== 工具函数：WGS84 经纬度转平面坐标（简化墨卡托） ==========
function lngLatToPoint(lng, lat, centerLng, centerLat, scale = 1000) {
  const x = (lng - centerLng) * scale;
  const y = (lat - centerLat) * scale;
  return new THREE.Vector3(x, 0, -y);
}

function addGeoOffset(coords, offsetX, offsetY) {
  if (typeof coords[0] === 'number') {
    return [coords[0] + offsetX, coords[1] + offsetY, ...coords.slice(2)];
  }
  return coords.map(item => addGeoOffset(item, offsetX, offsetY));
}

const debugOptions = {
  mapScale: 800,
  centerLng: 113.28,
  centerLat: 23.115,
  offsetX: 10,
  offsetY: -6
};

const debugHistory = [];
let lastDebugSnapshot = { ...debugOptions };
let restoringDebugOptions = false;

function snapshotDebugOptions() {
  return { ...debugOptions };
}

function sameDebugOptions(left, right) {
  return Object.keys(debugOptions).every(key => left[key] === right[key]);
}

function getCoordinateCenter(coords) {
  const points = [];
  const collectPoints = value => {
    if (typeof value[0] === 'number') {
      points.push(value);
      return;
    }
    value.forEach(collectPoints);
  };
  collectPoints(coords);

  const totals = points.reduce(
    (result, point) => ({ lng: result.lng + point[0], lat: result.lat + point[1] }),
    { lng: 0, lat: 0 }
  );
  return {
    lng: totals.lng / points.length,
    lat: totals.lat / points.length
  };
}

function createCoordinateLabel(text, position) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const fontSize = 24;
  context.font = `${fontSize}px monospace`;
  const textWidth = context.measureText(text).width;
  canvas.width = textWidth + 16;
  canvas.height = fontSize + 16;
  context.font = `${fontSize}px monospace`;
  context.fillStyle = 'rgba(0, 0, 0, 0.75)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.fillText(text, 8, fontSize + 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });
  const label = new THREE.Sprite(material);
  label.position.copy(position);
  label.scale.set(canvas.width / 10, canvas.height / 10, 1);
  scene.add(label);
  coordinateLabels.push(label);
}

// ========== 初始化场景 ==========
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f4f8);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 80, 80);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(50, 100, 50);
scene.add(dirLight);

// 底平面
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0xe6edf3 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ========== 模拟 GIS GeoJSON 面数据（示例多边形） ==========
fetchHelloApi('api/shp2geojson?file=data/乐山市_gis_osm_water_a_free_1.shp').then(coordGis=>{
  //console.log("coordGis:", coordGis)//需要取结构 .features 才是数组；数组每一行字段：id|type|properties|geometry|
  if(coordGis){
    currentGeoJson = coordGis;
    renderGeoJson(coordGis);
  }
})
let currentGeoJson = null;
let featureMeshes = null;
const coordinateLabels = [];
const coordinateLines = [];
const cameraLocations = {
  areaA: null,
  areaB: { lng: 113.315, lat: 23.115 },
  center: null
};
const renderGeoJson = (geojson)=>{
  if (!geojson) return;

  if (featureMeshes) {
    featureMeshes.forEach(mesh => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
  }
  coordinateLabels.forEach(label => {
    scene.remove(label);
    label.material.map.dispose();
    label.material.dispose();
  });
  coordinateLabels.length = 0;
  coordinateLines.forEach(line => {
    scene.remove(line);
    line.geometry.dispose();
    line.material.dispose();
  });
  coordinateLines.length = 0;

  //const coordsList = geojson.features.map(f => f.geometry.coordinates)//提取一下（python端 api返回）
  //console.log("coordsList:", coordsList)
  let gisGeoJson = null;
  gisGeoJson = {
    type: "FeatureCollection",
    // map生成全新features数组，每一项做替换
    features: geojson.features.map((originalFeat, index) => {
      // ============核心替换coordinates============
      // 直接拿原始geometry的type与coordinates，完成替换
      const geoType = originalFeat.geometry.type;
      const geoCoords = addGeoOffset(
        originalFeat.geometry.coordinates,
        debugOptions.offsetX,
        debugOptions.offsetY
      );
      
      
      return {
        type: "Feature",
        properties: {
          name: `区域_${index + 1}`,
        },
        geometry: {
          type: geoType,
          // ✅这里就是替换：把原始坐标赋值给新对象coordinates
          coordinates: geoCoords
        }
      };
    })
  };
  //console.log('实际接口：', gisGeoJson.features[0].geometry.coordinates)
  
  const c = {
    ...geojson.features[0].geometry,
    //coordinates:geojson.features[0].geometry.coordinates
    coordinates: addGeoOffset(
      geojson.features[0].geometry.coordinates,
      debugOptions.offsetX,
      debugOptions.offsetY
    )
  };

  console.log('实际接口：', c)

  //太近，根本绘制不出
  // c.coordinates = [[
  //   [113.5173571,23.8835787],
  //   [113.517561,23.8835973],
  //   [113.5180384,23.8833927],
  //   [113.5180974,23.8832531],
  //   [113.5182905,23.8831601]
  // ]]
  //改了，但是就是和实际预期点距离很远
  c.coordinates = [[
    [113.71,23.87],
    [113.61,23.73],
    [113.84,23.27],
    [113.74,23.31],
    [113.05,23.01]
  ]]
  //正常
  // c.coordinates = [[
  //             [113.25, 23.10],
  //             [113.28, 23.10],
  //             [113.28, 23.13],
  //             [113.25, 23.13],
  //             [113.25, 23.10]
  //           ]];
  cameraLocations.areaA = getCoordinateCenter(c.coordinates);
  cameraLocations.center = {
    lng: debugOptions.centerLng,
    lat: debugOptions.centerLat
  };
  
  if(1==1)
  {
    gisGeoJson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "区域A" },
          geometry: {
            type: "Polygon",
            // coordinates: [[
            //   [113.25, 23.10],
            //   [113.28, 23.10],
            //   [113.28, 23.13],
            //   [113.25, 23.13],
            //   [113.25, 23.10]
            // ]]
            coordinates: c.coordinates

          } 
        },
        {
          type: "Feature",
          properties: { name: "区域B" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [113.30, 23.10],
              [113.33, 23.10],
              [113.33, 23.13],
              [113.30, 23.13],
              [113.30, 23.10]
            ]]
          }
        }
      ]
    };
  }
  console.log(typeof gisGeoJson.features)
  console.log('实际接口：', gisGeoJson.features[0].geometry.coordinates)
  console.log('同步',[[
              [113.25, 23.10],
              [113.28, 23.10],
              [113.28, 23.13],
              [113.25, 23.13],
              [113.25, 23.10]
            ]])
  // 地图中心点
  const centerLng = debugOptions.centerLng;
  const centerLat = debugOptions.centerLat;
  const mapScale = debugOptions.mapScale;
  //const mapScale = 1;

  // 存放所有要素，用于鼠标拾取
  featureMeshes = [];

  // 渲染 GeoJSON 面要素
  gisGeoJson.features.forEach(feature => {
    const coords = feature.geometry.coordinates[0];
    const shape = new THREE.Shape();
    const linePoints = [];

    coords.forEach(([lng, lat], idx) => {
      const pt = lngLatToPoint(lng, lat, centerLng, centerLat, mapScale);
      linePoints.push(new THREE.Vector3(pt.x, 3, pt.z));
      createCoordinateLabel(`[${lng.toFixed(4)}, ${lat.toFixed(4)}]`, new THREE.Vector3(pt.x, 2, pt.z));
      if (idx === 0) shape.moveTo(pt.x, pt.z);
      else shape.lineTo(pt.x, pt.z);
    });

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const coordinateLine = new THREE.LineLoop(lineGeometry, lineMaterial);
    scene.add(coordinateLine);
    coordinateLines.push(coordinateLine);

    const extrudeSettings = { depth: 3, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({
      color: Math.random() * 0x666666 + 0x888888,
      transparent: true,
      opacity: 0.7
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = feature.properties;
    scene.add(mesh);
    featureMeshes.push(mesh);
  });
}

const gui = new GUI({ title: 'GIS 调试' });
function handleDebugChange() {
  renderGeoJson(currentGeoJson);
}

function finishDebugChange() {
  const currentSnapshot = snapshotDebugOptions();
  if (!restoringDebugOptions && !sameDebugOptions(currentSnapshot, lastDebugSnapshot)) {
    debugHistory.push(lastDebugSnapshot);
    lastDebugSnapshot = currentSnapshot;
  }
}

const debugControllers = [
  gui.add(debugOptions, 'mapScale', 1, 1000, 1),
  gui.add(debugOptions, 'centerLng', 100, 120, 0.001),
  gui.add(debugOptions, 'centerLat', 20, 35, 0.001),
  gui.add(debugOptions, 'offsetX', -20, 20, 0.001),
  gui.add(debugOptions, 'offsetY', -20, 20, 0.001)
];
debugControllers.forEach(controller => {
  controller.onChange(handleDebugChange);
  controller.onFinishChange(finishDebugChange);
});

function moveCameraTo(location) {
  if (!location) return;

  const target = lngLatToPoint(
    location.lng,
    location.lat,
    debugOptions.centerLng,
    debugOptions.centerLat,
    debugOptions.mapScale
  );
  controls.target.set(target.x, 0, target.z);
  camera.position.set(target.x, 80, target.z + 80);
  controls.update();
}

const cameraActions = {
  区域A: () => moveCameraTo(cameraLocations.areaA),
  区域B: () => moveCameraTo(cameraLocations.areaB),
  中心: () => moveCameraTo(cameraLocations.center)
};
const cameraFolder = gui.addFolder('镜头跳转');
cameraFolder.add(cameraActions, '区域A');
cameraFolder.add(cameraActions, '区域B');
cameraFolder.add(cameraActions, '中心');

window.addEventListener('keydown', event => {
  if (!(event.ctrlKey && event.key.toLowerCase() === 'z') || debugHistory.length === 0) return;

  event.preventDefault();
  restoringDebugOptions = true;
  Object.assign(debugOptions, debugHistory.pop());
  lastDebugSnapshot = snapshotDebugOptions();
  debugControllers.forEach(controller => controller.updateDisplay());
  restoringDebugOptions = false;
  renderGeoJson(currentGeoJson);
});

// ========== 鼠标拾取要素 ==========
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ========== 渲染循环 ==========
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if(featureMeshes === undefined||featureMeshes===null) return;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(featureMeshes);
  if (intersects.length > 0) {
    const info = intersects[0].object.userData;
    ref('info').innerText = `选中：${info.name}`;
  } else {
    ref('info').innerText = "Three.js GIS 演示｜鼠标拖拽旋转，滚轮缩放";
  }

  renderer.render(scene, camera);
}
animate();

// 窗口自适应
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
</script>

<style>
* { margin: 0; padding: 0; }
body { overflow: hidden; }
.info {
    position: absolute;
    top: 10px; left: 10px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    padding: 8px 12px;
    border-radius: 4px;
    z-index: 10;
}
</style>