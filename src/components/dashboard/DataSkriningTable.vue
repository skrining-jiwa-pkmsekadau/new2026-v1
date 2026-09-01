<template>
  <div v-show="visible" class="flex flex-col gap-6">
    <!-- TABLE CARD -->
    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <!-- Filter Header -->
      <div
        class="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 lg:items-center justify-between"
      >
        <div class="flex items-center gap-2 shrink-0">
          <span
            class="material-symbols-outlined text-blue-500 text-[18px]"
            >table_view</span
          >
          <h2 class="text-sm font-bold text-slate-700">Data Skrining</h2>
          <span
            class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100"
            >{{ totalFiltered }}</span
          >
        </div>

        <!-- Filter Controls Container -->
        <div class="flex flex-col gap-3 w-full lg:w-auto">
          <!-- Search -->
          <div class="relative w-full">
            <span
              class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]"
              >search</span
            >
            <input
              type="text"
              placeholder="Cari nama / NIK..."
              :value="filterCari"
              @input="onCariInput($event.target.value)"
              class="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50"
            />
          </div>

          <!-- Selects -->
          <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-2 w-full">
            <select
              :value="filterInstr"
              @change="$emit('update:filterInstr', $event.target.value)"
              class="px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate"
            >
              <option value="">Semua Instrumen</option>
              <option value="MMYS_ANAK">MMYS Anak</option>
              <option value="MMYS_REMAJA">MMYS Remaja</option>
              <option value="PHQ4">PHQ-4</option>
              <option value="EPDS">EPDS</option>
            </select>
            <select
              :value="filterRisiko"
              @change="$emit('update:filterRisiko', $event.target.value)"
              class="px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate"
            >
              <option value="">Semua Risiko</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Moderate Risk">Moderate</option>
              <option value="High Risk">High Risk</option>
            </select>
            <select
              :value="filterKecamatan"
              @change="$emit('update:filterKecamatan', $event.target.value)"
              class="px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate"
            >
              <option value="">Semua Kecamatan</option>
              <option v-for="k in kecamatanList" :key="k" :value="k">
                {{ k }}
              </option>
            </select>
            <select
              :value="filterGender"
              @change="$emit('update:filterGender', $event.target.value)"
              class="px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate"
            >
              <option value="">Semua Gender</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            <select
              :value="filterRiwayat"
              @change="$emit('update:filterRiwayat', $event.target.value)"
              class="px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate"
            >
              <option value="">Semua Riwayat</option>
              <option value="pertama">Skrining Pertama</option>
              <option value="ulang">Skrining Ulang</option>
            </select>
            <select
              :value="filterSekolah"
              @change="$emit('update:filterSekolah', $event.target.value)"
              class="col-span-2 sm:col-span-4 xl:col-span-1 px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate w-full"
            >
              <option value="">Semua Sekolah/Kampus</option>
              <option v-for="s in semuaSekolahKampusOptions" :key="s" :value="s">
                {{ s }}
              </option>
            </select>
          </div>

          <!-- Date Range & Reset -->
          <div class="flex items-center justify-between gap-2 w-full">
            <div
              class="flex-1 flex items-center justify-center sm:justify-start gap-1 p-1.5 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
            >
              <span
                class="material-symbols-outlined text-blue-400 text-[14px] shrink-0"
                >calendar_month</span
              >
              <input
                type="date"
                :value="filterTglDari"
                @change="$emit('update:filterTglDari', $event.target.value)"
                class="px-1 py-1 rounded border border-slate-200 text-[10px] sm:text-[11px] text-slate-700 bg-white w-[100px] sm:w-[110px]"
              />
              <span class="text-[10px] text-slate-400 shrink-0">–</span>
              <input
                type="date"
                :value="filterTglSampai"
                @change="$emit('update:filterTglSampai', $event.target.value)"
                class="px-1 py-1 rounded border border-slate-200 text-[10px] sm:text-[11px] text-slate-700 bg-white w-[100px] sm:w-[110px]"
              />
              <button
                @click="$emit('clearDates')"
                class="w-5 h-5 rounded flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 shrink-0"
              >
                <span class="material-symbols-outlined text-[12px]"
                  >close</span
                >
              </button>
            </div>
            <button
              @click="$emit('reset')"
              class="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold transition-all shrink-0 h-full"
            >
              <span class="material-symbols-outlined text-[14px]"
                >filter_alt_off</span
              >
              <span class="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th
                @click="$emit('sort', 'tanggal_skrining')"
                class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-blue-600 whitespace-nowrap"
              >
                Tanggal
                <span
                  class="material-symbols-outlined text-[12px] align-middle"
                  >unfold_more</span
                >
              </th>
              <th
                @click="$emit('sort', 'nama_lengkap')"
                class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-blue-600"
              >
                Nama
                <span
                  class="material-symbols-outlined text-[12px] align-middle"
                  >unfold_more</span
                >
              </th>
              <th
                class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell"
              >
                NIK
              </th>
              <th
                class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide"
              >
                No HP
              </th>
              <th
                class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide hidden sm:table-cell"
              >
                Instrumen
              </th>
              <th
                @click="$emit('sort', 'skor_total')"
                class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-blue-600"
              >
                Skor
                <span
                  class="material-symbols-outlined text-[12px] align-middle"
                  >unfold_more</span
                >
              </th>
              <th
                class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide"
              >
                Risiko
              </th>
              <th
                class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide hidden lg:table-cell"
              >
                Tempat
              </th>
              <th
                class="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pageSlice.length === 0">
              <td
                colspan="8"
                class="px-4 py-12 text-center text-slate-400 text-sm"
              >
                <span
                  class="material-symbols-outlined text-[40px] block mb-2 text-slate-300"
                  >search_off</span
                >Tidak ada data yang cocok dengan filter.
              </td>
            </tr>
            <tr
              v-for="d in pageSlice"
              :key="d.id"
              class="border-b border-slate-50 hover:bg-blue-50/30 transition-colors"
            >
              <td
                class="px-4 py-3 text-xs text-slate-600 whitespace-nowrap font-medium"
              >
                {{ formatTanggalID(d.tanggal_skrining) }}
              </td>
              <td class="px-4 py-3">
                <p
                  class="text-sm font-semibold text-slate-800 leading-tight"
                >
                  {{ d.nama_lengkap || "-" }}
                </p>
                <p class="text-[11px] text-slate-400">
                  {{ d.usia || "-" }} th · {{ d.jenis_kelamin || "-" }}
                </p>
                <p class="text-[10px] text-blue-600 font-bold mt-1">
                  Skrining ke-{{ d.skrining_ke || 1 }}
                </p>
              </td>
              <td
                class="px-4 py-3 text-xs text-slate-500 font-mono hidden md:table-cell"
              >
                {{ d.nik || "-" }}
              </td>
              <td
                class="px-4 py-3 text-xs text-slate-500 font-medium"
              >
                <span class="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md max-w-max">
                   <span class="material-symbols-outlined text-[13px] text-emerald-500">call</span>
                   {{ d.nomor_hp || d.no_hp || d.hp || "-" }}
                </span>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span :class="instrBadgeCls(d.instrumen)">{{
                  instrLabelText(d.instrumen)
                }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-lg font-black text-slate-700">{{
                  d.skor_total ?? "-"
                }}</span>
              </td>
              <td class="px-4 py-3">
                <span :class="riskBadgeCls(risikoExport(d))">{{ risikoExport(d) }}</span>
              </td>
              <td
                class="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell max-w-[140px] truncate"
              >
                {{ d.tempat_skrining || "-" }}
              </td>
              <td class="px-4 py-3 text-center whitespace-nowrap">
                <button
                  @click.stop="$emit('openDetail', d, $event)"
                  class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-bold transition-all border border-blue-100"
                >
                  <span class="material-symbols-outlined text-[13px]"
                    >visibility</span
                  >Detail
                </button>
                <button
                  @click.stop="$emit('deleteRequest', d.id)"
                  class="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Hapus data"
                >
                  <span class="material-symbols-outlined text-[18px]"
                    >delete</span
                  >
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <p class="text-xs text-slate-500">
          Menampilkan
          <strong>{{ paginStart }}–{{ paginEnd }}</strong> dari
          <strong>{{ totalFiltered }}</strong> data
        </p>
        <div class="flex items-center gap-1.5">
          <button
            @click="$emit('changePage', halamanAktif - 1)"
            :disabled="halamanAktif <= 1"
            class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span class="material-symbols-outlined text-[16px]"
              >chevron_left</span
            >
          </button>
          <template v-for="pg in paginPages" :key="pg">
            <span
              v-if="pg === '...'"
              class="w-8 h-8 flex items-center justify-center text-slate-400 text-xs"
              >...</span
            >
            <button
              v-else
              @click="$emit('changePage', pg)"
              :class="[
                'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                pg === halamanAktif
                  ? 'bg-[#0f4b80] text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600',
              ]"
            >
              {{ pg }}
            </button>
          </template>
          <button
            @click="$emit('changePage', halamanAktif + 1)"
            :disabled="halamanAktif >= totalHalaman"
            class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span class="material-symbols-outlined text-[16px]"
              >chevron_right</span
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import { formatTanggalID } from "@/utils/helpers";
import { instrBadgeCls, instrLabelText, riskBadgeCls, risikoExport } from "@/utils/badgeHelpers";

const props = defineProps({
  visible: { type: Boolean, default: true },
  pageSlice: { type: Array, required: true },
  paginStart: { type: Number, required: true },
  paginEnd: { type: Number, required: true },
  totalFiltered: { type: Number, required: true },
  paginPages: { type: Array, required: true },
  halamanAktif: { type: Number, required: true },
  totalHalaman: { type: Number, required: true },
  filterCari: { type: String, default: "" },
  filterInstr: { type: String, default: "" },
  filterRisiko: { type: String, default: "" },
  filterKecamatan: { type: String, default: "" },
  filterGender: { type: String, default: "" },
  filterRiwayat: { type: String, default: "" },
  filterSekolah: { type: String, default: "" },
  filterTglDari: { type: String, default: "" },
  filterTglSampai: { type: String, default: "" },
  kecamatanList: { type: Array, required: true },
  semuaSekolahKampusOptions: { type: Array, required: true },
});

const emit = defineEmits([
  "update:filterCari",
  "update:filterInstr",
  "update:filterRisiko",
  "update:filterKecamatan",
  "update:filterGender",
  "update:filterRiwayat",
  "update:filterSekolah",
  "update:filterTglDari",
  "update:filterTglSampai",
  "clearDates",
  "reset",
  "sort",
  "changePage",
  "openDetail",
  "deleteRequest",
]);

// Debounced search handler
let cariTimeout = null;

function onCariInput(v) {
  clearTimeout(cariTimeout);
  cariTimeout = setTimeout(() => {
    emit("update:filterCari", v.toLowerCase());
  }, 300);
}

onBeforeUnmount(() => {
  if (cariTimeout) clearTimeout(cariTimeout);
});
</script>
