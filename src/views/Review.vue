<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8"
  >
    <div class="max-w-lg mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <button
          @click="goBackToLastQuestion"
          class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
        >
          <span class="material-symbols-outlined text-slate-500 text-[20px]"
            >arrow_back</span
          >
        </button>
        <div>
          <h1 class="text-lg font-bold text-slate-800">Konfirmasi Jawaban</h1>
          <p class="text-xs text-slate-500">Periksa sebelum hasil dihitung</p>
        </div>
      </div>

      <!-- Info Pasien -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center justify-between"
      >
        <div>
          <p class="text-sm font-bold text-slate-800">
            {{ store.patientData.nama_lengkap }}
          </p>
          <p class="text-xs text-slate-500">
            {{ store.patientData.usia }} thn &middot;
            {{
              store.patientData.jenis_kelamin === "L"
                ? "Laki-laki"
                : "Perempuan"
            }}
            &middot;
            {{ store.patientData.kecamatan }}
          </p>
        </div>
        <span
          :class="['px-3 py-1 rounded-full text-xs font-bold border', instrCls]"
          >{{ namaInstr }}</span
        >
      </div>

      <!-- Ringkasan Jawaban -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4"
      >
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Ringkasan Jawaban
          </p>
          <span
            :class="[
              'text-[11px] font-semibold px-2 py-0.5 rounded-full',
              semuaDijawab
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600',
            ]"
          >
            {{ dijawab }}/{{ totalSoal }} terjawab
          </span>
        </div>

        <div
          v-for="(s, i) in soalList"
          :key="i"
          class="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0"
        >
          <span
            :class="[
              'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5',
              store.answers[i] !== undefined
                ? 'bg-blue-600 text-white'
                : 'bg-red-100 text-red-500',
            ]"
          >
            {{ s.nomor ?? i + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-slate-600 leading-relaxed mb-1.5">
              {{ s.teks }}
            </p>
            <span
              v-if="store.answers[i] !== undefined"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              &#10003; {{ getAnswerLabel(i) }}
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-red-50 text-red-600 border-red-200"
            >
              &#9888; Belum dijawab
            </span>
          </div>
          <button
            @click="ubahJawaban(i)"
            class="shrink-0 mt-0.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-500 border-slate-200 hover:border-blue-300 transition-all whitespace-nowrap"
          >
            Ubah
          </button>
        </div>
      </div>

      <!-- Status -->
      <div
        v-if="semuaDijawab"
        class="flex gap-2 items-center p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-5"
      >
        <span class="material-symbols-outlined text-emerald-500 text-[18px]"
          >check_circle</span
        >
        <p class="text-xs text-emerald-700 font-medium">
          Semua {{ totalSoal }} soal dijawab.
        </p>
      </div>
      <div
        v-else
        class="flex gap-2 items-center p-3 rounded-xl bg-amber-50 border border-amber-200 mb-5"
      >
        <span class="material-symbols-outlined text-amber-500 text-[18px]"
          >warning</span
        >
        <p class="text-xs text-amber-700 font-medium">
          Masih ada <strong>{{ totalSoal - dijawab }} soal</strong> belum
          dijawab.
        </p>
      </div>

      <!-- Tombol Aksi -->
      <div class="flex gap-3">
        <button
          @click="ubahJawaban(0)"
          class="flex-1 py-3.5 rounded-xl border-2 border-slate-200 hover:border-blue-300 text-sm font-semibold text-slate-600 bg-white transition-all"
        >
          &#8592; Ubah
        </button>
        <button
          @click="konfirmasiSubmit"
          :disabled="!semuaDijawab"
          :class="[
            'flex-1 py-3.5 rounded-xl text-sm font-bold transition-all',
            semuaDijawab
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          ]"
        >
          Lihat Hasil &#8594;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSkriningStore } from "@/stores/skriningStore";
import { useToast } from "@/composables/useToast";
import { INSTRUMEN_DATA } from "@/constants/instrumen";
import { hitungSkor } from "@/utils/skoring";

const router = useRouter();
const store = useSkriningStore();
const { showToast } = useToast();

onMounted(() => {
  if (!store.instrumen || !store.patientData?.nama_lengkap) {
    router.replace("/identitas");
  }
});

const data = computed(() => INSTRUMEN_DATA[store.instrumen]);
const soalList = computed(() => data.value?.soal || []);
const totalSoal = computed(() => soalList.value.length);
const dijawab = computed(
  () => soalList.value.filter((_, i) => store.answers[i] !== undefined).length,
);
const semuaDijawab = computed(() => dijawab.value === totalSoal.value);

const namaInstr = computed(
  () =>
    ({
      MMYS_ANAK: "MMYS Anak",
      MMYS_REMAJA: "MMYS Remaja",
      PHQ4: "PHQ-4",
      EPDS: "EPDS",
    })[store.instrumen] || store.instrumen,
);
const instrCls = computed(
  () =>
    ({
      MMYS_ANAK: "bg-sky-50 text-sky-700 border-sky-200",
      MMYS_REMAJA: "bg-violet-50 text-violet-700 border-violet-200",
      PHQ4: "bg-amber-50 text-amber-700 border-amber-200",
      EPDS: "bg-rose-50 text-rose-700 border-rose-200",
    })[store.instrumen] || "bg-slate-50 text-slate-600 border-slate-200",
);

function getAnswerLabel(index) {
  const ans = store.answers[index];
  if (!ans) return "-";
  const s = soalList.value[index];
  const opsi = s.opsi || data.value?.opsi || [];
  return opsi[ans.optionIndex]?.label || "-";
}

function ubahJawaban(index) {
  store.goToQuestion(Math.max(0, index));
  router.push("/kuesioner");
}

function goBackToLastQuestion() {
  store.goToQuestion(totalSoal.value - 1);
  router.push("/kuesioner");
}

function konfirmasiSubmit() {
  const belum = soalList.value.findIndex(
    (_, i) => store.answers[i] === undefined,
  );
  if (belum !== -1) {
    showToast(`Soal nomor ${belum + 1} belum dijawab.`, "warning");
    ubahJawaban(belum);
    return;
  }
  const hasil = hitungSkor(store.instrumen, store.answers);
  if (!hasil) {
    showToast("Kesalahan menghitung skor.", "error");
    return;
  }
  store.setHasilSkrining(hasil);
  router.push("/hasil");
}
</script>
