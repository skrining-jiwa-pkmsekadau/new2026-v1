import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/Landing.vue'),
  },
  {
    path: '/identitas',
    name: 'Identitas',
    component: () => import('@/views/Identitas.vue'),
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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
