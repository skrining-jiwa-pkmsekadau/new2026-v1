import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Zona waktu untuk test dipaku ke WIB (Sekadau, Kalimantan Barat).
// hitungUsia() dan hariIni() memakai waktu lokal, jadi tanpa ini hasil
// test akan berbeda antara mesin developer dan runner CI yang ber-UTC.
process.env.TZ = process.env.TZ || 'Asia/Pontianak'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Base path. Hosting resmi adalah Vercel, yang menyajikan dari root,
  // jadi nilai bakunya '/'. VITE_BASE_PATH dipertahankan agar aplikasi
  // masih dapat dibangun untuk subdirektori bila diperlukan.
  base: process.env.VITE_BASE_PATH || '/',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    env: { TZ: 'Asia/Pontianak' },
  },
})
