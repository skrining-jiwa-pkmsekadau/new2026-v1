/**
 * helpers.test.js — Mengunci perhitungan usia, tanggal, dan pemilihan
 * instrumen. Ketiganya menentukan kuesioner mana yang diterima pasien
 * dan tanggal apa yang tercatat sebagai tanggal skrining.
 *
 * Rujukan juknis:
 *  - MMYS anak 7-9 th, MMYS remaja 10-18 th : KJ.02.02/B.III/1107/2025 hal. 4
 *  - PHQ-4 usia >= 18 th (dewasa & lansia)  : KJ.02.05/B.III/92/2025 hal. 3
 *  - EPDS ibu hamil / nifas                 : KJ.02.05/B.III/92/2025 hal. 7
 *
 * CATATAN batas usia 18: juknis tumpang tindih (MMYS remaja "10-18",
 * PHQ-4 ">= 18"). Aplikasi memilih 18 -> PHQ-4. Keputusan itu dikunci
 * di sini agar tidak berubah tanpa sengaja.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { hitungUsia, formatTanggalID, hariIni, nentukanInstrumen, escHtml } from '@/utils/helpers'

afterEach(() => {
  vi.useRealTimers()
})

/** Memaku waktu sistem ke satu titik agar perhitungan usia deterministik. */
function bekukanWaktu(iso) {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(iso))
}

describe('hitungUsia', () => {
  it('menghitung usia penuh saat ulang tahun sudah lewat tahun ini', () => {
    bekukanWaktu('2026-08-26T10:00:00+07:00')
    expect(hitungUsia('2000-01-15')).toBe(26)
  })

  it('belum menambah usia bila ulang tahun belum tiba', () => {
    bekukanWaktu('2026-08-26T10:00:00+07:00')
    expect(hitungUsia('2000-12-31')).toBe(25)
  })

  // Keputusan yang disengaja (lihat komentar di src/utils/helpers.js:19):
  // usia baru dianggap bertambah H+1 setelah tanggal ulang tahun.
  // Konsekuensi: pada hari ulang tahunnya, seseorang masih dihitung
  // usia lama, sehingga pemilihan instrumen di batas umur (mis. tepat
  // berulang tahun ke-10 atau ke-18) memakai band sebelumnya untuk
  // satu hari itu.
  it('pada hari ulang tahun masih usia lama, bertambah H+1', () => {
    bekukanWaktu('2026-08-26T10:00:00+07:00')
    expect(hitungUsia('2000-08-26')).toBe(25)
    expect(hitungUsia('2000-08-25')).toBe(26)
  })

  it('sehari sebelum ulang tahun belum bertambah', () => {
    bekukanWaktu('2026-08-26T10:00:00+07:00')
    expect(hitungUsia('2000-08-27')).toBe(25)
  })

  it('tanggal lahir kosong / tidak valid → 0', () => {
    expect(hitungUsia('')).toBe(0)
    expect(hitungUsia(null)).toBe(0)
    expect(hitungUsia(undefined)).toBe(0)
    expect(hitungUsia('bukan-tanggal')).toBe(0)
  })

  it('tanggal lahir di masa depan → 0 (tidak menghasilkan usia negatif)', () => {
    bekukanWaktu('2026-08-26T10:00:00+07:00')
    expect(hitungUsia('2030-01-01')).toBe(0)
  })

  // Batas kewajaran: tidak ada penolakan usia ekstrem di helper maupun
  // di form (Identitas.vue hanya menolak usia < 7). Dikunci sebagai
  // perilaku saat ini; validasi batas atas masuk daftar perbaikan.
  it('[BELUM DIVALIDASI] usia sangat tua tetap diterima', () => {
    bekukanWaktu('2026-08-26T10:00:00+07:00')
    expect(hitungUsia('1900-01-01')).toBe(126)
  })
})

describe('nentukanInstrumen — pemetaan usia ke instrumen', () => {
  it('usia di bawah 7 tahun tidak memenuhi syarat', () => {
    expect(nentukanInstrumen(0, 'L', false)).toBeNull()
    expect(nentukanInstrumen(6, 'P', false)).toBeNull()
  })

  it.each([7, 8, 9])('usia %i → MMYS_ANAK (juknis: 7-9 tahun)', (usia) => {
    expect(nentukanInstrumen(usia, 'L', false)).toBe('MMYS_ANAK')
    expect(nentukanInstrumen(usia, 'P', false)).toBe('MMYS_ANAK')
  })

  it.each([10, 13, 17])('usia %i → MMYS_REMAJA', (usia) => {
    expect(nentukanInstrumen(usia, 'L', false)).toBe('MMYS_REMAJA')
  })

  // Batas paling rawan. Juknis tumpang tindih di usia 18; aplikasi memilih PHQ-4.
  it('batas 17/18: 17 → MMYS_REMAJA, 18 → PHQ4', () => {
    expect(nentukanInstrumen(17, 'L', false)).toBe('MMYS_REMAJA')
    expect(nentukanInstrumen(18, 'L', false)).toBe('PHQ4')
  })

  it.each([18, 40, 65, 90])('usia %i → PHQ4 (dewasa & lansia)', (usia) => {
    expect(nentukanInstrumen(usia, 'L', false)).toBe('PHQ4')
  })

  it('perempuan hamil/nifas usia >= 13 → EPDS, mengalahkan pemetaan usia', () => {
    expect(nentukanInstrumen(13, 'P', true)).toBe('EPDS')
    expect(nentukanInstrumen(17, 'P', true)).toBe('EPDS')
    expect(nentukanInstrumen(28, 'P', true)).toBe('EPDS')
  })

  it('laki-laki tidak pernah diarahkan ke EPDS walau flag hamil menyala', () => {
    // Flag hamil hanya boleh berlaku untuk gender P.
    expect(nentukanInstrumen(28, 'L', true)).toBe('PHQ4')
    expect(nentukanInstrumen(15, 'L', true)).toBe('MMYS_REMAJA')
  })

  it('perempuan hamil di bawah 13 tahun tidak diarahkan ke EPDS', () => {
    expect(nentukanInstrumen(9, 'P', true)).toBe('MMYS_ANAK')
    expect(nentukanInstrumen(12, 'P', true)).toBe('MMYS_REMAJA')
  })

  // Tidak ada batas usia atas untuk EPDS. Secara klinis mustahil, tetapi
  // saat ini diterima; masuk daftar perbaikan validasi.
  it('[BELUM DIVALIDASI] perempuan lanjut usia dengan flag hamil tetap ke EPDS', () => {
    expect(nentukanInstrumen(80, 'P', true)).toBe('EPDS')
  })
})

describe('formatTanggalID', () => {
  it('memformat tanggal ISO ke bahasa Indonesia', () => {
    expect(formatTanggalID('2026-01-27')).toBe('27 Januari 2026')
    expect(formatTanggalID('2026-12-01')).toBe('1 Desember 2026')
  })

  it('nilai kosong → "-"', () => {
    expect(formatTanggalID('')).toBe('-')
    expect(formatTanggalID(null)).toBe('-')
    expect(formatTanggalID(undefined)).toBe('-')
  })

  it('semua nama bulan benar', () => {
    const nama = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ]
    nama.forEach((bulan, i) => {
      const mm = String(i + 1).padStart(2, '0')
      expect(formatTanggalID(`2026-${mm}-15`)).toBe(`15 ${bulan} 2026`)
    })
  })
})

describe('hariIni', () => {
  it('mengembalikan format YYYY-MM-DD', () => {
    expect(hariIni()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('siang hari WIB menghasilkan tanggal lokal yang benar', () => {
    bekukanWaktu('2026-08-26T12:00:00+07:00')
    expect(hariIni()).toBe('2026-08-26')
  })

  /**
   * BUG TIMEZONE — dikunci pada perilaku saat ini.
   *
   * hariIni() memakai toISOString() yang selalu UTC. Sekadau ada di
   * UTC+7 (WIB), jadi setiap skrining antara 00:00-06:59 WIB tercatat
   * sebagai HARI SEBELUMNYA. Tanggal ini dipakai untuk tanggal_skrining,
   * gate jeda 90 hari, dan seluruh laporan periode.
   *
   * Test ini SENGAJA menegaskan perilaku salah agar perbaikannya nanti
   * terlihat sebagai perubahan yang disengaja, bukan kebetulan.
   */
  it('[BUG] pukul 06:00 WIB masih tercatat sebagai tanggal kemarin (UTC)', () => {
    bekukanWaktu('2026-08-26T06:00:00+07:00') // = 2026-08-25T23:00Z
    expect(hariIni()).toBe('2026-08-25')
  })

  it('[BUG] pukul 07:00 WIB baru berganti ke tanggal yang benar', () => {
    bekukanWaktu('2026-08-26T07:00:00+07:00') // = 2026-08-26T00:00Z
    expect(hariIni()).toBe('2026-08-26')
  })
})

describe('escHtml', () => {
  it('meloloskan kelima karakter berbahaya', () => {
    expect(escHtml('&')).toBe('&amp;')
    expect(escHtml('<')).toBe('&lt;')
    expect(escHtml('>')).toBe('&gt;')
    expect(escHtml('"')).toBe('&quot;')
    expect(escHtml("'")).toBe('&#39;')
  })

  it('mengganti & lebih dulu sehingga tidak terjadi double-encoding', () => {
    // Kalau urutannya salah, '<' akan menjadi '&amp;lt;'.
    expect(escHtml('<b>')).toBe('&lt;b&gt;')
    expect(escHtml('&lt;')).toBe('&amp;lt;')
  })

  it('menetralkan payload script', () => {
    expect(escHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    )
  })

  it('menetralkan payload pemutus atribut', () => {
    expect(escHtml('" onerror="alert(1)')).toBe('&quot; onerror=&quot;alert(1)')
  })

  it('null / undefined / angka diubah menjadi string aman', () => {
    expect(escHtml(null)).toBe('')
    expect(escHtml(undefined)).toBe('')
    expect(escHtml(0)).toBe('0')
    expect(escHtml(123)).toBe('123')
  })

  it('nama pasien dengan tanda kutip tetap terbaca', () => {
    // Kasus nyata: nama Indonesia memakai apostrof.
    expect(escHtml("Ma'ruf")).toBe('Ma&#39;ruf')
  })
})
