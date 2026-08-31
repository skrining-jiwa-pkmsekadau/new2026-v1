<template>
  <div class="relative flex flex-col min-h-screen bg-[#F0F7FF] page-enter gradient-mesh">
    <!-- BG Dekorasi -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[90px]"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-50/40 rounded-full blur-[80px]"
      ></div>
    </div>

    <!-- HEADER -->
    <header class="sticky top-0 z-50 bg-[#0f4b80] px-4 shadow-lg">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-3 pt-3 pb-2">
          <button
            @click="handleBack"
            class="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
          >
            <span class="material-symbols-outlined text-[20px]"
              >arrow_back</span
            >
          </button>
          <div class="flex-1 min-w-0">
            <p
              class="text-blue-200 text-[10px] font-semibold uppercase tracking-widest truncate"
            >
              {{ data?.nama }}
            </p>
            <h1 class="text-white font-bold text-sm leading-tight">
              Pertanyaan {{ store.currentQuestion + 1 }}
              <span class="text-blue-300 font-normal"
                >dari {{ totalSoal }}</span
              >
            </h1>
          </div>
          <div class="shrink-0 text-right">
            <span class="text-white font-bold text-lg">{{ progressPct }}%</span>
          </div>
        </div>
        <div class="pb-3">
          <div class="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              class="bg-white h-full rounded-full transition-all duration-500 ease-out"
              :style="{ width: progressPct + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="flex-1 flex flex-col items-center px-4 py-6 relative z-10">
      <div class="w-full max-w-2xl flex flex-col gap-5">
        <!-- Instruksi (soal pertama saja) -->
        <div
          v-if="store.currentQuestion === 0"
          class="bg-white rounded-xl p-4 border border-blue-100 shadow-sm flex items-start gap-3"
        >
          <span
            class="material-symbols-outlined text-blue-400 text-[22px] shrink-0 mt-0.5"
            >info</span
          >
          <div>
            <p
              class="text-xs font-bold text-blue-500 uppercase tracking-wide mb-1"
            >
              Petunjuk Pengisian
            </p>
            <!-- Petunjuk dirender sebagai potongan teks, bukan v-html.
                 Satu-satunya markup yang dipakai adalah <strong> untuk
                 penekanan, jadi tidak perlu menyuntikkan HTML mentah. -->
            <p class="text-sm text-slate-600 leading-relaxed">
              <template v-for="(bagian, i) in instruksiSegmen" :key="i">
                <strong v-if="bagian.tebal" class="font-bold">{{
                  bagian.teks
                }}</strong>
                <template v-else>{{ bagian.teks }}</template>
              </template>
            </p>
            <p
              class="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[13px]">person</span
              >{{ data?.sasaran }}
            </p>
          </div>
        </div>

        <!-- QUESTION CARD -->
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
        >
          <!-- Card Header -->
          <div
            class="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-full bg-[#0f4b80] flex items-center justify-center shrink-0 shadow-sm"
              >
                <span class="text-white text-xs font-bold">{{
                  store.currentQuestion + 1
                }}</span>
              </div>
              <span
                class="text-xs font-semibold text-slate-400 uppercase tracking-wide"
                >Soal {{ store.currentQuestion + 1 }} / {{ totalSoal }}</span
              >
            </div>
            <span
              v-if="skalaBadge"
              :class="[
                'px-2.5 py-1 rounded-full text-[11px] font-bold border',
                skalaBadge.cls,
              ]"
            >
              {{ skalaBadge.label }}
            </span>
          </div>

          <!-- Teks Soal + Opsi

               Struktur memakai fieldset + legend + <input type="radio">
               yang sebenarnya, bukan tombol.

               Sebelumnya seluruh opsi berupa <button> dan status pilihan
               hanya disampaikan lewat kelas CSS. Akibatnya pembaca layar
               mengumumkan empat tombol yang tidak berkaitan, tanpa
               memberi tahu bahwa ini pilihan tunggal, berapa jumlah
               pilihannya, atau mana yang sedang dipilih. Navigasi panah
               antar-opsi juga tidak berfungsi.

               Radio asli memberi semuanya secara bawaan: pengelompokan,
               "1 dari 4", status terpilih, dan navigasi panah. Inputnya
               disembunyikan secara visual namun tetap dapat difokus
               (sr-only), sedangkan tampilan kartu dipertahankan lewat
               <label>. -->
          <div class="p-5">
            <fieldset class="border-0 p-0 m-0">
              <legend
                class="text-slate-800 font-semibold text-[15px] leading-relaxed mb-1"
              >
                {{ soalNow?.teks }}
              </legend>

              <!-- Peringatan khusus EPDS soal 10 -->
              <div
                v-if="soalNow?.flagQuestion"
                class="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5"
              >
                <span
                  aria-hidden="true"
                  class="material-symbols-outlined text-rose-400 text-[18px] shrink-0 mt-0.5"
                  >info</span
                >
                <p class="text-xs text-rose-700 leading-relaxed font-medium">
                  Pertanyaan ini penting untuk diisi dengan jujur. Jawaban Anda
                  akan ditangani secara profesional dan sepenuhnya rahasia.
                </p>
              </div>

              <!-- OPSI YA/TIDAK (2 kolom) -->
              <div
                v-if="data?.tipe_jawaban === 'YA_TIDAK'"
                class="mt-5 grid grid-cols-2 gap-3"
              >
                <label
                  v-for="(o, i) in opsiList"
                  :key="i"
                  :class="[
                    'option-card rounded-xl p-5 flex flex-col items-center gap-3 cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-600',
                    isSelected(i) ? 'selected' : '',
                  ]"
                >
                  <input
                    type="radio"
                    class="sr-only"
                    :name="namaGrup"
                    :value="i"
                    :checked="isSelected(i)"
                    @change="pilihJawaban(o.value, i)"
                  />
                  <div
                    aria-hidden="true"
                    :class="[
                      'icon-box w-12 h-12 rounded-full flex items-center justify-center transition-all',
                      isSelected(i) && o.label === 'Ya'
                        ? 'bg-sky-100'
                        : 'bg-slate-100',
                    ]"
                  >
                    <span
                      :class="[
                        'material-symbols-outlined text-[26px]',
                        isSelected(i)
                          ? o.label === 'Ya'
                            ? 'text-sky-500'
                            : 'text-slate-500'
                          : 'text-slate-400',
                      ]"
                    >
                      {{ o.label === "Ya" ? "check_circle" : "cancel" }}
                    </span>
                  </div>
                  <span
                    :class="[
                      'option-text text-sm font-bold',
                      isSelected(i) ? 'text-sky-700' : 'text-slate-600',
                    ]"
                    >{{ o.label }}</span
                  >
                  <div
                    aria-hidden="true"
                    :class="[
                      'check-circle w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      isSelected(i)
                        ? 'border-sky-400 bg-sky-400'
                        : 'border-slate-300',
                    ]"
                  >
                    <div
                      :class="[
                        'check-dot w-2 h-2 rounded-full bg-white',
                        isSelected(i)
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      ]"
                    ></div>
                  </div>
                </label>
              </div>

              <!-- OPSI VERTIKAL (4 pilihan — PHQ-4 & EPDS) -->
              <div v-else class="mt-5 flex flex-col gap-2.5">
                <label
                  v-for="(o, i) in opsiList"
                  :key="i"
                  :class="[
                    'option-card rounded-xl px-4 py-3.5 flex items-center gap-4 text-left cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-600',
                    isSelected(i) ? 'selected' : '',
                  ]"
                >
                  <input
                    type="radio"
                    class="sr-only"
                    :name="namaGrup"
                    :value="i"
                    :checked="isSelected(i)"
                    @change="pilihJawaban(o.value, i)"
                  />
                  <div
                    aria-hidden="true"
                    :class="[
                      'icon-box w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all',
                      isSelected(i) ? 'bg-sky-100' : 'bg-slate-100',
                    ]"
                  >
                    <span
                      :class="[
                        'text-xs font-bold',
                        isSelected(i) ? 'text-sky-600' : 'text-slate-400',
                      ]"
                      >{{ ["A", "B", "C", "D"][i] }}</span
                    >
                  </div>
                  <span
                    :class="[
                      'option-text text-sm font-medium flex-1 leading-snug',
                      isSelected(i)
                        ? 'text-sky-800 font-semibold'
                        : 'text-slate-700',
                    ]"
                    >{{ o.label }}</span
                  >
                  <div
                    aria-hidden="true"
                    :class="[
                      'check-circle w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                      isSelected(i)
                        ? 'border-sky-400 bg-sky-400'
                        : 'border-slate-300',
                    ]"
                  >
                    <div
                      :class="[
                        'check-dot w-2 h-2 rounded-full bg-white',
                        isSelected(i)
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      ]"
                    ></div>
                  </div>
                </label>
              </div>
            </fieldset>
          </div>
        </div>

        <!-- PANEL KRISIS — muncul segera setelah responden mengakui
             pikiran mencelakai diri sendiri (EPDS item 10). Ditempatkan
             di sini, bukan hanya di halaman hasil, agar bantuan hadir
             pada saat pengakuan. -->
        <PanelKrisis v-if="tampilkanKrisis" nada="mendesak" />

        <!-- NAVIGASI -->
        <div class="flex gap-3 items-stretch">
          <button
            v-if="store.currentQuestion > 0"
            @click="prevSoal"
            class="flex-1 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[18px]"
              >arrow_back</span
            >
            Sebelumnya
          </button>
          <div v-else class="flex-1"></div>

          <button
            @click="isLast ? submitKuesioner() : nextSoal()"
            :class="[
              'flex-[2] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group',
              answered
                ? 'bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] hover:from-[#0a355c] hover:to-[#1565c0] text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none',
            ]"
          >
            <span>{{ isLast ? "Lihat Hasil Skrining" : "Selanjutnya" }}</span>
            <span
              class="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform"
            >
              {{ isLast ? "assessment" : "arrow_forward" }}
            </span>
          </button>
        </div>

        <!-- Dot Indicator -->
        <div class="flex items-center justify-center gap-1.5 flex-wrap py-2">
          <div
            v-for="(_, i) in soalList"
            :key="i"
            :class="[
              'transition-all duration-300 rounded-full',
              i < store.currentQuestion
                ? 'w-3 h-3 bg-[#0f4b80]'
                : i === store.currentQuestion
                  ? 'w-4 h-4 bg-blue-400 ring-2 ring-blue-200'
                  : 'w-3 h-3 bg-slate-200',
            ]"
          ></div>
        </div>
      </div>
    </main>

    <footer
      class="relative z-10 py-4 text-center text-xs text-slate-400 no-print"
    >
      © 2026 Puskesmas Sekadau. Sistem Skrining Jiwa Terpadu.
    </footer>

    <!-- MODAL KEJUJURAN -->
    <ModalKejujuran :visible="showModal" @confirm="onModalConfirm" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useSkriningStore } from "@/stores/skriningStore";
import { useToast } from "@/composables/useToast";
import { INSTRUMEN_DATA } from "@/constants/instrumen";
import ModalKejujuran from "@/components/ModalKejujuran.vue";
import PanelKrisis from "@/components/PanelKrisis.vue";
import { NILAI_KRISIS_E10 } from "@/utils/skoring";

const router = useRouter();
const store = useSkriningStore();
const { showToast } = useToast();

const showModal = ref(false);

// Guard: pastikan data tersedia
onMounted(() => {
  if (!store.instrumen || !store.patientData?.nama_lengkap) {
    router.replace("/identitas");
    return;
  }
  if (!store.sudahSetujuJujur) {
    showModal.value = true;
  }
});

function onModalConfirm() {
  showModal.value = false;
  store.sudahSetujuJujur = true;
}

// ── Data Instrumen ──
const data = computed(() => INSTRUMEN_DATA[store.instrumen]);

/**
 * Memecah teks petunjuk menjadi potongan biasa dan potongan tebal,
 * berdasarkan penanda <strong> di INSTRUMEN_DATA.
 *
 * Menggantikan v-html: teks tetap dirender melalui interpolasi Vue
 * yang otomatis meng-escape, sehingga tidak ada jalur injeksi HTML.
 */
const instruksiSegmen = computed(() => {
  const teks = data.value?.instruksi;
  if (!teks) return [];
  return teks
    .split(/<strong>|<\/strong>/)
    .map((bagian, i) => ({ teks: bagian, tebal: i % 2 === 1 }))
    .filter((bagian) => bagian.teks !== "");
});
const soalList = computed(() => data.value?.soal || []);
const totalSoal = computed(() => soalList.value.length);
const soalNow = computed(() => soalList.value[store.currentQuestion]);
const opsiList = computed(() => soalNow.value?.opsi || data.value?.opsi || []);
const isLast = computed(() => store.currentQuestion === totalSoal.value - 1);
const answered = computed(
  () => store.answers[store.currentQuestion] !== undefined,
);
// Guard `|| 1`: pada satu render sebelum onMounted mengalihkan halaman,
// totalSoal masih 0 dan pembagian menghasilkan NaN yang bocor ke
// atribut style sebagai "width: NaN%".
const progressPct = computed(() =>
  Math.round((store.currentQuestion / (totalSoal.value || 1)) * 100),
);

/**
 * Nama grup radio, unik per soal.
 *
 * Wajib berbeda antar-soal: bila sama, browser menganggap seluruh soal
 * sebagai satu grup pilihan tunggal, sehingga memilih jawaban pada soal
 * berikutnya akan membatalkan jawaban soal sebelumnya.
 */
const namaGrup = computed(
  () => `soal-${store.instrumen}-${store.currentQuestion}`,
);

/**
 * Panel krisis tampil saat soal aktif adalah item flag (EPDS item 10)
 * DAN jawaban yang dipilih mengakui adanya pikiran mencelakai diri
 * (nilai >= NILAI_KRISIS_E10, yaitu "Kadang-kadang" atau "Ya, agak sering").
 *
 * Ambang ini lebih rendah daripada ambang eskalasi risiko (nilai 3).
 * Juknis hanya mengeskalasi klasifikasi pada "Ya, agak sering", tetapi
 * setiap pengakuan pikiran mencelakai diri tetap perlu mendapat nomor
 * bantuan. Klasifikasi mengikuti regulasi; keselamatan tidak menunggu.
 */
const tampilkanKrisis = computed(() => {
  if (!soalNow.value?.flagQuestion) return false;
  const jwb = store.answers[store.currentQuestion];
  return jwb !== undefined && jwb.value >= NILAI_KRISIS_E10;
});

// ── Badge Skala ──
const skalaBadge = computed(() => {
  const s = soalNow.value;
  if (!s) return null;
  if (["MMYS_ANAK", "MMYS_REMAJA"].includes(store.instrumen)) {
    return s.skala === "A"
      ? {
          label: "Skala A — Kecemasan",
          cls: "bg-sky-50 text-sky-700 border-sky-200",
        }
      : {
          label: "Skala B — Depresi",
          cls: "bg-violet-50 text-violet-700 border-violet-200",
        };
  }
  if (store.instrumen === "PHQ4") {
    return s.skala === "PHQ2"
      ? {
          label: "PHQ-2 — Depresi",
          cls: "bg-orange-50 text-orange-700 border-orange-200",
        }
      : {
          label: "GAD-2 — Kecemasan",
          cls: "bg-amber-50 text-amber-700 border-amber-200",
        };
  }
  return null;
});

function isSelected(optionIndex) {
  const ans = store.answers[store.currentQuestion];
  return ans !== undefined && ans.optionIndex === optionIndex;
}

// ── Pilih Jawaban ──
function pilihJawaban(value, optionIndex) {
  store.setAnswer(store.currentQuestion, {
    id: soalNow.value.id,
    value,
    optionIndex,
  });

  // MMYS: auto-lanjut setelah 400ms
  if (["MMYS_ANAK", "MMYS_REMAJA"].includes(store.instrumen)) {
    setTimeout(() => {
      if (isLast.value) submitKuesioner();
      else nextSoal();
    }, 400);
  }
}

function nextSoal() {
  if (!answered.value) {
    showToast("Pilih jawaban terlebih dahulu.", "warning");
    return;
  }
  if (store.currentQuestion < totalSoal.value - 1) {
    store.nextQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function prevSoal() {
  store.prevQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleBack() {
  if (store.currentQuestion > 0) {
    prevSoal();
  } else {
    if (
      confirm(
        "Kembali ke formulir identitas? Semua jawaban yang sudah diisi akan hilang.",
      )
    ) {
      store.answers = [];
      store.currentQuestion = 0;
      router.push("/identitas");
    }
  }
}

function submitKuesioner() {
  const belum = soalList.value.findIndex(
    (_, i) => store.answers[i] === undefined,
  );
  if (belum !== -1) {
    showToast(`Soal nomor ${belum + 1} belum dijawab.`, "warning");
    store.goToQuestion(belum);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  router.push("/review");
}
</script>
