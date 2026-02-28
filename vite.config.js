import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Base path untuk deployment ke GitHub Pages:
  // repo: kejiwaan-pkm-sekadau/new2026-v1
  base: '/new2026-v1/',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
