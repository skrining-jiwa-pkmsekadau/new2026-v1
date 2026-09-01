<template>
  <div
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
              >{{ totalData }} Skrining</span
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
      <template v-if="isLoading && totalData === 0">
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
            >{{ totalData }} total</span
          >
        </div>
        <div class="space-y-3">
          <div v-if="totalData > 0">
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
                          Math.max(totalData, 1)) *
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
                  totalData
                    ? Math.round(
                        (statistikDashboard.mMysAnak /
                          totalData) *
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
                          Math.max(totalData, 1)) *
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
                  totalData
                    ? Math.round(
                        (statistikDashboard.mMysRemaja /
                          totalData) *
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
                          Math.max(totalData, 1)) *
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
                  totalData
                    ? Math.round(
                        (statistikDashboard.phq4 /
                          totalData) *
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
                          Math.max(totalData, 1)) *
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
                  totalData
                    ? Math.round(
                        (statistikDashboard.epds /
                          totalData) *
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
                  Math.max(totalData, 1)) *
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
                  Math.max(totalData, 1)) *
                  314 +
                ' 314'
              "
              :stroke-dashoffset="
                '-' +
                (statistikDashboard.risikoTinggi /
                  Math.max(totalData, 1)) *
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
                  Math.max(totalData, 1)) *
                  314 +
                ' 314'
              "
              :stroke-dashoffset="
                '-' +
                ((statistikDashboard.risikoTinggi +
                  statistikDashboard.risikoSedang) /
                  Math.max(totalData, 1)) *
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
              {{ totalData }}
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
                  totalData
                    ? Math.round(
                        (statistikDashboard.risikoTinggi /
                          totalData) *
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
                  totalData
                    ? Math.round(
                        (statistikDashboard.risikoSedang /
                          totalData) *
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
                  totalData
                    ? Math.round(
                        (statistikDashboard.risikoRendah /
                          totalData) *
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
</template>

<script setup>
defineProps({
  statCards: { type: Array, required: true },
  statistikDashboard: { type: Object, required: true },
  totalData: { type: Number, required: true },
  isLoading: { type: Boolean, default: false },
});
</script>
