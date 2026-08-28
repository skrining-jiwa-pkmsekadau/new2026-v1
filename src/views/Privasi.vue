<script setup>
/**
 * Privasi — halaman pemberitahuan pelindungan data pribadi yang dapat
 * dibuka kapan saja, tanpa harus melewati gerbang persetujuan.
 *
 * Ditautkan dari footer dan dari gerbang persetujuan, agar pasien yang
 * ingin membaca ulang tidak perlu memulai skrining.
 */
import { useRouter } from 'vue-router'
import KebijakanPrivasi from '@/components/KebijakanPrivasi.vue'

const router = useRouter()

function kembali() {
  // history.length <= 1 berarti halaman dibuka langsung lewat tautan,
  // sehingga router.back() akan keluar dari aplikasi.
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <div class="relative flex flex-col min-h-screen bg-[#F0F7FF] page-enter">
    <header class="relative z-10 px-4 py-4 border-b border-slate-200 bg-white/80">
      <div class="max-w-2xl mx-auto flex items-center gap-3">
        <button
          type="button"
          @click="kembali"
          class="w-11 h-11 shrink-0 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center justify-center transition-colors"
          aria-label="Kembali ke halaman sebelumnya"
        >
          <span aria-hidden="true" class="material-symbols-outlined text-[20px] text-slate-600"
            >arrow_back</span
          >
        </button>
        <p class="text-sm font-bold text-slate-700">Pelindungan Data Pribadi</p>
      </div>
    </header>

    <main class="flex-1 px-4 py-6 relative z-10">
      <div
        class="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6"
      >
        <KebijakanPrivasi :dengan-judul="true" />
      </div>
    </main>

    <footer class="relative z-10 py-4 text-center text-xs text-slate-500">
      &copy; 2026 UPTD Puskesmas Sekadau
    </footer>
  </div>
</template>
