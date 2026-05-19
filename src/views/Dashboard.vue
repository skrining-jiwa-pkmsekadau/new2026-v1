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
                              (store.semuaData.filter(
                                (x) => x.instrumen === 'MMYS_ANAK',
                              ).length /
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
                        store.semuaData.filter(
                          (x) => x.instrumen === "MMYS_ANAK",
                        ).length
                      }}</span
                    >
                    <span
                      class="text-[10px] text-slate-400 w-9 text-right shrink-0"
                      >{{
                        store.semuaData.length
                          ? Math.round(
                              (store.semuaData.filter(
                                (x) => x.instrumen === "MMYS_ANAK",
                              ).length /
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
                              (store.semuaData.filter(
                                (x) => x.instrumen === 'MMYS_REMAJA',
                              ).length /
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
                        store.semuaData.filter(
                          (x) => x.instrumen === "MMYS_REMAJA",
                        ).length
                      }}</span
                    >
                    <span
                      class="text-[10px] text-slate-400 w-9 text-right shrink-0"
                      >{{
                        store.semuaData.length
                          ? Math.round(
                              (store.semuaData.filter(
                                (x) => x.instrumen === "MMYS_REMAJA",
                              ).length /
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
                              (store.semuaData.filter(
                                (x) => x.instrumen === 'PHQ4',
                              ).length /
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
                        store.semuaData.filter((x) => x.instrumen === "PHQ4")
                          .length
                      }}</span
                    >
                    <span
                      class="text-[10px] text-slate-400 w-9 text-right shrink-0"
                      >{{
                        store.semuaData.length
                          ? Math.round(
                              (store.semuaData.filter(
                                (x) => x.instrumen === "PHQ4",
                              ).length /
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
                              (store.semuaData.filter(
                                (x) => x.instrumen === 'EPDS',
                              ).length /
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
                        store.semuaData.filter((x) => x.instrumen === "EPDS")
                          .length
                      }}</span
                    >
                    <span
                      class="text-[10px] text-slate-400 w-9 text-right shrink-0"
                      >{{
                        store.semuaData.length
                          ? Math.round(
                              (store.semuaData.filter(
                                (x) => x.instrumen === "EPDS",
                              ).length /
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
                      (store.semuaData.filter(
                        (x) => x.tingkat_risiko === 'High Risk',
                      ).length /
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
                      (store.semuaData.filter(
                        (x) => x.tingkat_risiko === 'Moderate Risk',
                      ).length /
                        Math.max(store.semuaData.length, 1)) *
                        314 +
                      ' 314'
                    "
                    :stroke-dashoffset="
                      '-' +
                      (store.semuaData.filter(
                        (x) => x.tingkat_risiko === 'High Risk',
                      ).length /
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
                      (store.semuaData.filter(
                        (x) => x.tingkat_risiko === 'Low Risk',
                      ).length /
                        Math.max(store.semuaData.length, 1)) *
                        314 +
                      ' 314'
                    "
                    :stroke-dashoffset="
                      '-' +
                      ((store.semuaData.filter(
                        (x) => x.tingkat_risiko === 'High Risk',
                      ).length +
                        store.semuaData.filter(
                          (x) => x.tingkat_risiko === 'Moderate Risk',
                        ).length) /
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
                      store.semuaData.filter(
                        (x) => x.tingkat_risiko === "High Risk",
                      ).length
                    }}</span>
                    <span class="text-[10px] opacity-60"
                      >({{
                        store.semuaData.length
                          ? Math.round(
                              (store.semuaData.filter(
                                (x) => x.tingkat_risiko === "High Risk",
                              ).length /
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
                      store.semuaData.filter(
                        (x) => x.tingkat_risiko === "Moderate Risk",
                      ).length
                    }}</span>
                    <span class="text-[10px] opacity-60"
                      >({{
                        store.semuaData.length
                          ? Math.round(
                              (store.semuaData.filter(
                                (x) => x.tingkat_risiko === "Moderate Risk",
                              ).length /
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
                      store.semuaData.filter(
                        (x) => x.tingkat_risiko === "Low Risk",
                      ).length
                    }}</span>
                    <span class="text-[10px] opacity-60"
                      >({{
                        store.semuaData.length
                          ? Math.round(
                              (store.semuaData.filter(
                                (x) => x.tingkat_risiko === "Low Risk",
                              ).length /
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
                <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-2 w-full">
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
                      <span :class="riskBadgeCls(d.tingkat_risiko)">{{
                        d.tingkat_risiko || "-"
                      }}</span>
                    </td>
                    <td
                      class="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell max-w-[140px] truncate"
                    >
                      {{ d.tempat_skrining || "-" }}
                    </td>
                    <td class="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        @click.stop="openDetail(d)"
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
          <div v-if="false">
          <!-- Tab Navigation -->
          <div
            class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-2 w-full sm:w-auto self-start"
          >
            <div class="flex gap-1 w-full sm:w-auto">
              <button
                v-for="tab in grafikTabs"
                :key="tab.key"
                @click="grafikTab = tab.key"
                :class="[
                  'flex-1 sm:flex-none py-2.5 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5',
                  grafikTab === tab.key
                    ? 'bg-[#0b3d66] text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                ]"
              >
                <span
                  class="material-symbols-outlined text-[16px] sm:text-[18px]"
                  >{{ tab.icon }}</span
                >
                <span>{{ tab.label }}</span>
              </button>
            </div>
          </div>

          <!-- Kelompok Usia Tab -->
          <div
            v-show="grafikTab === 'usia'"
            class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-6"
          >
            <h3
              class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4"
            >
              Distribusi Kelompok Usia (Breakdown Risiko & Instrumen)
            </h3>
            <div
              v-for="u in grafikUsia"
              :key="u.l"
              class="p-4 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-bold text-slate-700"
                  >{{ u.l }}
                  <span class="text-xs text-slate-400 font-normal"
                    >({{ u.bk.total }} org)</span
                  ></span
                >
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Risiko -->
                <div class="space-y-3">
                  <p class="text-[10px] uppercase font-bold text-slate-400">
                    Risiko
                  </p>
                  <div class="space-y-2">
                    <div v-if="u.bk.risiko.high.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-red-600">High Risk</span>
                        <span
                          >{{ u.bk.risiko.high.v }} org ({{
                            u.bk.risiko.high.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-red-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-red-500 rounded-full"
                          :style="{ width: u.bk.risiko.high.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="u.bk.risiko.mod.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-amber-600">Moderate Risk</span>
                        <span
                          >{{ u.bk.risiko.mod.v }} org ({{
                            u.bk.risiko.mod.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-amber-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-amber-500 rounded-full"
                          :style="{ width: u.bk.risiko.mod.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="u.bk.risiko.low.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-emerald-600">Low Risk</span>
                        <span
                          >{{ u.bk.risiko.low.v }} org ({{
                            u.bk.risiko.low.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-emerald-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-emerald-500 rounded-full"
                          :style="{ width: u.bk.risiko.low.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Instrumen -->
                <div class="space-y-3">
                  <p class="text-[10px] uppercase font-bold text-slate-400">
                    Instrumen
                  </p>
                  <div class="space-y-2">
                    <div v-if="u.bk.instr.mAnak.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-sky-600">MMYS Anak</span>
                        <span
                          >{{ u.bk.instr.mAnak.v }} org ({{
                            u.bk.instr.mAnak.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-sky-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-sky-500 rounded-full"
                          :style="{ width: u.bk.instr.mAnak.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="u.bk.instr.mRem.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-indigo-600">MMYS Remaja</span>
                        <span
                          >{{ u.bk.instr.mRem.v }} org ({{
                            u.bk.instr.mRem.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-indigo-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-indigo-500 rounded-full"
                          :style="{ width: u.bk.instr.mRem.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="u.bk.instr.phq.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-orange-600">PHQ-4</span>
                        <span
                          >{{ u.bk.instr.phq.v }} org ({{
                            u.bk.instr.phq.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-orange-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-orange-500 rounded-full"
                          :style="{ width: u.bk.instr.phq.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="u.bk.instr.epds.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-rose-600">EPDS</span>
                        <span
                          >{{ u.bk.instr.epds.v }} org ({{
                            u.bk.instr.epds.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-rose-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-rose-500 rounded-full"
                          :style="{ width: u.bk.instr.epds.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Jenis Kelamin Tab -->
          <div
            v-show="grafikTab === 'gender'"
            class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-6"
          >
            <h3
              class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4"
            >
              Distribusi Gender (Breakdown Risiko & Instrumen)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="g in grafikGender"
                :key="g.l"
                class="p-5 rounded-2xl border border-slate-100 bg-slate-50"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    :class="g.color"
                  >
                    <span class="material-symbols-outlined">{{ g.icon }}</span>
                  </div>
                  <div>
                    <p class="text-lg font-black text-slate-700">{{ g.l }}</p>
                    <p class="text-xs font-semibold text-slate-400">
                      {{ g.bk.total }} Total Skrining
                    </p>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="space-y-2">
                    <p class="text-[10px] uppercase font-bold text-slate-400">
                      Risiko
                    </p>
                    <div v-if="g.bk.risiko.high.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-red-600">High Risk</span>
                        <span
                          >{{ g.bk.risiko.high.v }} org ({{
                            g.bk.risiko.high.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-red-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-red-500 rounded-full"
                          :style="{ width: g.bk.risiko.high.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="g.bk.risiko.mod.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-amber-600">Moderate Risk</span>
                        <span
                          >{{ g.bk.risiko.mod.v }} org ({{
                            g.bk.risiko.mod.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-amber-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-amber-500 rounded-full"
                          :style="{ width: g.bk.risiko.mod.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="g.bk.risiko.low.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-emerald-600">Low Risk</span>
                        <span
                          >{{ g.bk.risiko.low.v }} org ({{
                            g.bk.risiko.low.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-emerald-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-emerald-500 rounded-full"
                          :style="{ width: g.bk.risiko.low.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <p class="text-[10px] uppercase font-bold text-slate-400">
                      Instrumen
                    </p>
                    <div v-if="g.bk.instr.mAnak.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-sky-600">MMYS Anak</span>
                        <span
                          >{{ g.bk.instr.mAnak.v }} org ({{
                            g.bk.instr.mAnak.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-sky-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-sky-500 rounded-full"
                          :style="{ width: g.bk.instr.mAnak.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="g.bk.instr.mRem.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-indigo-600">MMYS Remaja</span>
                        <span
                          >{{ g.bk.instr.mRem.v }} org ({{
                            g.bk.instr.mRem.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-indigo-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-indigo-500 rounded-full"
                          :style="{ width: g.bk.instr.mRem.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="g.bk.instr.phq.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-orange-600">PHQ-4</span>
                        <span
                          >{{ g.bk.instr.phq.v }} org ({{
                            g.bk.instr.phq.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-orange-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-orange-500 rounded-full"
                          :style="{ width: g.bk.instr.phq.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="g.bk.instr.epds.v">
                      <div
                        class="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-rose-600">EPDS</span>
                        <span
                          >{{ g.bk.instr.epds.v }} org ({{
                            g.bk.instr.epds.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-rose-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-rose-500 rounded-full"
                          :style="{ width: g.bk.instr.epds.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Daerah/Kecamatan Tab -->
          <div
            v-show="grafikTab === 'daerah'"
            class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-4"
          >
            <h3
              class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2"
            >
              Distribusi Daerah (Kecamatan & Desa)
            </h3>
            <div
              v-for="d in grafikDaerah"
              :key="d.l"
              class="border border-slate-200 rounded-xl overflow-hidden"
            >
              <div class="bg-slate-50 p-4 border-b border-slate-200">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span
                      class="material-symbols-outlined text-blue-500 text-[18px]"
                      >location_city</span
                    >
                    <span class="font-black text-slate-700"
                      >{{ d.l }}
                      <span class="text-xs font-normal text-slate-400"
                        >({{ d.bk.total }} org)</span
                      ></span
                    >
                  </div>
                  <button
                    @click="toggleDaerah(d.l)"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-all"
                  >
                    <span
                      class="material-symbols-outlined text-[16px] transition-transform duration-200"
                      :class="
                        expandedDaerah.has(d.l)
                          ? 'rotate-180 text-blue-500'
                          : ''
                      "
                    >
                      expand_more
                    </span>
                    {{ expandedDaerah.has(d.l) ? "Tutup Desa" : "Lihat Desa" }}
                  </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Risiko Kecamatan -->
                  <div class="space-y-2">
                    <p class="text-[9px] uppercase font-bold text-slate-400">
                      Risiko
                    </p>
                    <div v-if="d.bk.risiko.high.v">
                      <div
                        class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-red-600">High Risk</span>
                        <span
                          >{{ d.bk.risiko.high.v }} org ({{
                            d.bk.risiko.high.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-red-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-red-500 rounded-full"
                          :style="{ width: d.bk.risiko.high.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="d.bk.risiko.mod.v">
                      <div
                        class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-amber-600">Moderate Risk</span>
                        <span
                          >{{ d.bk.risiko.mod.v }} org ({{
                            d.bk.risiko.mod.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-amber-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-amber-500 rounded-full"
                          :style="{ width: d.bk.risiko.mod.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="d.bk.risiko.low.v">
                      <div
                        class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-emerald-600">Low Risk</span>
                        <span
                          >{{ d.bk.risiko.low.v }} org ({{
                            d.bk.risiko.low.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-emerald-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-emerald-500 rounded-full"
                          :style="{ width: d.bk.risiko.low.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <!-- Instrumen Kecamatan -->
                  <div class="space-y-2">
                    <p class="text-[9px] uppercase font-bold text-slate-400">
                      Instrumen
                    </p>
                    <div v-if="d.bk.instr.mAnak.v">
                      <div
                        class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-sky-600">MMYS Anak</span>
                        <span
                          >{{ d.bk.instr.mAnak.v }} org ({{
                            d.bk.instr.mAnak.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-sky-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-sky-500 rounded-full"
                          :style="{ width: d.bk.instr.mAnak.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="d.bk.instr.mRem.v">
                      <div
                        class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-indigo-600">MMYS Remaja</span>
                        <span
                          >{{ d.bk.instr.mRem.v }} org ({{
                            d.bk.instr.mRem.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-indigo-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-indigo-500 rounded-full"
                          :style="{ width: d.bk.instr.mRem.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="d.bk.instr.phq.v">
                      <div
                        class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-orange-600">PHQ-4</span>
                        <span
                          >{{ d.bk.instr.phq.v }} org ({{
                            d.bk.instr.phq.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-orange-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-orange-500 rounded-full"
                          :style="{ width: d.bk.instr.phq.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div v-if="d.bk.instr.epds.v">
                      <div
                        class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                      >
                        <span class="text-rose-600">EPDS</span>
                        <span
                          >{{ d.bk.instr.epds.v }} org ({{
                            d.bk.instr.epds.pct
                          }}%)</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 rounded-full bg-rose-100 overflow-hidden"
                      >
                        <div
                          class="h-full bg-rose-500 rounded-full"
                          :style="{ width: d.bk.instr.epds.pct + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-show="expandedDaerah.has(d.l)"
                class="p-4 bg-white space-y-3 animate-in slide-in-from-top-2 duration-300"
              >
                <p class="text-[10px] font-bold text-slate-500 uppercase">
                  Distribusi Desa / Kelurahan
                </p>
                <div
                  v-for="desa in d.desas"
                  :key="desa.l"
                  class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ml-2 border-l-2 border-slate-100 pl-3"
                >
                  <span
                    class="text-xs font-semibold text-slate-600 w-28 truncate shrink-0"
                    >{{ desa.l }}
                    <span class="text-[10px] text-slate-400 font-normal"
                      >({{ desa.bk.total }})</span
                    ></span
                  >
                  <div
                    class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 w-full py-2"
                  >
                    <!-- Risiko Desa -->
                    <div class="space-y-1.5">
                      <p class="text-[8px] uppercase font-bold text-slate-400">
                        Risiko
                      </p>
                      <div v-if="desa.bk.risiko.high.v">
                        <div
                          class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                        >
                          <span class="text-red-500">High Risk</span
                          ><span
                            >{{ desa.bk.risiko.high.v }} ({{
                              desa.bk.risiko.high.pct
                            }}%)</span
                          >
                        </div>
                        <div
                          class="w-full h-1 rounded-full bg-red-100 overflow-hidden"
                        >
                          <div
                            class="h-full bg-red-500"
                            :style="{ width: desa.bk.risiko.high.pct + '%' }"
                          ></div>
                        </div>
                      </div>
                      <div v-if="desa.bk.risiko.mod.v">
                        <div
                          class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                        >
                          <span class="text-amber-500">Mod Risk</span
                          ><span
                            >{{ desa.bk.risiko.mod.v }} ({{
                              desa.bk.risiko.mod.pct
                            }}%)</span
                          >
                        </div>
                        <div
                          class="w-full h-1 rounded-full bg-amber-100 overflow-hidden"
                        >
                          <div
                            class="h-full bg-amber-500"
                            :style="{ width: desa.bk.risiko.mod.pct + '%' }"
                          ></div>
                        </div>
                      </div>
                      <div v-if="desa.bk.risiko.low.v">
                        <div
                          class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                        >
                          <span class="text-emerald-500">Low Risk</span
                          ><span
                            >{{ desa.bk.risiko.low.v }} ({{
                              desa.bk.risiko.low.pct
                            }}%)</span
                          >
                        </div>
                        <div
                          class="w-full h-1 rounded-full bg-emerald-100 overflow-hidden"
                        >
                          <div
                            class="h-full bg-emerald-500"
                            :style="{ width: desa.bk.risiko.low.pct + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                    <!-- Instrumen Desa -->
                    <div class="space-y-1.5">
                      <p class="text-[8px] uppercase font-bold text-slate-400">
                        Instrumen
                      </p>
                      <div v-if="desa.bk.instr.mAnak.v">
                        <div
                          class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                        >
                          <span class="text-sky-500">M.Anak</span
                          ><span
                            >{{ desa.bk.instr.mAnak.v }} ({{
                              desa.bk.instr.mAnak.pct
                            }}%)</span
                          >
                        </div>
                        <div
                          class="w-full h-1 rounded-full bg-sky-100 overflow-hidden"
                        >
                          <div
                            class="h-full bg-sky-500"
                            :style="{ width: desa.bk.instr.mAnak.pct + '%' }"
                          ></div>
                        </div>
                      </div>
                      <div v-if="desa.bk.instr.mRem.v">
                        <div
                          class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                        >
                          <span class="text-indigo-500">M.Rem</span
                          ><span
                            >{{ desa.bk.instr.mRem.v }} ({{
                              desa.bk.instr.mRem.pct
                            }}%)</span
                          >
                        </div>
                        <div
                          class="w-full h-1 rounded-full bg-indigo-100 overflow-hidden"
                        >
                          <div
                            class="h-full bg-indigo-500"
                            :style="{ width: desa.bk.instr.mRem.pct + '%' }"
                          ></div>
                        </div>
                      </div>
                      <div v-if="desa.bk.instr.phq.v">
                        <div
                          class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                        >
                          <span class="text-orange-500">PHQ-4</span
                          ><span
                            >{{ desa.bk.instr.phq.v }} ({{
                              desa.bk.instr.phq.pct
                            }}%)</span
                          >
                        </div>
                        <div
                          class="w-full h-1 rounded-full bg-orange-100 overflow-hidden"
                        >
                          <div
                            class="h-full bg-orange-500"
                            :style="{ width: desa.bk.instr.phq.pct + '%' }"
                          ></div>
                        </div>
                      </div>
                      <div v-if="desa.bk.instr.epds.v">
                        <div
                          class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"
                        >
                          <span class="text-rose-500">EPDS</span
                          ><span
                            >{{ desa.bk.instr.epds.v }} ({{
                              desa.bk.instr.epds.pct
                            }}%)</span
                          >
                        </div>
                        <div
                          class="w-full h-1 rounded-full bg-rose-100 overflow-hidden"
                        >
                          <div
                            class="h-full bg-rose-500"
                            :style="{ width: desa.bk.instr.epds.pct + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
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

    <!-- ═══ MODAL DETAIL ═══ -->
    <div
      v-if="selectedDetail"
      class="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        @click="selectedDetail = null"
      ></div>
      <div
        class="relative z-10 w-full sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl flex flex-col h-[90vh] sm:h-[650px] overflow-hidden"
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
            <h2 class="text-white font-bold text-lg leading-tight">
              {{ selectedDetail.nama_lengkap }}
            </h2>
            <p class="text-blue-200 text-xs font-mono">
              NIK: {{ selectedDetail.nik || "-" }}
            </p>
          </div>
          <button
            @click="selectedDetail = null"
            class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition-all"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
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
                    riskBadgeLgCls(selectedDetail.tingkat_risiko),
                  ]"
                  ><span class="material-symbols-outlined text-[14px]">{{
                    riskIconName(selectedDetail.tingkat_risiko)
                  }}</span
                  >{{ selectedDetail.tingkat_risiko || "-" }}</span
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
                  Jawaban pada soal No.10 menunjukkan kemungkinan risiko
                  mencelakai diri
                </p>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p class="text-[10px] font-bold text-blue-400 uppercase mb-1">
                Kesimpulan Klinis
              </p>
              <p class="text-sm text-slate-700 leading-relaxed">
                {{ selectedDetail.kesimpulan_klinis || "-" }}
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
                        {{ r.kesimpulan_klinis || "-" }}
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
            v-if="selectedDetail?.tingkat_risiko === 'High Risk' || selectedDetail?.tingkat_risiko === 'Moderate Risk'"
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useSkriningStore } from "@/stores/skriningStore";
import { useToast } from "@/composables/useToast";
import { escHtml, formatTanggalID } from "@/utils/helpers";
import { INSTRUMEN_DATA } from "@/constants/instrumen";
import { DATA_WILAYAH } from "@/constants/wilayah";
import { hitungSkor } from "@/utils/skoring";
import ModalKonfirmasi from "@/components/ModalKonfirmasi.vue";
import GrafikMudah from "@/components/GrafikMudah.vue";

const router = useRouter();
const store = useDashboardStore();
const skriningStore = useSkriningStore();
const { showToast } = useToast();

const selectedDetail = ref(null);
const modalTab = ref(0);
const confirmDeleteId = ref(null);
const showLogoutConfirm = ref(false);
const showGrafik = ref(false);
const showLaporan = ref(false);
const laporanPreset = ref("bulan");
const laporanDari = ref("");
const laporanSampai = ref("");
const laporanSummary = ref(null);
let cariTimeout = null;

// ── Sidebar State ──
const activeView = ref("dashboard");
const sidebarOpen = ref(false);
const sidebarCollapsed = ref(true);
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

watch(selectedDetail, () => {
  modalTab.value = 0;
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

// ── Data Unik (Skrining Terakhir per NIK) ──
const dataUnik = computed(() => {
  const map = {};
  store.semuaData.forEach((d) => {
    const nik = d.nik;
    // Keep record if no record exists for this NIK, or if this record is newer
    if (
      !map[nik] ||
      new Date(d.tanggal_skrining) > new Date(map[nik].tanggal_skrining)
    ) {
      map[nik] = d;
    }
  });
  return Object.values(map);
});

// ── Stat Cards ──
const statCards = computed(() => {
  const semua = store.semuaData;
  const unik = dataUnik.value;

  const totalSkrining = semua.length;
  const totalUnik = unik.length;

  const h = unik.filter((x) => x.tingkat_risiko === "High Risk").length;
  const m = unik.filter((x) => x.tingkat_risiko === "Moderate Risk").length;
  const l = unik.filter((x) => x.tingkat_risiko === "Low Risk").length;

  const now = new Date();
  const skriningBulanIni = semua.filter((x) => {
    const tgl = new Date(x.tanggal_skrining);
    return (
      tgl.getMonth() === now.getMonth() &&
      tgl.getFullYear() === now.getFullYear()
    );
  }).length;

  const unikBulanIni = unik.filter((x) => {
    const tgl = new Date(x.tanggal_skrining);
    return (
      tgl.getMonth() === now.getMonth() &&
      tgl.getFullYear() === now.getFullYear()
    );
  }).length;

  return [
    {
      label: "Total Skrining",
      nilai: totalSkrining,
      sub: "Bulan ini",
      icon: "assignment",
      cls: "from-blue-500 to-blue-600",
      txt: "text-blue-600",
    },
    {
      label: "Pasien Unik",
      nilai: totalUnik,
      sub: "Bulan ini",
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

// ── Grafik Tabs ──
const grafikTab = ref("usia");
const grafikTabs = [
  { key: "usia", label: "Usia", icon: "cake" },
  { key: "gender", label: "Gender", icon: "wc" },
  { key: "daerah", label: "Daerah", icon: "location_on" },
];

const grafikUsia = computed(() => {
  const groups = [
    { l: "0–5 thn", min: 0, max: 5 },
    { l: "6–11 thn", min: 6, max: 11 },
    { l: "12–17 thn", min: 12, max: 17 },
    { l: "18–25 thn", min: 18, max: 25 },
    { l: "26–45 thn", min: 26, max: 45 },
    { l: "46–65 thn", min: 46, max: 65 },
    { l: "> 65 thn", min: 66, max: 999 },
  ];
  return groups
    .map((g) => {
      const items = dataUnik.value.filter((d) => {
        const u = parseInt(d.usia) || 0;
        return u >= g.min && u <= g.max;
      });
      return {
        ...g,
        v: items.length,
        items,
        bk: calcBreakdown(items),
      };
    })
    .filter((x) => x.v > 0);
});

const grafikGender = computed(() => {
  const itemsL = dataUnik.value.filter((d) => d.jenis_kelamin === "L");
  const itemsP = dataUnik.value.filter((d) => d.jenis_kelamin === "P");
  return [
    {
      l: "Laki-laki",
      v: itemsL.length,
      items: itemsL,
      bk: calcBreakdown(itemsL),
    },
    {
      l: "Perempuan",
      v: itemsP.length,
      items: itemsP,
      bk: calcBreakdown(itemsP),
    },
  ].filter((x) => x.v > 0);
});

function calcBreakdown(items) {
  const t = items.length;
  if (t === 0) return { total: 0, risiko: {}, instr: {} };
  const rh = items.filter((x) => x.tingkat_risiko === "High Risk").length;
  const rm = items.filter((x) => x.tingkat_risiko === "Moderate Risk").length;
  const rl = items.filter((x) => x.tingkat_risiko === "Low Risk").length;
  const iA = items.filter((x) => x.instrumen === "MMYS_ANAK").length;
  const iR = items.filter((x) => x.instrumen === "MMYS_REMAJA").length;
  const iP = items.filter((x) => x.instrumen === "PHQ4").length;
  const iE = items.filter((x) => x.instrumen === "EPDS").length;
  return {
    total: t,
    risiko: {
      high: { v: rh, pct: Math.round((rh / t) * 100) },
      mod: { v: rm, pct: Math.round((rm / t) * 100) },
      low: { v: rl, pct: Math.round((rl / t) * 100) },
    },
    instr: {
      mAnak: { v: iA, pct: Math.round((iA / t) * 100) },
      mRem: { v: iR, pct: Math.round((iR / t) * 100) },
      phq: { v: iP, pct: Math.round((iP / t) * 100) },
      epds: { v: iE, pct: Math.round((iE / t) * 100) },
    },
  };
}

const expandedDaerah = ref(new Set());
const toggleDaerah = (namaKecamatan) => {
  if (expandedDaerah.value.has(namaKecamatan)) {
    expandedDaerah.value.delete(namaKecamatan);
  } else {
    expandedDaerah.value.add(namaKecamatan);
  }
};

const grafikDaerah = computed(() => {
  const map = {};
  dataUnik.value.forEach((d) => {
    const k = d.kecamatan || "Lainnya";
    const ds = d.desa || "Lainnya";
    if (!map[k]) map[k] = { l: k, items: [], mapDesa: {} };
    map[k].items.push(d);
    if (!map[k].mapDesa[ds]) map[k].mapDesa[ds] = { l: ds, items: [] };
    map[k].mapDesa[ds].items.push(d);
  });

  return Object.values(map)
    .map((kec) => {
      kec.bk = calcBreakdown(kec.items);
      kec.desas = Object.values(kec.mapDesa)
        .map((desa) => {
          desa.bk = calcBreakdown(desa.items);
          return desa;
        })
        .sort((a, b) => b.bk.total - a.bk.total);
      return kec;
    })
    .sort((a, b) => b.bk.total - a.bk.total);
});

// ── Laporan ──
function setPreset(key) {
  laporanPreset.value = key;
  const now = new Date(),
    y = now.getFullYear(),
    m = now.getMonth();
  if (key === "minggu") {
    const day = now.getDay(),
      diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(now);
    mon.setDate(diff);
    laporanDari.value = mon.toISOString().slice(0, 10);
    laporanSampai.value = now.toISOString().slice(0, 10);
  } else if (key === "bulan") {
    laporanDari.value = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    laporanSampai.value = now.toISOString().slice(0, 10);
  } else if (key === "tahun") {
    laporanDari.value = `${y}-01-01`;
    laporanSampai.value = now.toISOString().slice(0, 10);
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
function openDetail(d) {
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
const detailRekomendasi = computed(() =>
  selectedDetail.value && Array.isArray(selectedDetail.value.rekomendasi)
    ? selectedDetail.value.rekomendasi
    : [],
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
    (s >= 13 ? "bg-red-400" : s >= 9 ? "bg-amber-400" : "bg-emerald-400")
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
function exportExcel() {
  const data = store.dataFilter;
  if (!data.length) {
    showToast("Tidak ada data untuk diexport.", "warning");
    return;
  }
  try {
    const headers = ["No","Tanggal Skrining","Nama Lengkap","NIK","Usia","Jenis Kelamin","Sekolah/Kampus","No HP","Alamat","Kecamatan","Desa","Tempat Skrining","Instrumen","Skor Total","Tingkat Risiko","Kesimpulan Klinis","Rekomendasi"];
    const rows = data.map((d, i) => [
      i + 1,
      excelSafe(d.tanggal_skrining),
      excelSafe(d.nama_lengkap),
      excelSafe(d.nik),
      d.usia ?? "-",
      d.jenis_kelamin === "L" ? "Laki-laki" : d.jenis_kelamin === "P" ? "Perempuan" : "-",
      excelSafe(d.nama_sekolah),
      excelSafe(d.nomor_hp),
      excelSafe(d.alamat),
      excelSafe(d.kecamatan),
      excelSafe(d.desa),
      excelSafe(d.tempat_skrining),
      excelSafe(instrLabelText(d.instrumen)),
      d.skor_total ?? "-",
      excelSafe(d.tingkat_risiko),
      excelSafe(d.kesimpulan_klinis),
      Array.isArray(d.rekomendasi) ? excelSafe(d.rekomendasi.join("; ")) : excelSafe(d.rekomendasi),
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `SSJ_Sekadau_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${data.length} data berhasil diexport ke CSV.`, "success");
  } catch (err) {
    showToast("Gagal export.", "error");
  }
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
    const headers = ["No","Tanggal Skrining","Nama Lengkap","NIK","Usia","Jenis Kelamin","Sekolah/Kampus","No HP","Alamat","Kecamatan","Desa","Tempat Skrining","Instrumen","Skor Total","Tingkat Risiko","Kesimpulan Klinis","Rekomendasi"];
    const rows = data.map((d, i) => [
      i + 1,
      excelSafe(d.tanggal_skrining),
      excelSafe(d.nama_lengkap),
      excelSafe(d.nik),
      d.usia ?? "-",
      d.jenis_kelamin === "L" ? "Laki-laki" : d.jenis_kelamin === "P" ? "Perempuan" : "-",
      excelSafe(d.nama_sekolah),
      excelSafe(d.nomor_hp),
      excelSafe(d.alamat),
      excelSafe(d.kecamatan),
      excelSafe(d.desa),
      excelSafe(d.tempat_skrining),
      excelSafe(instrLabelText(d.instrumen)),
      d.skor_total ?? "-",
      excelSafe(d.tingkat_risiko),
      excelSafe(d.kesimpulan_klinis),
      Array.isArray(d.rekomendasi) ? excelSafe(d.rekomendasi.join("; ")) : excelSafe(d.rekomendasi),
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const periodeLabel = laporanDari.value && laporanSampai.value
      ? `${laporanDari.value}_${laporanSampai.value}`
      : "semua";
    a.href = url;
    a.download = `SSJ_Laporan_${periodeLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${data.length} data berhasil diexport ke CSV.`, "success");
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
  const high = data.filter((d) => d.tingkat_risiko === "High Risk").length;
  const mod = data.filter((d) => d.tingkat_risiko === "Moderate Risk").length;
  const low = data.filter((d) => d.tingkat_risiko === "Low Risk").length;
  const periode =
    laporanDari.value && laporanSampai.value
      ? `${laporanDari.value} s/d ${laporanSampai.value}`
      : "Semua Data";
  const tableRows = data.map(sanitizePdfRow)
    .map(
      (d, i) =>
        `<tr><td>${i + 1}</td><td>${d.tanggal_skrining || "-"}</td><td>${d.nama_lengkap || "-"}</td><td>${d.nik || "-"}</td><td>${d.usia || "-"}</td><td>${d.jenis_kelamin === "L" ? "L" : "P"}</td><td>${d.nama_sekolah || "-"}</td><td>${instrLabelText(d.instrumen)}</td><td>${d.skor_total ?? "-"}</td><td>${d.tingkat_risiko || "-"}</td></tr>`,
    )
    .join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Laporan SSJ Sekadau</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:24px;font-size:11px}h1{font-size:16px;margin-bottom:4px}h2{font-size:13px;color:#555;margin-bottom:16px}.stats{display:flex;gap:16px;margin-bottom:20px}.stat-card{flex:1;padding:12px;border:1px solid #ddd;border-radius:8px;text-align:center}.stat-num{font-size:24px;font-weight:900}.high{color:#dc2626}.mod{color:#d97706}.low{color:#059669}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f1f5f9;font-size:10px;text-transform:uppercase}@media print{body{padding:12px}}</style></head><body><h1>Laporan Sistem Skrining Jiwa</h1><h2>UPTD Puskesmas Sekadau — Periode: ${periode}</h2><div class="stats"><div class="stat-card"><div class="stat-num">${data.length}</div><div>Total</div></div><div class="stat-card"><div class="stat-num high">${high}</div><div>High Risk</div></div><div class="stat-card"><div class="stat-num mod">${mod}</div><div>Moderate</div></div><div class="stat-card"><div class="stat-num low">${low}</div><div>Low Risk</div></div></div><table><thead><tr><th>No</th><th>Tanggal</th><th>Nama</th><th>NIK</th><th>Usia</th><th>JK</th><th>Sekolah</th><th>Instrumen</th><th>Skor</th><th>Risiko</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
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
