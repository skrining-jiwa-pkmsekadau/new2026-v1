<template>
  <div
    class="relative flex flex-col min-h-screen overflow-x-hidden bg-[#f8fafc]"
  >
    <!-- Animated Background -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="absolute inset-0 bg-[size:24px_24px] bg-dot-pattern opacity-20"
      ></div>
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- Header -->
    <header
      class="w-full px-6 py-3.5 md:px-10 lg:px-20 bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 shadow-sm"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f4b80] to-[#1e88e5] flex items-center justify-center shadow-lg shadow-blue-500/20"
          >
            <span class="material-symbols-outlined text-white text-[22px]"
              >health_and_safety</span
            >
          </div>
          <div class="flex flex-col">
            <span class="text-base font-extrabold tracking-tight text-slate-800"
              >SSJ Puskesmas Sekadau</span
            >
            <span
              class="text-[10px] text-slate-400 font-semibold tracking-wider uppercase"
              >Sistem Skrining Jiwa</span
            >
          </div>
        </div>
        <router-link
          to="/login"
          class="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all text-sm font-semibold text-slate-600 hover:text-slate-800"
        >
          <span
            class="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-600 transition-colors"
            >admin_panel_settings</span
          >
          <span class="hidden sm:inline">Admin</span>
        </router-link>
      </div>
    </header>

    <!-- Hero -->
    <main
      class="flex-grow flex flex-col items-center justify-center px-4 py-16 md:py-24 relative z-10"
    >
      <div
        class="max-w-5xl w-full mx-auto flex flex-col items-center text-center gap-10"
      >
        <!-- Status Badge — fade in + bobbing -->
        <div class="anim-fade-up" style="--delay: 0.1s">
          <div
            class="badge-bob inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white border border-emerald-200 shadow-sm text-emerald-700 font-bold text-xs tracking-wider uppercase"
          >
            <span class="relative flex h-2.5 w-2.5">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"
              ></span>
            </span>
            Layanan Aktif 24 Jam
          </div>
        </div>

        <!-- Title Block — staggered fade in -->
        <div class="flex flex-col items-center gap-3">
          <h1
            class="anim-fade-up text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95]"
            style="--delay: 0.25s"
          >
            <span class="text-slate-800">Sistem</span><br />
            <span class="text-slate-800">Skrining </span>
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-[#0f4b80] via-[#1565c0] to-[#1e88e5]"
              >Jiwa</span
            >
          </h1>
          <div
            class="anim-fade-up flex items-center gap-3 mt-2"
            style="--delay: 0.4s"
          >
            <div
              class="h-px w-12 bg-gradient-to-r from-transparent to-slate-300 anim-line-grow"
            ></div>
            <span
              class="text-sm md:text-base font-bold text-slate-400 tracking-[0.2em] uppercase"
              >Puskesmas Sekadau</span
            >
            <div
              class="h-px w-12 bg-gradient-to-l from-transparent to-slate-300 anim-line-grow-r"
            ></div>
          </div>
        </div>

        <!-- Subtitle -->
        <p
          class="anim-fade-up text-slate-500 max-w-lg mx-auto text-base md:text-lg leading-relaxed font-medium"
          style="--delay: 0.5s"
        >
          Platform deteksi dini masalah kesehatan mental terpadu untuk
          masyarakat Kabupaten Sekadau.
        </p>

        <!-- CTA + Info Row -->
        <div
          class="flex flex-col items-center gap-6 anim-fade-up"
          style="--delay: 0.6s"
        >
          <router-link
            to="/identitas"
            class="group relative inline-flex items-center justify-center gap-4 px-14 py-5 bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] hover:from-[#0a3a64] hover:to-[#1565c0] text-white font-extrabold text-xl rounded-2xl shadow-[0_14px_36px_-8px_rgba(15,75,128,0.5)] hover:shadow-[0_18px_44px_-8px_rgba(15,75,128,0.6)] transition-all duration-400 transform hover:-translate-y-1.5"
          >
            <span class="material-symbols-outlined text-[28px]"
              >play_arrow</span
            >
            <span>Mulai Skrining</span>
            <span
              class="material-symbols-outlined text-[24px] group-hover:translate-x-2 transition-transform duration-300"
              >east</span
            >
          </router-link>

          <!-- Quick Info Pills — bobbing -->
          <div class="flex flex-wrap items-center justify-center gap-3">
            <div
              v-for="(pill, i) in pills"
              :key="pill.label"
              class="badge-bob flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-semibold shadow-sm"
              :style="{ animationDelay: i * 0.5 + 1 + 's' }"
            >
              <span
                class="material-symbols-outlined text-[14px]"
                :class="pill.iconCls"
                >{{ pill.icon }}</span
              >
              {{ pill.label }}
            </div>
          </div>
        </div>

        <!-- Instrument Cards — staggered scroll reveal -->
        <div
          ref="cardsRef"
          class="w-full grid grid-cols-1 gap-5 mt-8 md:grid-cols-2 lg:grid-cols-4"
        >
          <div
            v-for="(card, idx) in instrumentCards"
            :key="card.title"
            :class="[
              'card-reveal group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-4 text-left border border-slate-200/80 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 transform hover:-translate-y-1',
              cardsVisible ? 'card-visible' : '',
            ]"
            :style="{ '--card-i': idx }"
          >
            <div
              class="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
              :class="card.glowCls"
            ></div>
            <div class="flex justify-between items-start">
              <div
                :class="[
                  'p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md',
                  card.iconBg,
                ]"
              >
                <span class="material-symbols-outlined text-[28px]">{{
                  card.icon
                }}</span>
              </div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                  card.badgeCls,
                ]"
              >
                {{ card.usia }}
              </span>
            </div>
            <div>
              <h3
                class="text-lg font-bold text-slate-800 mb-1.5 group-hover:text-blue-700 transition-colors"
              >
                {{ card.title }}
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                {{ card.desc }}
              </p>
            </div>
            <div class="mt-auto pt-3.5 border-t border-slate-100">
              <span
                class="text-[10px] text-slate-400 font-bold font-mono tracking-wide uppercase"
                >{{ card.sub }}</span
              >
            </div>
          </div>
        </div>

        <!-- How it works — scroll reveal with connector lines -->
        <div ref="stepsRef" class="w-full mt-8">
          <h3
            :class="[
              'text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 anim-scroll-fade',
              stepsVisible ? 'anim-scroll-visible' : '',
            ]"
          >
            Bagaimana Cara Kerjanya
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0 relative">
            <!-- Connector line (desktop) -->
            <div
              class="hidden md:block absolute top-[28px] left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-0.5 z-0"
            >
              <div
                :class="[
                  'h-full bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300 rounded-full origin-left transition-transform duration-1000 ease-out',
                  stepsVisible ? 'scale-x-100' : 'scale-x-0',
                ]"
              ></div>
            </div>
            <div
              v-for="(step, si) in steps"
              :key="step.num"
              :class="[
                'step-item relative z-10 flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm mx-0 md:mx-2 mb-4 md:mb-0',
                stepsVisible ? 'step-visible' : '',
              ]"
              :style="{ '--step-i': si }"
            >
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-blue-500/20"
              >
                {{ step.num }}
              </div>
              <div>
                <p class="text-sm font-bold text-slate-700 mb-0.5">
                  {{ step.title }}
                </p>
                <p class="text-xs text-slate-400 leading-relaxed">
                  {{ step.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer
      class="relative z-10 w-full py-8 border-t border-slate-200/60 bg-white/60 backdrop-blur-sm"
    >
      <div class="max-w-7xl mx-auto px-6 text-center">
        <p class="text-slate-400 text-xs font-medium">
          © 2026 UPTD Puskesmas Sekadau — Dinas Kesehatan Kabupaten Sekadau,
          Kalimantan Barat
        </p>
        <p class="text-slate-500 text-sm font-semibold mt-2">
          Dikembangkan oleh Banu Prasetya bersama Tim Kesehatan Jiwa Puskesmas
          Sekadau
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

/* ── Intersection Observer for scroll-triggered animations ── */
const cardsRef = ref(null);
const stepsRef = ref(null);
const cardsVisible = ref(false);
const stepsVisible = ref(false);

let observer = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (e.target === cardsRef.value) cardsVisible.value = true;
        if (e.target === stepsRef.value) stepsVisible.value = true;
      });
    },
    { threshold: 0.15 },
  );
  if (cardsRef.value) observer.observe(cardsRef.value);
  if (stepsRef.value) observer.observe(stepsRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
});

/* ── Data ── */
const pills = [
  { icon: "timer", iconCls: "text-blue-400", label: "5–10 menit" },
  {
    icon: "verified_user",
    iconCls: "text-emerald-400",
    label: "Rahasia & aman",
  },
  { icon: "payments", iconCls: "text-violet-400", label: "100% gratis" },
];

const instrumentCards = [
  {
    title: "MMYS Anak",
    icon: "child_care",
    iconBg: "bg-sky-50 text-sky-600",
    usia: "7–9 th",
    badgeCls: "bg-sky-50 border-sky-200 text-sky-600",
    glowCls: "from-sky-50/50 to-transparent",
    desc: "Deteksi dini masalah mental emosional untuk anak usia sekolah dasar.",
    sub: "Mini MindHEAR Youth Scale",
  },
  {
    title: "MMYS Remaja",
    icon: "face",
    iconBg: "bg-violet-50 text-violet-600",
    usia: "10–17 th",
    badgeCls: "bg-violet-50 border-violet-200 text-violet-600",
    glowCls: "from-violet-50/50 to-transparent",
    desc: "Instrumen skrining kesehatan mental untuk remaja dan siswa menengah.",
    sub: "Mini MindHEAR Youth Scale",
  },
  {
    title: "PHQ-4",
    icon: "psychology",
    iconBg: "bg-emerald-50 text-emerald-600",
    usia: "≥ 18 th",
    badgeCls: "bg-emerald-50 border-emerald-200 text-emerald-600",
    glowCls: "from-emerald-50/50 to-transparent",
    desc: "Skrining cepat depresi dan gangguan kecemasan untuk pasien dewasa.",
    sub: "Patient Health Questionnaire-4",
  },
  {
    title: "EPDS",
    icon: "pregnant_woman",
    iconBg: "bg-rose-50 text-rose-600",
    usia: "Ibu Hamil",
    badgeCls: "bg-rose-50 border-rose-200 text-rose-600",
    glowCls: "from-rose-50/50 to-transparent",
    desc: "Deteksi gejala depresi pada masa kehamilan dan pasca melahirkan.",
    sub: "Edinburgh Postnatal Depression Scale",
  },
];

const steps = [
  {
    num: "1",
    title: "Klik Mulai Skrining & Isi Data",
    desc: "Klik tombol 'Mulai Skrining' di atas, lalu lengkapi formulir data diri pasien. Instrumen skrining dipilih otomatis berdasarkan usia.",
  },
  {
    num: "2",
    title: "Jawab Kuesioner",
    desc: "Jawab pertanyaan skrining sesuai kondisi yang dirasakan dalam beberapa waktu terakhir.",
  },
  {
    num: "3",
    title: "Lihat Hasil & Tindak Lanjut",
    desc: "Dapatkan skor, interpretasi, dan rekomendasi tindak lanjut secara instan.",
  },
];
</script>

<style scoped>
/* ═══════════════════ BACKGROUND BLOBS ═══════════════════ */
.blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(120px);
  animation: blob-float 12s ease-in-out infinite;
}
.blob-1 {
  top: -15%;
  left: -10%;
  width: 650px;
  height: 650px;
  background: linear-gradient(
    135deg,
    rgba(191, 219, 254, 0.45),
    rgba(199, 210, 254, 0.25)
  );
  animation-delay: 0s;
}
.blob-2 {
  bottom: -15%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: linear-gradient(
    315deg,
    rgba(207, 250, 254, 0.35),
    rgba(191, 219, 254, 0.2)
  );
  animation-delay: -4s;
}
.blob-3 {
  top: 40%;
  right: 15%;
  width: 280px;
  height: 280px;
  background: rgba(221, 214, 254, 0.18);
  animation-delay: -8s;
}
@keyframes blob-float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.35;
  }
  33% {
    transform: translate(30px, -20px) scale(1.05);
    opacity: 0.5;
  }
  66% {
    transform: translate(-20px, 15px) scale(0.97);
    opacity: 0.4;
  }
}

/* ═══════════════════ FADE-IN-UP (hero elements) ═══════════════════ */
.anim-fade-up {
  opacity: 0;
  transform: translateY(28px);
  animation: fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0s);
}
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ═══════════════════ LINE GROW (title decorators) ═══════════════════ */
.anim-line-grow {
  transform-origin: right center;
  animation: lineGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: 0.55s;
  transform: scaleX(0);
}
.anim-line-grow-r {
  transform-origin: left center;
  animation: lineGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: 0.55s;
  transform: scaleX(0);
}
@keyframes lineGrow {
  to {
    transform: scaleX(1);
  }
}

/* ═══════════════════ BADGE BOBBING ═══════════════════ */
.badge-bob {
  animation: bob 3.5s ease-in-out infinite;
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* ═══════════════════ CARD STAGGERED REVEAL ═══════════════════ */
.card-reveal {
  opacity: 0;
  transform: translateY(40px) scale(0.96);
  transition:
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--card-i, 0) * 0.12s);
}
.card-reveal.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ═══════════════════ STEPS SCROLL REVEAL ═══════════════════ */
.anim-scroll-fade {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}
.anim-scroll-fade.anim-scroll-visible {
  opacity: 1;
  transform: translateY(0);
}
.step-item {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--step-i, 0) * 0.15s + 0.2s);
}
.step-item.step-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
