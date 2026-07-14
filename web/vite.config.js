import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const now = new Date()
const hh = String(now.getHours()).padStart(2, '0')
const mm = String(now.getMinutes()).padStart(2, '0')

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v' + pkg.version),
    __BUILD_TIME__: JSON.stringify(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${hh}:${mm}`),
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
    assetsInlineLimit: 4096,
  },
})
