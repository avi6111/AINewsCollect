import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
export default defineConfig({
  plugins: [vue()],
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
    open: '/flowlayout-main.html'  // 指定入口
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