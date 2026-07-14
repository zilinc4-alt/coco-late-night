import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString().replace('T', ' ').slice(0, 19)),
  },
  plugins: [vue()],
  server: { host: '127.0.0.1', port: 5183, strictPort: true },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) {
            return 'vendor-vue'
          }
          if (id.includes('node_modules/pinia')) {
            return 'vendor-pinia'
          }
          if (id.includes('node_modules/vue-router')) {
            return 'vendor-router'
          }
          if (id.includes('node_modules/qrcode')) {
            return 'vendor-qrcode'
          }
          if (id.includes('src/data/shops')) {
            return 'data-shops'
          }
        },
      },
    },
    // 图片资源内联阈值（小于 4KB 的图片转为 base64）
    assetsInlineLimit: 4096,
  },
})
