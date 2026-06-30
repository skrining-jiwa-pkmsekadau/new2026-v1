<template>
  <div
    id="hasil-print-area"
    class="relative flex flex-col min-h-screen bg-[#F0F7FF]"
  >
    <!-- BG Deko -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden no-print">
      <div
        class="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[90px]"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-50/40 rounded-full blur-[80px]"
      ></div>
    </div>

    <!-- HEADER -->
    <header class="sticky top-0 z-50 bg-[#0f4b80] px-4 py-4 shadow-lg no-print">
      <div class="max-w-2xl mx-auto flex items-center gap-3">
        <div
          class="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 shrink-0"
        >
          <span class="material-symbols-outlined text-white text-[20px]"
            >assessment</span
          >
        </div>
        <div class="flex-1">
          <h1 class="text-white font-bold text-base leading-tight">
            Hasil Skrining
          </h1>
          <p class="text-blue-100 text-xs">Langkah 3 dari 3 — Hasil</p>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-7 h-1.5 rounded-full bg-white/40"></div>
          <div class="w-7 h-1.5 rounded-full bg-white/40"></div>
          <div class="w-7 h-1.5 rounded-full bg-white"></div>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="flex-1 flex flex-col items-center px-4 py-6 relative z-10">
      <div class="w-full max-w-2xl flex flex-col gap-5">
        <!-- CARD 1: IDENTITAS -->
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
        >
          <div
            class="px-5 py-4 bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] flex items-center justify-between"
          >
            <div>
              <p
                class="text-blue-100 text-[10px] font-bold uppercase tracking-widest"
              >
                Detail Hasil Skrining
              </p>
              <h2 class="text-white font-bold text-lg leading-tight">
                {{ pasien.nama_lengkap }}
              </h2>
              <p class="text-blue-200 text-xs font-mono mt-0.5">
                NIK: {{ pasien.nik }}
              </p>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-white"
            >
              <span class="material-symbols-outlined text-[14px]"
                >calendar_today</span
              >
              {{ formatTanggalID(pasien.tanggal_skrining) }}
            </span>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p
                  class="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-0.5"
                >
                  Umur
                </p>
                <p class="text-slate-800 font-semibold text-sm">
                  {{ pasien.usia }} Tahun
                </p>
              </div>
              <div>
                <p
                  class="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-0.5"
                >
                  Kecamatan
                </p>
                <p class="text-slate-800 font-semibold text-sm">
                  {{ pasien.kecamatan }}
                </p>
              </div>
              <div>
                <p
                  class="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-0.5"
                >
                  Desa
                </p>
                <p class="text-slate-800 font-semibold text-sm">
                  {{ pasien.desa }}
                </p>
              </div>
            </div>
            <div
              class="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4 mb-3"
            >
              <div>
                <p
                  class="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-0.5"
                >
                  Tempat Skrining
                </p>
                <p
                  class="text-slate-700 text-sm font-semibold flex items-center gap-1.5"
                >
                  <span
                    class="material-symbols-outlined text-blue-400 text-[14px]"
                    >location_on</span
                  >
                  {{ pasien.tempat_skrining || "Puskesmas Sekadau" }}
                </p>
              </div>
              <div>
                <p
                  class="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-0.5"
                >
                  Instrumen
                </p>
                <p
                  class="text-slate-700 text-sm font-semibold flex items-center gap-1.5"
                >
                  <span
                    class="material-symbols-outlined text-blue-400 text-[14px]"
                    >assignment</span
                  >
                  {{ instrumenData?.nama }}
                </p>
              </div>
            </div>
            <div class="pt-3 border-t border-slate-100">
              <p
                class="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-0.5"
              >
                Alamat Lengkap
              </p>
              <p class="text-slate-700 text-sm font-medium">
                {{ pasien.alamat }}
              </p>
            </div>
          </div>
        </div>

        <!-- CARD 2: SKOR -->
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
        >
          <div
            class="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-blue-500 text-[18px]"
              >assignment</span
            >
            <h3
              class="text-xs font-bold text-slate-600 uppercase tracking-widest"
            >
              Hasil Skor {{ instrumenData?.nama }}
            </h3>
          </div>
          <div class="p-5 flex flex-col gap-4">
            <!-- Total Skor + Badge -->
            <div
              class="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div>
                <p class="text-xs text-slate-500 font-medium mb-1">
                  Total Skor
                </p>
                <span class="text-5xl font-black text-slate-800">{{
                  hasil.skor_total
                }}</span>
              </div>
              <div class="text-right flex flex-col items-end gap-1.5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border',
                    hasil.badge_cls,
                  ]"
                >
                  <span class="material-symbols-outlined text-[16px]">{{
                    hasil.icon
                  }}</span>
                  {{ hasil.badge }}
                </span>
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                    riskInfo.cls,
                  ]"
                >
                  <span
                    :class="['w-1.5 h-1.5 rounded-full', riskInfo.dot]"
                  ></span>
                  {{ hasil.risk_level }}
                </span>
              </div>
            </div>

            <!-- Skor Detail MMYS -->
            <template v-if="isMMYS">
              <div class="grid grid-cols-2 gap-3">
                <div class="p-4 rounded-xl bg-sky-50 border border-sky-100">
                  <p
                    class="text-xs font-bold text-sky-500 uppercase tracking-wide mb-2"
                  >
                    Skala A — Kecemasan
                  </p>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl font-black text-sky-700"
                      >{{ hasil.skor_detail.skor_A
                      }}<span class="text-sm font-normal text-sky-400">
                        / 3</span
                      ></span
                    >
                    <span
                      :class="[
                        'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                        hasilCls(hasil.skor_detail.hasil_A),
                      ]"
                      >{{ hasilLabel(hasil.skor_detail.hasil_A) }}</span
                    >
                  </div>
                  <div
                    class="w-full bg-sky-100 h-2 rounded-full overflow-hidden"
                  >
                    <div
                      :class="[
                        'h-full rounded-full transition-all duration-700',
                        barColor(hasil.skor_detail.hasil_A),
                      ]"
                      :style="{
                        width: (hasil.skor_detail.skor_A / 3) * 100 + '%',
                      }"
                    ></div>
                  </div>
                </div>
                <div
                  class="p-4 rounded-xl bg-violet-50 border border-violet-100"
                >
                  <p
                    class="text-xs font-bold text-violet-500 uppercase tracking-wide mb-2"
                  >
                    Skala B — Depresi
                  </p>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl font-black text-violet-700"
                      >{{ hasil.skor_detail.skor_B
                      }}<span class="text-sm font-normal text-violet-400">
                        / 3</span
                      ></span
                    >
                    <span
                      :class="[
                        'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                        hasilCls(hasil.skor_detail.hasil_B),
                      ]"
                      >{{ hasilLabel(hasil.skor_detail.hasil_B) }}</span
                    >
                  </div>
                  <div
                    class="w-full bg-violet-100 h-2 rounded-full overflow-hidden"
                  >
                    <div
                      :class="[
                        'h-full rounded-full transition-all duration-700',
                        barColor(hasil.skor_detail.hasil_B),
                      ]"
                      :style="{
                        width: (hasil.skor_detail.skor_B / 3) * 100 + '%',
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Skor Detail PHQ-4 -->
            <template v-if="isPHQ4">
              <div class="grid grid-cols-2 gap-3">
                <div
                  class="p-4 rounded-xl bg-orange-50 border border-orange-100"
                >
                  <p
                    class="text-xs font-bold text-orange-500 uppercase tracking-wide mb-2"
                  >
                    PHQ-2 — Depresi
                  </p>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl font-black text-orange-700"
                      >{{ hasil.skor_detail.skor_phq2
                      }}<span class="text-sm font-normal text-orange-400">
                        / 6</span
                      ></span
                    >
                    <span
                      :class="[
                        'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                        phqCls(hasil.skor_detail.hasil_phq2),
                      ]"
                      >{{ phqLabel(hasil.skor_detail.hasil_phq2) }}</span
                    >
                  </div>
                  <div
                    class="w-full bg-orange-100 h-2 rounded-full overflow-hidden"
                  >
                    <div
                      :class="[
                        'h-full rounded-full transition-all duration-700',
                        hasil.skor_detail.hasil_phq2 === 'GEJALA'
                          ? 'bg-red-400'
                          : 'bg-emerald-400',
                      ]"
                      :style="{
                        width: (hasil.skor_detail.skor_phq2 / 6) * 100 + '%',
                      }"
                    ></div>
                  </div>
                </div>
                <div class="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p
                    class="text-xs font-bold text-amber-500 uppercase tracking-wide mb-2"
                  >
                    GAD-2 — Kecemasan
                  </p>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl font-black text-amber-700"
                      >{{ hasil.skor_detail.skor_gad2
                      }}<span class="text-sm font-normal text-amber-400">
                        / 6</span
                      ></span
                    >
                    <span
                      :class="[
                        'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                        phqCls(hasil.skor_detail.hasil_gad2),
                      ]"
                      >{{ phqLabel(hasil.skor_detail.hasil_gad2) }}</span
                    >
                  </div>
                  <div
                    class="w-full bg-amber-100 h-2 rounded-full overflow-hidden"
                  >
                    <div
                      :class="[
                        'h-full rounded-full transition-all duration-700',
                        hasil.skor_detail.hasil_gad2 === 'GEJALA'
                          ? 'bg-red-400'
                          : 'bg-emerald-400',
                      ]"
                      :style="{
                        width: (hasil.skor_detail.skor_gad2 / 6) * 100 + '%',
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Skor Detail EPDS -->
            <template v-if="isEPDS">
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div class="flex items-center justify-between mb-3">
                  <p
                    class="text-xs font-bold text-slate-500 uppercase tracking-wide"
                  >
                    Skor Total EPDS
                  </p>
                  <span class="text-3xl font-black text-slate-800"
                    >{{ hasil.skor_total
                    }}<span class="text-base font-normal text-slate-400">
                      / 30</span
                    ></span
                  >
                </div>
                <div
                  class="w-full bg-slate-200 h-3 rounded-full overflow-hidden"
                >
                  <div
                    :class="[
                      'h-full rounded-full transition-all duration-700',
                      epdsBarColor,
                    ]"
                    :style="{ width: (hasil.skor_total / 30) * 100 + '%' }"
                  ></div>
                </div>
                <div
                  class="flex justify-between text-[10px] text-slate-400 mt-1 font-medium"
                >
                  <span>0 — Tidak ada gejala</span>
                  <span>≥13 — Terindikasi depresi</span>
                </div>
                <div
                  v-if="hasil.flag_e10"
                  class="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2"
                >
                  <span
                    class="material-symbols-outlined text-rose-400 text-[18px] shrink-0"
                    >warning</span
                  >
                  <p class="text-xs text-rose-700 font-medium leading-relaxed">
                    ⚠️ Jawaban "Ya, agak sering" pada pertanyaan No.10 menunjukkan kemungkinan
                    risiko mencelakai diri sendiri — diperlukan tindak lanjut
                    segera. Rujuk ke FKTL jika ada indikasi membahayakan diri.
                  </p>
                </div>
              </div>
            </template>

            <!-- Kesimpulan -->
            <div class="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p
                class="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-1.5"
              >
                Kesimpulan Klinis
              </p>
              <p class="text-sm text-slate-700 leading-relaxed">
                {{ hasil.kesimpulan_klinis }}
              </p>
            </div>

            <!-- Alert Urgent -->
            <div
              v-if="hasil.urgent"
              class="p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-start gap-3"
            >
              <span
                class="material-symbols-outlined text-red-500 text-[24px] shrink-0 mt-0.5"
                >emergency</span
              >
              <div>
                <p class="text-sm font-bold text-red-700 mb-0.5">
                  Perlu Penanganan Segera!
                </p>
                <p class="text-xs text-red-600 leading-relaxed">
                  Harap segera hubungi tenaga kesehatan di Puskesmas Sekadau
                  atau kunjungi poli jiwa / IGD terdekat.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 3: REKOMENDASI -->
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
        >
          <div
            class="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-emerald-500 text-[18px]"
              >recommend</span
            >
            <h3
              class="text-xs font-bold text-slate-600 uppercase tracking-widest"
            >
              Rekomendasi Tindak Lanjut
            </h3>
          </div>
          <div class="p-5">
            <div class="flex flex-col gap-2.5">
              <div
                v-for="(r, i) in hasil.rekomendasi_list"
                :key="i"
                class="flex gap-3 p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm"
              >
                <div
                  class="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5"
                >
                  <span class="text-blue-500 font-bold text-xs">{{
                    i + 1
                  }}</span>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed font-medium">
                  {{ r }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 4: PELAKSANA -->
        <div
          v-if="hasil.pelaksana_list && hasil.pelaksana_list.length"
          class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
        >
          <div
            class="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-violet-500 text-[18px]"
              >person</span
            >
            <h3
              class="text-xs font-bold text-slate-600 uppercase tracking-widest"
            >
              Pelaksana Tindak Lanjut
            </h3>
          </div>
          <div class="p-5">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(p, i) in hasil.pelaksana_list"
                :key="i"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 border border-violet-100 text-sm font-semibold text-violet-700"
              >
                <span
                  class="material-symbols-outlined text-[16px] text-violet-400"
                  >person</span
                >
                {{ p }}
              </span>
            </div>
          </div>
        </div>

        <!-- STATUS SIMPAN -->
        <div v-if="saveStatus" :class="saveStatus.cls">
          <div v-if="saveStatus.loading" class="spinner"></div>
          <span v-else class="material-symbols-outlined text-[18px]">{{
            saveStatus.icon
          }}</span>
          <span class="flex-1">{{ saveStatus.msg }}</span>
          <button
            v-if="saveStatus.retry"
            type="button"
            @click="simpanKeSupabase"
            class="ml-auto px-3 py-1 rounded-lg bg-white/80 border border-amber-300 text-xs font-bold text-amber-800 hover:bg-white transition-all"
          >
            Coba Simpan Ulang
          </button>
        </div>

        <!-- TOMBOL AKSI -->
        <div class="flex flex-col sm:flex-row gap-3 no-print">
          <button
            @click="goHome"
            :disabled="actionLocked"
            :class="[
              'flex-1 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-600 font-semibold text-sm transition-all flex items-center justify-center gap-2',
              actionLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 hover:bg-slate-50',
            ]"
          >
            <span class="material-symbols-outlined text-[18px]">home</span>
            Kembali ke Beranda
          </button>
          <button
            @click="cetakPDF"
            :disabled="actionLocked"
            :class="[
              'flex-1 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-600 font-semibold text-sm transition-all flex items-center justify-center gap-2',
              actionLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 hover:bg-slate-50',
            ]"
          >
            <span class="material-symbols-outlined text-[18px]">print</span>
            Cetak Hasil
          </button>

          <button
            @click="skriningBaru"
            :disabled="actionLocked"
            :class="[
              'flex-[2] py-3 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2',
              actionLocked
                ? 'bg-slate-300 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] hover:from-[#0a355c] hover:to-[#1565c0]',
            ]"
          >
            <span class="material-symbols-outlined text-[18px]"
              >add_circle</span
            >
            Skrining Baru
          </button>
        </div>
      </div>

    </main>

    <footer
      class="relative z-10 py-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-white/50"
    >
      © 2026 Puskesmas Sekadau. Sistem Skrining Jiwa Terpadu.
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSkriningStore } from "@/stores/skriningStore";
import { useToast } from "@/composables/useToast";
import { INSTRUMEN_DATA } from "@/constants/instrumen";
import { formatTanggalID } from "@/utils/helpers";
import { db } from "@/services/supabase";

const router = useRouter();
const store = useSkriningStore();
const { showToast } = useToast();

const saveStatus = ref(null);

function buildScreeningKey(patient, instrumen, answers) {
  return [
    patient?.nik || "",
    patient?.tanggal_skrining || "",
    instrumen || "",
    JSON.stringify(answers || []),
  ].join("|");
}

const currentScreeningKey = computed(() =>
  buildScreeningKey(pasien.value, store.instrumen, store.answers),
);
const isSaving = computed(() => Boolean(saveStatus.value?.loading));
const actionLocked = computed(() => isSaving.value || Boolean(saveStatus.value?.retry));

onMounted(() => {
  if (
    !store.hasilSkrining?.skor_total &&
    store.hasilSkrining?.skor_total !== 0
  ) {
    router.replace("/");
    return;
  }

  if (store.savedScreeningKey === currentScreeningKey.value) {
    saveStatus.value = {
      icon: "check_circle",
      cls: "flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium",
      msg: "Data berhasil disimpan ke server.",
    };
    return;
  }

  simpanKeSupabase();
});
const pasien = computed(() => store.patientData);
const hasil = computed(() => store.hasilSkrining);
const instrumenData = computed(() => INSTRUMEN_DATA[store.instrumen]);

const isMMYS = computed(() =>
  ["MMYS_ANAK", "MMYS_REMAJA"].includes(store.instrumen),
);
const isPHQ4 = computed(() => store.instrumen === "PHQ4");
const isEPDS = computed(() => store.instrumen === "EPDS");

const riskInfo = computed(() => {
  const map = {
    "Low Risk": {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-300",
      dot: "bg-emerald-500",
    },
    "Moderate Risk": {
      cls: "bg-amber-50 text-amber-700 border-amber-300",
      dot: "bg-amber-500",
    },
    "High Risk": {
      cls: "bg-red-50 text-red-700 border-red-300",
      dot: "bg-red-500",
    },
  };
  return map[hasil.value.risk_level] || map["Low Risk"];
});

const epdsBarColor = computed(() => {
  if (hasil.value.skor_total >= 13) return "bg-red-400";
  return "bg-emerald-400";
});

// Helpers
function hasilLabel(h) {
  return {
    TIDAK_ADA: "Tidak Ada Gejala",
    RINGAN: "Gejala Ringan",
    BERAT: "Gejala Berat",
  }[h];
}
function hasilCls(h) {
  return {
    TIDAK_ADA: "text-emerald-600 bg-emerald-50 border-emerald-200",
    RINGAN: "text-amber-600 bg-amber-50 border-amber-200",
    BERAT: "text-red-600 bg-red-50 border-red-200",
  }[h];
}
function barColor(h) {
  return { BERAT: "bg-red-400", RINGAN: "bg-amber-400" }[h] || "bg-emerald-400";
}
function phqLabel(h) {
  return h === "GEJALA" ? "Ada Gejala" : "Tidak Ada Gejala";
}
function phqCls(h) {
  return h === "GEJALA"
    ? "text-red-500 bg-red-50 border-red-200"
    : "text-emerald-500 bg-emerald-50 border-emerald-200";
}

// Simpan ke Supabase
async function simpanKeSupabase() {
  if (store.modeCetak || isSaving.value) return;

  const screeningKey = currentScreeningKey.value;
  saveStatus.value = {
    loading: true,
    cls: "flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-600 font-medium",
    msg: "Menyimpan data ke server...",
  };

  // Hanya kirim data identitas + jawaban mentah ke server.
  // Server (RPC simpan_skrining) akan menghitung skor, risiko, dan rekomendasi sendiri
  // agar tidak bisa dimanipulasi dari client/devtools.
  const payload = {
    nama_lengkap: pasien.value.nama_lengkap,
    nik: pasien.value.nik,
    tanggal_lahir: pasien.value.tanggal_lahir,
    usia: pasien.value.usia,
    jenis_kelamin: pasien.value.jenis_kelamin,
    nomor_hp: pasien.value.nomor_hp || "-",
    is_hamil_nifas: pasien.value.is_hamil_nifas,
    alamat: pasien.value.alamat,
    kecamatan: pasien.value.kecamatan,
    desa: pasien.value.desa,
    pendidikan: pasien.value.pendidikan,
    pekerjaan: pasien.value.pekerjaan,
    nama_sekolah: pasien.value.nama_sekolah || null,
    tanggal_skrining: pasien.value.tanggal_skrining,
    tempat_skrining: pasien.value.tempat_skrining,
    instrumen: store.instrumen,
    jawaban: [...store.answers],
  };

  try {
    const { error } = await db.rpc("simpan_skrining", { payload_data: payload });
    if (error) throw error;

    if (currentScreeningKey.value !== screeningKey) return;

    store.isSaved = true;
    store.savedScreeningKey = screeningKey;

    saveStatus.value = {
      icon: "check_circle",
      cls: "flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium",
      msg: "Data berhasil disimpan ke server.",
    };
    showToast("Data skrining berhasil disimpan!", "success");
  } catch (err) {
    if (currentScreeningKey.value !== screeningKey) return;

    saveStatus.value = {
      loading: false,
      retry: true,
      icon: "warning",
      cls: "flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-medium",
      msg: "Gagal menyimpan: " + (err.message || "Cek koneksi internet."),
    };
    showToast("Gagal menyimpan data. Tekan Coba Simpan Ulang sebelum membuat skrining baru.", "error");
  }
}
function goHome() {
  if (actionLocked.value) return;
  router.push("/");
}

function cetakPDF() {
  if (actionLocked.value) return;
  store.modeCetak = true;
  window.print();
  window.onafterprint = () => {
    store.modeCetak = false;
  };
}

function skriningBaru() {
  if (actionLocked.value) return;
  store.resetSkrining();
  router.push("/identitas");
}
</script>

<style>
@media print {
  @page {
    margin: 1cm;
    size: A4 portrait;
  }
  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #hasil-print-area {
    min-height: auto !important;
    background: none !important;
    padding: 0 !important;
  }
  .no-print {
    display: none !important;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
