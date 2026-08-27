/**
 * skoring.test.js — Mengunci logika skoring terhadap Juknis Kemenkes.
 *
 * Rujukan:
 *  - PHQ-4 & EPDS : Surat Nomor KJ.02.05/B.III/92/2025 (10 Februari 2025)
 *  - MMYS V.1     : Surat Nomor KJ.02.02/B.III/1107/2025 (10 Juli 2025)
 *
 * Berkas juknis ada di folder "panduan skrinining, perhitungan, dan skoring/".
 *
 * Ambang di sini WAJIB sama dengan db/simpan_skrining.sql. Client
 * menentukan yang DILIHAT pasien, SQL menentukan yang DISIMPAN. Bila
 * berbeda, surat rujukan dan laporan akan bertentangan dengan layar.
 */
import { describe, it, expect } from 'vitest'
import {
  skorMMYS,
  skorPHQ4,
  skorEPDS,
  hitungSkor,
  HASIL_INTERPRETASI,
  NILAI_ESKALASI_E10,
  NILAI_KRISIS_E10,
} from '@/utils/skoring'

/** Bentuk jawaban MMYS: 6 item, [A1,A2,A3,B1,B2,B3], nilai 1=Ya / 0=Tidak. */
const mmys = (a1, a2, a3, b1, b2, b3) => [
  { id: 'A1', value: a1 }, { id: 'A2', value: a2 }, { id: 'A3', value: a3 },
  { id: 'B1', value: b1 }, { id: 'B2', value: b2 }, { id: 'B3', value: b3 },
]

/** Bentuk jawaban PHQ-4: 4 item, [PHQ1,PHQ2,GAD1,GAD2], nilai 0..3. */
const phq4 = (p1, p2, g1, g2) => [
  { id: 'PHQ1', value: p1 }, { id: 'PHQ2', value: p2 },
  { id: 'GAD1', value: g1 }, { id: 'GAD2', value: g2 },
]

/** Bentuk jawaban EPDS: 10 item E1..E10, nilai 0..3 (sudah pasca-pembobotan). */
const epds = (...v) => v.map((value, i) => ({ id: `E${i + 1}`, value }))

// ════════════════════════════════════════════════════════════════
// MMYS V.1 — KJ.02.02/B.III/1107/2025 hal. 7-8
// Level ditentukan HANYA oleh item 1 & 3 tiap skala. Item 2 hanya
// menambah skor total, tidak pernah menaikkan level.
// ════════════════════════════════════════════════════════════════
describe('MMYS V.1 — interpretasi per skala (juknis hal. 7-8)', () => {
  it('semua "Tidak" → tidak ada gejala pada kedua skala', () => {
    const h = skorMMYS(mmys(0, 0, 0, 0, 0, 0))
    expect(h.skor_detail.hasil_A).toBe('TIDAK_ADA')
    expect(h.skor_detail.hasil_B).toBe('TIDAK_ADA')
    expect(h.tingkat_risiko).toBe('TIDAK_ADA')
    expect(h.skor_total).toBe(0)
  })

  // Juknis: "Tidak – ya – tidak" → TIDAK menunjukkan gejala.
  // Ini pembeda terpenting: item 2 saja tidak boleh menaikkan level.
  it('"Ya" HANYA pada item 2 tidak menaikkan level, tetapi tetap menambah skor', () => {
    const h = skorMMYS(mmys(0, 1, 0, 0, 1, 0))
    expect(h.skor_detail.hasil_A).toBe('TIDAK_ADA')
    expect(h.skor_detail.hasil_B).toBe('TIDAK_ADA')
    expect(h.tingkat_risiko).toBe('TIDAK_ADA')
    expect(h.skor_total).toBe(2)
    expect(h.skor_detail.skor_A).toBe(1)
    expect(h.skor_detail.skor_B).toBe(1)
  })

  // Juknis: "Tidak–tidak–ya", "Ya–tidak–tidak", "Tidak–ya–ya", "Ya–ya–tidak" → RINGAN
  it.each([
    ['Tidak-tidak-ya', 0, 0, 1],
    ['Ya-tidak-tidak', 1, 0, 0],
    ['Tidak-ya-ya', 0, 1, 1],
    ['Ya-ya-tidak', 1, 1, 0],
  ])('salah satu item kunci (1 atau 3) "Ya" → RINGAN [%s]', (_label, a1, a2, a3) => {
    const h = skorMMYS(mmys(a1, a2, a3, 0, 0, 0))
    expect(h.skor_detail.hasil_A).toBe('RINGAN')
  })

  // Juknis: "Ya–tidak–ya", "Ya–ya–ya" → BERAT
  it.each([
    ['Ya-tidak-ya', 1, 0, 1],
    ['Ya-ya-ya', 1, 1, 1],
  ])('item 1 DAN 3 "Ya" → BERAT [%s]', (_label, a1, a2, a3) => {
    const h = skorMMYS(mmys(a1, a2, a3, 0, 0, 0))
    expect(h.skor_detail.hasil_A).toBe('BERAT')
  })

  it('skala B dinilai independen dari skala A', () => {
    const h = skorMMYS(mmys(0, 0, 0, 1, 0, 1))
    expect(h.skor_detail.hasil_A).toBe('TIDAK_ADA')
    expect(h.skor_detail.hasil_B).toBe('BERAT')
  })

  it('tingkat risiko keseluruhan = level tertinggi antara skala A dan B', () => {
    // A ringan, B berat → keseluruhan BERAT
    expect(skorMMYS(mmys(1, 0, 0, 1, 0, 1)).tingkat_risiko).toBe('BERAT')
    // A berat, B ringan → keseluruhan BERAT
    expect(skorMMYS(mmys(1, 0, 1, 0, 0, 1)).tingkat_risiko).toBe('BERAT')
    // A ringan, B tidak ada → keseluruhan RINGAN
    expect(skorMMYS(mmys(1, 0, 0, 0, 0, 0)).tingkat_risiko).toBe('RINGAN')
  })

  it('skor maksimal tiap skala = 3, total = 6', () => {
    const h = skorMMYS(mmys(1, 1, 1, 1, 1, 1))
    expect(h.skor_detail.skor_A).toBe(3)
    expect(h.skor_detail.skor_B).toBe(3)
    expect(h.skor_total).toBe(6)
    expect(h.tingkat_risiko).toBe('BERAT')
  })
})

// ════════════════════════════════════════════════════════════════
// PHQ-4 — KJ.02.05/B.III/92/2025 hal. 5
// PHQ-2 = soal 1+2 (depresi), GAD-2 = soal 3+4 (kecemasan).
// Subskor <3 = tidak signifikan; >=3 = kemungkinan gejala.
// ════════════════════════════════════════════════════════════════
describe('PHQ-4 — subskor dan ambang (juknis hal. 5)', () => {
  it('PHQ-2 dijumlahkan dari soal 1+2, GAD-2 dari soal 3+4', () => {
    const h = skorPHQ4(phq4(3, 2, 1, 0))
    expect(h.skor_detail.skor_phq2).toBe(5)
    expect(h.skor_detail.skor_gad2).toBe(1)
    expect(h.skor_total).toBe(6)
  })

  it('kedua subskor < 3 → tidak ada gejala signifikan', () => {
    expect(skorPHQ4(phq4(1, 1, 1, 1)).tingkat_risiko).toBe('TIDAK_ADA')
  })

  // Ambang tepat di batas — titik paling rawan salah (< vs <=).
  it('subskor tepat 2 masih "tidak ada", tepat 3 sudah "ada gejala"', () => {
    expect(skorPHQ4(phq4(1, 1, 0, 0)).skor_detail.hasil_phq2).toBe('TIDAK_ADA')
    expect(skorPHQ4(phq4(2, 1, 0, 0)).skor_detail.hasil_phq2).toBe('GEJALA')
    expect(skorPHQ4(phq4(0, 0, 1, 1)).skor_detail.hasil_gad2).toBe('TIDAK_ADA')
    expect(skorPHQ4(phq4(0, 0, 2, 1)).skor_detail.hasil_gad2).toBe('GEJALA')
  })

  it('hanya PHQ-2 >= 3 → DEPRESI', () => {
    expect(skorPHQ4(phq4(3, 0, 0, 0)).tingkat_risiko).toBe('DEPRESI')
  })

  it('hanya GAD-2 >= 3 → KECEMASAN', () => {
    expect(skorPHQ4(phq4(0, 0, 3, 0)).tingkat_risiko).toBe('KECEMASAN')
  })

  it('kedua subskor >= 3 → DEPRESI_DAN_KECEMASAN', () => {
    expect(skorPHQ4(phq4(2, 1, 2, 1)).tingkat_risiko).toBe('DEPRESI_DAN_KECEMASAN')
  })

  it('skor maksimal 12', () => {
    expect(skorPHQ4(phq4(3, 3, 3, 3)).skor_total).toBe(12)
  })
})

// ════════════════════════════════════════════════════════════════
// EPDS — KJ.02.05/B.III/92/2025 hal. 11
// Skor maksimal 30. 0-12 tidak signifikan; >=13 kemungkinan depresi.
// ════════════════════════════════════════════════════════════════
describe('EPDS — total skor dan ambang 13 (juknis hal. 11)', () => {
  it('total = jumlah 10 item, maksimal 30', () => {
    expect(skorEPDS(epds(3, 3, 3, 3, 3, 3, 3, 3, 3, 3)).skor_total).toBe(30)
    expect(skorEPDS(epds(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)).skor_total).toBe(0)
  })

  it('skor 12 belum terindikasi depresi', () => {
    // 12 poin tersebar, item 10 = 0 agar tidak memicu flag
    const h = skorEPDS(epds(2, 2, 2, 2, 2, 1, 1, 0, 0, 0))
    expect(h.skor_total).toBe(12)
    expect(h.flag_e10).toBe(false)
    expect(h.tingkat_risiko).not.toBe('DEPRESI')
  })

  it('skor tepat 13 → terindikasi depresi', () => {
    const h = skorEPDS(epds(2, 2, 2, 2, 2, 2, 1, 0, 0, 0))
    expect(h.skor_total).toBe(13)
    expect(h.tingkat_risiko).toBe('DEPRESI')
  })

  it('item 10 "Tidak pernah" (0) tidak memicu flag', () => {
    expect(skorEPDS(epds(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)).flag_e10).toBe(false)
  })

  it('item 10 "Ya, agak sering" (3) memicu flag walau total rendah', () => {
    // Juknis hal. 11: "skor kurang dari 13 namun memilih jawaban
    // 'agak sering' untuk pertanyaan no.10" → tindak lanjut setara >=13.
    const h = skorEPDS(epds(0, 0, 0, 0, 0, 0, 0, 0, 0, 3))
    expect(h.skor_total).toBe(3)
    expect(h.flag_e10).toBe(true)
    expect(h.tingkat_risiko).toBe('DEPRESI')
  })

  it('flag item 10 dicari lewat id E10, bukan posisi array', () => {
    // Urutan diacak; flag harus tetap terdeteksi dari id.
    const acak = [
      { id: 'E10', value: 3 },
      ...epds(0, 0, 0, 0, 0, 0, 0, 0, 0).slice(0, 9),
    ]
    expect(skorEPDS(acak).flag_e10).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════
// KEPATUHAN JUKNIS — item 10 EPDS dan rentang 9-12.
//
// Sebelumnya kode memakai `value > 0` untuk item 10 dan melabeli 9-12
// sebagai Moderate Risk. Keduanya menyimpang dari juknis dan sudah
// diperbaiki. Test di bawah menjaga agar tidak kembali menyimpang.
//
// Perhatikan pemisahan dua ambang:
//   NILAI_ESKALASI_E10 = 3 -> menaikkan tingkat_risiko (juknis hal. 11)
//   NILAI_KRISIS_E10   = 2 -> memunculkan panel krisis di UI (keselamatan)
// Klasifikasi patuh regulasi; bantuan krisis tidak digantungkan padanya.
// ════════════════════════════════════════════════════════════════
describe('EPDS item 10 — hanya "Ya, agak sering" mengeskalasi risiko', () => {
  it('ambang eskalasi = 3, ambang krisis = 2', () => {
    expect(NILAI_ESKALASI_E10).toBe(3)
    expect(NILAI_KRISIS_E10).toBe(2)
    expect(NILAI_KRISIS_E10).toBeLessThan(NILAI_ESKALASI_E10)
  })

  it.each([
    ['Tidak pernah', 0],
    ['Hampir tidak pernah', 1],
    ['Kadang-kadang', 2],
  ])('item 10 "%s" (%i) TIDAK mengeskalasi ke DEPRESI', (_label, nilai) => {
    const h = skorEPDS(epds(0, 0, 0, 0, 0, 0, 0, 0, 0, nilai))
    expect(h.flag_e10).toBe(false)
    expect(h.tingkat_risiko).toBe('TIDAK_ADA')
  })

  it('item 10 "Ya, agak sering" (3) mengeskalasi ke DEPRESI', () => {
    const h = skorEPDS(epds(0, 0, 0, 0, 0, 0, 0, 0, 0, 3))
    expect(h.flag_e10).toBe(true)
    expect(h.tingkat_risiko).toBe('DEPRESI')
  })

  // Keselamatan pasien: setiap pengakuan pikiran mencelakai diri harus
  // memunculkan nomor bantuan, walau klasifikasinya tetap "tidak signifikan".
  it.each([
    ['Tidak pernah', 0, false],
    ['Hampir tidak pernah', 1, false],
    ['Kadang-kadang', 2, true],
    ['Ya, agak sering', 3, true],
  ])('item 10 "%s" (%i) → perlu_krisis = %s', (_label, nilai, harap) => {
    expect(skorEPDS(epds(0, 0, 0, 0, 0, 0, 0, 0, 0, nilai)).perlu_krisis).toBe(harap)
  })

  it('"Kadang-kadang" (2): risiko tetap rendah TAPI krisis menyala', () => {
    // Kasus paling penting dari perubahan ini. Angka yang dilaporkan
    // mengikuti juknis; pasien tetap mendapat pertolongan.
    const h = skorEPDS(epds(0, 0, 0, 0, 0, 0, 0, 0, 0, 2))
    expect(h.tingkat_risiko).toBe('TIDAK_ADA')
    expect(h.flag_e10).toBe(false)
    expect(h.perlu_krisis).toBe(true)
  })

  it('nilai_e10 mentah ikut disimpan di skor_detail untuk audit klinis', () => {
    expect(skorEPDS(epds(0, 0, 0, 0, 0, 0, 0, 0, 0, 2)).skor_detail.nilai_e10).toBe(2)
    expect(skorEPDS(epds(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)).skor_detail.nilai_e10).toBe(0)
  })
})

describe('EPDS rentang 9-12 — tetap "tidak signifikan" per juknis', () => {
  // Implementasi tidak lagi memakai kategori terpisah PERLU_MONITORING.
  // Rentang 9-12 tetap TIDAK_ADA (Low Risk); yang membedakan hanyalah
  // flag `perlu_skrining_ulang`, yang oleh hitungSkor diterjemahkan
  // menjadi tambahan anjuran skrining ulang ANC.
  it('skor 9 tetap TIDAK_ADA, bukan kategori risiko tersendiri', () => {
    const h = skorEPDS(epds(2, 2, 2, 1, 1, 1, 0, 0, 0, 0))
    expect(h.skor_total).toBe(9)
    expect(h.tingkat_risiko).toBe('TIDAK_ADA')
    expect(HASIL_INTERPRETASI.EPDS.TIDAK_ADA.risk_level).toBe('Low Risk')
  })

  it.each([9, 10, 11, 12])('skor %i menandai perlu_skrining_ulang', (target) => {
    // Bangun jawaban yang totalnya tepat `target`, item 10 = 0.
    const nilai = Array(10).fill(0)
    let sisa = target
    for (let i = 0; i < 9 && sisa > 0; i++) {
      nilai[i] = Math.min(3, sisa)
      sisa -= nilai[i]
    }
    const h = skorEPDS(epds(...nilai))
    expect(h.skor_total).toBe(target)
    expect(h.perlu_skrining_ulang).toBe(true)
    expect(h.skor_detail.perlu_skrining_ulang).toBe(true)
    expect(h.tingkat_risiko).toBe('TIDAK_ADA')
  })

  it('skor 8 belum perlu skrining ulang, skor 13 sudah DEPRESI', () => {
    const rendah = skorEPDS(epds(3, 3, 2, 0, 0, 0, 0, 0, 0, 0))
    expect(rendah.skor_total).toBe(8)
    expect(rendah.perlu_skrining_ulang).toBe(false)
    expect(rendah.tingkat_risiko).toBe('TIDAK_ADA')

    const tinggi = skorEPDS(epds(3, 3, 3, 3, 1, 0, 0, 0, 0, 0))
    expect(tinggi.skor_total).toBe(13)
    expect(tinggi.perlu_skrining_ulang).toBe(false)
    expect(tinggi.tingkat_risiko).toBe('DEPRESI')
  })

  it('item 10 = 3 membatalkan anjuran skrining ulang walau total 9-12', () => {
    // Skor 12 dengan item 10 = 3 sudah High Risk, jadi tidak masuk
    // jalur "skrining ulang" melainkan penanganan segera.
    const h = skorEPDS(epds(3, 3, 3, 0, 0, 0, 0, 0, 0, 3))
    expect(h.skor_total).toBe(12)
    expect(h.flag_e10).toBe(true)
    expect(h.perlu_skrining_ulang).toBe(false)
    expect(h.tingkat_risiko).toBe('DEPRESI')
  })

  it('tabel interpretasi EPDS hanya punya Low Risk dan High Risk', () => {
    // Juknis EPDS mengenal dua tingkat saja: 0-12 dan >=13.
    const semuaRisk = Object.values(HASIL_INTERPRETASI.EPDS).map((e) => e.risk_level)
    expect(semuaRisk).not.toContain('Moderate Risk')
    expect(new Set(semuaRisk)).toEqual(new Set(['Low Risk', 'High Risk']))
  })

  it('hitungSkor menambahkan anjuran skrining ulang pada rentang 9-12', () => {
    const h = hitungSkor('EPDS', epds(2, 2, 2, 1, 1, 1, 0, 0, 0, 0))
    expect(h.skor_total).toBe(9)
    expect(h.risk_level).toBe('Low Risk')
    expect(h.kesimpulan_klinis).toContain('9-12')
    expect(h.rekomendasi_list.some((r) => /skrining ulang/i.test(r))).toBe(true)
  })

  it('hitungSkor tidak menambahkan anjuran itu pada skor 0-8', () => {
    const h = hitungSkor('EPDS', epds(3, 3, 2, 0, 0, 0, 0, 0, 0, 0))
    expect(h.skor_total).toBe(8)
    expect(h.kesimpulan_klinis).not.toContain('9-12')
  })
})

// ════════════════════════════════════════════════════════════════
// Pemetaan tingkat_risiko internal → label High/Moderate/Low Risk
// yang disimpan server. Wajib konsisten dengan db/simpan_skrining.sql.
// ════════════════════════════════════════════════════════════════
describe('pemetaan risk_level konsisten dengan yang disimpan server', () => {
  it.each([
    ['MMYS', 'TIDAK_ADA', 'Low Risk'],
    ['MMYS', 'RINGAN', 'Moderate Risk'],
    ['MMYS', 'BERAT', 'High Risk'],
    ['PHQ4', 'TIDAK_ADA', 'Low Risk'],
    ['PHQ4', 'DEPRESI', 'Moderate Risk'],
    ['PHQ4', 'KECEMASAN', 'Moderate Risk'],
    ['PHQ4', 'DEPRESI_DAN_KECEMASAN', 'High Risk'],
    ['EPDS', 'TIDAK_ADA', 'Low Risk'],
    ['EPDS', 'DEPRESI', 'High Risk'],
  ])('%s / %s → %s', (kategori, kunci, risk) => {
    expect(HASIL_INTERPRETASI[kategori][kunci].risk_level).toBe(risk)
  })

  it('setiap entri interpretasi punya kesimpulan, rekomendasi, dan pelaksana', () => {
    for (const [kategori, entri] of Object.entries(HASIL_INTERPRETASI)) {
      for (const [kunci, isi] of Object.entries(entri)) {
        expect(isi.kesimpulan, `${kategori}.${kunci}.kesimpulan`).toBeTruthy()
        expect(Array.isArray(isi.rekomendasi), `${kategori}.${kunci}.rekomendasi`).toBe(true)
        expect(isi.rekomendasi.length, `${kategori}.${kunci}.rekomendasi kosong`).toBeGreaterThan(0)
        expect(Array.isArray(isi.pelaksana), `${kategori}.${kunci}.pelaksana`).toBe(true)
      }
    }
  })
})

// ════════════════════════════════════════════════════════════════
// Dispatcher hitungSkor
// ════════════════════════════════════════════════════════════════
describe('hitungSkor — dispatcher', () => {
  it('MMYS_ANAK dan MMYS_REMAJA memakai tabel interpretasi MMYS yang sama', () => {
    const jwb = mmys(1, 0, 1, 0, 0, 0)
    const anak = hitungSkor('MMYS_ANAK', jwb)
    const remaja = hitungSkor('MMYS_REMAJA', jwb)
    expect(anak.risk_level).toBe('High Risk')
    expect(remaja.risk_level).toBe('High Risk')
    expect(anak.kesimpulan_klinis).toBe(remaja.kesimpulan_klinis)
  })

  it('menyertakan kesimpulan_klinis, rekomendasi_list, dan pelaksana_list', () => {
    const h = hitungSkor('PHQ4', phq4(3, 0, 0, 0))
    expect(h.instrumen).toBe('PHQ4')
    expect(h.risk_level).toBe('Moderate Risk')
    expect(h.kesimpulan_klinis).toBeTruthy()
    expect(h.rekomendasi_list.length).toBeGreaterThan(0)
    expect(h.pelaksana_list.length).toBeGreaterThan(0)
  })

  it('instrumen tak dikenal → null', () => {
    expect(hitungSkor('TIDAK_ADA_INSTRUMEN', [])).toBeNull()
  })

  it('EPDS dengan flag item 10 menandai urgent', () => {
    const h = hitungSkor('EPDS', epds(0, 0, 0, 0, 0, 0, 0, 0, 0, 3))
    expect(h.risk_level).toBe('High Risk')
    expect(h.urgent).toBe(true)
  })
})
