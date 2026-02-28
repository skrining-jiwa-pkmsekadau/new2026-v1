import { ref } from 'vue'

/**
 * Shared toast state — singleton pattern agar semua komponen
 * menggunakan toast list yang sama.
 */
const toasts = ref([])
let nextId = 0

/**
 * Composable untuk menampilkan notifikasi toast.
 * Menggantikan fungsi global showToast() dari kode vanilla.
 */
export function useToast() {
  const icons = {
    success: 'check_circle',
    error:   'error',
    info:    'info',
    warning: 'warning',
  }

  /**
   * @param {string} msg  - Pesan yang ditampilkan
   * @param {'info'|'success'|'error'|'warning'} type - Tipe toast
   * @param {number} ms   - Durasi tampil dalam milidetik
   */
  function showToast(msg, type = 'info', ms = 3500) {
    const id = nextId++
    toasts.value.push({ id, msg, type, icon: icons[type] || 'info' })

    setTimeout(() => {
      const idx = toasts.value.findIndex((t) => t.id === id)
      if (idx !== -1) toasts.value.splice(idx, 1)
    }, ms)
  }

  return { toasts, showToast }
}
