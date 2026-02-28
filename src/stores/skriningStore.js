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
  }

  /** Simpan data identitas pasien */
  function setPatientData(data) {
    patientData.value = { ...data }
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
    // actions
    resetSkrining,
    setPatientData,
    setInstrumen,
    setAnswer,
    setHasilSkrining,
    nextQuestion,
    prevQuestion,
    goToQuestion,
  }
})
