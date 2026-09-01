<template>
  <div class="flex flex-col gap-6">
    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="px-6 py-5 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-700 mb-4">
          Pilih Periode Export
        </h3>
        <div class="grid grid-cols-2 lg:flex lg:flex-row gap-2 mb-4">
          <button
            v-for="p in presets"
            :key="p.key"
            @click="setPreset(p.key)"
            :class="[
              'px-4 py-2 rounded-xl text-[11px] sm:text-sm font-semibold border transition-all text-center flex items-center justify-center',
              laporanPreset === p.key
                ? 'border-blue-400 bg-blue-50 text-blue-700'
                : 'border-slate-200 hover:border-blue-300 text-slate-600',
            ]"
          >
            {{ p.label }}
          </button>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="date"
            v-model="laporanDari"
            @change="renderLaporan()"
            class="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-400 focus:outline-none"
          />
          <span class="text-sm text-slate-400 font-semibold hidden sm:inline">s/d</span>
          <span class="text-sm text-slate-400 font-semibold sm:hidden">sampai</span>
          <input
            type="date"
            v-model="laporanSampai"
            @change="renderLaporan()"
            class="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>
      <div class="px-6 py-5">
        <div class="mb-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Filter Kategori / Golongan Usia (Export)</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label class="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" v-model="laporanInstrumenFilter" value="MMYS_ANAK" @change="renderLaporan" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-[11px] sm:text-xs font-semibold text-slate-700">MMYS Anak</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" v-model="laporanInstrumenFilter" value="MMYS_REMAJA" @change="renderLaporan" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-[11px] sm:text-xs font-semibold text-slate-700">MMYS Remaja</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" v-model="laporanInstrumenFilter" value="PHQ4" @change="renderLaporan" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-[11px] sm:text-xs font-semibold text-slate-700">PHQ-4</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" v-model="laporanInstrumenFilter" value="EPDS" @change="renderLaporan" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-[11px] sm:text-xs font-semibold text-slate-700">EPDS</span>
            </label>
          </div>
          <!-- Tambahan Filter Sekolah -->
          <div class="mt-4 pt-4 border-t border-slate-200">
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Filter Sekolah / Kampus (Opsional)</p>
            <select
              v-model="laporanSekolahFilter"
              @change="renderLaporan"
              class="w-full sm:max-w-xs px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-400 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="">Semua Sekolah/Kampus</option>
              <option v-for="s in semuaSekolahKampusOptions" :key="s" :value="s">
                {{ s }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="laporanSummary" class="space-y-5">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="bg-blue-50 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <span class="text-2xl font-black text-blue-700">{{ laporanSummary.total }}</span>
              <span class="text-[10px] font-bold text-blue-500">Total</span>
            </div>
            <div class="bg-red-50 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <span class="text-2xl font-black text-red-700">{{ laporanSummary.high }}</span>
              <span class="text-[10px] font-bold text-red-500">High Risk</span>
            </div>
            <div class="bg-amber-50 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <span class="text-2xl font-black text-amber-700">{{ laporanSummary.mod }}</span>
              <span class="text-[10px] font-bold text-amber-500">Moderate</span>
            </div>
            <div class="bg-emerald-50 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <span class="text-2xl font-black text-emerald-700">{{ laporanSummary.low }}</span>
              <span class="text-[10px] font-bold text-emerald-500">Low Risk</span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              v-for="ig in laporanSummary.instrumen"
              :key="ig.l"
              class="p-3 rounded-xl border border-slate-100 bg-white flex flex-col items-center justify-center text-center"
            >
               <span class="text-2xl font-black mb-0" :style="{ color: ig.color }">{{ ig.v }}</span>
               <span class="text-[10px] font-bold text-slate-500">{{ ig.l }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="exportExcelLaporan"
              class="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]"
                >download</span
              >
              Export Excel (.xlsx)
            </button>
            <button
              @click="exportPdfLaporan"
              class="py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]"
                >picture_as_pdf</span
              >
              Export PDF
            </button>
          </div>
        </div>
        <p v-else class="text-sm text-slate-400 text-center py-8">
          Tidak ada data untuk periode ini.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import * as XLSX from "xlsx";
import { hitungSkor } from "@/utils/skoring";
import { escHtml, keTanggalLokal } from "@/utils/helpers";
import { instrLabelText, risikoExport, hasilPanduanExport } from "@/utils/badgeHelpers";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  semuaData: { type: Array, required: true },
  semuaSekolahKampusOptions: { type: Array, required: true },
});

const { showToast } = useToast();

const laporanPreset = ref("bulan");
const laporanDari = ref("");
const laporanSampai = ref("");
const laporanSummary = ref(null);
const laporanInstrumenFilter = ref(["MMYS_ANAK", "MMYS_REMAJA", "PHQ4", "EPDS"]);
const laporanSekolahFilter = ref("");

const presets = [
  { key: "minggu", label: "Minggu Ini" },
  { key: "bulan", label: "Bulan Ini" },
  { key: "tahun", label: "Tahun Ini" },
  { key: "semua", label: "Semua Data" },
];

// ── Lifecycle ──
onMounted(() => {
  renderLaporan();
});

watch(() => props.semuaData, () => {
  renderLaporan();
});

// ── Preset logic ──
function setPreset(key) {
  laporanPreset.value = key;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const hariIniLokal = keTanggalLokal(now);

  if (key === "minggu") {
    const day = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    laporanDari.value = keTanggalLokal(mon);
    laporanSampai.value = hariIniLokal;
  } else if (key === "bulan") {
    laporanDari.value = keTanggalLokal(new Date(y, m, 1));
    laporanSampai.value = hariIniLokal;
  } else if (key === "tahun") {
    laporanDari.value = keTanggalLokal(new Date(y, 0, 1));
    laporanSampai.value = hariIniLokal;
  } else {
    laporanDari.value = "";
    laporanSampai.value = "";
  }
  renderLaporan();
}

// ── Data filtering ──
function getLaporanDataToExport() {
  return props.semuaData.filter((d) => {
    const t = d.tanggal_skrining ? String(d.tanggal_skrining).slice(0, 10) : "";
    if (laporanDari.value && t < laporanDari.value) return false;
    if (laporanSampai.value && t > laporanSampai.value) return false;
    if (d.instrumen && !laporanInstrumenFilter.value.includes(d.instrumen)) return false;
    if (laporanSekolahFilter.value && d.nama_sekolah !== laporanSekolahFilter.value) return false;
    return true;
  });
}

function renderLaporan() {
  const data = getLaporanDataToExport();
  if (!data.length) {
    laporanSummary.value = null;
    return;
  }
  const colors = {
    MMYS_ANAK: "#0ea5e9",
    MMYS_REMAJA: "#8b5cf6",
    PHQ4: "#f59e0b",
    EPDS: "#f43f5e",
  };
  const labels = {
    MMYS_ANAK: "MMYS Anak",
    MMYS_REMAJA: "MMYS Remaja",
    PHQ4: "PHQ-4",
    EPDS: "EPDS",
  };
  laporanSummary.value = {
    total: data.length,
    high: data.filter((d) => d.tingkat_risiko === "High Risk").length,
    mod: data.filter((d) => d.tingkat_risiko === "Moderate Risk").length,
    low: data.filter((d) => d.tingkat_risiko === "Low Risk").length,
    instrumen: ["MMYS_ANAK", "MMYS_REMAJA", "PHQ4", "EPDS"]
      .filter((k) => laporanInstrumenFilter.value.includes(k))
      .map((k) => ({
        l: labels[k],
        v: data.filter((d) => d.instrumen === k).length,
        color: colors[k],
      })),
  };
}

// ── Export helpers ──
function rekomendasiText(value) {
  return Array.isArray(value) ? value.join("; ") : value || "-";
}

function kesimpulanExport(d) {
  return hasilPanduanExport(d)?.kesimpulan_klinis || d.kesimpulan_klinis || "-";
}

function rekomendasiExport(d) {
  return rekomendasiText(hasilPanduanExport(d)?.rekomendasi_list || d.rekomendasi);
}

function excelSafe(value) {
  if (value === null || value === undefined || value === "") return "-";
  const text = String(value);
  const first = text.trimStart().charAt(0);
  return ["=", "+", "-", "@"].includes(first) ? `'${text}` : text;
}

function htmlCell(value) {
  if (value === null || value === undefined || value === "") return "-";
  return escHtml(value);
}

function sanitizePdfRow(row) {
  return {
    ...row,
    tanggal_skrining: htmlCell(row.tanggal_skrining),
    nama_lengkap: htmlCell(row.nama_lengkap),
    nik: htmlCell(row.nik),
    usia: htmlCell(row.usia),
    jenis_kelamin: row.jenis_kelamin,
    nama_sekolah: htmlCell(row.nama_sekolah),
    instrumen: htmlCell(row.instrumen),
    skor_total: htmlCell(row.skor_total),
    tingkat_risiko: htmlCell(row.tingkat_risiko),
  };
}

function escapeLaporanHtml(value) {
  return String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buatRowsExport(data) {
  return data.map((d, i) => ({
    No: i + 1,
    "Tanggal Skrining": d.tanggal_skrining || "-",
    "Nama Lengkap": d.nama_lengkap || "-",
    NIK: d.nik || "-",
    Usia: d.usia || "-",
    "Jenis Kelamin":
      d.jenis_kelamin === "L"
        ? "Laki-laki"
        : d.jenis_kelamin === "P"
          ? "Perempuan"
          : "-",
    "Sekolah/Kampus": d.nama_sekolah || "-",
    "No HP": d.nomor_hp || "-",
    Alamat: d.alamat || "-",
    Kecamatan: d.kecamatan || "-",
    Desa: d.desa || "-",
    "Tempat Skrining": d.tempat_skrining || "-",
    Instrumen: instrLabelText(d.instrumen),
    "Skor Total": d.skor_total ?? "-",
    "Skrining Ke": d.skrining_ke || 1,
    "Total Riwayat NIK": d.jumlah_riwayat || 1,
    "Tingkat Risiko": risikoExport(d),
    "Kesimpulan Klinis": kesimpulanExport(d),
    Rekomendasi: rekomendasiExport(d),
  }));
}

// ── Excel Export ──
function exportExcelLaporan() {
  const data = getLaporanDataToExport();
  if (!data || !data.length) {
    showToast("Tidak ada data laporan untuk diexport.", "warning");
    return;
  }
  try {
    const rows = buatRowsExport(data);
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 5 },
      { wch: 16 },
      { wch: 28 },
      { wch: 20 },
      { wch: 6 },
      { wch: 14 },
      { wch: 25 },
      { wch: 16 },
      { wch: 30 },
      { wch: 16 },
      { wch: 16 },
      { wch: 20 },
      { wch: 14 },
      { wch: 10 },
      { wch: 16 },
      { wch: 40 },
      { wch: 50 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Skrining");
    const periodeLabel =
      laporanDari.value && laporanSampai.value
        ? `${laporanDari.value}_${laporanSampai.value}`
        : "semua";
    XLSX.writeFile(wb, `SSJ_Laporan_${periodeLabel}.xlsx`);
    showToast(`${data.length} data berhasil diexport ke Excel.`, "success");
  } catch (err) {
    showToast("Gagal export.", "error");
  }
}

// ── PDF Export ──
function exportPdfLaporan() {
  const data = getLaporanDataToExport();
  if (!data || !data.length) {
    showToast("Tidak ada data laporan untuk diexport.", "warning");
    return;
  }
  const high = data.filter((d) => risikoExport(d) === "High Risk").length;
  const mod = data.filter((d) => risikoExport(d) === "Moderate Risk").length;
  const low = data.filter((d) => risikoExport(d) === "Low Risk").length;
  const periode =
    laporanDari.value && laporanSampai.value
      ? `${laporanDari.value} s/d ${laporanSampai.value}`
      : "Semua Data";
  const tableRows = data
    .map((d, i) => {
      const rekomendasi = escapeLaporanHtml(rekomendasiExport(d)).replace(/; /g, "<br>");
      return `<tr><td>${i + 1}</td><td>${escapeLaporanHtml(d.tanggal_skrining || "-")}</td><td>${escapeLaporanHtml(d.nama_lengkap || "-")}</td><td>${escapeLaporanHtml(d.nik || "-")}</td><td>${escapeLaporanHtml(d.skrining_ke || 1)}</td><td>${escapeLaporanHtml(d.jumlah_riwayat || 1)}</td><td>${escapeLaporanHtml(d.usia || "-")}</td><td>${escapeLaporanHtml(d.jenis_kelamin === "L" ? "L" : "P")}</td><td>${escapeLaporanHtml(d.nama_sekolah || "-")}</td><td>${escapeLaporanHtml(instrLabelText(d.instrumen))}</td><td>${escapeLaporanHtml(d.skor_total ?? "-")}</td><td>${escapeLaporanHtml(risikoExport(d))}</td><td>${escapeLaporanHtml(kesimpulanExport(d))}</td><td>${rekomendasi}</td></tr>`;
    })
    .join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Laporan SSJ Sekadau</title><style>*{margin:0;padding:0;box-sizing:border-box}@page{size:landscape;margin:10mm}body{font-family:Arial,sans-serif;padding:18px;font-size:9px}h1{font-size:16px;margin-bottom:4px}h2{font-size:13px;color:#555;margin-bottom:16px}.stats{display:flex;gap:16px;margin-bottom:20px}.stat-card{flex:1;padding:12px;border:1px solid #ddd;border-radius:8px;text-align:center}.stat-num{font-size:24px;font-weight:900}.high{color:#dc2626}.mod{color:#d97706}.low{color:#059669}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ddd;padding:5px 6px;text-align:left;vertical-align:top}th{background:#f1f5f9;font-size:10px;text-transform:uppercase}@media print{body{padding:12px}}</style></head><body><h1>Laporan Sistem Skrining Jiwa</h1><h2>UPTD Puskesmas Sekadau — Periode: ${periode}</h2><div class="stats"><div class="stat-card"><div class="stat-num">${data.length}</div><div>Total</div></div><div class="stat-card"><div class="stat-num high">${high}</div><div>High Risk</div></div><div class="stat-card"><div class="stat-num mod">${mod}</div><div>Moderate</div></div><div class="stat-card"><div class="stat-num low">${low}</div><div>Low Risk</div></div></div><table><thead><tr><th>No</th><th>Tanggal</th><th>Nama</th><th>NIK</th><th>Ke</th><th>Total Riwayat</th><th>Usia</th><th>JK</th><th>Sekolah</th><th>Instrumen</th><th>Skor</th><th>Risiko</th><th>Kesimpulan Klinis</th><th>Rekomendasi</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    // Cleanup after print dialog closes
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 500);
}
</script>
