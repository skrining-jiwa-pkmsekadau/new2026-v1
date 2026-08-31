/**
 * dashboardStore.test.js — Menjaga kebenaran ANGKA yang dilaporkan.
 *
 * Kesalahan di sini tidak memunculkan galat apa pun: dashboard tetap
 * tampil, hanya angkanya salah. Karena laporan ini dikirim ke Dinas
 * Kesehatan, salah urut atau salah hitung berarti salah lapor.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// dashboardStore mengimpor services/supabase, yang menyentuh
// window.localStorage saat modul dimuat. Test ini berjalan di lingkungan
// node tanpa window, dan sengaja TIDAK menyentuh jaringan — yang diuji
// hanyalah logika penyaringan dan pengurutan di sisi klien.
vi.mock('@/services/supabase', () => ({
  db: {
    from: () => ({ select: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }) }) }) }),
    auth: { getSession: async () => ({ data: { session: null } }) },
    rpc: async () => ({ data: null, error: null }),
  },
}))

const { useDashboardStore } = await import('@/stores/dashboardStore')

/** Baris skrining minimal, cukup untuk menguji penyaringan dan urutan. */
const baris = (o) => ({
  id: o.id,
  nama_lengkap: o.nama ?? `Pasien ${o.id}`,
  nik: o.nik ?? null,
  skor_total: o.skor ?? 0,
  usia: o.usia ?? 30,
  tanggal_skrining: o.tanggal ?? '2026-08-01',
  instrumen: o.instrumen ?? 'PHQ4',
  tingkat_risiko: o.risiko ?? 'Low Risk',
  kecamatan: o.kecamatan ?? 'Belitang',
  jenis_kelamin: o.gender ?? 'L',
  nama_sekolah: o.sekolah ?? null,
  jumlah_riwayat: o.jumlahRiwayat ?? 1,
  skrining_ke: o.skriningKe ?? 1,
})

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('sortTabel — urutan angka', () => {
  it('skor_total diurutkan secara numerik, bukan sebagai teks', () => {
    // Inti bug lama: perbandingan teks menempatkan '10' sebelum '9',
    // sehingga pasien berskor tertinggi tidak muncul di urutan teratas.
    const store = useDashboardStore()
    store.semuaData = [
      baris({ id: 1, skor: 9 }),
      baris({ id: 2, skor: 10 }),
      baris({ id: 3, skor: 2 }),
      baris({ id: 4, skor: 12 }),
    ]
    store.dataFilter = [...store.semuaData]

    store.sortTabel('skor_total')
    expect(store.dataFilter.map((d) => d.skor_total)).toEqual([2, 9, 10, 12])

    // Klik kedua membalik arah.
    store.sortTabel('skor_total')
    expect(store.dataFilter.map((d) => d.skor_total)).toEqual([12, 10, 9, 2])
  })

  it('usia juga diurutkan numerik', () => {
    const store = useDashboardStore()
    store.semuaData = [
      baris({ id: 1, usia: 7 }),
      baris({ id: 2, usia: 45 }),
      baris({ id: 3, usia: 9 }),
    ]
    store.dataFilter = [...store.semuaData]
    store.sortTabel('usia')
    expect(store.dataFilter.map((d) => d.usia)).toEqual([7, 9, 45])
  })

  it('skor kosong selalu di bawah, tidak ikut terbalik', () => {
    // Baris cacat tidak boleh menyamar sebagai skor tertinggi saat
    // urutan dibalik ke menurun.
    const store = useDashboardStore()
    store.semuaData = [
      baris({ id: 1, skor: 5 }),
      { ...baris({ id: 2 }), skor_total: null },
      baris({ id: 3, skor: 12 }),
    ]
    store.dataFilter = [...store.semuaData]

    store.sortTabel('skor_total')
    expect(store.dataFilter.at(-1).skor_total).toBeNull()

    store.sortTabel('skor_total')
    expect(store.dataFilter.at(-1).skor_total).toBeNull()
  })

  it('nama diurutkan sebagai teks', () => {
    const store = useDashboardStore()
    store.semuaData = [
      baris({ id: 1, nama: 'Zainal' }),
      baris({ id: 2, nama: 'Ahmad' }),
      baris({ id: 3, nama: 'Monika' }),
    ]
    store.dataFilter = [...store.semuaData]
    store.sortTabel('nama_lengkap')
    expect(store.dataFilter.map((d) => d.nama_lengkap)).toEqual([
      'Ahmad',
      'Monika',
      'Zainal',
    ])
  })

  it('tanggal diurutkan secara kronologis', () => {
    const store = useDashboardStore()
    store.semuaData = [
      baris({ id: 1, tanggal: '2026-08-09' }),
      baris({ id: 2, tanggal: '2026-08-10' }),
      baris({ id: 3, tanggal: '2026-07-31' }),
    ]
    store.dataFilter = [...store.semuaData]
    store.sortTabel('tanggal_skrining')
    expect(store.dataFilter.map((d) => d.tanggal_skrining)).toEqual([
      '2026-07-31',
      '2026-08-09',
      '2026-08-10',
    ])
  })
})

describe('urutan tetap bertahan setelah penyaringan', () => {
  it('terapkanFilter tidak membuang urutan yang sedang aktif', () => {
    // Bug lama: setiap penyaringan mengembalikan urutan ke bawaan,
    // sementara indikator kolom di kepala tabel masih menunjukkan
    // urutan yang sudah tidak berlaku.
    const store = useDashboardStore()
    store.semuaData = [
      baris({ id: 1, skor: 3, kecamatan: 'Belitang' }),
      baris({ id: 2, skor: 11, kecamatan: 'Belitang' }),
      baris({ id: 3, skor: 7, kecamatan: 'Nanga Taman' }),
    ]
    store.dataFilter = [...store.semuaData]

    store.sortTabel('skor_total')
    store.sortTabel('skor_total') // menurun
    store.filterKecamatan = 'Belitang'
    store.terapkanFilter()

    expect(store.dataFilter.map((d) => d.skor_total)).toEqual([11, 3])
  })
})

describe('penyaringan', () => {
  it('menyaring berdasarkan rentang tanggal secara inklusif', () => {
    const store = useDashboardStore()
    store.semuaData = [
      baris({ id: 1, tanggal: '2026-07-31' }),
      baris({ id: 2, tanggal: '2026-08-01' }),
      baris({ id: 3, tanggal: '2026-08-31' }),
      baris({ id: 4, tanggal: '2026-09-01' }),
    ]
    store.filterTglDari = '2026-08-01'
    store.filterTglSampai = '2026-08-31'
    store.terapkanFilter()
    // Urutan bawaan store adalah tanggal_skrining menurun, dan
    // terapkanFilter mempertahankan urutan aktif. Yang diuji di sini
    // adalah keanggotaan hasil saring, bukan urutannya.
    expect(store.dataFilter.map((d) => d.id).sort()).toEqual([2, 3])
  })

  it('menyaring berdasarkan tingkat risiko', () => {
    const store = useDashboardStore()
    store.semuaData = [
      baris({ id: 1, risiko: 'High Risk' }),
      baris({ id: 2, risiko: 'Low Risk' }),
      baris({ id: 3, risiko: 'High Risk' }),
    ]
    store.filterRisiko = 'High Risk'
    store.terapkanFilter()
    expect(store.dataFilter.map((d) => d.id)).toEqual([1, 3])
  })

  it('reset filter memulihkan seluruh baris', () => {
    const store = useDashboardStore()
    store.semuaData = [
      baris({ id: 1, risiko: 'High Risk' }),
      baris({ id: 2, risiko: 'Low Risk' }),
    ]
    store.filterRisiko = 'High Risk'
    store.terapkanFilter()
    expect(store.dataFilter).toHaveLength(1)

    store.resetSemuaFilter()
    expect(store.dataFilter).toHaveLength(2)
  })
})

describe('pagination', () => {
  it('menolak nomor halaman di luar rentang', () => {
    const store = useDashboardStore()
    store.semuaData = Array.from({ length: 25 }, (_, i) => baris({ id: i + 1 }))
    store.dataFilter = [...store.semuaData]
    store.perHalaman = 10

    store.gantiHalaman(3)
    expect(store.halamanAktif).toBe(3)

    store.gantiHalaman(4) // di luar rentang
    expect(store.halamanAktif).toBe(3)

    store.gantiHalaman(0)
    expect(store.halamanAktif).toBe(3)
  })
})
