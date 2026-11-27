import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { createPaperApiPlugin } from './scripts/paper-search.mjs'

// 运行时按原路径访问的静态资源：画廊数据、图片与 forge 模块（如 /forge/pptx-template.json）。
// Vite 不处理它们，构建结束后原样复制进 dist。
const RUNTIME_STATIC = ['assets/figures.js', 'assets/subfigures.js', 'images', 'forge']

function copyRuntimeStatic(): Plugin {
  let outDir = 'dist'
  return {
    name: 'copy-runtime-static',
    apply: 'build',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir) },
    closeBundle() {
      for (const p of RUNTIME_STATIC) {
        fs.cpSync(path.resolve(__dirname, p), path.join(outDir, p), { recursive: true })
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), copyRuntimeStatic(), createPaperApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@forge': path.resolve(__dirname, './forge'),
      '@assets': path.resolve(__dirname, './assets')
    }
  },
  server: {
    port: 8000,
    host: '127.0.0.1'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
