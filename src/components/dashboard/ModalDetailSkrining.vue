<template>
  <Teleport to="body">
  <div
    v-if="detail"
    class="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="judul-detail-modal"
    @keydown.esc="$emit('close')"
  >
    <div
      class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      @click="$emit('close')"
    ></div>
    <div
      ref="modalPanel"
      tabindex="-1"
      class="relative z-10 w-full sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl flex flex-col h-[90vh] sm:h-[650px] overflow-hidden focus:outline-none"
    >
      <div
        class="px-5 py-4 bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] sm:rounded-t-2xl flex items-start justify-between gap-3 shrink-0"
      >
        <div>
          <p
            class="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-0.5"
          >
            Detail Hasil Skrining
          </p>
          <h2 id="judul-detail-modal" class="text-white font-bold text-lg leading-tight">
            {{ detail.nama_lengkap }}
          </h2>
          <p class="text-blue-200 text-xs font-mono">
            NIK: {{ detail.nik || "-" }}
          </p>
          <span class="inline-flex mt-2 px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold text-white">
            Skrining ke-{{ detail.skrining_ke || 1 }} dari {{ detail.jumlah_riwayat || 1 }}
          </span>
        </div>
        <button
          @click="$emit('close')"
          aria-label="Tutup detail"
          class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white text-white flex items-center justify-center shrink-0 transition-all"
        >
          <span aria-hidden="true" class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <div class="flex border-b border-slate-100 bg-slate-50 shrink-0">
        <button
          v-for="(t, i) in ['Ringkasan', 'Jawaban', 'Rekomendasi', 'Riwayat']"
          :key="i"
          @click="modalTab = i"
          :class="[
            'flex-1 py-3 text-xs font-bold transition-all border-b-2',
            modalTab === i
              ? 'text-blue-600 border-blue-500 bg-white'
              : 'text-slate-400 border-transparent hover:text-slate-600',
          ]"
        >
          {{ t }}
        </button>
      </div>
      <div class="overflow-y-auto flex-1 p-5">
        <!-- TAB 0 -->
        <div v-show="modalTab === 0" class="flex flex-col gap-4">
          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Usia
              </p>
              <p class="text-sm font-bold text-slate-700">
                {{ detail.usia || "-" }} Tahun
              </p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Kelamin
              </p>
              <p class="text-sm font-bold text-slate-700">
                {{ detail.jenis_kelamin || "-" }}
              </p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Tanggal
              </p>
              <p class="text-sm font-bold text-slate-700">
                {{ formatTanggalID(detail.tanggal_skrining) }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Alamat
              </p>
              <p
                class="text-sm font-semibold text-slate-700 break-words"
              >
                {{ detail.alamat || "-" }}
              </p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                No HP
              </p>
              <p class="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px] text-emerald-500">call</span>
                {{ detail.nomor_hp || detail.no_hp || detail.hp || "-" }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Tempat Skrining
              </p>
              <p
                class="text-sm font-semibold text-slate-700 flex items-center gap-1"
              >
                <span
                  class="material-symbols-outlined text-blue-400 text-[14px]"
                  >location_on</span
                >{{ detail.tempat_skrining || "-" }}
              </p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Instrumen
              </p>
              <p class="text-sm font-semibold text-slate-700">
                {{ instrLabelText(detail.instrumen) }}
              </p>
            </div>
          </div>
          <div
            class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
          >
            <div>
              <p class="text-xs text-slate-500 mb-1">Skor Total</p>
              <p class="text-4xl font-black text-slate-800">
                {{ detail.skor_total ?? "-" }}
              </p>
            </div>
            <div class="text-right flex flex-col items-end gap-1.5">
              <span
                v-if="detailLengkap"
                :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border',
                  detailLengkap.badge_cls,
                ]"
              >
                <span class="material-symbols-outlined text-[16px]">{{ detailLengkap.icon }}</span>
                {{ detailLengkap.badge }}
              </span>
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                  riskBadgeLgCls(selectedRisikoPanduan),
                ]"
                ><span class="material-symbols-outlined text-[14px]">{{
                  riskIconName(selectedRisikoPanduan)
                }}</span
                >{{ selectedRisikoPanduan }}</span
              >
            </div>
          </div>
          <!-- Skor Detail: MMYS -->
          <div
            v-if="isMMYS(detail.instrumen)"
            class="grid grid-cols-2 gap-3"
          >
            <div
              class="p-3 rounded-xl bg-sky-50 border border-sky-100 text-center"
            >
              <p class="text-[10px] font-bold text-sky-500 uppercase mb-1">
                Skala A — Cemas
              </p>
              <p class="text-2xl font-black text-sky-700">
                {{ detail.skor_detail?.skor_A ?? "-"
                }}<span class="text-xs text-sky-400">/3</span>
              </p>
              <span
                :class="mmysHasilCls(detail.skor_detail?.hasil_A)"
                >{{
                  mmysHasilLabel(detail.skor_detail?.hasil_A)
                }}</span
              >
            </div>
            <div
              class="p-3 rounded-xl bg-violet-50 border border-violet-100 text-center"
            >
              <p class="text-[10px] font-bold text-violet-500 uppercase mb-1">
                Skala B — Depresi
              </p>
              <p class="text-2xl font-black text-violet-700">
                {{ detail.skor_detail?.skor_B ?? "-"
                }}<span class="text-xs text-violet-400">/3</span>
              </p>
              <span
                :class="mmysHasilCls(detail.skor_detail?.hasil_B)"
                >{{
                  mmysHasilLabel(detail.skor_detail?.hasil_B)
                }}</span
              >
            </div>
          </div>
          <!-- Skor Detail: PHQ4 -->
          <div
            v-if="detail.instrumen === 'PHQ4'"
            class="grid grid-cols-2 gap-3"
          >
            <div
              class="p-3 rounded-xl bg-orange-50 border border-orange-100 text-center"
            >
              <p class="text-[10px] font-bold text-orange-500 uppercase mb-1">
                PHQ-2 — Depresi
              </p>
              <p class="text-2xl font-black text-orange-700">
                {{ detail.skor_detail?.skor_phq2 ?? "-"
                }}<span class="text-xs text-orange-400">/6</span>
              </p>
              <span
                :class="phqHasilCls(detail.skor_detail?.hasil_phq2)"
                >{{
                  phqHasilLabel(detail.skor_detail?.hasil_phq2)
                }}</span
              >
            </div>
            <div
              class="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center"
            >
              <p class="text-[10px] font-bold text-amber-500 uppercase mb-1">
                GAD-2 — Cemas
              </p>
              <p class="text-2xl font-black text-amber-700">
                {{ detail.skor_detail?.skor_gad2 ?? "-"
                }}<span class="text-xs text-amber-400">/6</span>
              </p>
              <span
                :class="phqHasilCls(detail.skor_detail?.hasil_gad2)"
                >{{
                  phqHasilLabel(detail.skor_detail?.hasil_gad2)
                }}</span
              >
            </div>
          </div>
          <!-- Skor Detail: EPDS -->
          <div
            v-if="detail.instrumen === 'EPDS'"
            class="p-3 rounded-xl bg-slate-50 border border-slate-100"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-bold text-slate-500">Skor Total EPDS</p>
              <span class="text-2xl font-black text-slate-700"
                >{{ detail.skor_total
                }}<span class="text-sm text-slate-400">/30</span></span
              >
            </div>
            <div
              class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden"
            >
              <div
                :class="epdsBarCls"
                :style="{ width: epdsBarPct + '%' }"
              ></div>
            </div>
            <div
              v-if="detail.skor_detail?.flag_e10"
              class="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2"
            >
              <span
                class="material-symbols-outlined text-rose-400 text-[15px]"
                >warning</span
              >
              <p class="text-[11px] text-rose-700 font-medium">
                Jawaban "Ya, agak sering" pada soal No.10 menunjukkan kemungkinan risiko
                mencelakai diri
              </p>
            </div>
          </div>
          <div class="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p class="text-[10px] font-bold text-blue-400 uppercase mb-1">
              Kesimpulan Klinis
            </p>
            <p class="text-sm text-slate-700 leading-relaxed">
              {{ detailKesimpulan }}
            </p>
          </div>
        </div>
        <!-- TAB 1 -->
        <div v-show="modalTab === 1" class="flex flex-col gap-1">
          <p
            v-if="!detailJawaban.length"
            class="text-sm text-slate-400 text-center py-8"
          >
            Data jawaban tidak tersedia.
          </p>
          <div
            v-for="(j, i) in detailJawaban"
            :key="i"
            class="flex gap-3 py-2.5 border-b border-slate-50 last:border-0"
          >
            <span
              class="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5"
              >{{ i + 1 }}</span
            >
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-600 leading-snug mb-1">
                {{ j.teks }}
              </p>
              <span
                class="inline-block px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100"
                >{{ j.jawaban }}</span
              >
            </div>
          </div>
        </div>
        <!-- TAB 2 -->
        <div v-show="modalTab === 2" class="flex flex-col gap-2">
          <p
            v-if="!detailRekomendasi.length"
            class="text-sm text-slate-400 text-center py-8"
          >
            Data rekomendasi tidak tersedia.
          </p>
          <div
            v-for="(r, i) in detailRekomendasi"
            :key="i"
            class="flex gap-2.5 p-3 rounded-xl bg-white border border-slate-100"
          >
            <div
              class="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0"
            >
              <span class="text-blue-500 font-bold text-[10px]">{{
                i + 1
              }}</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">{{ r }}</p>
          </div>
        </div>
        <!-- TAB 3: RIWAYAT -->
        <div v-show="modalTab === 3" class="flex flex-col gap-5">
          <p
            v-if="riwayatPasien.length === 0"
            class="text-sm text-slate-400 text-center py-8"
          >
            Belum ada riwayat sebelumnya.
          </p>
          <template v-else>
            <!-- Trend Visualization -->
            <div
              class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-2"
            >
              <p
                class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4"
              >
                Tren Risiko (Terbaru di Bawah)
              </p>
              <div
                class="flex flex-col gap-2 relative pl-2 border-l-2 border-slate-200 ml-2"
              >
                <div
                  v-for="(r, idx) in [...riwayatPasien].reverse()"
                  :key="'trend-' + idx"
                  class="relative"
                >
                  <div
                    class="absolute -left-[14px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white"
                  ></div>
                  <div class="flex items-center gap-3">
                    <p
                      class="text-[10px] text-slate-500 w-16 shrink-0 font-medium"
                    >
                      {{
                        new Date(r.tanggal_skrining).toLocaleDateString(
                          "id-ID",
                          { month: "short", year: "numeric" },
                        )
                      }}
                    </p>
                    <div
                      class="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden flex"
                    >
                      <div
                        :class="[
                          'h-full transition-all',
                          r.tingkat_risiko === 'High Risk'
                            ? 'bg-red-500 w-[95%]'
                            : r.tingkat_risiko === 'Moderate Risk'
                              ? 'bg-amber-500 w-[60%]'
                              : 'bg-emerald-500 w-[20%]',
                        ]"
                      ></div>
                    </div>
                    <p
                      class="text-[10px] font-bold w-20 shrink-0 text-right"
                      :class="[
                        r.tingkat_risiko === 'High Risk'
                          ? 'text-red-600'
                          : r.tingkat_risiko === 'Moderate Risk'
                            ? 'text-amber-600'
                            : 'text-emerald-600',
                      ]"
                    >
                      {{ r.tingkat_risiko || "Normal" }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- History Detail Cards (Newest First) -->
            <div class="flex flex-col gap-3">
              <p
                class="text-xs font-bold text-slate-500 uppercase tracking-widest px-1"
              >
                Detail Tiap Skrining
              </p>
              <div
                v-for="(r, idx) in riwayatPasien"
                :key="idx"
                class="p-4 rounded-xl border flex flex-col gap-2 transition-all"
                :class="[
                  r.id === detail.id
                    ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-slate-300',
                ]"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <div class="flex items-center flex-wrap gap-2 mb-1">
                      <span
                        class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        {{
                          new Date(r.tanggal_skrining).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )
                        }}
                      </span>
                      <span class="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        Skrining ke-{{ r.skrining_ke || 1 }}
                      </span>
                      <span
                        v-if="r.id === detail.id"
                        class="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full"
                        >Saat ini dilihat</span
                      >
                    </div>
                    <p class="text-xs text-slate-500 mb-0.5">
                      <span
                        class="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600 border border-slate-200"
                        >{{ r.instrumen }}</span
                      >
                    </p>
                    <p
                      class="text-[11px] text-slate-600 leading-tight border-l-2 border-slate-200 pl-2 mt-2"
                    >
                      {{ r.kesimpulan_klinis || (hitungSkor(r.instrumen, r.jawaban)?.kesimpulan_klinis) || "-" }}
                    </p>
                  </div>
                  <span
                    :class="[
                      'inline-flex shrink-0 items-center px-2 py-1.5 rounded-lg text-[10px] font-bold',
                      r.tingkat_risiko === 'High Risk'
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : r.tingkat_risiko === 'Moderate Risk'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                    ]"
                  >
                    {{ r.tingkat_risiko || "Normal" }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div
        class="px-5 py-4 border-t border-slate-100 bg-slate-50 sm:rounded-b-2xl shrink-0 flex gap-3"
      >
        <button
          v-if="selectedRisikoPanduan === 'High Risk' || selectedRisikoPanduan === 'Moderate Risk'"
          @click="$emit('buatRujukan', detail)"
          class="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5 hover:bg-red-100 shadow-sm"
        >
          <span class="material-symbols-outlined text-[16px]">description</span>
          Buat Surat Rujukan
        </button>
        <button
          @click="$emit('close')"
          class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 hover:shadow-lg"
        >
          <span class="material-symbols-outlined text-[15px]">close</span>
          Tutup
        </button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { formatTanggalID } from "@/utils/helpers";
import { INSTRUMEN_DATA } from "@/constants/instrumen";
import { hitungSkor } from "@/utils/skoring";
import { instrLabelText, risikoExport } from "@/utils/badgeHelpers";

const props = defineProps({
  detail: { type: Object, default: null },
  riwayatPasien: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "buatRujukan"]);

const modalTab = ref(0);
const modalPanel = ref(null);
// Elemen yang memicu modal, agar fokus dapat dikembalikan saat ditutup.
let pemicuModal = null;

/** Called by parent to open the modal while passing the trigger element for focus return. */
function open(triggerEl) {
  pemicuModal = triggerEl ?? null;
}

defineExpose({ open });

watch(() => props.detail, async (baru, lama) => {
  modalTab.value = 0;
  if (baru) {
    await nextTick();
    modalPanel.value?.focus();
  } else if (lama) {
    pemicuModal?.focus?.();
    pemicuModal = null;
  }
});

// ── Computeds ──
const detailLengkap = computed(() => {
  if (!props.detail || !props.detail.jawaban) return null;
  return hitungSkor(props.detail.instrumen, props.detail.jawaban);
});

const detailJawaban = computed(() => {
  if (!props.detail) return [];
  const item = props.detail,
    data = INSTRUMEN_DATA[item.instrumen];
  if (!data?.soal) return [];
  const jawaban = Array.isArray(item.jawaban) ? item.jawaban : [];
  return data.soal.map((s, i) => {
    const jwb = jawaban[i],
      opsi = s.opsi || data.opsi || [];
    let teks = "-";
    if (jwb != null) {
      if (jwb.optionIndex !== undefined && opsi[jwb.optionIndex]?.label)
        teks = opsi[jwb.optionIndex].label;
      else if (jwb.value !== undefined) {
        const f = opsi.find((o) => String(o.value) === String(jwb.value));
        teks = f
          ? f.label
          : jwb.value == 1
            ? "Ya"
            : jwb.value == 0
              ? "Tidak"
              : String(jwb.value);
      }
    }
    return { teks: s.teks, jawaban: teks };
  });
});

const detailRekomendasi = computed(() => {
  if (!props.detail) return [];
  if (Array.isArray(detailLengkap.value?.rekomendasi_list)) return detailLengkap.value.rekomendasi_list;
  return Array.isArray(props.detail.rekomendasi)
    ? props.detail.rekomendasi
    : [];
});

const detailKesimpulan = computed(() => {
  if (!props.detail) return "-";
  return detailLengkap.value?.kesimpulan_klinis || props.detail.kesimpulan_klinis || "-";
});

const selectedRisikoPanduan = computed(() =>
  props.detail ? risikoExport(props.detail) : "-",
);

// ── Score Detail Helpers ──
function isMMYS(i) {
  return ["MMYS_ANAK", "MMYS_REMAJA"].includes(i);
}
function mmysHasilLabel(h) {
  return { TIDAK_ADA: "Tidak Ada", RINGAN: "Ringan", BERAT: "Berat" }[h] || "-";
}
function mmysHasilCls(h) {
  const m = {
    TIDAK_ADA: "text-emerald-600 bg-emerald-50 border-emerald-200",
    RINGAN: "text-amber-600 bg-amber-50 border-amber-200",
    BERAT: "text-red-600 bg-red-50 border-red-200",
  };
  return (
    "px-2 py-0.5 rounded-full text-[10px] font-bold border " + (m[h] || "")
  );
}
function phqHasilLabel(h) {
  return h === "GEJALA" ? "Ada Gejala" : "Tidak Ada";
}
function phqHasilCls(h) {
  return (
    "px-2 py-0.5 rounded-full text-[10px] font-bold border " +
    (h === "GEJALA"
      ? "text-red-500 bg-red-50 border-red-200"
      : "text-emerald-500 bg-emerald-50 border-emerald-200")
  );
}
const epdsBarPct = computed(() =>
  props.detail
    ? Math.round(((props.detail.skor_total || 0) / 30) * 100)
    : 0,
);
const epdsBarCls = computed(() => {
  if (!props.detail) return "";
  const s = props.detail.skor_total;
  return (
    "h-full rounded-full " +
    (s >= 13 ? "bg-red-400" : "bg-emerald-400")
  );
});

function riskBadgeLgCls(r) {
  return (
    {
      "High Risk": "bg-red-50 text-red-600 border-red-200",
      "Moderate Risk": "bg-amber-50 text-amber-600 border-amber-200",
      "Low Risk": "bg-emerald-50 text-emerald-600 border-emerald-200",
    }[r] || "bg-slate-50 text-slate-500 border-slate-200"
  );
}
function riskIconName(r) {
  return (
    {
      "High Risk": "emergency",
      "Moderate Risk": "warning",
      "Low Risk": "check_circle",
    }[r] || "info"
  );
}
</script>
