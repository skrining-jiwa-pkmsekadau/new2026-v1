<template>
  <div class="flex flex-col min-h-screen bg-slate-50 pb-[80px]">
    <!-- MAIN AREA -->
    <div class="flex-1 flex flex-col w-full">
      <!-- TOPBAR -->
      <header
        class="sticky top-0 z-30 bg-[#0b3d66] border-b border-white/10 shadow-sm px-4 py-0"
      >
        <div class="flex items-center gap-3 h-14">
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md shrink-0"
          >
            <span class="material-symbols-outlined text-white text-[18px]">health_and_safety</span>
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-white font-bold text-sm leading-none flex items-center gap-2">
              PIJAR Puskesmas Sekadau
              <span class="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold tracking-wider uppercase">Admin</span>
            </h1>
            <p class="text-blue-200 text-[10px] truncate">
              {{ currentTitle }} - UPTD Puskesmas Sekadau
            </p>
          </div>
        </div>
      </header>

      <!-- MAIN CONTENT -->
      <main class="flex-1 px-4 py-6">
        <!-- ═══ DASHBOARD VIEW ═══ -->
        <DashboardOverview
          v-show="activeView === 'dashboard'"
          :statCards="statCards"
          :statistikDashboard="statistikDashboard"
          :totalData="store.semuaData.length"
          :isLoading="store.isLoading"
        />

        <!-- ═══ DATA VIEW ═══ -->
        <DataSkriningTable
          :visible="activeView === 'data'"
          :pageSlice="pageSlice"
          :paginStart="paginStart"
          :paginEnd="paginEnd"
          :totalFiltered="store.dataFilter.length"
          :paginPages="paginPages"
          :halamanAktif="store.halamanAktif"
          :totalHalaman="totalHalaman"
          :filterCari="store.filterCari"
          :filterInstr="store.filterInstr"
          :filterRisiko="store.filterRisiko"
          :filterKecamatan="store.filterKecamatan"
          :filterGender="store.filterGender"
          :filterRiwayat="store.filterRiwayat"
          :filterSekolah="store.filterSekolah"
          :filterTglDari="store.filterTglDari"
          :filterTglSampai="store.filterTglSampai"
          :kecamatanList="kecamatanList"
          :semuaSekolahKampusOptions="semuaSekolahKampusOptions"
          @update:filterCari="v => { store.filterCari = v; store.terapkanFilter(); }"
          @update:filterInstr="v => { store.filterInstr = v; store.terapkanFilter(); }"
          @update:filterRisiko="v => { store.filterRisiko = v; store.terapkanFilter(); }"
          @update:filterKecamatan="v => { store.filterKecamatan = v; store.terapkanFilter(); }"
          @update:filterGender="v => { store.filterGender = v; store.terapkanFilter(); }"
          @update:filterRiwayat="v => { store.filterRiwayat = v; store.terapkanFilter(); }"
          @update:filterSekolah="v => { store.filterSekolah = v; store.terapkanFilter(); }"
          @update:filterTglDari="v => { store.filterTglDari = v; store.terapkanFilter(); }"
          @update:filterTglSampai="v => { store.filterTglSampai = v; store.terapkanFilter(); }"
          @clearDates="store.filterTglDari = ''; store.filterTglSampai = ''; store.terapkanFilter();"
          @reset="resetAll"
          @sort="store.sortTabel"
          @changePage="store.gantiHalaman"
          @openDetail="openDetail"
          @deleteRequest="id => confirmDeleteId = id"
        />

        <!-- ═══ GRAFIK VIEW ═══ -->
        <div
          v-show="activeView === 'grafik'"
          class="flex flex-col gap-4 max-w-7xl mx-auto w-full"
        >
          <GrafikMudah :data="dataUnik" />
        </div>

        <!-- ═══ LAPORAN VIEW ═══ -->
        <LaporanExport
          v-show="activeView === 'laporan'"
          :semuaData="store.semuaData"
          :semuaSekolahKampusOptions="semuaSekolahKampusOptions"
        />
      </main>
    </div>
    <!-- end main area -->

    <!-- ═══ MODAL DETAIL ═══ -->
    <ModalDetailSkrining
      ref="modalDetailRef"
      :detail="selectedDetail"
      :riwayatPasien="riwayatPasien"
      @close="selectedDetail = null"
      @buatRujukan="buatSuratRujukan"
    />

    <!-- ═══ KONFIRMASI HAPUS ═══ -->
    <ModalKonfirmasi
      :visible="!!confirmDeleteId"
      type="danger"
      title="Hapus Data Skrining?"
      message="Data yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin menghapus data skrining pasien ini?"
      confirmText="Ya, Hapus"
      cancelText="Batal"
      @confirm="doDelete"
      @cancel="confirmDeleteId = null"
    />

    <!-- ═══ KONFIRMASI LOGOUT ═══ -->
    <ModalKonfirmasi
      :visible="showLogoutConfirm"
      type="warning"
      title="Keluar dari Dashboard?"
      message="Anda akan keluar dari dashboard admin. Pastikan semua pekerjaan sudah tersimpan."
      confirmText="Ya, Keluar"
      cancelText="Batal"
      @confirm="doLogout"
      @cancel="showLogoutConfirm = false"
    />

    <!-- BOTTOM NAVIGATION -->
    <BottomNav
      :menuItems="menuItems"
      :activeView="activeView"
      :isLoading="store.isLoading"
      @update:activeView="activeView = $event"
      @refresh="refreshData"
      @logout="showLogoutConfirm = true"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useSkriningStore } from "@/stores/skriningStore";
import { useToast } from "@/composables/useToast";
import { keTanggalLokal } from "@/utils/helpers";
import { hitungStatistikSkrining } from "@/utils/statistik";
import { DATA_WILAYAH } from "@/constants/wilayah";
import ModalKonfirmasi from "@/components/ModalKonfirmasi.vue";
import GrafikMudah from "@/components/GrafikMudah.vue";
import DashboardOverview from "@/components/dashboard/DashboardOverview.vue";
import DataSkriningTable from "@/components/dashboard/DataSkriningTable.vue";
import ModalDetailSkrining from "@/components/dashboard/ModalDetailSkrining.vue";
import LaporanExport from "@/components/dashboard/LaporanExport.vue";
import BottomNav from "@/components/dashboard/BottomNav.vue";

const router = useRouter();
const store = useDashboardStore();
const skriningStore = useSkriningStore();
const { showToast } = useToast();

// ── Shared State ──
const selectedDetail = ref(null);
const modalDetailRef = ref(null);
const confirmDeleteId = ref(null);
const showLogoutConfirm = ref(false);
const activeView = ref("dashboard");

const menuItems = computed(() => [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  {
    key: "data",
    label: "Data Skrining",
    icon: "table_view",
    badge: store.semuaData.length || null,
  },
  { key: "grafik", label: "Grafik", icon: "bar_chart" },
  { key: "laporan", label: "Laporan", icon: "summarize" },
]);

const currentTitle = computed(() => {
  const found = menuItems.value.find((m) => m.key === activeView.value);
  return found ? found.label : "Dashboard";
});

const kecamatanList = Object.keys(DATA_WILAYAH);

const semuaSekolahKampusOptions = [
  "SMA NEGERI 01",
  "SMA KARYA",
  "SMK KELING KUMANG",
  "SMK AMALIYAH",
  "SMK NEGERI 01",
  "SMA AL RAHMAH",
  "SMA NEGERI 02",
  "SMA NEGERI 05",
  "MTS AL RAHMAH",
  "SMP IT AR RAYYAN",
  "SMP NEGERI 10",
  "SMPK SANTO GABRIEL",
  "SMP NEGERI 01",
  "MTS NEGERI",
  "SMP NEGERI 05",
  "SMP NEGERI 03",
  "SDB SLAMET RIYADI",
  "SD SWASTA FILIPI",
  "SD NEGERI 01 SEKADAU",
  "SD NEGERI 04",
  "SD NEGERI 21",
  "SD /MIN SEKADAU",
  "SD NEGERI 14 SUNGAI PUTAT",
  "SD NEGERI 03",
  "SD NEGERI 47",
  "SD IT AR RAYYAN",
  "SD AL RAHMAH",
  "SD NEGERI 17",
  "SD NEGERI 18 PANGKIN",
  "SD NEGERI 06",
  "SD NEGERI 26 TERIBANG",
  "SD NEGERI 27",
  "SD NEGERI 44 SUNGAI AKAR",
  "SD NEGERI SEJIRAK EMPERANANG",
  "SD NEGERI 06 PENITI",
  "SD NEGERI 38 MERAH AIR",
  "SD NEGERI 19 SERIRANG",
  "SD NEGERI 20 SERAMPUK",
  "SD NEGERI 30 AMAK",
  "SD NEGERI 51",
  "SD NEGERI 46 ENSALANG",
  "SD NEGERI 41 ENSALI",
  "SD NEGERI 16 TELUK PASIR",
  "SD NEGERI 03 TANJUNG",
  "Institute Keling Kumang",
  "Universitas Terbuka",
  "Lainnya",
];

// ── Lifecycle ──
onMounted(async () => {
  if (!store.adminUser) {
    const { db } = await import("@/services/supabase");
    const {
      data: { session },
    } = await db.auth.getSession();
    if (session) {
      store.adminUser = session.user;
      store.adminSession = session;
    } else {
      router.replace("/login");
      return;
    }
  }
  try {
    await store.fetchSemuaData();
  } catch {
    showToast("Gagal memuat data.", "error");
  }
});

// ── Riwayat Pasien (History for selected NIK) ──
const riwayatPasien = computed(() => {
  if (!selectedDetail.value || !selectedDetail.value.nik) return [];
  return store.semuaData
    .filter((d) => d.nik === selectedDetail.value.nik)
    .sort(
      (a, b) => new Date(b.tanggal_skrining) - new Date(a.tanggal_skrining),
    );
});

// ── Data Unik (skrining terakhir per pasien) ──
const dataUnik = computed(() => {
  const map = new Map();

  for (const d of store.semuaData) {
    const nik = String(d.nik ?? "").trim();
    const kunci = nik ? `nik:${nik}` : `baris:${d.id}`;

    const lama = map.get(kunci);
    if (!lama) {
      map.set(kunci, d);
      continue;
    }

    const tglBaru = String(d.tanggal_skrining || "").slice(0, 10);
    const tglLama = String(lama.tanggal_skrining || "").slice(0, 10);
    if (tglBaru > tglLama) map.set(kunci, d);
  }

  return [...map.values()];
});

const statistikDashboard = computed(() => hitungStatistikSkrining(store.semuaData));

// ── Stat Cards ──
const statCards = computed(() => {
  const semua = store.semuaData;
  const unik = dataUnik.value;

  const totalSkrining = semua.length;
  const totalUnik = unik.length;

  const h = unik.filter((x) => x.tingkat_risiko === "High Risk").length;
  const m = unik.filter((x) => x.tingkat_risiko === "Moderate Risk").length;
  const l = unik.filter((x) => x.tingkat_risiko === "Low Risk").length;

  const prefixBulanIni = keTanggalLokal(new Date()).slice(0, 7);
  const bulanIni = (x) =>
    String(x.tanggal_skrining || "").slice(0, 7) === prefixBulanIni;

  const skriningBulanIni = semua.filter(bulanIni).length;
  const unikBulanIni = unik.filter(bulanIni).length;

  return [
    {
      label: "Total Skrining",
      nilai: totalSkrining,
      sub: `${skriningBulanIni} bulan ini`,
      icon: "assignment",
      cls: "from-blue-500 to-blue-600",
      txt: "text-blue-600",
    },
    {
      label: "Pasien Unik",
      nilai: totalUnik,
      sub: `${unikBulanIni} bulan ini`,
      icon: "person",
      cls: "from-indigo-500 to-indigo-600",
      txt: "text-indigo-600",
    },
    {
      label: "High Risk",
      nilai: h,
      sub: "Dari pasien unik",
      icon: "emergency",
      cls: "from-red-500 to-red-600",
      txt: "text-red-600",
    },
    {
      label: "Moderate Risk",
      nilai: m,
      sub: "Dari pasien unik",
      icon: "warning",
      cls: "from-amber-500 to-amber-600",
      txt: "text-amber-600",
    },
    {
      label: "Low Risk",
      nilai: l,
      sub: "Dari pasien unik",
      icon: "check_circle",
      cls: "from-emerald-500 to-emerald-600",
      txt: "text-emerald-600",
    },
  ];
});

// ── Pagination ──
const totalHalaman = computed(
  () => Math.ceil(store.dataFilter.length / store.perHalaman) || 1,
);
const paginStart = computed(() =>
  store.dataFilter.length === 0
    ? 0
    : (store.halamanAktif - 1) * store.perHalaman + 1,
);
const paginEnd = computed(() =>
  Math.min(store.halamanAktif * store.perHalaman, store.dataFilter.length),
);
const pageSlice = computed(() => {
  const s = (store.halamanAktif - 1) * store.perHalaman;
  return store.dataFilter.slice(s, s + store.perHalaman);
});
const paginPages = computed(() => {
  const p = [],
    h = store.halamanAktif,
    t = totalHalaman.value;
  for (let i = 1; i <= t; i++) {
    if (i === 1 || i === t || (i >= h - 1 && i <= h + 1)) p.push(i);
    else if (i === h - 2 || i === h + 2) p.push("...");
  }
  return p;
});

// ── Actions ──
function openDetail(d, ev) {
  selectedDetail.value = d;
  modalDetailRef.value?.open(ev?.currentTarget ?? null);
}

function resetAll() {
  store.resetSemuaFilter();
  showToast("Semua filter direset.", "info");
}

async function refreshData() {
  try {
    await store.fetchSemuaData();
    showToast("Data diperbarui.", "success");
  } catch {
    showToast("Gagal memuat data.", "error");
  }
}

async function doDelete() {
  const id = confirmDeleteId.value;
  confirmDeleteId.value = null;
  if (!id) return;
  try {
    await store.hapusRecord(id);
    if (selectedDetail.value?.id === id) selectedDetail.value = null;
    showToast("Data berhasil dihapus.", "success");
  } catch {
    showToast("Gagal menghapus data.", "error");
  }
}

async function doLogout() {
  showLogoutConfirm.value = false;
  await store.logout();
  router.push("/login");
  showToast("Berhasil logout.", "success");
}

function buatSuratRujukan(d) {
  skriningStore.setPatientData({
    nama_lengkap: d.nama_lengkap,
    nik: d.nik,
    usia: d.usia,
    tanggal_lahir: d.tanggal_lahir,
    jenis_kelamin: d.jenis_kelamin,
    alamat: d.alamat,
    nomor_hp: d.nomor_hp || d.no_hp || d.hp,
    tanggal_skrining: d.tanggal_skrining,
  });
  skriningStore.setInstrumen(d.instrumen);
  skriningStore.setHasilSkrining({
    skor_total: d.skor_total,
    risk_level: d.tingkat_risiko,
    badge: d.kesimpulan_klinis,
    urgent: d.tingkat_risiko === 'High Risk' || d.tingkat_risiko === 'Moderate Risk',
  });
  router.push('/rujukan');
}
</script>
