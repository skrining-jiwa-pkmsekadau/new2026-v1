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

  // Usia baru dianggap bertambah H+1 setelah tanggal ulang tahun.
  if (
    skrg.getMonth() < lahir.getMonth() ||
    (skrg.getMonth() === lahir.getMonth() && skrg.getDate() <= lahir.getDate())
  ) {
    usia--
  }

  return Math.max(0, usia)
}

/**
 * Format tanggal ke bahasa Indonesia (contoh: "27 Januari 2026").
 *
 * Masukan yang diharapkan adalah tanggal saja ('YYYY-MM-DD'), yang oleh
 * JavaScript diurai sebagai tengah malam UTC. Karena itu pembacaannya
 * memakai getUTC* — memakai getter lokal justru akan menggeser tanggal
 * satu hari ke belakang di zona waktu Indonesia.
 *
 * JANGAN mengubahnya menjadi getter lokal tanpa juga menangani masukan
 * bertimestamp penuh.
 *
 * @param {string} str - Tanggal ISO, umumnya 'YYYY-MM-DD'
 * @returns {string} Tanggal terformat, atau '-' bila kosong
 */
export function formatTanggalID(str) {
  if (!str) return '-'

  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]

  const d = new Date(str)
  if (isNaN(d.getTime())) return '-'
  return `${d.getUTCDate()} ${bulan[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/**
 * Mengubah objek Date menjadi string 'YYYY-MM-DD' menurut waktu LOKAL.
 *
 * JANGAN memakai toISOString() untuk ini: fungsi itu selalu mengonversi
 * ke UTC. Sekadau berada di UTC+7 (WIB), sehingga setiap skrining antara
 * 00:00 dan 06:59 WIB akan tercatat sebagai HARI SEBELUMNYA.
 *
 * Tanggal ini dipakai sebagai tanggal_skrining, dasar gate jeda 90 hari,
 * dan penyaring seluruh laporan periode — salah satu hari menggeser
 * semuanya.
 *
 * @param {Date} d
 * @returns {string} 'YYYY-MM-DD'
 */
export function keTanggalLokal(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${t}`
}

/**
 * Tanggal hari ini dalam format 'YYYY-MM-DD' menurut waktu lokal
 * perangkat.
 *
 * @returns {string}
 */
export function hariIni() {
  return keTanggalLokal(new Date())
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
    .replace(/'/g, '&#39;')
}
