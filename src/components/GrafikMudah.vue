<template>
  <section class="flex flex-col gap-4">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-3">
      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm lg:col-span-1">
        <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Total Responden
        </p>
        <div class="flex items-end gap-2">
          <span class="text-4xl font-black text-slate-800 leading-none">{{ overall.total }}</span>
          <span class="text-sm font-bold text-slate-400 mb-1">orang</span>
        </div>
        <p class="text-xs text-slate-500 mt-3 leading-relaxed">
          Data dihitung dari skrining terakhir tiap NIK agar satu orang tidak terhitung berulang.
        </p>
      </div>

      <div class="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-widest text-red-400 mb-1">
              Risiko Tinggi
            </p>
            <p class="text-3xl font-black text-red-700 leading-none">{{ overall.risiko.high.v }}</p>
          </div>
          <span class="material-symbols-outlined text-red-400 text-[30px]">priority_high</span>
        </div>
        <p class="text-xs font-semibold text-red-600 mt-3">
          {{ overall.risiko.high.pct }}% dari total responden
        </p>
      </div>

      <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-1">
              Risiko Sedang
            </p>
            <p class="text-3xl font-black text-amber-700 leading-none">{{ overall.risiko.mod.v }}</p>
          </div>
          <span class="material-symbols-outlined text-amber-400 text-[30px]">warning</span>
        </div>
        <p class="text-xs font-semibold text-amber-700 mt-3">
          {{ overall.risiko.mod.pct }}% dari total responden
        </p>
      </div>

      <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-widest text-emerald-500 mb-1">
              Risiko Rendah
            </p>
            <p class="text-3xl font-black text-emerald-700 leading-none">{{ overall.risiko.low.v }}</p>
          </div>
          <span class="material-symbols-outlined text-emerald-400 text-[30px]">check_circle</span>
        </div>
        <p class="text-xs font-semibold text-emerald-700 mt-3">
          {{ overall.risiko.low.pct }}% dari total responden
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div class="xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-slate-100">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-widest text-blue-500 mb-1">
                Peta Risiko
              </p>
              <h2 class="text-lg sm:text-xl font-black text-slate-800">
                {{ activeTitle }}
              </h2>
              <p class="text-xs text-slate-500 mt-1">
                Batang warna menunjukkan komposisi risiko di setiap kelompok.
              </p>
            </div>

            <div class="bg-slate-100 rounded-xl p-1 grid grid-cols-3 gap-1">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                :class="[
                  'h-10 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap',
                  activeTab === tab.key
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                ]"
              >
                <span class="material-symbols-outlined text-[16px]">{{ tab.icon }}</span>
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <span
              v-for="risk in riskLegend"
              :key="risk.key"
              class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold"
              :class="risk.badgeClass"
            >
              <span class="w-2 h-2 rounded-full" :class="risk.dotClass"></span>
              {{ risk.label }}
            </span>
          </div>
        </div>

        <div v-if="activeRows.length" class="p-3 sm:p-5 space-y-3">
          <article
            v-for="row in activeRows"
            :key="row.id"
            class="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
          >
            <div class="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-3 lg:gap-4">
              <div class="min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h3 class="text-sm font-black text-slate-800 leading-tight break-words">
                      {{ row.label }}
                    </h3>
                    <p class="text-xs font-semibold text-slate-500 mt-1">
                      {{ row.total }} orang
                    </p>
                  </div>
                  <button
                    v-if="row.children?.length"
                    @click="toggleRegion(row.id)"
                    class="lg:hidden w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center shrink-0"
                    :aria-label="expandedRegions.has(row.id) ? 'Tutup desa' : 'Lihat desa'"
                  >
                    <span
                      class="material-symbols-outlined text-[18px] transition-transform"
                      :class="{ 'rotate-180': expandedRegions.has(row.id) }"
                    >expand_more</span>
                  </button>
                </div>

                <button
                  v-if="row.children?.length"
                  @click="toggleRegion(row.id)"
                  class="hidden lg:inline-flex mt-3 items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50 text-[11px] font-bold text-slate-500 hover:text-blue-700 transition-all"
                >
                  <span
                    class="material-symbols-outlined text-[16px] transition-transform"
                    :class="{ 'rotate-180': expandedRegions.has(row.id) }"
                  >expand_more</span>
                  {{ expandedRegions.has(row.id) ? "Tutup Desa" : "Lihat Desa" }}
                </button>
              </div>

              <div class="space-y-3">
                <StackedRiskBar :breakdown="row.breakdown" />

                <div class="grid grid-cols-3 gap-2">
                  <RiskCount
                    label="Tinggi"
                    :value="row.breakdown.risiko.high.v"
                    :pct="row.breakdown.risiko.high.pct"
                    tone="high"
                  />
                  <RiskCount
                    label="Sedang"
                    :value="row.breakdown.risiko.mod.v"
                    :pct="row.breakdown.risiko.mod.pct"
                    tone="mod"
                  />
                  <RiskCount
                    label="Rendah"
                    :value="row.breakdown.risiko.low.v"
                    :pct="row.breakdown.risiko.low.pct"
                    tone="low"
                  />
                </div>
              </div>
            </div>

            <div
              v-if="row.children?.length && expandedRegions.has(row.id)"
              class="mt-4 border-t border-slate-200 pt-3 space-y-2"
            >
              <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Desa / Kelurahan
              </p>
              <div
                v-for="child in row.children"
                :key="child.id"
                class="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-2 sm:gap-3 rounded-lg bg-white border border-slate-100 p-3"
              >
                <div>
                  <p class="text-xs font-bold text-slate-700 break-words">{{ child.label }}</p>
                  <p class="text-[11px] font-semibold text-slate-400">{{ child.total }} orang</p>
                </div>
                <div class="space-y-2">
                  <StackedRiskBar :breakdown="child.breakdown" compact />
                  <p class="text-[11px] font-semibold text-slate-500">
                    Tinggi {{ child.breakdown.risiko.high.v }},
                    Sedang {{ child.breakdown.risiko.mod.v }},
                    Rendah {{ child.breakdown.risiko.low.v }}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="p-10 text-center">
          <span class="material-symbols-outlined text-slate-300 text-[42px]">bar_chart_off</span>
          <p class="text-sm font-bold text-slate-500 mt-2">Belum ada data grafik.</p>
          <p class="text-xs text-slate-400 mt-1">Data akan tampil setelah skrining masuk.</p>
        </div>
      </div>

      <aside class="xl:col-span-4 flex flex-col gap-4">
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            Prioritas Perhatian
          </p>
          <div v-if="priorityRows.length" class="space-y-3">
            <div
              v-for="item in priorityRows"
              :key="item.id"
              class="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-3"
            >
              <div class="min-w-0">
                <p class="text-sm font-black text-red-800 truncate">{{ item.label }}</p>
                <p class="text-[11px] font-semibold text-red-600">
                  {{ item.total }} orang dalam kelompok ini
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-2xl font-black text-red-700 leading-none">
                  {{ item.breakdown.risiko.high.v }}
                </p>
                <p class="text-[10px] font-bold text-red-500 uppercase">tinggi</p>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-slate-500">
            Tidak ada kelompok dengan risiko tinggi.
          </p>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            Jenis Kuesioner
          </p>
          <div class="space-y-3">
            <div v-for="item in instrumentRows" :key="item.key">
              <div class="flex items-center justify-between gap-3 mb-1">
                <span class="text-xs font-bold text-slate-700">{{ item.label }}</span>
                <span class="text-xs font-black text-slate-700">{{ item.value }} orang</span>
              </div>
              <div class="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :class="item.class"
                  :style="{ width: item.pct + '%' }"
                ></div>
              </div>
              <p class="text-[10px] font-semibold text-slate-400 mt-1">{{ item.pct }}%</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, defineComponent, h, ref } from "vue";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const activeTab = ref("usia");
const expandedRegions = ref(new Set());

const tabs = [
  { key: "usia", label: "Usia", icon: "cake" },
  { key: "gender", label: "Kelamin", icon: "wc" },
  { key: "daerah", label: "Wilayah", icon: "location_on" },
];

const riskLegend = [
  {
    key: "high",
    label: "Risiko Tinggi",
    dotClass: "bg-red-500",
    badgeClass: "bg-red-50 border-red-100 text-red-700",
  },
  {
    key: "mod",
    label: "Risiko Sedang",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-50 border-amber-100 text-amber-700",
  },
  {
    key: "low",
    label: "Risiko Rendah",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 border-emerald-100 text-emerald-700",
  },
];

const instrumentLabels = {
  MMYS_ANAK: "MMYS Anak",
  MMYS_REMAJA: "MMYS Remaja",
  PHQ4: "PHQ-4",
  EPDS: "EPDS",
};

const instrumentClasses = {
  MMYS_ANAK: "bg-sky-500",
  MMYS_REMAJA: "bg-indigo-500",
  PHQ4: "bg-orange-500",
  EPDS: "bg-rose-500",
};

const activeTitle = computed(() => {
  if (activeTab.value === "usia") return "Risiko berdasarkan kelompok usia";
  if (activeTab.value === "gender") return "Risiko berdasarkan jenis kelamin";
  return "Risiko berdasarkan kecamatan";
});

const overall = computed(() => calcBreakdown(props.data));

const usiaRows = computed(() => {
  const groups = [
    { id: "usia-0-5", label: "0-5 tahun", min: 0, max: 5 },
    { id: "usia-6-11", label: "6-11 tahun", min: 6, max: 11 },
    { id: "usia-12-17", label: "12-17 tahun", min: 12, max: 17 },
    { id: "usia-18-25", label: "18-25 tahun", min: 18, max: 25 },
    { id: "usia-26-45", label: "26-45 tahun", min: 26, max: 45 },
    { id: "usia-46-65", label: "46-65 tahun", min: 46, max: 65 },
    { id: "usia-66", label: "Di atas 65 tahun", min: 66, max: 999 },
  ];

  return groups
    .map((group) => {
      const items = props.data.filter((item) => {
        const usia = parseInt(item.usia, 10);
        return Number.isFinite(usia) && usia >= group.min && usia <= group.max;
      });
      return makeRow(group.id, group.label, items);
    })
    .filter((row) => row.total > 0);
});

const genderRows = computed(() => {
  const laki = props.data.filter((item) => item.jenis_kelamin === "L");
  const perempuan = props.data.filter((item) => item.jenis_kelamin === "P");
  const lainnya = props.data.filter((item) => !["L", "P"].includes(item.jenis_kelamin));

  return [
    makeRow("gender-l", "Laki-laki", laki),
    makeRow("gender-p", "Perempuan", perempuan),
    makeRow("gender-x", "Tidak diisi", lainnya),
  ].filter((row) => row.total > 0);
});

const daerahRows = computed(() => {
  const map = new Map();
  props.data.forEach((item) => {
    const kecamatan = cleanName(item.kecamatan, "Lainnya");
    const desa = cleanName(item.desa, "Lainnya");

    if (!map.has(kecamatan)) {
      map.set(kecamatan, { label: kecamatan, items: [], desaMap: new Map() });
    }

    const kec = map.get(kecamatan);
    kec.items.push(item);

    if (!kec.desaMap.has(desa)) {
      kec.desaMap.set(desa, { label: desa, items: [] });
    }
    kec.desaMap.get(desa).items.push(item);
  });

  return Array.from(map.values())
    .map((kec) => {
      const row = makeRow(`daerah-${kec.label}`, kec.label, kec.items);
      row.children = Array.from(kec.desaMap.values())
        .map((desa) => makeRow(`desa-${kec.label}-${desa.label}`, desa.label, desa.items))
        .sort(sortByPriority);
      return row;
    })
    .sort(sortByPriority);
});

const activeRows = computed(() => {
  if (activeTab.value === "usia") return usiaRows.value;
  if (activeTab.value === "gender") return genderRows.value;
  return daerahRows.value;
});

const priorityRows = computed(() =>
  [...activeRows.value]
    .filter((row) => row.breakdown.risiko.high.v > 0)
    .sort(sortByPriority)
    .slice(0, 3),
);

const instrumentRows = computed(() => {
  const total = Math.max(props.data.length, 1);
  return Object.keys(instrumentLabels).map((key) => {
    const value = props.data.filter((item) => item.instrumen === key).length;
    return {
      key,
      label: instrumentLabels[key],
      value,
      pct: props.data.length ? Math.round((value / total) * 100) : 0,
      class: instrumentClasses[key],
    };
  });
});

function cleanName(value, fallback) {
  const text = value ? String(value).trim() : "";
  return text || fallback;
}

function makeRow(id, label, items) {
  return {
    id,
    label,
    items,
    total: items.length,
    breakdown: calcBreakdown(items),
    children: [],
  };
}

function calcBreakdown(items) {
  const total = items.length;
  const high = items.filter((item) => item.tingkat_risiko === "High Risk").length;
  const mod = items.filter((item) => item.tingkat_risiko === "Moderate Risk").length;
  const low = items.filter((item) => item.tingkat_risiko === "Low Risk").length;

  return {
    total,
    risiko: {
      high: { v: high, pct: percent(high, total) },
      mod: { v: mod, pct: percent(mod, total) },
      low: { v: low, pct: percent(low, total) },
    },
  };
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function sortByPriority(a, b) {
  return (
    b.breakdown.risiko.high.v - a.breakdown.risiko.high.v ||
    b.breakdown.risiko.mod.v - a.breakdown.risiko.mod.v ||
    b.total - a.total ||
    a.label.localeCompare(b.label)
  );
}

function toggleRegion(id) {
  const next = new Set(expandedRegions.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedRegions.value = next;
}

const StackedRiskBar = defineComponent({
  name: "StackedRiskBar",
  props: {
    breakdown: {
      type: Object,
      required: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  setup(componentProps) {
    return () => {
      const total = componentProps.breakdown.total;
      const segments = [
        {
          key: "high",
          value: componentProps.breakdown.risiko.high.v,
          pct: componentProps.breakdown.risiko.high.pct,
          class: "bg-red-500",
        },
        {
          key: "mod",
          value: componentProps.breakdown.risiko.mod.v,
          pct: componentProps.breakdown.risiko.mod.pct,
          class: "bg-amber-500",
        },
        {
          key: "low",
          value: componentProps.breakdown.risiko.low.v,
          pct: componentProps.breakdown.risiko.low.pct,
          class: "bg-emerald-500",
        },
      ];

      return h(
        "div",
        {
          class: [
            "w-full rounded-full bg-slate-200 overflow-hidden flex",
            componentProps.compact ? "h-3" : "h-5",
          ],
          role: "img",
          "aria-label": `Distribusi risiko dari ${total} orang`,
        },
        segments.map((segment) =>
          h("div", {
            key: segment.key,
            class: [segment.class, "h-full transition-all"],
            style: {
              width: segment.value ? `${segment.pct}%` : "0%",
              minWidth: segment.value ? "6px" : "0",
            },
          }),
        ),
      );
    };
  },
});

const RiskCount = defineComponent({
  name: "RiskCount",
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    pct: {
      type: Number,
      required: true,
    },
    tone: {
      type: String,
      required: true,
    },
  },
  setup(componentProps) {
    return () => {
      const tones = {
        high: "bg-red-50 border-red-100 text-red-700",
        mod: "bg-amber-50 border-amber-100 text-amber-700",
        low: "bg-emerald-50 border-emerald-100 text-emerald-700",
      };

      return h(
        "div",
        {
          class: [
            "rounded-lg border px-2 py-2 text-center min-w-0",
            tones[componentProps.tone] || "bg-slate-50 border-slate-100 text-slate-700",
          ],
        },
        [
          h("p", { class: "text-[10px] font-bold uppercase truncate" }, componentProps.label),
          h("p", { class: "text-lg font-black leading-none mt-1" }, String(componentProps.value)),
          h("p", { class: "text-[10px] font-bold opacity-70 mt-1" }, `${componentProps.pct}%`),
        ],
      );
    };
  },
});
</script>
