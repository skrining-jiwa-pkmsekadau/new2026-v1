/**
 * skoring.js — Logika penghitungan skor dan interpretasi hasil skrining
 * Disesuaikan dengan Pedoman Skrining Kesehatan Jiwa (PDF 03-12 & 04-11)
 */

// ================================================================
// SKORING — MMYS ANAK & REMAJA
// ================================================================
/**
 * @param {Array<{id: string, value: number}>} answers - 6 jawaban [A1,A2,A3,B1,B2,B3]
 * @returns {object} Hasil skor MMYS
 */
export function skorMMYS(answers) {
  const A = answers.slice(0, 3) // Skala A: Kecemasan (Q1,Q2,Q3)
  const B = answers.slice(3, 6) // Skala B: Depresi   (Q4,Q5,Q6)

  function interpretSkala(soal) {
    const q1 = soal[0].value // item pertama skala (A1 atau B1)
    const q3 = soal[2].value // item ketiga skala  (A3 atau B3)
    if (q1 === 1 && q3 === 1) return 'BERAT'    // Kedua item kunci = Ya
    if (q1 === 1 || q3 === 1) return 'RINGAN'   // Salah satu item kunci = Ya
    return 'TIDAK_ADA'                           // Keduanya Tidak
  }

  const hasilA = interpretSkala(A)
  const hasilB = interpretSkala(B)
  const skorA  = A.reduce((s, a) => s + a.value, 0)
  const skorB  = B.reduce((s, a) => s + a.value, 0)

  // Ambil tingkat risiko tertinggi dari dua skala
  const levelOrder = { TIDAK_ADA: 0, RINGAN: 1, BERAT: 2 }
  const tingkatRisiko = levelOrder[hasilA] >= levelOrder[hasilB] ? hasilA : hasilB

  return {
    skor_total: skorA + skorB,
    skor_detail: { skor_A: skorA, skor_B: skorB, hasil_A: hasilA, hasil_B: hasilB },
    tingkat_risiko: tingkatRisiko,
  }
}

// ================================================================
// SKORING — PHQ-4
// ================================================================
/**
 * @param {Array<{id: string, value: number}>} answers - 4 jawaban [PHQ1,PHQ2,GAD1,GAD2]
 * @returns {object} Hasil skor PHQ-4
 */
export function skorPHQ4(answers) {
  const phq2  = answers[0].value + answers[1].value
  const gad2  = answers[2].value + answers[3].value
  const total = phq2 + gad2

  const gejalaPHQ2 = phq2 >= 3
  const gejalaGAD2 = gad2 >= 3

  let tingkatRisiko
  if (gejalaPHQ2 && gejalaGAD2)   tingkatRisiko = 'DEPRESI_DAN_KECEMASAN'
  else if (gejalaPHQ2)            tingkatRisiko = 'DEPRESI'
  else if (gejalaGAD2)            tingkatRisiko = 'KECEMASAN'
  else                            tingkatRisiko = 'TIDAK_ADA'

  return {
    skor_total: total,
    skor_detail: {
      skor_phq2: phq2,
      skor_gad2: gad2,
      hasil_phq2: gejalaPHQ2 ? 'GEJALA' : 'TIDAK_ADA',
      hasil_gad2: gejalaGAD2 ? 'GEJALA' : 'TIDAK_ADA',
    },
    tingkat_risiko: tingkatRisiko,
  }
}

// ================================================================
// SKORING — EPDS
// ================================================================
/**
 * @param {Array<{id: string, value: number, optionIndex: number}>} answers - 10 jawaban E1–E10
 * @returns {object} Hasil skor EPDS
 */
export function skorEPDS(answers) {
  const total = answers.reduce((s, a) => s + a.value, 0)

  // Flag Q10: Jawaban selain "Tidak pernah" (value > 0) → risiko bunuh diri
  // Sesuai pedoman PDF: setiap jawaban Q10 > 0 dianggap berisiko
  const jwbE10  = answers.find((a) => a.id === 'E10')
  const flagE10 = jwbE10 ? jwbE10.value > 0 : false

  let tingkatRisiko
  if (total >= 13 || flagE10) tingkatRisiko = 'DEPRESI'
  else if (total >= 9)        tingkatRisiko = 'PERLU_MONITORING'
  else                        tingkatRisiko = 'TIDAK_ADA'

  return {
    skor_total: total,
    skor_detail: { flag_e10: flagE10 },
    tingkat_risiko: tingkatRisiko,
    flag_e10: flagE10,
  }
}

// ================================================================
// INTERPRETASI & REKOMENDASI TINDAK LANJUT
// Disesuaikan dengan Pedoman PDF 03-12.pdf dan 04-11.pdf
// ================================================================
export const HASIL_INTERPRETASI = {

  MMYS: {
    TIDAK_ADA: {
      badge: 'Tidak Ada Gejala',
      badge_cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      risk_level: 'Low Risk',
      risk_cls: 'text-emerald-600 bg-emerald-50',
      icon: 'check_circle',
      icon_cls: 'text-emerald-500',
      urgent: false,
      kesimpulan: 'Hasil skrining tidak menunjukkan kemungkinan gejala kecemasan maupun depresi yang signifikan.',
      pelaksana: ['Guru (dapat dibantu Tenaga Kesehatan)'],
      rekomendasi: [
        'Edukasi kesehatan jiwa: definisi kesehatan jiwa, pentingnya menjaga kesehatan mental, dan sistem deteksi mandiri.',
        'Penguatan faktor protektif: dorong keterlibatan dalam kegiatan ekstrakurikuler, hobi positif, dan relasi sosial yang sehat.',
        'Edukasi P3LP (Pertolongan Pertama pada Luka Psikologis) kepada orang tua/pengasuh.',
        'Edukasi pengasuhan yang sehat jiwa kepada orang tua/pengasuh.',
        'Lakukan pemeriksaan kesehatan jiwa berkala minimal 1 kali per tahun.',
      ],
    },
    RINGAN: {
      badge: 'Gejala Ringan',
      badge_cls: 'bg-amber-50 text-amber-700 border-amber-200',
      risk_level: 'Moderate Risk',
      risk_cls: 'text-amber-600 bg-amber-50',
      icon: 'warning',
      icon_cls: 'text-amber-500',
      urgent: false,
      kesimpulan: 'Hasil skrining menunjukkan kemungkinan gejala kecemasan dan/atau depresi ringan yang perlu ditindaklanjuti.',
      pelaksana: ['Bidan', 'Perawat', 'Dokter', 'Psikolog Klinis'],
      rekomendasi: [
        'Konseling awal oleh Perawat atau Bidan yang bersifat suportif untuk mengidentifikasi dan membantu mengurangi keluhan.',
        'Penegakan diagnosis keperawatan dan pemberian asuhan keperawatan jiwa pada anak dan remaja oleh Perawat.',
        'Tatalaksana medis oleh Dokter Puskesmas sesuai kompetensi.',
        'Assessment dan tatalaksana psikologis oleh Psikolog Klinis (jika tersedia).',
        'Pemeriksaan lanjut untuk menegakkan diagnosa awal oleh Dokter/Psikolog Klinis.',
      ],
    },
    BERAT: {
      badge: 'Gejala Berat',
      badge_cls: 'bg-red-50 text-red-700 border-red-200',
      risk_level: 'High Risk',
      risk_cls: 'text-red-600 bg-red-50',
      icon: 'emergency',
      icon_cls: 'text-red-500',
      urgent: true,
      kesimpulan: 'Hasil skrining menunjukkan kemungkinan gejala kecemasan dan/atau depresi berat. Perlu penanganan segera.',
      pelaksana: ['Bidan', 'Perawat', 'Dokter', 'Psikolog Klinis'],
      rekomendasi: [
        'Konseling awal segera oleh Perawat atau Bidan yang bersifat suportif.',
        'Penegakan diagnosis keperawatan dan asuhan keperawatan jiwa pada anak dan remaja oleh Perawat.',
        'Tatalaksana medis segera oleh Dokter Puskesmas.',
        'Assessment dan tatalaksana psikologis oleh Psikolog Klinis.',
        'Pemeriksaan lanjut untuk menegakkan diagnosa awal oleh Dokter/Psikolog Klinis.',
        'Lakukan evaluasi setelah 3 bulan. Rujuk ke Rumah Sakit (FKTL) yang memiliki fasilitas kesehatan jiwa/tumbuh kembang jika tidak ada perbaikan.',
        'Rujuk SEGERA jika ada: perilaku melukai diri/dorongan bunuh diri, luka/memar fisik, gangguan tumbuh kembang, atau kondisi medis berat.',
      ],
    },
  },

  PHQ4: {
    TIDAK_ADA: {
      badge: 'Tidak Ada Gejala Signifikan',
      badge_cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      risk_level: 'Low Risk',
      risk_cls: 'text-emerald-600 bg-emerald-50',
      icon: 'check_circle',
      icon_cls: 'text-emerald-500',
      urgent: false,
      kesimpulan: 'Hasil skrining PHQ-4 tidak menunjukkan gejala depresi maupun kecemasan yang signifikan.',
      pelaksana: ['Dokter', 'Perawat', 'Bidan', 'Psikolog Klinis'],
      rekomendasi: [
        'Edukasi kesehatan jiwa: tanda sehat jiwa dan faktor protektif.',
        'Ajarkan teknik manajemen stres dan coping stress yang sehat.',
        'Edukasi P3LP (Pertolongan Pertama pada Luka Psikologis).',
        'Pertahankan gaya hidup sehat: olahraga teratur, tidur cukup, dan hubungan sosial yang positif.',
      ],
    },
    DEPRESI: {
      badge: 'Kemungkinan Gejala Depresi',
      badge_cls: 'bg-orange-50 text-orange-700 border-orange-200',
      risk_level: 'Moderate Risk',
      risk_cls: 'text-orange-600 bg-orange-50',
      icon: 'mood_bad',
      icon_cls: 'text-orange-500',
      urgent: false,
      kesimpulan: 'Hasil skrining PHQ-4 menunjukkan kemungkinan adanya gejala depresi (skor PHQ-2 ≥ 3). Diperlukan pemeriksaan dan tindak lanjut lebih lanjut.',
      pelaksana: ['Dokter', 'Psikolog Klinis', 'Perawat', 'Bidan'],
      rekomendasi: [
        'Konseling awal oleh Perawat atau Bidan yang bersifat suportif.',
        'Pemeriksaan kesehatan jiwa oleh Dokter atau Psikolog Klinis untuk menegakkan diagnosis medis.',
        'Tatalaksana sesuai kompetensi tenaga medis dan kesehatan di Puskesmas.',
        'Rujuk ke FKTL jika: depresi berat atau ada indikasi membahayakan diri sendiri atau orang lain.',
      ],
    },
    KECEMASAN: {
      badge: 'Kemungkinan Gejala Kecemasan',
      badge_cls: 'bg-amber-50 text-amber-700 border-amber-200',
      risk_level: 'Moderate Risk',
      risk_cls: 'text-amber-600 bg-amber-50',
      icon: 'sentiment_worried',
      icon_cls: 'text-amber-500',
      urgent: false,
      kesimpulan: 'Hasil skrining PHQ-4 menunjukkan kemungkinan adanya gejala kecemasan (skor GAD-2 ≥ 3). Diperlukan pemeriksaan dan tindak lanjut lebih lanjut.',
      pelaksana: ['Dokter', 'Psikolog Klinis', 'Perawat', 'Bidan'],
      rekomendasi: [
        'Konseling awal oleh Perawat atau Bidan yang bersifat suportif.',
        'Pemeriksaan kesehatan jiwa oleh Dokter atau Psikolog Klinis untuk menegakkan diagnosis medis.',
        'Tatalaksana sesuai kompetensi tenaga medis dan kesehatan di Puskesmas.',
        'Rujuk ke FKTL jika: gejala tidak membaik lebih dari 1 bulan pasca konseling atau ada indikasi ketergantungan obat cemas.',
      ],
    },
    DEPRESI_DAN_KECEMASAN: {
      badge: 'Gejala Depresi & Kecemasan',
      badge_cls: 'bg-red-50 text-red-700 border-red-200',
      risk_level: 'High Risk',
      risk_cls: 'text-red-600 bg-red-50',
      icon: 'warning',
      icon_cls: 'text-red-500',
      urgent: true,
      kesimpulan: 'Hasil skrining PHQ-4 menunjukkan kemungkinan gejala depresi DAN kecemasan secara bersamaan (PHQ-2 ≥ 3 dan GAD-2 ≥ 3). Perlu penanganan segera.',
      pelaksana: ['Dokter', 'Psikolog Klinis', 'Perawat', 'Bidan'],
      rekomendasi: [
        'Konseling awal segera oleh Perawat atau Bidan yang bersifat suportif.',
        'Pemeriksaan kesehatan jiwa menyeluruh oleh Dokter atau Psikolog Klinis.',
        'Tatalaksana komprehensif sesuai kompetensi tenaga medis di Puskesmas.',
        'Rujuk ke FKTL jika: depresi berat, indikasi membahayakan diri/orang lain, atau gejala kecemasan tidak membaik lebih dari 1 bulan.',
      ],
    },
  },

  EPDS: {
    TIDAK_ADA: {
      badge: 'Tidak Ada Gejala Signifikan',
      badge_cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      risk_level: 'Low Risk',
      risk_cls: 'text-emerald-600 bg-emerald-50',
      icon: 'check_circle',
      icon_cls: 'text-emerald-500',
      urgent: false,
      kesimpulan: 'Hasil skrining EPDS tidak menunjukkan gejala depresi yang signifikan (skor 0–8).',
      pelaksana: ['Dokter', 'Psikolog Klinis', 'Perawat', 'Bidan'],
      rekomendasi: [
        'Edukasi kesehatan jiwa: tanda sehat jiwa pada ibu dan faktor protektif kesehatan jiwa.',
        'Latihan manajemen stres dan coping stress yang sehat selama masa kehamilan/nifas.',
        'Edukasi pengasuhan positif dan perawatan bayi yang menyenangkan.',
        'Jaga dukungan sosial dari keluarga dan tenaga kesehatan.',
      ],
    },
    PERLU_MONITORING: {
      badge: 'Perlu Pemantauan',
      badge_cls: 'bg-amber-50 text-amber-700 border-amber-200',
      risk_level: 'Moderate Risk',
      risk_cls: 'text-amber-600 bg-amber-50',
      icon: 'visibility',
      icon_cls: 'text-amber-500',
      urgent: false,
      kesimpulan: 'Skor EPDS 9–12 menunjukkan gejala yang perlu dipantau. Lakukan skrining ulang pada kunjungan ANC berikutnya.',
      pelaksana: ['Dokter', 'Psikolog Klinis', 'Perawat', 'Bidan'],
      rekomendasi: [
        'Berikan edukasi kesehatan jiwa: tanda sehat jiwa, faktor protektif, latihan manajemen stres.',
        'Lakukan skrining ulang EPDS pada kunjungan ANC berikutnya.',
        'Pantau kondisi ibu secara berkala oleh Bidan atau Perawat.',
        'Tingkatkan dukungan sosial dan emosional dari keluarga terdekat.',
      ],
    },
    DEPRESI: {
      badge: 'Terindikasi Gejala Depresi',
      badge_cls: 'bg-red-50 text-red-700 border-red-200',
      risk_level: 'High Risk',
      risk_cls: 'text-red-600 bg-red-50',
      icon: 'emergency',
      icon_cls: 'text-red-500',
      urgent: true,
      kesimpulan: 'Hasil skrining EPDS mengindikasikan kemungkinan gejala depresi pada ibu hamil/nifas (skor ≥ 13 atau Q10 positif). Diperlukan penanganan segera.',
      pelaksana: ['Dokter', 'Psikolog Klinis', 'Perawat', 'Bidan'],
      rekomendasi: [
        'Konseling awal segera oleh Perawat atau Bidan yang bersifat suportif.',
        'Pemeriksaan kesehatan jiwa untuk menegakkan diagnosis oleh Dokter atau Psikolog Klinis.',
        'Tatalaksana komprehensif sesuai kompetensi tenaga medis dan kesehatan di Puskesmas.',
        'Segera rujuk ke FKTL jika ada indikasi membahayakan diri sendiri atau orang lain.',
        'Pastikan pendampingan intensif dari keluarga terdekat selama proses pemulihan.',
      ],
    },
  },
}

// ================================================================
// FUNGSI HITUNG SKOR UTAMA
// ================================================================
/**
 * Dispatcher utama — menghitung skor berdasarkan instrumen dan jawaban,
 * lalu menggabungkan hasil skor dengan data interpretasi/rekomendasi.
 *
 * @param {string} instrumen - Kode instrumen (MMYS_ANAK, MMYS_REMAJA, PHQ4, EPDS)
 * @param {Array} answers - Array jawaban
 * @returns {object|null} Objek hasil lengkap atau null jika gagal
 */
export function hitungSkor(instrumen, answers) {
  let skorData

  if (['MMYS_ANAK', 'MMYS_REMAJA'].includes(instrumen)) {
    skorData = skorMMYS(answers)
  } else if (instrumen === 'PHQ4') {
    skorData = skorPHQ4(answers)
  } else if (instrumen === 'EPDS') {
    skorData = skorEPDS(answers)
  }

  if (!skorData) {
    return null
  }

  const kategori = ['MMYS_ANAK', 'MMYS_REMAJA'].includes(instrumen) ? 'MMYS' : instrumen
  const interp =
    HASIL_INTERPRETASI[kategori]?.[skorData.tingkat_risiko] ||
    HASIL_INTERPRETASI[kategori]?.['TIDAK_ADA']

  if (!interp) {
    return null
  }

  return {
    ...skorData,
    ...interp,
    instrumen,
    kesimpulan_klinis: interp.kesimpulan,
    rekomendasi_list: interp.rekomendasi,
    pelaksana_list: interp.pelaksana,
  }
}
