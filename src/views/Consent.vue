<script setup>
/**
 * Consent — gerbang persetujuan sebelum formulir identitas.
 *
 * Dasar hukum: UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
 * Jawaban kuesioner kesehatan jiwa adalah data pribadi SPESIFIK (Pasal 4),
 * sehingga memerlukan persetujuan eksplisit SEBELUM data dikumpulkan.
 *
 * Rancangan yang disengaja:
 *  - Persetujuan harus ditekan secara AKTIF. Tidak ada centang otomatis
 *    dan tidak ada cara melewati halaman ini menuju /identitas.
 *  - Versi kebijakan yang disetujui dicatat di store, lalu ikut dikirim
 *    ke server bersama data skrining sebagai bukti.
 *  - Persetujuan untuk pasien di bawah 18 tahun tidak diminta di sini,
 *    melainkan di formulir identitas setelah usia diketahui dari tanggal
 *    lahir. Di halaman ini usia belum diketahui.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSkriningStore } from '@/stores/skriningStore'
import { useToast } from '@/composables/useToast'
import KebijakanPrivasi from '@/components/KebijakanPrivasi.vue'
import {
  VERSI_KEBIJAKAN,
  RINGKASAN_CONSENT,
  PENGENDALI_DATA,
} from '@/constants/kebijakanPrivasi'

const router = useRouter()
const store = useSkriningStore()
const { showToast } = useToast()

const setuju = ref(false)
const bacaLengkap = ref(false)

function lanjut() {
  if (!setuju.value) {
    showToast('Centang pernyataan persetujuan terlebih dahulu.', 'warning')
    return
  }
  store.setConsent(VERSI_KEBIJAKAN)
  router.push('/identitas')
}

function tolak() {
  router.push('/')
}
</script>

<template>
  <div class="relative flex flex-col min-h-screen bg-[#F0F7FF] page-enter">
    <header class="relative z-10 px-4 py-4 border-b border-slate-200 bg-white/80">
      <div class="max-w-2xl mx-auto">
        <p class="text-sm font-bold text-slate-700">Persetujuan Penggunaan Data</p>
        <p class="text-xs text-slate-500 mt-0.5">Langkah awal sebelum skrining</p>
      </div>
    </header>

    <main class="flex-1 px-4 py-6 relative z-10">
      <div class="max-w-2xl mx-auto flex flex-col gap-4">
        <!-- Ringkasan -->
        <section
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
          aria-labelledby="judul-ringkasan"
        >
          <div class="flex items-start gap-3">
            <span
              aria-hidden="true"
              class="material-symbols-outlined text-blue-500 text-[22px] shrink-0 mt-0.5"
              >privacy_tip</span
            >
            <div class="min-w-0">
              <h1 id="judul-ringkasan" class="text-base font-bold text-slate-800">
                Sebelum mulai, mohon dibaca
              </h1>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Skrining ini mengumpulkan data kesehatan jiwa Anda. Menurut
                Undang-Undang Nomor 27 Tahun 2022, data tersebut hanya boleh
                dikumpulkan setelah Anda menyetujuinya.
              </p>
            </div>
          </div>

          <ul class="mt-4 flex flex-col gap-2">
            <li
              v-for="r in RINGKASAN_CONSENT"
              :key="r"
              class="text-sm text-slate-700 leading-relaxed flex gap-2"
            >
              <span aria-hidden="true" class="text-blue-400 shrink-0">&bull;</span>
              <span>{{ r }}</span>
            </li>
          </ul>

          <button
            type="button"
            @click="bacaLengkap = !bacaLengkap"
            :aria-expanded="bacaLengkap"
            aria-controls="uraian-lengkap"
            class="mt-4 inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold text-blue-700 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-lg"
          >
            <span aria-hidden="true" class="material-symbols-outlined text-[18px]">{{
              bacaLengkap ? 'expand_less' : 'expand_more'
            }}</span>
            {{ bacaLengkap ? 'Sembunyikan penjelasan lengkap' : 'Baca penjelasan lengkap' }}
          </button>

          <div
            v-if="bacaLengkap"
            id="uraian-lengkap"
            class="mt-4 pt-4 border-t border-slate-200"
          >
            <KebijakanPrivasi />
          </div>
        </section>

        <!-- Pernyataan persetujuan -->
        <section class="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-5">
          <div class="flex items-start gap-3">
            <input
              id="setuju"
              v-model="setuju"
              type="checkbox"
              class="mt-0.5 w-5 h-5 shrink-0 rounded border-2 border-slate-300 text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            />
            <label for="setuju" class="text-sm text-slate-700 leading-relaxed cursor-pointer">
              Saya telah membaca dan memahami pemberitahuan di atas, dan
              <strong>menyetujui</strong> pengumpulan serta penggunaan data saya
              oleh {{ PENGENDALI_DATA.nama }} untuk keperluan skrining kesehatan
              jiwa dan tindak lanjutnya.
            </label>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              type="button"
              @click="tolak"
              class="flex-1 min-h-[48px] rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 text-slate-600 font-semibold text-sm transition-colors"
            >
              Tidak sekarang
            </button>
            <button
              type="button"
              @click="lanjut"
              :disabled="!setuju"
              :class="[
                'flex-[2] min-h-[48px] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2',
                setuju
                  ? 'bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] hover:from-[#0a355c] hover:to-[#1565c0] text-white shadow-lg shadow-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              ]"
            >
              Setuju dan Lanjutkan
              <span aria-hidden="true" class="material-symbols-outlined text-[18px]"
                >arrow_forward</span
              >
            </button>
          </div>

          <p class="text-[11px] text-slate-500 mt-3 leading-relaxed">
            Anda dapat menarik persetujuan kapan saja dengan menghubungi
            Puskesmas. Penarikan tidak membatalkan pemrosesan yang sudah
            terjadi sebelumnya.
          </p>
        </section>
      </div>
    </main>

    <footer class="relative z-10 py-4 text-center text-xs text-slate-500">
      <RouterLink
        to="/privasi"
        class="underline hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
        >Pemberitahuan Pelindungan Data Pribadi</RouterLink
      >
    </footer>
  </div>
</template>
