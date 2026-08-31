import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/services/supabase'
import { hitungSkor } from '@/utils/skoring'

function normalisasiHasilPanduan(record) {
  if (!Array.isArray(record?.jawaban)) return record

  const hasil = hitungSkor(record.instrumen, record.jawaban)
  if (!hasil) return record

  return {
    ...record,
    skor_total: hasil.skor_total,
    skor_detail: hasil.skor_detail,
    tingkat_risiko: hasil.risk_level,
    kesimpulan_klinis: hasil.kesimpulan_klinis,
    rekomendasi: hasil.rekomendasi_list,
  }
}

function tambahMetadataRiwayat(records) {
  const groups = new Map()
  records.forEach((record) => {
    const nik = record?.nik || `__tanpa_nik_${record?.id || Math.random()}`
    if (!groups.has(nik)) groups.set(nik, [])
    groups.get(nik).push(record)
  })

  groups.forEach((items) => {
    items.sort((a, b) => new Date(a.tanggal_skrining) - new Date(b.tanggal_skrining))
    const total = items.length
    items.forEach((item, index) => {
      item.skrining_ke = index + 1
      item.jumlah_riwayat = total
    })
  })

  return records
}
export const useDashboardStore = defineStore('dashboard', () => {
  // ── State ──
  const adminUser     = ref(null)
  const adminSession  = ref(null)

  const semuaData     = ref([])
  const dataFilter    = ref([])
  const isLoading     = ref(false)

  // Pagination
  const halamanAktif  = ref(1)
  const perHalaman    = ref(10)

  // Sorting
  const sortKolom     = ref('tanggal_skrining')
  const sortAsc       = ref(false)

// Filters
  const filterCari     = ref('')
  const filterInstr    = ref('')
  const filterRisiko   = ref('')
  const filterTglDari  = ref('')
  const filterTglSampai= ref('')
  const filterKecamatan= ref('')
  const filterGender   = ref('')
  const filterSekolah  = ref('')
  const filterRiwayat  = ref('')

  // ── Actions ──

  async function cekSession() {
    const { data: { session } } = await db.auth.getSession()
    if (session) {
      adminUser.value    = session.user
      adminSession.value = session
    }
  }

  async function login(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password })
    if (error) throw error
    adminUser.value    = data.user
    adminSession.value = data.session
    return data
  }

  async function logout() {
    await db.auth.signOut()
    adminUser.value    = null
    adminSession.value = null
    semuaData.value    = []
    dataFilter.value   = []
  }

  async function fetchSemuaData() {
    isLoading.value = true
    try {
      const { data, error } = await db
        .from('screenings')
        .select('*')
        .eq('is_valid', true)
        .order('tanggal_skrining', { ascending: false })
      if (error) throw error
      semuaData.value  = tambahMetadataRiwayat((data || []).map(normalisasiHasilPanduan))
      dataFilter.value = [...semuaData.value]
      halamanAktif.value = 1
    } catch (err) {
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function hapusRecord(id) {
    const { error } = await db.from('screenings').delete().eq('id', id)
    if (error) throw error
    semuaData.value  = semuaData.value.filter(d => d.id !== id)
    dataFilter.value = dataFilter.value.filter(d => d.id !== id)
    // Fix halaman
    const maxHal = Math.ceil(dataFilter.value.length / perHalaman.value)
    if (halamanAktif.value > maxHal && maxHal > 0) halamanAktif.value = maxHal
  }

  function terapkanFilter() {
    dataFilter.value = semuaData.value.filter(d => {
      const cocokCari   = !filterCari.value || (d.nama_lengkap||'').toLowerCase().includes(filterCari.value) || (d.nik||'').includes(filterCari.value)
      const cocokInstr  = !filterInstr.value || d.instrumen === filterInstr.value
      const cocokRisiko = !filterRisiko.value || d.tingkat_risiko === filterRisiko.value
      const tglData     = d.tanggal_skrining ? String(d.tanggal_skrining).slice(0,10) : ''
      const cocokDari   = !filterTglDari.value || tglData >= filterTglDari.value
      const cocokSampai = !filterTglSampai.value || tglData <= filterTglSampai.value
      const cocokKec    = !filterKecamatan.value || d.kecamatan === filterKecamatan.value
      const cocokGender = !filterGender.value || d.jenis_kelamin === filterGender.value
      const cocokSekolah= !filterSekolah.value || (d.nama_sekolah === filterSekolah.value)
      const cocokRiwayat= !filterRiwayat.value || (filterRiwayat.value === 'ulang' ? (d.jumlah_riwayat || 1) > 1 : (d.skrining_ke || 1) === 1)
      
      return cocokCari && cocokInstr && cocokRisiko && cocokDari && cocokSampai && cocokKec && cocokGender && cocokSekolah && cocokRiwayat
    })
    halamanAktif.value = 1
    // Pertahankan urutan yang sedang aktif; tanpa ini indikator kolom
    // di kepala tabel menunjukkan urutan yang tidak lagi berlaku.
    urutkanDataFilter()
  }

  /** Kolom yang nilainya angka dan harus dibandingkan secara numerik. */
  const KOLOM_ANGKA = new Set(['skor_total', 'usia', 'jumlah_riwayat', 'skrining_ke'])

  /** Kolom tanggal: string 'YYYY-MM-DD' sudah urut secara leksikal. */
  const KOLOM_TANGGAL = new Set(['tanggal_skrining', 'tanggal_lahir'])

  /** true bila nilai kolom tidak dapat dipakai untuk mengurutkan. */
  function nilaiKosong(baris, kolom) {
    const v = baris[kolom]
    if (v === null || v === undefined || v === '') return true
    if (KOLOM_ANGKA.has(kolom)) return Number.isNaN(Number(v))
    return false
  }

  /**
   * Bandingkan dua baris pada satu kolom, TANPA memperhitungkan arah.
   *
   * Sebelumnya semua kolom dibandingkan sebagai teks, sehingga
   * skor_total terurut salah: '10' dianggap lebih kecil daripada '9'.
   * Untuk kolom skor dan usia, itu berarti pasien dengan skor tertinggi
   * tidak muncul di urutan teratas.
   */
  function bandingkan(a, b, kolom) {
    if (KOLOM_ANGKA.has(kolom)) {
      return Number(a[kolom]) - Number(b[kolom])
    }

    const sa = String(a[kolom] ?? '')
    const sb = String(b[kolom] ?? '')
    if (KOLOM_TANGGAL.has(kolom)) {
      return sa.slice(0, 10).localeCompare(sb.slice(0, 10))
    }
    return sa.localeCompare(sb, 'id')
  }

  function sortTabel(kolom) {
    if (sortKolom.value === kolom) {
      sortAsc.value = !sortAsc.value
    } else {
      sortKolom.value = kolom
      sortAsc.value   = true
    }
    urutkanDataFilter()
  }

  /**
   * Terapkan urutan aktif pada dataFilter.
   *
   * Dipanggil juga dari terapkanFilter(): tanpa itu, setiap penyaringan
   * mengembalikan urutan ke bawaan sementara indikator kolom di kepala
   * tabel masih menunjukkan urutan lama.
   *
   * Baris bernilai kosong SELALU diletakkan paling bawah, tidak ikut
   * terbalik saat arah berubah. Karena itu pemeriksaan kosong dilakukan
   * di sini, di luar perkalian dengan `arah` — agar baris cacat tidak
   * menyamar sebagai skor tertinggi saat urutan dibalik ke menurun.
   */
  function urutkanDataFilter() {
    if (!sortKolom.value) return
    const kolom = sortKolom.value
    const arah = sortAsc.value ? 1 : -1
    dataFilter.value = [...dataFilter.value].sort((a, b) => {
      const aKosong = nilaiKosong(a, kolom)
      const bKosong = nilaiKosong(b, kolom)
      if (aKosong && bKosong) return 0
      if (aKosong) return 1
      if (bKosong) return -1
      return arah * bandingkan(a, b, kolom)
    })
  }

  function resetSemuaFilter() {
    filterCari.value      = ''
    filterInstr.value     = ''
    filterRisiko.value    = ''
    filterTglDari.value   = ''
    filterTglSampai.value = ''
    filterKecamatan.value = ''
    filterGender.value    = ''
    filterSekolah.value   = ''
    filterRiwayat.value   = ''
    terapkanFilter()
  }

  function gantiHalaman(hal) {
    const totalHal = Math.ceil(dataFilter.value.length / perHalaman.value)
    if (hal < 1 || hal > totalHal) return
    halamanAktif.value = hal
  }

  return {
    adminUser, adminSession,
    semuaData, dataFilter, isLoading,
    halamanAktif, perHalaman, sortKolom, sortAsc,
    filterCari, filterInstr, filterRisiko,
    filterTglDari, filterTglSampai, filterKecamatan, filterGender, filterSekolah, filterRiwayat,
    cekSession, login, logout, fetchSemuaData,
    hapusRecord, terapkanFilter, sortTabel, resetSemuaFilter, gantiHalaman,
  }
})
