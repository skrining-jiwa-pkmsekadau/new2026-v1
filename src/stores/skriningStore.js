import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSkriningStore = defineStore('skrining', () => {
  // ── State (mereplikasi AppState dari kode asli) ──
  const patientData          = ref({})
  const instrumen            = ref(null)
  const currentQuestion      = ref(0)
  const answers              = ref([])
  const hasilSkrining        = ref({})
  const modeCetak            = ref(false)
  const nikDiblokir          = ref(false)
  const tanggalBolehSkrining = ref(null)
  const sudahSetujuJujur     = ref(false)
  const isSaved              = ref(false)
  const savedScreeningKey    = ref(null)
  const submissionId         = ref(null)

  // ── Persetujuan pelindungan data pribadi (UU 27/2022) ──
  // Waktu dan versi kebijakan yang disetujui, dikirim ke server bersama
  // data skrining sebagai bukti persetujuan per pasien.
  const consentAt            = ref(null)
  const consentVersion       = ref(null)
  // Untuk pasien di bawah 18 tahun, persetujuan diberikan orang tua
  // atau wali. Dikonfirmasi di formulir identitas setelah usia
  // diketahui dari tanggal lahir.
  const consentWali          = ref(false)

  // ── Actions ──

  /** Reset seluruh state skrining ke kondisi awal */
  function resetSkrining() {
    patientData.value          = {}
    instrumen.value            = null
    currentQuestion.value      = 0
    answers.value              = []
    hasilSkrining.value        = {}
    modeCetak.value            = false
    nikDiblokir.value          = false
    tanggalBolehSkrining.value = null
    sudahSetujuJujur.value     = false
    isSaved.value              = false
    savedScreeningKey.value    = null
    submissionId.value         = null
    consentAt.value            = null
    consentVersion.value       = null
    consentWali.value          = false
  }

  function ensureSubmissionId() {
    if (!submissionId.value) submissionId.value = crypto.randomUUID()
    return submissionId.value
  }

  /** Simpan data identitas pasien */
  function setPatientData(data) {
    patientData.value = { ...data }
    submissionId.value = crypto.randomUUID()
  }

  /** Set instrumen yang digunakan */
  function setInstrumen(kode) {
    instrumen.value = kode
  }

  /** Simpan jawaban di index tertentu */
  function setAnswer(index, answer) {
    const arr = [...answers.value]
    arr[index] = answer
    answers.value = arr
  }

  /** Simpan hasil skrining (skor + interpretasi) */
  function setHasilSkrining(hasil) {
    hasilSkrining.value = { ...hasil }
  }

  /**
   * Catat persetujuan pasien beserta versi kebijakan yang berlaku.
   * Versi wajib disimpan: bila isi kebijakan berubah, harus dapat
   * dibuktikan isi mana yang disetujui pasien ini.
   *
   * consentWali direset di sini. Persetujuan wali bersifat per pasien,
   * bukan per perangkat: tanpa reset, centang dari pasien sebelumnya
   * ikut terbawa ke pasien berikutnya pada perangkat bersama.
   */
  function setConsent(versi) {
    consentAt.value = new Date().toISOString()
    consentVersion.value = versi
    consentWali.value = false
  }

  /** Tandai bahwa persetujuan diberikan oleh orang tua atau wali. */
  function setConsentWali(nilai) {
    consentWali.value = nilai === true
  }

  /** Navigasi ke soal selanjutnya */
  function nextQuestion() {
    currentQuestion.value++
  }

  /** Navigasi ke soal sebelumnya */
  function prevQuestion() {
    if (currentQuestion.value > 0) currentQuestion.value--
  }

  /** Set soal aktif ke index tertentu */
  function goToQuestion(index) {
    currentQuestion.value = Math.max(0, index)
  }

  return {
    // state
    patientData,
    instrumen,
    currentQuestion,
    answers,
    hasilSkrining,
    modeCetak,
    nikDiblokir,
    tanggalBolehSkrining,
    sudahSetujuJujur,
    isSaved,
    savedScreeningKey,
    submissionId,
    consentAt,
    consentVersion,
    consentWali,
    // actions
    resetSkrining,
    ensureSubmissionId,
    setPatientData,
    setInstrumen,
    setAnswer,
    setHasilSkrining,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    setConsent,
    setConsentWali,
  }
})
