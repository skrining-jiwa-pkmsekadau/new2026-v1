<template>
  <div class="relative flex flex-col min-h-screen bg-[#F0F7FF]">
    <!-- Dekorasi BG -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]"
      ></div>
      <div
        class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px]"
      ></div>
    </div>

    <!-- HEADER -->
    <header class="sticky top-0 z-50 bg-[#0f4b80] px-4 py-4 shadow-lg">
      <div class="max-w-2xl mx-auto flex items-center gap-3">
        <button
          class="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
          @click="router.push('/')"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-white font-bold text-base leading-tight">
            Formulir Identitas Pasien
          </h1>
          <p class="text-blue-100 text-xs">Langkah 1 dari 3 — Data Diri</p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <div class="w-7 h-1.5 rounded-full bg-white"></div>
          <div class="w-7 h-1.5 rounded-full bg-white/30"></div>
          <div class="w-7 h-1.5 rounded-full bg-white/30"></div>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="flex-1 flex flex-col items-center px-4 py-8 relative z-10">
      <div class="w-full max-w-2xl flex flex-col gap-5">
        <!-- Alert 90 Hari -->
        <div class="bg-blue-50 border border-blue-200 shadow-sm rounded-2xl p-4 flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-blue-600 text-[18px]">info</span>
          </div>
          <div>
            <h3 class="text-sm font-bold text-blue-900 mb-1">Penting: Batas Waktu Skrining</h3>
            <p class="text-xs text-blue-800 leading-relaxed">
              Setiap pasien hanya diperbolehkan melakukan skrining <strong>1 kali dalam 90 hari (3 bulan)</strong>. Sistem akan otomatis menolak pengisian kuesioner jika belum melewati batas waktu tersebut.
            </p>
          </div>
        </div>

        <!-- Preview Instrumen -->
        <div
          v-if="instrumenPreview"
          :class="[
            'p-4 rounded-xl border-2 transition-all',
            instrumenPreview.bg,
            instrumenPreview.border,
          ]"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"
            >
              <span
                :class="[
                  'material-symbols-outlined text-[22px]',
                  instrumenPreview.iconColor,
                ]"
                >{{ instrumenPreview.icon }}</span
              >
            </div>
            <div>
              <p
                class="text-[11px] font-bold uppercase tracking-wide text-blue-400"
              >
                Instrumen yang akan digunakan
              </p>
              <p :class="['font-bold text-sm', instrumenPreview.text]">
                {{ instrumenPreview.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- FORM CARD -->
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
        >
          <!-- ── SEKSI 1: DATA DIRI ── -->
          <div
            class="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100"
          >
            <h2
              class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-blue-400 text-[16px]"
                >person</span
              >Data Diri
            </h2>
          </div>

          <div class="p-6 space-y-5">
            <!-- Nama Lengkap -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Nama Lengkap <span class="text-red-400">*</span></label
              >
              <input
                v-model="form.nama"
                type="text"
                placeholder="Masukkan nama lengkap sesuai KTP"
                class="warm-input w-full px-4 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <!-- NIK -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >NIK <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <span
                    class="material-symbols-outlined text-slate-400 text-[18px]"
                    >badge</span
                  >
                </span>
                <input
                  v-model="form.nik"
                  type="text"
                  maxlength="16"
                  placeholder="16 digit Nomor Induk Kependudukan"
                  class="warm-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none font-mono"
                  @input="onNikInput"
                />
              </div>
              <p
                :class="[
                  'text-xs mt-1 ml-1',
                  form.nik.length === 16
                    ? 'text-emerald-500 font-semibold'
                    : 'text-slate-400',
                ]"
              >
                {{ form.nik.length }} / 16 digit
              </p>
              <!-- NIK Riwayat Banner -->
              <div
                v-if="nikStatus.html"
                class="mt-2"
                v-html="nikStatus.html"
              ></div>
            </div>

            <!-- Tanggal Lahir + Usia -->
            <div class="grid grid-cols-5 gap-3">
              <div class="col-span-3">
                <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                  >Tanggal Lahir <span class="text-red-400">*</span></label
                >
                <input
                  v-model="form.tglLahir"
                  type="date"
                  :max="hariIni()"
                  class="warm-input w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                  >Usia</label
                >
                <div
                  class="warm-input w-full px-3 py-2.5 rounded-lg text-sm bg-slate-50 flex items-center gap-2 min-h-[42px]"
                >
                  <span
                    class="material-symbols-outlined text-slate-400 text-[16px] shrink-0"
                    >cake</span
                  >
                  <span
                    v-if="usia >= 7"
                    class="text-slate-800 text-sm font-bold"
                    >{{ usia }} Tahun</span
                  >
                  <span
                    v-else-if="usia > 0"
                    class="text-red-500 text-sm font-bold"
                    >{{ usia }} Tahun</span
                  >
                  <span v-else class="text-slate-400 text-xs">Otomatis</span>
                </div>
              </div>
            </div>

            <!-- Jenis Kelamin -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2"
                >Jenis Kelamin <span class="text-red-400">*</span></label
              >
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="form.gender = 'L'"
                  :class="[
                    'gender-btn flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all',
                    form.gender === 'L'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300',
                  ]"
                >
                  <div
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                      form.gender === 'L'
                        ? 'border-blue-500'
                        : 'border-slate-300',
                    ]"
                  >
                    <div
                      :class="[
                        'w-2.5 h-2.5 rounded-full bg-blue-500 transition-all',
                        form.gender === 'L'
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      ]"
                    ></div>
                  </div>
                  <span
                    :class="[
                      'material-symbols-outlined text-[20px]',
                      form.gender === 'L' ? 'text-blue-500' : 'text-slate-400',
                    ]"
                    >male</span
                  >
                  <span class="text-sm font-medium text-slate-700"
                    >Laki-laki</span
                  >
                </button>
                <button
                  type="button"
                  @click="form.gender = 'P'"
                  :class="[
                    'gender-btn flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all',
                    form.gender === 'P'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-slate-200 hover:border-pink-300',
                  ]"
                >
                  <div
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                      form.gender === 'P'
                        ? 'border-pink-500'
                        : 'border-slate-300',
                    ]"
                  >
                    <div
                      :class="[
                        'w-2.5 h-2.5 rounded-full bg-pink-500 transition-all',
                        form.gender === 'P'
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      ]"
                    ></div>
                  </div>
                  <span
                    :class="[
                      'material-symbols-outlined text-[20px]',
                      form.gender === 'P' ? 'text-pink-500' : 'text-slate-400',
                    ]"
                    >female</span
                  >
                  <span class="text-sm font-medium text-slate-700"
                    >Perempuan</span
                  >
                </button>
              </div>
            </div>

            <!-- Nomor HP -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Nomor HP <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <span
                    class="material-symbols-outlined text-slate-400 text-[18px]"
                    >phone</span
                  >
                </span>
                <input
                  v-model="form.hp"
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  class="warm-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none"
                  @input="form.hp = form.hp.replace(/\D/g, '')"
                />
              </div>
            </div>
          </div>

          <!-- ── SEKSI 2: ALAMAT ── -->
          <div
            class="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-b border-slate-100"
          >
            <h2
              class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-blue-400 text-[16px]"
                >location_on</span
              >Alamat &amp; Wilayah
            </h2>
          </div>

          <div class="p-6 space-y-5">
            <!-- Kecamatan -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Kecamatan <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <select
                  v-model="form.kecamatan"
                  class="warm-input w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none appearance-none pr-10"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  <option v-for="kec in kecamatanList" :key="kec" :value="kec">
                    {{ kec }}
                  </option>
                </select>
                <span
                  class="absolute inset-y-0 right-3 flex items-center pointer-events-none"
                >
                  <span
                    class="material-symbols-outlined text-slate-400 text-[18px]"
                    >expand_more</span
                  >
                </span>
              </div>
            </div>

            <!-- Desa -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Desa / Kelurahan <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <select
                  v-model="form.desa"
                  class="warm-input w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none appearance-none pr-10"
                >
                  <option value="">
                    {{
                      form.kecamatan
                        ? "-- Pilih Desa/Kelurahan --"
                        : "-- Pilih Kecamatan terlebih dahulu --"
                    }}
                  </option>
                  <option v-for="d in desaList" :key="d" :value="d">
                    {{ d }}
                  </option>
                </select>
                <span
                  class="absolute inset-y-0 right-3 flex items-center pointer-events-none"
                >
                  <span
                    class="material-symbols-outlined text-slate-400 text-[18px]"
                    >expand_more</span
                  >
                </span>
              </div>
            </div>

            <!-- Alamat -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Alamat Lengkap <span class="text-red-400">*</span></label
              >
              <textarea
                v-model="form.alamat"
                rows="2"
                placeholder="Jl. Nama Jalan, No. Rumah, RT/RW"
                class="warm-input w-full px-4 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <!-- ── SEKSI 3: PENDIDIKAN & PEKERJAAN ── -->
          <div
            class="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-b border-slate-100"
          >
            <h2
              class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-blue-400 text-[16px]"
                >school</span
              >Pendidikan &amp; Pekerjaan
            </h2>
          </div>

          <div class="p-6 space-y-5">
            <!-- Pendidikan -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Pendidikan Terakhir <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]"
                  >school</span
                >
                <select
                  v-model="form.pendidikan"
                  class="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none bg-white text-slate-700 text-sm font-medium appearance-none transition-all"
                >
                  <option value="">-- Pilih Pendidikan --</option>
                  <option v-for="p in pendidikanOptions" :key="p" :value="p">
                    {{ p }}
                  </option>
                </select>
                <span
                  class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px] pointer-events-none"
                  >expand_more</span
                >
              </div>
            </div>

            <!-- Pekerjaan -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Pekerjaan <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]"
                  >work</span
                >
                <input
                  v-model="form.pekerjaan"
                  type="text"
                  placeholder="Contoh: Pelajar, Petani, Pegawai Swasta, IRT"
                  class="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none bg-white text-slate-700 text-sm font-medium transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <!-- Tempat Skrining -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Tempat Skrining <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]"
                  >location_on</span
                >
                <input
                  v-model="form.tempatSkrining"
                  type="text"
                  placeholder="Contoh: Puskesmas Sekadau, SDN 01 Sekadau, Posyandu..."
                  class="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none bg-white text-slate-700 text-sm font-medium transition-all placeholder:text-slate-300"
                />
              </div>
              <p class="text-[11px] text-slate-400 mt-1 ml-1">
                Isi sesuai lokasi skrining dilakukan (Puskesmas, Sekolah,
                Posyandu, Rumah, dll.)
              </p>
            </div>
          </div>

          <!-- ── SEKSI 4: HAMIL/NIFAS (KONDISIONAL) ── -->
          <template v-if="showHamilSection">
            <div class="px-6 py-4 bg-rose-50 border-t border-b border-rose-100">
              <h2
                class="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2"
              >
                <span
                  class="material-symbols-outlined text-rose-400 text-[16px]"
                  >pregnant_woman</span
                >
                Kondisi Kehamilan
              </h2>
            </div>
            <div class="p-6">
              <p class="text-sm font-semibold text-slate-700 mb-3">
                Apakah saat ini sedang hamil atau dalam masa nifas?
                <span class="text-red-400">*</span>
              </p>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="form.hamil = 'ya'"
                  :class="[
                    'hamil-btn flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    form.hamil === 'ya'
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-slate-200 hover:border-rose-300',
                  ]"
                >
                  <div
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                      form.hamil === 'ya'
                        ? 'border-rose-500'
                        : 'border-slate-300',
                    ]"
                  >
                    <div
                      :class="[
                        'w-2.5 h-2.5 rounded-full bg-rose-500 transition-all',
                        form.hamil === 'ya'
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      ]"
                    ></div>
                  </div>
                  <span class="text-sm font-semibold text-slate-700">Ya</span>
                </button>
                <button
                  type="button"
                  @click="form.hamil = 'tidak'"
                  :class="[
                    'hamil-btn flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    form.hamil === 'tidak'
                      ? 'border-slate-500 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-400',
                  ]"
                >
                  <div
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                      form.hamil === 'tidak'
                        ? 'border-slate-500'
                        : 'border-slate-300',
                    ]"
                  >
                    <div
                      :class="[
                        'w-2.5 h-2.5 rounded-full bg-slate-500 transition-all',
                        form.hamil === 'tidak'
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      ]"
                    ></div>
                  </div>
                  <span class="text-sm font-semibold text-slate-700"
                    >Tidak</span
                  >
                </button>
              </div>
            </div>
          </template>

          <!-- ── FOOTER FORM ── -->
          <div class="p-6 bg-slate-50 border-t border-slate-100">
            <button
              @click="submitIdentitas"
              :disabled="store.nikDiblokir"
              :class="[
                'w-full py-3.5 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 group',
                store.nikDiblokir
                  ? 'bg-slate-300 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] hover:from-[#0a355c] hover:to-[#1565c0]',
              ]"
            >
              <span>Lanjutkan ke Skrining</span>
              <span
                class="material-symbols-outlined group-hover:translate-x-1 transition-transform"
                >arrow_forward</span
              >
            </button>
            <p class="text-center text-xs text-slate-400 mt-3">
              <span class="material-symbols-outlined text-[14px] align-middle"
                >lock</span
              >
              Data Anda dijaga kerahasiaannya sesuai regulasi kesehatan.
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- FOOTER -->
    <footer
      class="relative z-10 py-6 text-center text-xs text-slate-400 no-print border-t border-slate-100 bg-white/50"
    >
      © 2026 Puskesmas Sekadau. Sistem Skrining Jiwa Terpadu.
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useSkriningStore } from "@/stores/skriningStore";
import { useToast } from "@/composables/useToast";
import { DATA_WILAYAH } from "@/constants/wilayah";
import { INSTRUMEN_INFO } from "@/constants/instrumen";
import {
  hitungUsia,
  nentukanInstrumen,
  hariIni,
  formatTanggalID,
  escHtml,
} from "@/utils/helpers";
import { db } from "@/services/supabase";

const router = useRouter();
const store = useSkriningStore();
const { showToast } = useToast();

// ── Form Data (reactive, menggantikan getElementById) ──
const form = ref({
  nama: "",
  nik: "",
  tglLahir: "",
  gender: "",
  hp: "",
  kecamatan: "",
  desa: "",
  alamat: "",
  pendidikan: "",
  pekerjaan: "",
  tempatSkrining: "",
  hamil: "",
});

const pendidikanOptions = [
  "Tidak Sekolah",
  "SD/Sederajat",
  "SMP/Sederajat",
  "SMA/Sederajat",
  "D3/D4",
  "S1",
  "S2/S3",
];

// ── Computed ──
const usia = computed(() => hitungUsia(form.value.tglLahir));
const kecamatanList = computed(() => Object.keys(DATA_WILAYAH));
const desaList = computed(() => DATA_WILAYAH[form.value.kecamatan] || []);
const showHamilSection = computed(
  () => form.value.gender === "P" && usia.value >= 13,
);

const instrumenPreview = computed(() => {
  if (!form.value.tglLahir || !form.value.gender) return null;
  const hamil = form.value.hamil === "ya";
  const kode = nentukanInstrumen(usia.value, form.value.gender, hamil);
  return kode ? INSTRUMEN_INFO[kode] : null;
});

// Reset desa saat kecamatan berubah
watch(
  () => form.value.kecamatan,
  () => {
    form.value.desa = "";
  },
);

// Reset hamil saat gender/usia berubah dan section tersembunyi
watch(showHamilSection, (show) => {
  if (!show) form.value.hamil = "";
});

// ── NIK Checking ──
const nikStatus = ref({ html: "", checking: false });
let nikDebounce = null;

function onNikInput() {
  form.value.nik = form.value.nik.replace(/\D/g, "");
  clearTimeout(nikDebounce);
  if (form.value.nik.length < 16) {
    nikStatus.value.html = "";
    store.nikDiblokir = false;
    store.tanggalBolehSkrining = null;
    return;
  }
  nikStatus.value.checking = true;
  nikStatus.value.html = `<div class="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
    <span class="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>Memeriksa riwayat...</div>`;
  nikDebounce = setTimeout(() => cekRiwayatNIK(form.value.nik), 600);
}

async function cekRiwayatNIK(nik) {
  store.nikDiblokir = false;
  store.tanggalBolehSkrining = null;
  try {
    const { data, error } = await db.rpc("cek_riwayat_nik", { p_nik: nik });

    if (error) {
      console.error("Gagal memeriksa riwayat:", error.message);
      throw error;
    }

    if (!data || data.length === 0) {
      nikStatus.value.html = `<div class="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
        <span class="material-symbols-outlined text-[15px]">person_add</span>NIK baru — belum ada riwayat.</div>`;
      return;
    }
    const BATAS_HARI = 90;
    const tglTerakhir = new Date(data[0].tanggal_skrining);
    const tglTerakhirUtc = Date.UTC(
      tglTerakhir.getFullYear(),
      tglTerakhir.getMonth(),
      tglTerakhir.getDate(),
    );
    const hariIniDate = new Date();
    const hariIniUtc = Date.UTC(
      hariIniDate.getFullYear(),
      hariIniDate.getMonth(),
      hariIniDate.getDate(),
    );
    const selisihHari = Math.floor(
      (hariIniUtc - tglTerakhirUtc) / (1000 * 60 * 60 * 24),
    );
    const sisaHari = BATAS_HARI - selisihHari;
    const tglBoleh = new Date(tglTerakhir);
    tglBoleh.setDate(tglTerakhir.getDate() + BATAS_HARI);

    const rC = (r) =>
      ({
        "High Risk": "bg-red-100 text-red-700",
        "Moderate Risk": "bg-amber-100 text-amber-700",
        "Low Risk": "bg-emerald-100 text-emerald-700",
      })[r] || "bg-slate-100 text-slate-600";
    const iL = (i) =>
      ({
        MMYS_ANAK: "MMYS Anak",
        MMYS_REMAJA: "MMYS Remaja",
        PHQ4: "PHQ-4",
        EPDS: "EPDS",
      })[i] || i;
    const rows = data
      .map(
        (
          d,
        ) => `<div class="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-slate-400 text-[13px]">calendar_today</span>
      <span class="text-[11px] text-slate-600">${formatTanggalID(d.tanggal_skrining)}</span>
      <span class="text-[11px] font-medium">&middot; ${escHtml(iL(d.instrumen))}</span></div>
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${rC(d.tingkat_risiko)}">${escHtml(d.tingkat_risiko) || "-"}</span></div>`,
      )
      .join("");

    if (sisaHari > 0) {
      store.nikDiblokir = true;
      store.tanggalBolehSkrining = tglBoleh;
      nikStatus.value.html = `<div class="p-3 rounded-xl bg-rose-50 border-2 border-rose-200">
        <div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-rose-500 text-[18px]">block</span>
        <p class="text-xs font-bold text-rose-700">Skrining Belum Dapat Dilakukan</p></div>
        <p class="text-[11px] text-rose-700 mb-2.5 leading-relaxed">Pasien <strong>${escHtml(data[0]?.nama_lengkap || "-")}</strong> sudah skrining pada <strong>${formatTanggalID(data[0].tanggal_skrining)}</strong>.<br>
        Skrining berikutnya: <span class="font-bold text-rose-900 text-[13px]">${formatTanggalID(tglBoleh.toISOString())}</span>
        <span class="ml-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">sisa ${sisaHari} hari</span></p>
        <div class="bg-white rounded-lg p-2 border border-rose-100 mb-2">${rows}</div>
        <p class="text-[10px] text-rose-500 italic">⚠ Skrining hanya dapat dilakukan 1x dalam 90 hari.</p></div>`;
    } else {
      store.nikDiblokir = false;
      nikStatus.value.html = `<div class="p-3 rounded-xl bg-blue-50 border border-blue-200">
        <div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-blue-500 text-[16px]">history</span>
        <p class="text-xs font-bold text-blue-700">Pernah skrining <span class="text-blue-900">${data.length}x</span>
        <span class="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">✓ Boleh skrining kembali</span></p></div>
        <div class="bg-white rounded-lg p-2 border border-blue-100">${rows}</div>
        <p class="text-[10px] text-blue-500 mt-1.5 italic">Nama: ${escHtml(data[0]?.nama_lengkap || "-")}</p></div>`;
    }
  } catch {
    nikStatus.value.html = `<div class="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
      <span class="material-symbols-outlined text-[15px]">wifi_off</span>Tidak dapat memeriksa riwayat.</div>`;
  } finally {
    nikStatus.value.checking = false;
  }
}

// ── Submit ──
function submitIdentitas() {
  if (nikStatus.value.checking)
    return showToast(
      "Sedang memeriksa riwayat NIK, mohon tunggu...",
      "warning",
    );
  const f = form.value;
  if (!f.nama.trim()) return showToast("Nama lengkap harus diisi.", "error");
  if (!f.nik || f.nik.length !== 16)
    return showToast("NIK harus tepat 16 digit.", "error");
  if (!f.tglLahir) return showToast("Tanggal lahir harus diisi.", "error");
  if (usia.value < 7)
    return showToast("Usia minimal untuk skrining adalah 7 tahun.", "warning");
  if (!f.gender)
    return showToast("Pilih jenis kelamin terlebih dahulu.", "error");
  if (!f.hp.trim()) return showToast("Nomor HP harus diisi.", "error");
  if (!f.kecamatan)
    return showToast("Pilih kecamatan terlebih dahulu.", "error");
  if (!f.desa)
    return showToast("Pilih desa/kelurahan terlebih dahulu.", "error");
  if (!f.alamat.trim())
    return showToast("Alamat lengkap harus diisi.", "error");
  if (!f.pendidikan) return showToast("Pilih pendidikan terakhir.", "error");
  if (!f.pekerjaan.trim()) return showToast("Pekerjaan harus diisi.", "error");
  if (!f.tempatSkrining.trim())
    return showToast("Tempat skrining harus diisi.", "error");

  let hamilNifas = false;
  if (showHamilSection.value) {
    if (!f.hamil) return showToast("Pilih status kehamilan / nifas.", "error");
    hamilNifas = f.hamil === "ya";
  }

  if (store.nikDiblokir) {
    const tglBoleh = store.tanggalBolehSkrining
      ? formatTanggalID(store.tanggalBolehSkrining.toISOString())
      : "-";
    showToast(
      `Skrining belum dapat dilakukan. Jadwal berikutnya: ${tglBoleh}`,
      "error",
    );
    return;
  }

  const instr = nentukanInstrumen(usia.value, f.gender, hamilNifas);
  if (!instr)
    return showToast(
      "Usia tidak memenuhi syarat skrining (min. 7 tahun).",
      "error",
    );

  store.setPatientData({
    nama_lengkap: f.nama.trim(),
    nik: f.nik,
    tanggal_lahir: f.tglLahir,
    usia: usia.value,
    jenis_kelamin: f.gender,
    nomor_hp: f.hp.trim(), // as expected by store/supabase
    no_hp: f.hp.trim(), // fallback just in case
    is_hamil_nifas: hamilNifas,
    kecamatan: f.kecamatan,
    desa: f.desa,
    alamat: f.alamat.trim(),
    pendidikan: f.pendidikan,
    pekerjaan: f.pekerjaan.trim(),
    tanggal_skrining: hariIni(),
    tempat_skrining: f.tempatSkrining.trim(),
  });
  store.setInstrumen(instr);
  store.currentQuestion = 0;
  store.answers = [];
  store.sudahSetujuJujur = false;

  router.push("/kuesioner");
}
</script>
