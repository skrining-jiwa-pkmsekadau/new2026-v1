import { ref } from 'vue'

/**
 * Status toast bersama — pola singleton agar seluruh komponen memakai
 * daftar toast yang sama.
 */
const toasts = ref([])
let nextId = 0

/** Pencatat timer per toast, agar dapat dibersihkan saat dibuang manual. */
const timer = new Map()

const icons = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning',
}

/**
 * Durasi tampil baku, dibedakan menurut tingkat kepentingan.
 *
 * Galat perlu waktu baca lebih lama: pesan validasi formulir di aplikasi
 * ini HANYA disampaikan lewat toast, jadi bila hilang terlalu cepat
 * pengguna tidak tahu apa yang salah. Pembaca layar juga butuh waktu
 * untuk mengumumkannya.
 */
const DURASI = {
  error: 6000,
  warning: 5000,
  success: 3500,
  info: 3500,
}

function buang(id) {
  const t = timer.get(id)
  if (t) {
    clearTimeout(t)
    timer.delete(id)
  }
  const idx = toasts.value.findIndex((x) => x.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

/**
 * Composable untuk menampilkan notifikasi toast.
 */
export function useToast() {
  /**
   * @param {string} msg - Pesan yang ditampilkan
   * @param {'info'|'success'|'error'|'warning'} type - Tipe toast
   * @param {number} [ms] - Durasi tampil; bila kosong memakai DURASI per tipe
   */
  function showToast(msg, type = 'info', ms) {
    const id = nextId++
    const durasi = ms ?? DURASI[type] ?? DURASI.info

    toasts.value.push({ id, msg, type, icon: icons[type] || 'info' })
    timer.set(id, setTimeout(() => buang(id), durasi))
    return id
  }

  /** Buang satu toast lebih awal, misalnya saat ditutup pengguna. */
  function tutupToast(id) {
    buang(id)
  }

  /** Bersihkan seluruh toast beserta timernya. */
  function bersihkanToast() {
    for (const t of timer.values()) clearTimeout(t)
    timer.clear()
    toasts.value = []
  }

  return { toasts, showToast, tutupToast, bersihkanToast }
}
