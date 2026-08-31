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
        <div
          v-show="activeView === 'dashboard'"
          class="flex flex-col gap-5 max-w-7xl mx-auto w-full"
        >
          <!-- Welcome Banner -->
          <div
            class="bg-gradient-to-br from-[#0b3d66] via-[#0f4b80] to-[#1a6fc4] rounded-2xl p-5 md:p-7 text-white relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"
            ></div>
            <div
              class="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"
            ></div>
            <div class="relative z-10">
              <h2 class="text-lg md:text-2xl font-extrabold mb-1">
                Selamat Datang, Admin 👋
              </h2>
              <p class="text-blue-200 text-xs md:text-sm">
                Dashboard Pemeriksaan Indikator Jiwa & Analisa Risiko — UPTD Puskesmas Sekadau
              </p>
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <div
                  class="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5"
                >
                  <span
                    class="material-symbols-outlined text-[16px] text-emerald-300"
                    >check_circle</span
                  >
                  <span class="text-xs font-semibold"
                    >{{ store.semuaData.length }} Skrining</span
                  >
                </div>
                <div
                  class="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5"
                >
                  <span
                    class="material-symbols-outlined text-[16px] text-blue-300"
                    >calendar_month</span
                  >
                  <span class="text-xs font-semibold">{{
                    new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- STAT CARDS -->
          <div class="grid grid-cols-6 lg:grid-cols-5 gap-3 md:gap-4">
            <template v-if="store.isLoading && store.semuaData.length === 0">
              <div
                class="col-span-6 lg:col-span-5 flex items-center justify-center py-8 text-slate-400"
              >
                <div class="spinner mr-2"></div>
                Memuat data...
              </div>
            </template>
            <template v-else>
              <div
                v-for="(c, i) in statCards"
                :key="c.label"
                :class="[
                  'group bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-0.5',
                  i < 2 ? 'col-span-3 lg:col-span-1' : 'col-span-2 lg:col-span-1'
                ]"
              >
                <div
                  :class="[
                    'w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform',
                    c.cls,
                  ]"
                >
                  <span
                    class="material-symbols-outlined text-white text-[20px] md:text-[24px]"
                    >{{ c.icon }}</span
                  >
                </div>
                <div class="flex flex-col items-center min-w-0 w-full">
                  <p
                    class="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1 truncate w-full"
                  >
                    {{ c.label }}
                  </p>
                  <h3
                    class="text-2xl md:text-3xl font-black text-slate-700 leading-none mb-1 md:mb-1.5"
                  >
                    {{ c.nilai }}
                  </h3>
                  <p
                    :class="[
                      'text-[10px] md:text-[11px] font-semibold truncate w-full',
                      c.txt,
                    ]"
                  >
                    {{ c.sub }}
                  </p>
                </div>
              </div>
            </template>
          </div>

          <!-- Dashboard Grid: Instrumen + Risiko Donut -->
          <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <!-- Distribusi Instrumen (3 cols) -->
            <div
              class="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5"
            >
              <div class="flex items-center justify-between mb-4">
                <h3
                  class="text-xs font-bold text-slate-500 uppercase tracking-widest"
                >
                  Distribusi Instrumen
                </h3>
                <span class="text-[10px] text-slate-400 font-semibold"
                  >{{ store.semuaData.length }} total</span
                >
              </div>
              <div class="space-y-3">
                <div v-if="store.semuaData.length > 0">
                  <div class="flex items-center gap-3 mb-3">
                    <div
                      class="w-2.5 h-2.5 rounded-full shrink-0 bg-[#0ea5e9]"
                    ></div>
                    <span
                      class="text-xs font-semibold text-slate-700 w-24 shrink-0 truncate"
                      >MMYS Anak</span
                    >
                    <div
                      class="flex-1 h-6 rounded-lg bg-slate-100 overflow-hidden"
                    >
                      <div
                        class="h-full rounded-lg transition-all duration-700 bg-[#0ea5e9]"
                        :style="{
                          width:
                            Math.max(
                              (statistikDashboard.mMysAnak /
                                Math.max(store.semuaData.length, 1)) *
                                100,
                              4,
                            ) + '%',
                        }"
                      ></div>
                    </div>
                    <span
                      class="text-xs font-bold text-slate-700 w-8 text-right shrink-0"
                      >{{
                        statistikDashboard.mMysAnak
                      }}</span
                    >
                    <span
                      class="text-[10px] text-slate-400 w-9 text-right shrink-0"
                      >{{
                        store.semuaData.length
                          ? Math.round(
                              (statistikDashboard.mMysAnak /
                                store.semuaData.length) *
                                100,
                            )
                          : 0
                      }}%</span
                    >
                  </div>
                  <!-- MMYS REMAJA -->
                  <div class="flex items-center gap-3 mb-3">
                    <div
                      class="w-2.5 h-2.5 rounded-full shrink-0 bg-[#8b5cf6]"
                    ></div>
                    <span
                      class="text-xs font-semibold text-slate-700 w-24 shrink-0 truncate"
                      >MMYS Remaja</span
                    >
                    <div
                      class="flex-1 h-6 rounded-lg bg-slate-100 overflow-hidden"
                    >
                      <div
                        class="h-full rounded-lg transition-all duration-700 bg-[#8b5cf6]"
                        :style="{
                          width:
                            Math.max(
                              (statistikDashboard.mMysRemaja /
                                Math.max(store.semuaData.length, 1)) *
                                100,
                              4,
                            ) + '%',
                        }"
                      ></div>
                    </div>
                    <span
                      class="text-xs font-bold text-slate-700 w-8 text-right shrink-0"
                      >{{
                        statistikDashboard.mMysRemaja
                      }}</span
                    >
                    <span
                      class="text-[10px] text-slate-400 w-9 text-right shrink-0"
                      >{{
                        store.semuaData.length
                          ? Math.round(
                              (statistikDashboard.mMysRemaja /
                                store.semuaData.length) *
                                100,
                            )
                          : 0
                      }}%</span
                    >
                  </div>
                  <!-- PHQ4 -->
                  <div class="flex items-center gap-3 mb-3">
                    <div
                      class="w-2.5 h-2.5 rounded-full shrink-0 bg-[#f59e0b]"
                    ></div>
                    <span
                      class="text-xs font-semibold text-slate-700 w-24 shrink-0 truncate"
                      >PHQ-4</span
                    >
                    <div
                      class="flex-1 h-6 rounded-lg bg-slate-100 overflow-hidden"
                    >
                      <div
                        class="h-full rounded-lg transition-all duration-700 bg-[#f59e0b]"
                        :style="{
                          width:
                            Math.max(
                              (statistikDashboard.phq4 /
                                Math.max(store.semuaData.length, 1)) *
                                100,
                              4,
                            ) + '%',
                        }"
                      ></div>
                    </div>
                    <span
                      class="text-xs font-bold text-slate-700 w-8 text-right shrink-0"
                      >{{
                        statistikDashboard.phq4
                      }}</span
                    >
                    <span
                      class="text-[10px] text-slate-400 w-9 text-right shrink-0"
                      >{{
                        store.semuaData.length
                          ? Math.round(
                              (statistikDashboard.phq4 /
                                store.semuaData.length) *
                                100,
                            )
                          : 0
                      }}%</span
                    >
                  </div>
                  <!-- EPDS -->
                  <div class="flex items-center gap-3">
                    <div
                      class="w-2.5 h-2.5 rounded-full shrink-0 bg-[#f43f5e]"
                    ></div>
                    <span
                      class="text-xs font-semibold text-slate-700 w-24 shrink-0 truncate"
                      >EPDS</span
                    >
                    <div
                      class="flex-1 h-6 rounded-lg bg-slate-100 overflow-hidden"
                    >
                      <div
                        class="h-full rounded-lg transition-all duration-700 bg-[#f43f5e]"
                        :style="{
                          width:
                            Math.max(
                              (statistikDashboard.epds /
                                Math.max(store.semuaData.length, 1)) *
                                100,
                              4,
                            ) + '%',
                        }"
                      ></div>
                    </div>
                    <span
                      class="text-xs font-bold text-slate-700 w-8 text-right shrink-0"
                      >{{
                        statistikDashboard.epds
                      }}</span
                    >
                    <span
                      class="text-[10px] text-slate-400 w-9 text-right shrink-0"
                      >{{
                        store.semuaData.length
                          ? Math.round(
                              (statistikDashboard.epds /
                                store.semuaData.length) *
                                100,
                            )
                          : 0
                      }}%</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Distribusi Risiko (2 cols) - Donut Style -->
            <div
              class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5"
            >
              <h3
                class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4"
              >
                Distribusi Risiko
              </h3>
              <div class="flex items-center justify-center mb-4">
                <svg viewBox="0 0 120 120" class="w-32 h-32">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#f1f5f9"
                    stroke-width="14"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    :stroke="'#ef4444'"
                    stroke-width="14"
                    :stroke-dasharray="
                      (statistikDashboard.risikoTinggi /
                        Math.max(store.semuaData.length, 1)) *
                        314 +
                      ' 314'
                    "
                    stroke-dashoffset="0"
                    transform="rotate(-90 60 60)"
                    stroke-linecap="round"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    :stroke="'#f59e0b'"
                    stroke-width="14"
                    :stroke-dasharray="
                      (statistikDashboard.risikoSedang /
                        Math.max(store.semuaData.length, 1)) *
                        314 +
                      ' 314'
                    "
                    :stroke-dashoffset="
                      '-' +
                      (statistikDashboard.risikoTinggi /
                        Math.max(store.semuaData.length, 1)) *
                        314
                    "
                    transform="rotate(-90 60 60)"
                    stroke-linecap="round"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    :stroke="'#10b981'"
                    stroke-width="14"
                    :stroke-dasharray="
                      (statistikDashboard.risikoRendah /
                        Math.max(store.semuaData.length, 1)) *
                        314 +
                      ' 314'
                    "
                    :stroke-dashoffset="
                      '-' +
                      ((statistikDashboard.risikoTinggi +
                        statistikDashboard.risikoSedang) /
                        Math.max(store.semuaData.length, 1)) *
                        314
                    "
                    transform="rotate(-90 60 60)"
                    stroke-linecap="round"
                  />
                  <text
                    x="60"
                    y="56"
                    text-anchor="middle"
                    class="text-2xl font-black fill-slate-800"
                    style="font-size: 22px"
                  >
                    {{ store.semuaData.length }}
                  </text>
                  <text
                    x="60"
                    y="72"
                    text-anchor="middle"
                    class="fill-slate-400"
                    style="font-size: 9px; font-weight: 600"
                  >
                    TOTAL
                  </text>
                </svg>
              </div>
              <div class="space-y-2">
                <div
                  class="flex items-center justify-between p-2 rounded-lg border-red-200 bg-red-50 text-red-600"
                >
                  <span class="text-xs font-bold">High Risk</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-black">{{
                      statistikDashboard.risikoTinggi
                    }}</span>
                    <span class="text-[10px] opacity-60"
                      >({{
                        store.semuaData.length
                          ? Math.round(
                              (statistikDashboard.risikoTinggi /
                                store.semuaData.length) *
                                100,
                            )
                          : 0
                      }}%)</span
                    >
                  </div>
                </div>
                <div
                  class="flex items-center justify-between p-2 rounded-lg border-amber-200 bg-amber-50 text-amber-600"
                >
                  <span class="text-xs font-bold">Moderate</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-black">{{
                      statistikDashboard.risikoSedang
                    }}</span>
                    <span class="text-[10px] opacity-60"
                      >({{
                        store.semuaData.length
                          ? Math.round(
                              (statistikDashboard.risikoSedang /
                                store.semuaData.length) *
                                100,
                            )
                          : 0
                      }}%)</span
                    >
                  </div>
                </div>
                <div
                  class="flex items-center justify-between p-2 rounded-lg border-emerald-200 bg-emerald-50 text-emerald-600"
                >
                  <span class="text-xs font-bold">Low Risk</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-black">{{
                      statistikDashboard.risikoRendah
                    }}</span>
                    <span class="text-[10px] opacity-60"
                      >({{
                        store.semuaData.length
                          ? Math.round(
                              (statistikDashboard.risikoRendah /
                                store.semuaData.length) *
                                100,
                            )
                          : 0
                      }}%)</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end dashboard view -->
        <!-- Welcome Banner -->

        <!-- ═══ DATA VIEW ═══ -->
        <div v-show="activeView === 'data'" class="flex flex-col gap-6">
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
                  >{{ store.dataFilter.length }}</span
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
                    :value="store.filterCari"
                    @input="onCariInput($event.target.value)"
                    class="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50"
                  />
                </div>

                <!-- Selects -->
                <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-2 w-full">
                  <select
                    :value="store.filterInstr"
                    @change="
                      store.filterInstr = $event.target.value;
                      store.terapkanFilter();
                    "
                    class="px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate"
                  >
                    <option value="">Semua Instrumen</option>
                    <option value="MMYS_ANAK">MMYS Anak</option>
                    <option value="MMYS_REMAJA">MMYS Remaja</option>
                    <option value="PHQ4">PHQ-4</option>
                    <option value="EPDS">EPDS</option>
                  </select>
                  <select
                    :value="store.filterRisiko"
                    @change="
                      store.filterRisiko = $event.target.value;
                      store.terapkanFilter();
                    "
                    class="px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate"
                  >
                    <option value="">Semua Risiko</option>
                    <option value="Low Risk">Low Risk</option>
                    <option value="Moderate Risk">Moderate</option>
                    <option value="High Risk">High Risk</option>
                  </select>
                  <select
                    :value="store.filterKecamatan"
                    @change="
                      store.filterKecamatan = $event.target.value;
                      store.terapkanFilter();
                    "
                    class="px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate"
                  >
                    <option value="">Semua Kecamatan</option>
                    <option v-for="k in kecamatanList" :key="k" :value="k">
                      {{ k }}
                    </option>
                  </select>
                  <select
                    :value="store.filterGender"
                    @change="
                      store.filterGender = $event.target.value;
                      store.terapkanFilter();
                    "
                    class="px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate"
                  >
                    <option value="">Semua Gender</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  <select
                    :value="store.filterRiwayat"
                    @change="
                      store.filterRiwayat = $event.target.value;
                      store.terapkanFilter();
                    "
                    class="px-2 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-xs text-slate-700 bg-slate-50 truncate"
                  >
                    <option value="">Semua Riwayat</option>
                    <option value="pertama">Skrining Pertama</option>
                    <option value="ulang">Skrining Ulang</option>
                  </select>
                  <select
                    :value="store.filterSekolah"
                    @change="
                      store.filterSekolah = $event.target.value;
                      store.terapkanFilter();
                    "
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
                      :value="store.filterTglDari"
                      @change="
                        store.filterTglDari = $event.target.value;
                        store.terapkanFilter();
                      "
                      class="px-1 py-1 rounded border border-slate-200 text-[10px] sm:text-[11px] text-slate-700 bg-white w-[100px] sm:w-[110px]"
                    />
                    <span class="text-[10px] text-slate-400 shrink-0">–</span>
                    <input
                      type="date"
                      :value="store.filterTglSampai"
                      @change="
                        store.filterTglSampai = $event.target.value;
                        store.terapkanFilter();
                      "
                      class="px-1 py-1 rounded border border-slate-200 text-[10px] sm:text-[11px] text-slate-700 bg-white w-[100px] sm:w-[110px]"
                    />
                    <button
                      @click="
                        store.filterTglDari = '';
                        store.filterTglSampai = '';
                        store.terapkanFilter();
                      "
                      class="w-5 h-5 rounded flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 shrink-0"
                    >
                      <span class="material-symbols-outlined text-[12px]"
                        >close</span
                      >
                    </button>
                  </div>
                  <button
                    @click="resetAll"
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
                      @click="store.sortTabel('tanggal_skrining')"
                      class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-blue-600 whitespace-nowrap"
                    >
                      Tanggal
                      <span
                        class="material-symbols-outlined text-[12px] align-middle"
                        >unfold_more</span
                      >
                    </th>
                    <th
                      @click="store.sortTabel('nama_lengkap')"
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
                      @click="store.sortTabel('skor_total')"
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
                        @click.stop="openDetail(d, $event)"
                        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-bold transition-all border border-blue-100"
                      >
                        <span class="material-symbols-outlined text-[13px]"
                          >visibility</span
                        >Detail
                      </button>
                      <button
                        @click.stop="confirmDeleteId = d.id"
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
                <strong>{{ store.dataFilter.length }}</strong> data
              </p>
              <div class="flex items-center gap-1.5">
                <button
                  @click="store.gantiHalaman(store.halamanAktif - 1)"
                  :disabled="store.halamanAktif <= 1"
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
                    @click="store.gantiHalaman(pg)"
                    :class="[
                      'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                      pg === store.halamanAktif
                        ? 'bg-[#0f4b80] text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600',
                    ]"
                  >
                    {{ pg }}
                  </button>
                </template>
                <button
                  @click="store.gantiHalaman(store.halamanAktif + 1)"
                  :disabled="store.halamanAktif >= totalHalaman"
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
        <!-- end data view -->

        <!-- ═══ GRAFIK VIEW ═══ -->
        <div
          v-show="activeView === 'grafik'"
          class="flex flex-col gap-4 max-w-7xl mx-auto w-full"
        >
          <GrafikMudah :data="dataUnik" />
        </div>

        <!-- ═══ LAPORAN VIEW ═══ -->
        <div v-show="activeView === 'laporan'" class="flex flex-col gap-6">
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
        <!-- end laporan view -->
      </main>


    </div>
    <!-- end main area -->

    <!-- ═══ MODAL DETAIL ═══
         role="dialog" + aria-modal + aria-labelledby memberi tahu pembaca
         layar bahwa ini jendela modal dan menyebutkan judulnya. Di-teleport
         ke body agar lepas dari konteks penumpukan tabel. Tombol Escape dan
         pengembalian fokus ditangani di script (onMounted/onUnmounted watch
         selectedDetail). -->
    <Teleport to="body">
    <div
      v-if="selectedDetail"
      class="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-detail-modal"
      @keydown.esc="selectedDetail = null"
    >
      <div
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        @click="selectedDetail = null"
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
              {{ selectedDetail.nama_lengkap }}
            </h2>
            <p class="text-blue-200 text-xs font-mono">
              NIK: {{ selectedDetail.nik || "-" }}
            </p>
            <span class="inline-flex mt-2 px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold text-white">
              Skrining ke-{{ selectedDetail.skrining_ke || 1 }} dari {{ selectedDetail.jumlah_riwayat || 1 }}
            </span>
          </div>
          <button
            @click="selectedDetail = null"
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
                  {{ selectedDetail.usia || "-" }} Tahun
                </p>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Kelamin
                </p>
                <p class="text-sm font-bold text-slate-700">
                  {{ selectedDetail.jenis_kelamin || "-" }}
                </p>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Tanggal
                </p>
                <p class="text-sm font-bold text-slate-700">
                  {{ formatTanggalID(selectedDetail.tanggal_skrining) }}
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
                  {{ selectedDetail.alamat || "-" }}
                </p>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  No HP
                </p>
                <p class="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px] text-emerald-500">call</span>
                  {{ selectedDetail.nomor_hp || selectedDetail.no_hp || selectedDetail.hp || "-" }}
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
                  >{{ selectedDetail.tempat_skrining || "-" }}
                </p>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Instrumen
                </p>
                <p class="text-sm font-semibold text-slate-700">
                  {{ instrLabelText(selectedDetail.instrumen) }}
                </p>
              </div>
            </div>
            <div
              class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div>
                <p class="text-xs text-slate-500 mb-1">Skor Total</p>
                <p class="text-4xl font-black text-slate-800">
                  {{ selectedDetail.skor_total ?? "-" }}
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
              v-if="isMMYS(selectedDetail.instrumen)"
              class="grid grid-cols-2 gap-3"
            >
              <div
                class="p-3 rounded-xl bg-sky-50 border border-sky-100 text-center"
              >
                <p class="text-[10px] font-bold text-sky-500 uppercase mb-1">
                  Skala A — Cemas
                </p>
                <p class="text-2xl font-black text-sky-700">
                  {{ selectedDetail.skor_detail?.skor_A ?? "-"
                  }}<span class="text-xs text-sky-400">/3</span>
                </p>
                <span
                  :class="mmysHasilCls(selectedDetail.skor_detail?.hasil_A)"
                  >{{
                    mmysHasilLabel(selectedDetail.skor_detail?.hasil_A)
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
                  {{ selectedDetail.skor_detail?.skor_B ?? "-"
                  }}<span class="text-xs text-violet-400">/3</span>
                </p>
                <span
                  :class="mmysHasilCls(selectedDetail.skor_detail?.hasil_B)"
                  >{{
                    mmysHasilLabel(selectedDetail.skor_detail?.hasil_B)
                  }}</span
                >
              </div>
            </div>
            <!-- Skor Detail: PHQ4 -->
            <div
              v-if="selectedDetail.instrumen === 'PHQ4'"
              class="grid grid-cols-2 gap-3"
            >
              <div
                class="p-3 rounded-xl bg-orange-50 border border-orange-100 text-center"
              >
                <p class="text-[10px] font-bold text-orange-500 uppercase mb-1">
                  PHQ-2 — Depresi
                </p>
                <p class="text-2xl font-black text-orange-700">
                  {{ selectedDetail.skor_detail?.skor_phq2 ?? "-"
                  }}<span class="text-xs text-orange-400">/6</span>
                </p>
                <span
                  :class="phqHasilCls(selectedDetail.skor_detail?.hasil_phq2)"
                  >{{
                    phqHasilLabel(selectedDetail.skor_detail?.hasil_phq2)
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
                  {{ selectedDetail.skor_detail?.skor_gad2 ?? "-"
                  }}<span class="text-xs text-amber-400">/6</span>
                </p>
                <span
                  :class="phqHasilCls(selectedDetail.skor_detail?.hasil_gad2)"
                  >{{
                    phqHasilLabel(selectedDetail.skor_detail?.hasil_gad2)
                  }}</span
                >
              </div>
            </div>
            <!-- Skor Detail: EPDS -->
            <div
              v-if="selectedDetail.instrumen === 'EPDS'"
              class="p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-bold text-slate-500">Skor Total EPDS</p>
                <span class="text-2xl font-black text-slate-700"
                  >{{ selectedDetail.skor_total
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
                v-if="selectedDetail.skor_detail?.flag_e10"
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
                    r.id === selectedDetail.id
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
                          v-if="r.id === selectedDetail.id"
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
            @click="buatSuratRujukan(selectedDetail)"
            class="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5 hover:bg-red-100 shadow-sm"
          >
            <span class="material-symbols-outlined text-[16px]">description</span>
            Buat Surat Rujukan
          </button>
          <button
            @click="selectedDetail = null"
            class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 hover:shadow-lg"
          >
            <span class="material-symbols-outlined text-[15px]">close</span>
            Tutup
          </button>
        </div>
      </div>
    </div>
    </Teleport>

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
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-around px-2 py-2">
      <!-- Menu Items -->
      <button
        v-for="m in menuItems"
        :key="m.key"
        @click="activeView = m.key"
        :class="[
          'flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all relative',
          activeView === m.key
            ? 'text-blue-600'
            : 'text-slate-400 hover:text-slate-600',
        ]"
      >
        <div v-if="activeView === m.key" class="absolute inset-0 bg-blue-50/50 rounded-xl"></div>
        <span class="material-symbols-outlined text-[20px] relative z-10 mb-0.5" :class="{ 'text-blue-600': activeView === m.key }">{{ m.icon }}</span>
        <span class="text-[10px] font-bold relative z-10 tracking-tight">{{ m.label }}</span>
        <span
          v-if="m.badge"
          class="absolute top-1 right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center text-[7px] font-bold shadow-sm"
        >{{ m.badge }}</span>
      </button>

      <!-- Separator -->
      <div class="w-px h-8 bg-slate-200 mx-1"></div>

      <!-- Action Buttons -->
      <button
        @click="refreshData"
        class="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all relative"
      >
        <span class="material-symbols-outlined text-[18px] mb-0.5" :class="{ 'animate-spin': store.isLoading }">refresh</span>
        <span class="text-[9px] font-bold">Refresh</span>
      </button>

      <button
        @click="showLogoutConfirm = true"
        class="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all relative"
      >
        <span class="material-symbols-outlined text-[18px] mb-0.5">logout</span>
        <span class="text-[9px] font-bold">Keluar</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useSkriningStore } from "@/stores/skriningStore";
import { useToast } from "@/composables/useToast";
import { escHtml, formatTanggalID, keTanggalLokal } from "@/utils/helpers";
import { INSTRUMEN_DATA } from "@/constants/instrumen";
import { hitungSkor } from "@/utils/skoring";
import { hitungStatistikSkrining } from "@/utils/statistik";
import ModalKonfirmasi from "@/components/ModalKonfirmasi.vue";
import GrafikMudah from "@/components/GrafikMudah.vue";
import * as XLSX from "xlsx";

const router = useRouter();
const store = useDashboardStore();
const skriningStore = useSkriningStore();
const { showToast } = useToast();

const selectedDetail = ref(null);
const modalPanel = ref(null);
// Elemen yang memicu modal, agar fokus dapat dikembalikan saat ditutup.
let pemicuModal = null;
const modalTab = ref(0);
const confirmDeleteId = ref(null);
const showLogoutConfirm = ref(false);
const laporanPreset = ref("bulan");
const laporanDari = ref("");
const laporanSampai = ref("");
const laporanSummary = ref(null);
let cariTimeout = null;

// ── Sidebar State ──
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

const presets = [
  { key: "minggu", label: "Minggu Ini" },
  { key: "bulan", label: "Bulan Ini" },
  { key: "tahun", label: "Tahun Ini" },
  { key: "semua", label: "Semua Data" },
];

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

watch(selectedDetail, async (baru, lama) => {
  modalTab.value = 0;
  if (baru) {
    // Pindahkan fokus ke panel modal agar pembaca layar masuk ke
    // konteksnya dan Escape langsung tertangkap.
    await nextTick();
    modalPanel.value?.focus();
  } else if (lama) {
    // Kembalikan fokus ke baris/tombol yang membuka modal.
    pemicuModal?.focus?.();
    pemicuModal = null;
  }
});

// Bersihkan timer debounce pencarian saat komponen dilepas, agar tidak
// ada callback yang menyentuh store setelah unmount.
onBeforeUnmount(() => {
  if (cariTimeout) clearTimeout(cariTimeout);
});
watch(activeView, (v) => {
  if (v === "laporan") {
    renderLaporan();
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
//
// Sebelumnya mengelompokkan langsung dengan `d.nik` sebagai kunci objek.
// Akibatnya SELURUH baris tanpa NIK (null, kosong, atau undefined)
// jatuh ke satu kunci yang sama dan dihitung sebagai SATU orang —
// menggerus jumlah pasien unik dan seluruh angka risiko yang dihitung
// dari dataUnik, termasuk grafik dan laporan.
//
// Baris tanpa NIK kini diperlakukan sebagai individu tersendiri
// memakai kunci berbasis id barisnya. Itu pilihan yang lebih aman:
// melaporkan lebih banyak pasien berisiko daripada menyembunyikannya.
const dataUnik = computed(() => {
  const map = new Map();

  for (const d of store.semuaData) {
    const nik = String(d.nik ?? "").trim();
    // Tanpa NIK yang sah, baris tidak dapat dipastikan milik orang yang
    // sama, jadi jangan digabungkan.
    const kunci = nik ? `nik:${nik}` : `baris:${d.id}`;

    const lama = map.get(kunci);
    if (!lama) {
      map.set(kunci, d);
      continue;
    }

    // Perbandingan string 'YYYY-MM-DD' cukup dan urut secara leksikal,
    // tanpa risiko pergeseran zona waktu dari penguraian Date.
    const tglBaru = String(d.tanggal_skrining || "").slice(0, 10);
    const tglLama = String(lama.tanggal_skrining || "").slice(0, 10);
    if (tglBaru > tglLama) map.set(kunci, d);
  }

  return [...map.values()];
});
// Angka statistik dihitung oleh fungsi murni hitungStatistikSkrining agar dapat
// diuji terpisah — Dashboard.vue tidak punya component test, jadi kesalahan
// predikat di sini (angka yang dilaporkan ke Dinkes) tidak akan tertangkap
// tanpa pengujian pada fungsi tersebut.
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

  // Perbandingan bulan memakai potongan string 'YYYY-MM' agar tidak
  // bergantung pada penguraian Date. Kolom tanggal_skrining berupa
  // tanggal saja, yang bila diurai Date menjadi tengah malam UTC dan
  // dapat bergeser satu hari di zona waktu Indonesia.
  const prefixBulanIni = keTanggalLokal(new Date()).slice(0, 7);
  const bulanIni = (x) =>
    String(x.tanggal_skrining || "").slice(0, 7) === prefixBulanIni;

  const skriningBulanIni = semua.filter(bulanIni).length;
  const unikBulanIni = unik.filter(bulanIni).length;

  return [
    // Kedua kartu pertama sebelumnya berlabel "Bulan ini" tetapi
    // menampilkan total sepanjang waktu — angka bulanan sudah dihitung
    // namun tidak pernah dipakai. Kini label dan nilainya sepadan, dan
    // angka bulanan tampil sebagai keterangan di bawahnya.
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


// ── Laporan ──
//
// Seluruh batas tanggal WAJIB dihitung dengan waktu LOKAL memakai
// keTanggalLokal(). Sebelumnya fungsi ini mencampur toISOString() (UTC)
// dengan getFullYear/getMonth (lokal), sehingga di WIB antara 00:00 dan
// 06:59 batas "sampai" mundur satu hari — dan pada tanggal 1 setiap
// bulan `dari` bisa melewati `sampai`, membuat laporan kosong tanpa
// pesan galat.
function setPreset(key) {
  laporanPreset.value = key;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const hariIniLokal = keTanggalLokal(now);

  if (key === "minggu") {
    // Senin sebagai awal pekan. getDay(): 0 = Minggu, jadi Minggu
    // dianggap akhir pekan sebelumnya (-6).
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

const laporanInstrumenFilter = ref(["MMYS_ANAK", "MMYS_REMAJA", "PHQ4", "EPDS"]);
const laporanSekolahFilter = ref("");

function getLaporanDataToExport() {
  return store.semuaData.filter((d) => {
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

// ── Detail Modal ──
function openDetail(d, ev) {
  // Simpan elemen pemicu agar fokus dapat dikembalikan saat modal tutup.
  pemicuModal = ev?.currentTarget ?? null;
  selectedDetail.value = d;
}

const detailLengkap = computed(() => {
  if (!selectedDetail.value || !selectedDetail.value.jawaban) return null;
  return hitungSkor(selectedDetail.value.instrumen, selectedDetail.value.jawaban);
});
const detailJawaban = computed(() => {
  if (!selectedDetail.value) return [];
  const item = selectedDetail.value,
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
  if (!selectedDetail.value) return [];
  if (Array.isArray(detailLengkap.value?.rekomendasi_list)) return detailLengkap.value.rekomendasi_list;
  return Array.isArray(selectedDetail.value.rekomendasi)
    ? selectedDetail.value.rekomendasi
    : [];
});

const detailKesimpulan = computed(() => {
  if (!selectedDetail.value) return "-";
  return detailLengkap.value?.kesimpulan_klinis || selectedDetail.value.kesimpulan_klinis || "-";
});

const selectedRisikoPanduan = computed(() =>
  selectedDetail.value ? risikoExport(selectedDetail.value) : "-",
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
  selectedDetail.value
    ? Math.round(((selectedDetail.value.skor_total || 0) / 30) * 100)
    : 0,
);
const epdsBarCls = computed(() => {
  if (!selectedDetail.value) return "";
  const s = selectedDetail.value.skor_total;
  return (
    "h-full rounded-full " +
    (s >= 13 ? "bg-red-400" : "bg-emerald-400")
  );
});

// ── Badge Helpers ──
function instrLabelText(i) {
  return (
    {
      MMYS_ANAK: "MMYS Anak",
      MMYS_REMAJA: "MMYS Remaja",
      PHQ4: "PHQ-4",
      EPDS: "EPDS",
    }[i] || i
  );
}
function instrBadgeCls(i) {
  const m = {
    MMYS_ANAK: "bg-sky-50 text-sky-600 border-sky-200",
    MMYS_REMAJA: "bg-violet-50 text-violet-600 border-violet-200",
    PHQ4: "bg-orange-50 text-orange-600 border-orange-200",
    EPDS: "bg-pink-50 text-pink-600 border-pink-200",
  };
  return (
    "px-2 py-0.5 rounded-full text-[10px] font-bold border " +
    (m[i] || "bg-slate-50 text-slate-500 border-slate-200")
  );
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
function riskBadgeCls(r) {
  const m = {
    "High Risk": "bg-red-50 text-red-600 border-red-200",
    "Moderate Risk": "bg-amber-50 text-amber-600 border-amber-200",
    "Low Risk": "bg-emerald-50 text-emerald-600 border-emerald-200",
  };
  return (
    "px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap " +
    (m[r] || "bg-slate-50 text-slate-500 border-slate-200")
  );
}
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

// ── Actions ──
function onCariInput(v) {
  clearTimeout(cariTimeout);
  cariTimeout = setTimeout(() => {
    store.filterCari = v.toLowerCase();
    store.terapkanFilter();
  }, 300);
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
function hasilPanduanExport(d) {
  if (Array.isArray(d.jawaban)) {
    const hasil = hitungSkor(d.instrumen, d.jawaban);
    if (hasil) return hasil;
  }
  return null;
}

function rekomendasiText(value) {
  return Array.isArray(value) ? value.join("; ") : value || "-";
}

function kesimpulanExport(d) {
  return hasilPanduanExport(d)?.kesimpulan_klinis || d.kesimpulan_klinis || "-";
}

function rekomendasiExport(d) {
  return rekomendasiText(hasilPanduanExport(d)?.rekomendasi_list || d.rekomendasi);
}

function risikoExport(d) {
  return hasilPanduanExport(d)?.risk_level || d.tingkat_risiko || "-";
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
