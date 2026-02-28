<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      @click.self
    ></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
    >
      <!-- Header -->
      <div
        class="bg-gradient-to-r from-primary to-[#1e88e5] px-6 py-5 text-white"
      >
        <div class="flex items-center gap-3 mb-1">
          <span class="material-symbols-outlined text-[28px] text-yellow-300"
            >verified_user</span
          >
          <h2 class="text-base font-bold">Pernyataan Sebelum Mengisi</h2>
        </div>
        <p class="text-[11px] text-blue-100">
          Bacalah dengan seksama sebelum memulai skrining
        </p>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <!-- Warning Box -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div class="flex gap-3">
            <span
              class="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5"
              >info</span
            >
            <div>
              <p class="text-sm font-bold text-amber-800 mb-1.5">
                Isilah dengan Jujur
              </p>
              <p class="text-[12px] text-amber-700 leading-relaxed">
                Jawablah setiap pertanyaan sesuai dengan
                <strong>keadaan yang Anda rasakan sebenarnya</strong>, bukan
                yang Anda inginkan atau anggap benar.
              </p>
            </div>
          </div>
        </div>

        <!-- Info Points -->
        <div class="space-y-2.5">
          <div class="flex items-start gap-2.5">
            <span
              class="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5"
              >schedule</span
            >
            <p class="text-[12px] text-slate-600 leading-relaxed">
              Skrining ini
              <strong class="text-slate-800"
                >hanya dapat diisi satu kali dalam 90 hari (3 bulan)</strong
              >. Tidak ada kesempatan mengulang dalam periode tersebut.
            </p>
          </div>
          <div class="flex items-start gap-2.5">
            <span
              class="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5"
              >lock</span
            >
            <p class="text-[12px] text-slate-600 leading-relaxed">
              Hasil skrining bersifat
              <strong class="text-slate-800">rahasia</strong> dan hanya
              digunakan untuk keperluan pelayanan kesehatan di Puskesmas
              Sekadau.
            </p>
          </div>
          <div class="flex items-start gap-2.5">
            <span
              class="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5"
              >medical_services</span
            >
            <p class="text-[12px] text-slate-600 leading-relaxed">
              Tidak ada jawaban yang
              <strong class="text-slate-800">benar atau salah</strong>.
              Kejujuran Anda membantu tenaga kesehatan memberikan penanganan
              yang tepat.
            </p>
          </div>
        </div>

        <!-- Checkbox -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <label class="flex items-start gap-3 cursor-pointer select-none">
            <input
              v-model="checked"
              type="checkbox"
              class="mt-0.5 w-4 h-4 rounded border-slate-300 accent-primary cursor-pointer shrink-0"
            />
            <span class="text-[12px] text-slate-700 leading-relaxed">
              Saya memahami pernyataan di atas dan bersedia mengisi kuesioner
              ini dengan
              <strong>jujur sesuai keadaan yang saya rasakan saat ini</strong>.
            </span>
          </label>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 pb-5">
        <button
          :disabled="!checked"
          :class="[
            'w-full py-3.5 rounded-xl text-sm font-bold transition-all',
            checked
              ? 'bg-gradient-to-r from-primary to-[#1e88e5] hover:from-[#0a355c] text-white shadow-lg'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          ]"
          @click="onConfirm"
        >
          Saya Mengerti — Mulai Skrining
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["confirm"]);

const checked = ref(false);

function onConfirm() {
  if (!checked.value) return;
  emit("confirm");
}
</script>
