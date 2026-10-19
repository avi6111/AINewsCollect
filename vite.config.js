import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
//import { fileURLToPath } from 'url'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
// 引入tailwind v4 vite插件
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  base: './',  // 关键！确保资源引用是相对路径
  plugins: [vue(),crx({ manifest }),tailwindcss() // 注册tailwind
  ],
  // resolve: {
  //   alias: {
  //     // 把 three/addons 映射到实际的 npm 包路径
  //     'three/addons': path.resolve(__dirname, 'node_modules/three/examples/jsm'),
  //     // 保险起见，也加上 three 本身的别名
  //     'three': path.resolve(__dirname, 'node_modules/three/build/three.module.js')
  //   }
  // },
  resolve: {
    alias: {

      find: /^three$/,
      
      replacement: path.resolve(__dirname, 'node_modules/three')

    }
  },
  server: {
    port: 5173,
    //open: true
    open: '/#/newsQQCar',  // 指定入口
    proxy: {
      '/tropy-api': {
        target: 'http://127.0.0.1:2019',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tropy-api/, '')
      },
      '/newapi': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
          // 不需要 rewrite，因为后端路由本身也是 /newapi/...
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './flowlayout-main.html'  // 构建入口
      },
      // external: [//npm run dev 模式，写了也没用；build 模式才会生效；
      //   'three',
      //   'three/addons/exporters/GLTFExporter.js'
      // ], // 将 three 标记为外部依赖(走CDN 需要写)
    }
  }
})