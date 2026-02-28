/**
 * helpers.js — Fungsi utilitas umum untuk SSJ
 */

/**
 * Menghitung usia berdasarkan tanggal lahir
 * @param {string} tglLahir - Format YYYY-MM-DD
 * @returns {number} Usia dalam tahun
 */
export function hitungUsia(tglLahir) {
  if (!tglLahir) return 0

  const lahir = new Date(tglLahir)
  if (isNaN(lahir.getTime()) || lahir > new Date()) return 0

  const skrg = new Date()
  let usia = skrg.getFullYear() - lahir.getFullYear()

  if (
    skrg.getMonth() < lahir.getMonth() ||
    (skrg.getMonth() === lahir.getMonth() && skrg.getDate() < lahir.getDate())
  ) {
    usia--
  }

  return usia
}

/**
 * Format tanggal ke format Indonesia (contoh: "27 Januari 2026")
 * @param {string} str - ISO date string
 * @returns {string} Tanggal terformat
 */
export function formatTanggalID(str) {
  if (!str) return '-'

  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]

  const d = new Date(str)
  return `${d.getUTCDate()} ${bulan[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
 * @returns {string}
 */
export function hariIni() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Menentukan instrumen skrining berdasarkan usia, gender, dan status kehamilan
 * @param {number} usia
 * @param {string} gender - 'L' atau 'P'
 * @param {boolean} hamilNifas
 * @returns {string|null} Kode instrumen atau null jika tidak memenuhi syarat
 */
export function nentukanInstrumen(usia, gender, hamilNifas) {
  if (gender === 'P' && usia >= 13 && hamilNifas) return 'EPDS'
  if (usia >= 7 && usia <= 9)  return 'MMYS_ANAK'
  if (usia >= 10 && usia <= 17) return 'MMYS_REMAJA'
  if (usia >= 18) return 'PHQ4'
  return null
}

/**
 * Sanitasi string untuk mencegah XSS
 * @param {string} str
 * @returns {string}
 */
export function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
