/**
 * kontrak-jawaban.test.js — Mengunci KONTRAK POSISIONAL antara
 * src/constants/instrumen.js (client) dan db/simpan_skrining.sql (server).
 *
 * Mengapa test ini ada:
 * RPC simpan_skrining membaca jawaban MURNI BERDASARKAN INDEX ARRAY:
 *   MMYS : jawaban->0, ->1, ->2 = Skala A ; ->3, ->4, ->5 = Skala B
 *          level ditentukan oleh ->0 (item 1) dan ->2 (item 3) tiap skala
 *   PHQ4 : (->0 + ->1) = PHQ-2 ; (->2 + ->3) = GAD-2
 *   EPDS : FOR i IN 0..9, flag dicari via id = 'E10'
 *
 * Akibatnya: MENYISIPKAN, MENGHAPUS, atau MENUKAR URUTAN soal di
 * instrumen.js akan MERUSAK SKORING DI SERVER TANPA ERROR APA PUN.
 * Data pasien akan tersimpan dengan risiko yang salah, diam-diam.
 *
 * Test ini membaca db/simpan_skrining.sql sebagai teks dan memastikan
 * asumsi index di SQL masih cocok dengan struktur soal di client.
 *
 * Rujukan juknis: KJ.02.02/B.III/1107/2025 (MMYS), KJ.02.05/B.III/92/2025 (PHQ-4, EPDS).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { INSTRUMEN_DATA, INSTRUMEN_INFO } from '@/constants/instrumen'
import { skorMMYS, skorPHQ4, skorEPDS } from '@/utils/skoring'

const sql = readFileSync(
  fileURLToPath(new URL('../db/simpan_skrining.sql', import.meta.url)),
  'utf8',
)

/** Semua instrumen yang harus didukung penuh oleh client maupun server. */
const SEMUA_INSTRUMEN = ['MMYS_ANAK', 'MMYS_REMAJA', 'PHQ4', 'EPDS']

/** Jumlah item wajib per instrumen menurut juknis. */
const JUMLAH_ITEM = {
  MMYS_ANAK: 6,   // 3 Skala A + 3 Skala B
  MMYS_REMAJA: 6,
  PHQ4: 4,        // 2 PHQ-2 + 2 GAD-2
  EPDS: 10,
}

/** Urutan id soal yang WAJIB dipertahankan (dibaca by index oleh SQL). */
const URUTAN_ID = {
  MMYS_ANAK: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'],
  MMYS_REMAJA: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'],
  PHQ4: ['PHQ1', 'PHQ2', 'GAD1', 'GAD2'],
  EPDS: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10'],
}

/**
 * Opsi jawaban efektif untuk soal ke-`i`.
 *
 * Dua bentuk hidup berdampingan di INSTRUMEN_DATA dan Kuesioner.vue
 * membaca keduanya:
 *  - MMYS & PHQ-4 : satu set `opsi` di level instrumen, dipakai semua soal
 *  - EPDS         : `opsi` per soal, karena tiap item punya label dan
 *                   arah pembobotan sendiri (juknis hal. 9)
 */
function opsiUntuk(kode, i) {
  return INSTRUMEN_DATA[kode].soal[i].opsi ?? INSTRUMEN_DATA[kode].opsi
}

describe('kelengkapan data instrumen', () => {
  it.each(SEMUA_INSTRUMEN)('%s ada di INSTRUMEN_DATA dan INSTRUMEN_INFO', (kode) => {
    expect(INSTRUMEN_DATA[kode], `INSTRUMEN_DATA.${kode}`).toBeDefined()
    expect(INSTRUMEN_INFO[kode], `INSTRUMEN_INFO.${kode}`).toBeDefined()
    expect(INSTRUMEN_INFO[kode].name).toBeTruthy()
  })

  it('tidak ada instrumen tambahan yang tidak dikenali server', () => {
    // Server (simpan_skrining.sql) hanya menangani 4 kode ini; kode lain
    // memicu "Instrumen tidak dikenali" dan data GAGAL tersimpan.
    expect(Object.keys(INSTRUMEN_DATA).sort()).toEqual([...SEMUA_INSTRUMEN].sort())
  })

  it.each(SEMUA_INSTRUMEN)('%s punya jumlah item sesuai juknis', (kode) => {
    expect(INSTRUMEN_DATA[kode].soal).toHaveLength(JUMLAH_ITEM[kode])
  })

  it.each(SEMUA_INSTRUMEN)('%s: urutan id soal persis seperti yang diasumsikan SQL', (kode) => {
    const idAktual = INSTRUMEN_DATA[kode].soal.map((s) => s.id)
    expect(idAktual).toEqual(URUTAN_ID[kode])
  })

  it.each(SEMUA_INSTRUMEN)('%s: setiap soal punya teks dan opsi yang valid', (kode) => {
    for (const [i, soal] of INSTRUMEN_DATA[kode].soal.entries()) {
      const opsi = opsiUntuk(kode, i)
      expect(soal.teks, `${kode} soal[${i}].teks`).toBeTruthy()
      expect(Array.isArray(opsi), `${kode} soal[${i}] opsi`).toBe(true)
      expect(opsi.length, `${kode} soal[${i}] jumlah opsi`).toBeGreaterThan(1)
      for (const [j, o] of opsi.entries()) {
        expect(o.label, `${kode} soal[${i}].opsi[${j}].label`).toBeTruthy()
        expect(Number.isInteger(o.value), `${kode} soal[${i}].opsi[${j}].value bukan integer`).toBe(true)
      }
    }
  })

  it.each(SEMUA_INSTRUMEN)('%s: tidak ada id soal duplikat', (kode) => {
    const ids = INSTRUMEN_DATA[kode].soal.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ════════════════════════════════════════════════════════════════
// MMYS — index 0,1,2 = Skala A ; 3,4,5 = Skala B
// Item kunci penentu level: index 0 dan 2 dalam tiap skala.
// ════════════════════════════════════════════════════════════════
describe('MMYS — kontrak posisi Skala A / Skala B', () => {
  it.each(['MMYS_ANAK', 'MMYS_REMAJA'])('%s: index 0-2 skala A, index 3-5 skala B', (kode) => {
    const soal = INSTRUMEN_DATA[kode].soal
    expect(soal.slice(0, 3).map((s) => s.skala)).toEqual(['A', 'A', 'A'])
    expect(soal.slice(3, 6).map((s) => s.skala)).toEqual(['B', 'B', 'B'])
  })

  it.each(['MMYS_ANAK', 'MMYS_REMAJA'])('%s: opsi hanya Ya=1 / Tidak=0', (kode) => {
    // SQL menjumlahkan nilai mentah (baris 47-48) tetapi hanya membandingkan
    // "= 1" untuk level (baris 52-61). Nilai selain 0/1 membuat skor total
    // dan level tidak konsisten.
    INSTRUMEN_DATA[kode].soal.forEach((_soal, i) => {
      const nilai = opsiUntuk(kode, i).map((o) => o.value)
      expect([...nilai].sort()).toEqual([0, 1])
    })
  })

  it('SQL membaca index 0 dan 2 untuk skala A, 3 dan 5 untuk skala B', () => {
    // Kalau baris ini hilang dari SQL, kontrak berubah dan test harus ditinjau.
    expect(sql).toContain("v_q1_a := (v_jawaban->0->>'value')::INT")
    expect(sql).toContain("v_q3_a := (v_jawaban->2->>'value')::INT")
    expect(sql).toContain("v_q1_b := (v_jawaban->3->>'value')::INT")
    expect(sql).toContain("v_q3_b := (v_jawaban->5->>'value')::INT")
  })

  it('index item kunci di client = index yang dibaca SQL', () => {
    const soal = INSTRUMEN_DATA.MMYS_REMAJA.soal
    // Skala A: item kunci pertama di index 0, item kunci kedua di index 2
    expect(soal[0].id).toBe('A1')
    expect(soal[2].id).toBe('A3')
    // Skala B: item kunci pertama di index 3, item kunci kedua di index 5
    expect(soal[3].id).toBe('B1')
    expect(soal[5].id).toBe('B3')
    // `nomor` berjalan 1..6 lintas kedua skala (bukan 1..3 per skala).
    expect(soal.map((s) => s.nomor)).toEqual([1, 2, 3, 4, 5, 6])
  })
})

// ════════════════════════════════════════════════════════════════
// PHQ-4 — index 0,1 = PHQ-2 (depresi) ; 2,3 = GAD-2 (kecemasan)
// ════════════════════════════════════════════════════════════════
describe('PHQ-4 — kontrak posisi PHQ-2 / GAD-2', () => {
  it('index 0-1 subskala PHQ2, index 2-3 subskala GAD2', () => {
    const soal = INSTRUMEN_DATA.PHQ4.soal
    expect(soal.slice(0, 2).map((s) => s.skala)).toEqual(['PHQ2', 'PHQ2'])
    expect(soal.slice(2, 4).map((s) => s.skala)).toEqual(['GAD2', 'GAD2'])
  })

  it('setiap soal punya 4 opsi bernilai 0,1,2,3 (juknis hal. 5)', () => {
    INSTRUMEN_DATA.PHQ4.soal.forEach((_soal, i) => {
      expect(opsiUntuk('PHQ4', i).map((o) => o.value)).toEqual([0, 1, 2, 3])
    })
  })

  it('SQL menjumlahkan index 0+1 untuk PHQ-2 dan 2+3 untuk GAD-2', () => {
    expect(sql).toContain("v_phq2 := (v_jawaban->0->>'value')::INT + (v_jawaban->1->>'value')::INT")
    expect(sql).toContain("v_gad2 := (v_jawaban->2->>'value')::INT + (v_jawaban->3->>'value')::INT")
  })
})

// ════════════════════════════════════════════════════════════════
// EPDS — 10 item, pembobotan terbalik pada soal 3, 5-10
// Juknis KJ.02.05 hal. 9 butir a & b.
// ════════════════════════════════════════════════════════════════
describe('EPDS — pembobotan dan flag item 10', () => {
  it('setiap soal punya 4 opsi dengan nilai unik 0..3', () => {
    for (const soal of INSTRUMEN_DATA.EPDS.soal) {
      const nilai = soal.opsi.map((o) => o.value)
      expect(nilai).toHaveLength(4)
      expect([...nilai].sort()).toEqual([0, 1, 2, 3])
    }
  })

  // Juknis hal. 9: soal 1, 2, 4 normal (kotak atas = 0);
  //                soal 3, 5 s/d 10 terbalik (kotak atas = 3).
  it('soal 1, 2, 4 TIDAK terbalik — opsi pertama bernilai 0', () => {
    for (const nomor of [1, 2, 4]) {
      const soal = INSTRUMEN_DATA.EPDS.soal[nomor - 1]
      expect(soal.nomor, `posisi soal ${nomor}`).toBe(nomor)
      expect(soal.reversed, `soal ${nomor}.reversed`).toBe(false)
      expect(soal.opsi[0].value, `soal ${nomor} opsi pertama`).toBe(0)
      expect(soal.opsi[3].value, `soal ${nomor} opsi terakhir`).toBe(3)
    }
  })

  it('soal 3, 5, 6, 7, 8, 9, 10 TERBALIK — opsi pertama bernilai 3', () => {
    for (const nomor of [3, 5, 6, 7, 8, 9, 10]) {
      const soal = INSTRUMEN_DATA.EPDS.soal[nomor - 1]
      expect(soal.nomor, `posisi soal ${nomor}`).toBe(nomor)
      expect(soal.reversed, `soal ${nomor}.reversed`).toBe(true)
      expect(soal.opsi[0].value, `soal ${nomor} opsi pertama`).toBe(3)
      expect(soal.opsi[3].value, `soal ${nomor} opsi terakhir`).toBe(0)
    }
  })

  it('item 10 ada di index terakhir, ber-id E10, dan ditandai flagQuestion', () => {
    const soal = INSTRUMEN_DATA.EPDS.soal
    const e10 = soal[soal.length - 1]
    expect(e10.id).toBe('E10')
    expect(e10.nomor).toBe(10)
    expect(e10.flagQuestion).toBe(true)
  })

  it('hanya opsi "Ya, agak sering" (nilai 3) yang ditandai flag — sesuai juknis hal. 11', () => {
    // Ini data yang BENAR menurut juknis. Logika skorEPDS saat ini belum
    // memakainya (masih value > 0) — lihat blok PENYIMPANGAN di skoring.test.js.
    const e10 = INSTRUMEN_DATA.EPDS.soal[9]
    const berflag = e10.opsi.filter((o) => o.flag === true)
    expect(berflag).toHaveLength(1)
    expect(berflag[0].value).toBe(3)
    expect(berflag[0].label).toContain('agak sering')
  })

  it('SQL menjelajah index 0..9 dan mencari id E10', () => {
    expect(sql).toContain('FOR i IN 0..9 LOOP')
    expect(sql).toContain("v_jwb->>'id' = 'E10'")
  })

  it('skor maksimal EPDS = 30 sesuai juknis hal. 11', () => {
    const maks = INSTRUMEN_DATA.EPDS.soal.reduce(
      (t, _s, i) => t + Math.max(...opsiUntuk('EPDS', i).map((o) => o.value)), 0,
    )
    expect(maks).toBe(30)
  })
})

// ════════════════════════════════════════════════════════════════
// Simulasi: jawaban dibangun persis seperti alur Kuesioner.vue
// (setAnswer(index, {id, value, optionIndex})), lalu diskor.
// Membuktikan urutan client benar-benar menghasilkan skor yang benar.
// ════════════════════════════════════════════════════════════════
describe('simulasi alur pengisian sesuai urutan soal client', () => {
  /** Meniru Kuesioner.vue: pilih opsi ke-n untuk tiap soal, berurutan. */
  const isiBerurutan = (kode, indexOpsi) =>
    INSTRUMEN_DATA[kode].soal.map((soal, i) => ({
      id: soal.id,
      value: opsiUntuk(kode, i)[indexOpsi[i]].value,
      optionIndex: indexOpsi[i],
    }))

  it('MMYS: memilih "Ya" pada item 1 & 3 skala A menghasilkan BERAT', () => {
    // opsi[0] = Ya (1), opsi[1] = Tidak (0)
    const jwb = isiBerurutan('MMYS_REMAJA', [0, 1, 0, 1, 1, 1])
    const h = skorMMYS(jwb)
    expect(h.skor_detail.hasil_A).toBe('BERAT')
    expect(h.skor_detail.hasil_B).toBe('TIDAK_ADA')
    expect(h.tingkat_risiko).toBe('BERAT')
  })

  it('PHQ4: memilih "Hampir setiap hari" pada 2 soal pertama → DEPRESI', () => {
    // opsi[3] = nilai 3, opsi[0] = nilai 0
    const jwb = isiBerurutan('PHQ4', [3, 3, 0, 0])
    const h = skorPHQ4(jwb)
    expect(h.skor_detail.skor_phq2).toBe(6)
    expect(h.skor_detail.skor_gad2).toBe(0)
    expect(h.tingkat_risiko).toBe('DEPRESI')
  })

  it('EPDS: semua opsi pertama → skor 21 karena 7 soal terbalik', () => {
    // opsi[0]: soal 1,2,4 = 0 ; soal 3,5,6,7,8,9,10 = 3 → 7 x 3 = 21
    // Verifikasi bahwa pembobotan terbalik benar-benar berlaku.
    const jwb = isiBerurutan('EPDS', Array(10).fill(0))
    const h = skorEPDS(jwb)
    expect(h.skor_total).toBe(21)
    expect(h.flag_e10).toBe(true) // soal 10 opsi pertama = 3 = "agak sering"
    expect(h.tingkat_risiko).toBe('DEPRESI')
  })

  it('EPDS: semua opsi terakhir → skor 9 (soal 1,2,4 = 3; sisanya 0)', () => {
    const jwb = isiBerurutan('EPDS', Array(10).fill(3))
    const h = skorEPDS(jwb)
    expect(h.skor_total).toBe(9)
    expect(h.flag_e10).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════
// Penjaga terhadap regresi di sisi SQL
// ════════════════════════════════════════════════════════════════
describe('penjaga db/simpan_skrining.sql', () => {
  it('menangani keempat instrumen', () => {
    expect(sql).toContain("'MMYS_ANAK', 'MMYS_REMAJA'")
    expect(sql).toContain("v_instrumen = 'PHQ4'")
    expect(sql).toContain("v_instrumen = 'EPDS'")
  })

  it('menolak instrumen yang tidak dikenali, bukan menyimpan diam-diam', () => {
    expect(sql).toContain('RAISE EXCEPTION')
    expect(sql).toContain('Instrumen tidak dikenali')
  })

  it('ambang risiko di SQL sama dengan juknis', () => {
    expect(sql).toContain('v_phq2 >= 3')
    expect(sql).toContain('v_gad2 >= 3')
    expect(sql).toContain('v_total_epds >= 13')
  })

  it('SQL memakai ambang eskalasi item 10 = 3, bukan > 0', () => {
    // Harus sama dengan NILAI_ESKALASI_E10 di src/utils/skoring.js.
    expect(sql).toContain('v_nilai_e10, 0) >= 3')
    // Pola lama yang menyimpang dari juknis tidak boleh kembali.
    expect(sql).not.toContain("(v_jwb->>'value')::INT > 0")
  })

  it('SQL tidak lagi menaikkan skor EPDS 9-12 ke Moderate Risk', () => {
    // Juknis hal. 11: 0-12 seluruhnya "tidak menunjukkan gejala signifikan".
    expect(sql).not.toContain('v_total_epds >= 9 THEN v_tingkat_risiko')
    expect(sql).toContain('perlu_skrining_ulang')
    expect(sql).toContain('v_total_epds BETWEEN 9 AND 12')
  })

  it('SQL menyimpan nilai_e10 mentah untuk audit klinis', () => {
    expect(sql).toContain("'nilai_e10', v_nilai_e10")
  })

  it('menyimpan label High/Moderate/Low Risk yang dibaca dashboard', () => {
    for (const label of ['High Risk', 'Moderate Risk', 'Low Risk']) {
      expect(sql).toContain(`'${label}'`)
    }
  })
})
