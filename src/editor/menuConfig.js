// import dataCenter from "/src/editor/comp/dataCenter.vue"
// import tools from "/src/editor/comp/tools.vue"//ref([]) 会有wanning ，不建议这么包着，等于多次引入

//import tools from "@/editor/comp/tools.vue" 错误写法
import { ref } from "vue";
//const imProgressPath = '/src/editor/page/projectProgress.vue'
function lazyLoad(filePath) {
  return new Function(`return import('${filePath}')`)()
}
//如果写成：export const funcName ;//则导入**必须加大括号，名字必须完全对上，不能乱起名**
const menuList = ref([
  {
    id: 1,
    label: "首页",
    icon: "🏠",
  },
  {
    id: 2,
    label: "系统管理",
    icon: "⚙️",
    children: [
      { id: 21, label: "进度管理",page:"/projectProgress",
        //component:()=>import(/* @vite-ignore */'/src/editor/page/projectProgress.vue') 
        component:()=>lazyLoad('/src/editor/page/projectProgress.vue')
      },
      { id: 22, label: "测试Chrome 插件",page:"/proChromePlugin",
        component:()=>import ("/src/editor/page/proChromePlugin.vue")
       },
      { id: 23, label: "菜单管理" },
      { id: 24, label: "项目Shop 管理", page: "/ProjCardShopManagement",
         component:()=>lazyLoad('/src/editor/page/proCardShopProgress.vue') },
      { id: 25, label: "项目测试45° 管理", page: "/ProjCardTemp",
         component:()=>lazyLoad('/src/editor/page/proCardTempMain.vue') }
    ],
  },
  
  {id:5,label:"算法演练",icon:"🤖",
    children:[
      
          {id:511,label:"加油站贪心问题",path:"/GasStationDijkstra",
            //component:()=>import("/src/editor/suanfa/GasStationDijkstra.vue")
            component:()=>lazyLoad('/src/editor/suanfa/GasStationDijkstra.vue')
          },
          {id:512,label:"算1",path:"/multiHeadAlgo",component:()=>lazyLoad('/src/editor/suanfa/multiHeadAlgo.vue')},
          {id:513,label:"多头算法2",path:"/multiHeadAlgo2",component:()=>lazyLoad('/src/editor/suanfa/multiHeadAlgo2.vue')},
        
    ]
  },
  {id:6,label:"时事新闻",icon:"🗺️",
    children:[
      {id:61,label:"四川场景数据",page:"/newsSicuan",component:()=>import("/src/editor/spec_gis/CoordsMap.vue")},
      {id:62,label:"QQ飞车广告",page:"/newsQQCar",component:()=>import("/src/editor/spec_gis/ClassicQQAdv.vue")},
      {id:63,label:"UV 改造",page:"",component:()=>import("/src/editor/spec_gis/ClassicQQAdv.vue")},
      {id:64,label:"Anim 改造",page:"/module_anim",component:()=>import("/src/editor/store/editorLayout.vue")},
      {id:65,label:"Threejs 动画系统",page:"/module_three",component:()=>import("/src/editor/store/flowanim.vue")},

    ]
  },
  {
    id: 3,
    label: "数据中心",
    icon: "📊",
    children: [
      { id: 30, label: "测试页面",
        path: "/projectProgress",
        //component:()=>import(/* @vite-ignore */imProgressPath),
        //component:()=> lazyLoad('/src/editor/page/projectProgress.vue')
       },
      { id: 31, label: "数据统计",
        path: "/data-center",
        component:()=>lazyLoad('/src/editor/comp/dataCenter.vue'),
       },
      { id: 32, label: "模型导出",
        func:"fnExportGlb"
       },
      { id: 33, label: "统计文件夹大小",
        path: "/folder-data-center",
        component:()=>lazyLoad('/src/editor/comp/folderAnalyzeGBar_v2.vue'),
       },
    ],
    path: "/data-center", //这里写也是不行，要写在 children:[] 里
    component:()=>lazyLoad('/src/editor/comp/dataCenter.vue'),

    //z:()=> import("@/editor/comp/dataCenter.vue"),
    //x:()=>import("@/editor/comp/userCenter.vue"),
    //component: () => import(`@/editor/comp/dataCenter.vue`),
  },
  {
    id: 4,
    label: "工具",
    icon: "🔧",
    path: "/tools",
    //component: () => import(`@/editor/comp/tools.vue`),
    //component: () => import(`src/editor/comp/tools.vue`)
    //component: tools//vue ref() 不建议这么包着，有性能问题
    component:()=>lazyLoad('/src/editor/comp/tools.vue')
  },
]);
export default menuList;