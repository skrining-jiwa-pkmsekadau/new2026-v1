import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Base path:
  // - GitHub Pages: '/new2026-v1/'
  // - Vercel/lainnya: '/'
  base: process.env.VITE_BASE_PATH || '/',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
