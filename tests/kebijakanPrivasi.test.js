/**
 * kebijakanPrivasi.test.js — Menjaga isi pemberitahuan privasi tetap
 * lengkap dan jujur.
 *
 * Dasar hukum: UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
 * Pasal 4 menempatkan "data dan informasi kesehatan" sebagai data
 * pribadi spesifik, sehingga pemrosesannya memerlukan persetujuan
 * eksplisit dan pemberitahuan yang memuat butir-butir tertentu.
 *
 * Test ini bukan pemeriksaan hukum. Yang dijaga di sini adalah hal-hal
 * yang dapat diperiksa secara mekanis: kelengkapan butir wajib,
 * konsistensi versi, dan tidak adanya klaim yang tidak dapat dibuktikan.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import {
  VERSI_KEBIJAKAN,
  TANGGAL_BERLAKU,
  PENGENDALI_DATA,
  KONTAK_PENGADUAN,
  MASA_SIMPAN,
  DATA_DIKUMPULKAN,
  TUJUAN_PEMROSESAN,
  PENERIMA_DATA,
  HAK_PASIEN,
  USIA_PERLU_WALI,
  RINGKASAN_CONSENT,
} from '@/constants/kebijakanPrivasi'

const baca = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8')

describe('kelengkapan pemberitahuan privasi', () => {
  it('versi memakai format angka dan tanggal berlaku sah', () => {
    // Versi disimpan di setiap baris skrining sebagai bukti persetujuan,
    // jadi formatnya harus stabil dan dapat dibandingkan.
    expect(VERSI_KEBIJAKAN).toMatch(/^\d+\.\d+$/)
    expect(TANGGAL_BERLAKU).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Number.isNaN(Date.parse(TANGGAL_BERLAKU))).toBe(false)
  })

  it('pengendali data disebut dengan jelas', () => {
    expect(PENGENDALI_DATA.nama).toBeTruthy()
    expect(PENGENDALI_DATA.wilayah).toBeTruthy()
  })

  it('menyebut seluruh kelompok data yang benar-benar dikumpulkan', () => {
    const semua = DATA_DIKUMPULKAN.map((d) => d.rincian.toLowerCase()).join(' ')
    // Bandingkan dengan field yang benar-benar dikirim ke server pada
    // payload simpan_skrining (lihat src/views/Hasil.vue).
    for (const wajib of [
      'nik',
      'tanggal lahir',
      'nomor hp',
      'alamat',
      'kecamatan',
      'desa',
      'pendidikan',
      'pekerjaan',
      'sekolah',
      'kehamilan',
    ]) {
      expect(semua, `tidak menyebut "${wajib}"`).toContain(wajib)
    }
  })

  it('menyebut jawaban kuesioner dan tingkat risiko sebagai data kesehatan', () => {
    const kesehatan = DATA_DIKUMPULKAN.find((d) => d.kelompok === 'Kesehatan')
    expect(kesehatan).toBeDefined()
    expect(kesehatan.rincian.toLowerCase()).toContain('kuesioner')
    expect(kesehatan.rincian.toLowerCase()).toContain('risiko')
  })

  it('tujuan pemrosesan tidak kosong', () => {
    expect(TUJUAN_PEMROSESAN.length).toBeGreaterThan(0)
    for (const t of TUJUAN_PEMROSESAN) expect(t.trim()).toBeTruthy()
  })

  it('menyebut Dinas Kesehatan dan ASIK/SatuSehat sebagai penerima data', () => {
    // Data diekspor dan dikirim keluar dari Puskesmas. Pasien berhak
    // tahu; menyembunyikan ini adalah pelanggaran tersendiri.
    const semua = PENERIMA_DATA.map((p) => `${p.pihak} ${p.tujuan}`).join(' ')
    expect(semua).toMatch(/Dinas Kesehatan/i)
    expect(semua).toMatch(/ASIK|SatuSehat/i)
  })

  it('menyebut masa penyimpanan secara konkret', () => {
    expect(MASA_SIMPAN).toMatch(/\d+\s*tahun/i)
  })

  it('memuat hak subjek data yang utama', () => {
    const semua = HAK_PASIEN.join(' ').toLowerCase()
    expect(semua).toMatch(/salinan|mengetahui/)
    expect(semua).toMatch(/perbaikan|memperbaiki/)
    expect(semua).toMatch(/penghapusan|menghapus/)
    expect(semua).toMatch(/menarik persetujuan/)
    expect(semua).toMatch(/keberatan|pengaduan/)
  })

  it('menyediakan cara menghubungi untuk pengaduan', () => {
    const ada =
      Boolean(KONTAK_PENGADUAN.keterangan) ||
      Boolean(KONTAK_PENGADUAN.telepon) ||
      Boolean(KONTAK_PENGADUAN.email)
    expect(ada, 'tidak ada satu pun cara menghubungi').toBe(true)
  })

  it('batas usia wali sesuai ketentuan anak', () => {
    expect(USIA_PERLU_WALI).toBe(18)
  })

  it('ringkasan menyebut ekspor data ke luar Puskesmas', () => {
    // Pasien yang hanya membaca ringkasan tetap harus tahu datanya
    // dikirim ke Dinas Kesehatan.
    expect(RINGKASAN_CONSENT.join(' ')).toMatch(/Dinas Kesehatan|ASIK|SatuSehat/i)
  })
})

describe('tidak ada klaim yang tidak dapat dibuktikan', () => {
  it('Landing tidak mengklaim enkripsi tingkat aplikasi', () => {
    // Tidak ada enkripsi tingkat aplikasi di kode ini. Klaim semacam itu
    // menyesatkan dan dapat menjadi bumerang bila terjadi sengketa.
    const landing = baca('../src/views/Landing.vue')
    expect(landing).not.toMatch(/enkripsi medis/i)
    expect(landing).not.toMatch(/Privasi Terjamin/i)
  })

  it('kebijakan tidak menjanjikan enkripsi atau keamanan mutlak', () => {
    const isi = [
      ...TUJUAN_PEMROSESAN,
      ...HAK_PASIEN,
      ...RINGKASAN_CONSENT,
      MASA_SIMPAN,
      ...DATA_DIKUMPULKAN.map((d) => d.rincian),
    ].join(' ')
    expect(isi).not.toMatch(/enkripsi/i)
    expect(isi).not.toMatch(/100%|sepenuhnya aman|dijamin aman/i)
  })
})

describe('gerbang persetujuan tidak dapat dilewati', () => {
  it('router menandai /identitas memerlukan consent', () => {
    const router = baca('../src/router/index.js')
    expect(router).toContain("path: '/consent'")
    expect(router).toContain('perluConsent: true')
    // Penjagaan harus di router, bukan hanya di tombol, agar tautan
    // langsung ke #/identitas pun tidak lolos.
    expect(router).toContain('store.consentVersion')
  })

  it('Landing mengarahkan ke /consent, bukan langsung ke /identitas', () => {
    const landing = baca('../src/views/Landing.vue')
    expect(landing).toContain('to="/consent"')
    expect(landing).not.toContain('to="/identitas"')
  })

  it('skrining baru mengulang gerbang persetujuan', () => {
    // Persetujuan bersifat per orang, bukan per perangkat. Pasien
    // berikutnya di perangkat yang sama harus menyetujui sendiri.
    const hasil = baca('../src/views/Hasil.vue')
    expect(hasil).toMatch(/resetSkrining\(\);\s*(\/\/[^\n]*\n\s*)*router\.push\("\/consent"\)/)
  })

  it('payload penyimpanan menyertakan bukti persetujuan', () => {
    const hasil = baca('../src/services/simpanSkrining.js')
    expect(hasil).toContain('consent_at: store.consentAt')
    expect(hasil).toContain('consent_version: store.consentVersion')
    expect(hasil).toContain('consent_wali: store.consentWali')
  })
})

describe('persetujuan orang tua atau wali', () => {
  it('formulir identitas memeriksa persetujuan wali untuk usia di bawah 18', () => {
    const identitas = baca('../src/views/Identitas.vue')
    expect(identitas).toContain('USIA_PERLU_WALI')
    expect(identitas).toContain('perluPersetujuanWali')
    // Pemeriksaan harus ada di fungsi submit, bukan hanya menonaktifkan
    // tombol, agar tidak dapat dilewati dari devtools.
    expect(identitas).toMatch(/perluPersetujuanWali\.value\s*&&\s*!store\.consentWali/)
  })
})

describe('migrasi basis data consent', () => {
  const sql = baca('../db/07_kolom_consent.sql')

  it('menambah ketiga kolom consent', () => {
    expect(sql).toContain('consent_at')
    expect(sql).toContain('consent_version')
    expect(sql).toContain('consent_wali')
  })

  it('RPC menuliskan kolom consent saat INSERT', () => {
    expect(sql).toMatch(/consent_at,\s*consent_version,\s*consent_wali/)
    expect(sql).toContain("(payload_data->>'consent_at')::TIMESTAMPTZ")
  })

  it('tidak mengisi mundur baris lama dengan nilai palsu', () => {
    // Memalsukan bukti persetujuan lebih buruk daripada mengakui bahwa
    // persetujuannya tidak pernah tercatat.
    expect(sql).not.toMatch(/UPDATE\s+public\.screenings\s+SET\s+consent_at\s*=/i)
    expect(sql).not.toMatch(/DEFAULT\s+NOW\(\)/i)
  })

  it('RPC tetap memakai search_path dan ambang EPDS sesuai juknis', () => {
    expect(sql).toContain("SET search_path TO 'public', 'pg_temp'")
    expect(sql).toContain('v_nilai_e10, 0) >= 3')
  })
})
