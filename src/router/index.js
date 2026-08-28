import { createRouter, createWebHashHistory } from 'vue-router'
import { db } from '@/services/supabase'
import { useSkriningStore } from '@/stores/skriningStore'
const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/Landing.vue'),
  },
  {
    // Gerbang persetujuan pelindungan data pribadi (UU 27/2022).
    // Wajib dilewati sebelum /identitas.
    path: '/consent',
    name: 'Consent',
    component: () => import('@/views/Consent.vue'),
  },
  {
    // Dapat dibuka kapan saja tanpa melewati gerbang persetujuan.
    path: '/privasi',
    name: 'Privasi',
    component: () => import('@/views/Privasi.vue'),
  },
  {
    path: '/identitas',
    name: 'Identitas',
    component: () => import('@/views/Identitas.vue'),
    meta: { perluConsent: true },
  },
  {
    path: '/kuesioner',
    name: 'Kuesioner',
    component: () => import('@/views/Kuesioner.vue'),
  },
  {
    path: '/review',
    name: 'Review',
    component: () => import('@/views/Review.vue'),
  },
  {
    path: '/hasil',
    name: 'Hasil',
    component: () => import('@/views/Hasil.vue'),
  },
  {
    path: '/rujukan',
    name: 'SuratRujukan',
    component: () => import('@/views/SuratRujukan.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // Gerbang persetujuan: data pribadi spesifik tidak boleh dikumpulkan
  // sebelum pasien menyetujui pemberitahuan privasi (UU 27/2022 Pasal 4).
  // Penjagaan di router memastikan tautan langsung ke #/identitas pun
  // tidak dapat melewatinya.
  if (to.meta.perluConsent) {
    const store = useSkriningStore()
    if (!store.consentVersion) {
      return next('/consent')
    }
  }

  if (to.meta.requiresAuth) {
    const { data: { session } } = await db.auth.getSession()
    if (!session) {
      return next('/login')
    }

    // Cek role admin via RPC is_admin
    const { data: isAdmin, error } = await db.rpc('is_admin')
    if (error || !isAdmin) {
      // User login tapi bukan admin — redirect ke login
      await db.auth.signOut()
      return next('/login')
    }
  }
  next()
})

export default router
