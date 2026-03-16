<template>
  <div
    class="relative flex flex-col min-h-screen overflow-x-hidden bg-[#f8fafc]"
  >
    <!-- Premium background with reactive particles -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden text-slate-900/5">
      <div class="absolute inset-0 bg-[size:32px_32px] bg-dot-pattern opacity-10"></div>
      
      <!-- Reactive blobs with parallax -->
      <div 
        class="blob blob-1 blur-[120px]" 
        :style="{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }"
      ></div>
      <div 
        class="blob blob-2 blur-[100px]"
        :style="{ transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)` }"
      ></div>
      <div 
        class="blob blob-3 blur-[80px]"
        :style="{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * 15}px)` }"
      ></div>

      <!-- Animated background particles -->
      <div v-for="n in 12" :key="n" class="floating-particle" :style="particleStyle(n)"></div>
    </div>

    <!-- Header Glassmorphism -->
    <header
      class="w-full px-6 py-4 md:px-10 lg:px-20 sticky top-0 z-50 transition-all duration-300 border-b border-white/20"
      :class="scrolled ? 'bg-white/70 backdrop-blur-2xl shadow-sm' : 'bg-transparent'"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3 group cursor-pointer" @click="router.push('/')">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f4b80] to-[#1e88e5] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500"
          >
            <span class="material-symbols-outlined text-white text-[22px]">health_and_safety</span>
          </div>
          <div class="flex flex-col">
            <span class="text-base font-black tracking-tight text-slate-800 leading-none mb-1">PIJAR</span>
            <span class="text-[9px] text-slate-400 font-bold tracking-widest uppercase">UPTD Puskesmas Sekadau</span>
          </div>
        </div>
        <router-link
          to="/login"
          class="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/5 hover:bg-slate-900/10 transition-all text-xs font-bold text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200"
        >
          <span class="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-600 group-hover:rotate-12 transition-all">admin_panel_settings</span>
          <span class="hidden sm:inline">Portal Admin</span>
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

        <!-- Staggered PIJAR Title -->
        <div class="flex flex-col items-center">
          <h1 class="flex flex-col items-center gap-4">
            <div class="flex items-center gap-2 py-6 px-10">
              <span 
                v-for="(char, i) in 'PIJAR'.split('')" 
                :key="i"
                class="stagger-char text-[85px] md:text-[120px] lg:text-[150px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[#0f4b80] via-[#1a73e8] to-[#64b5f6] leading-[1.2]"
                :style="{ '--char-i': i }"
              >
                {{ char }}
              </span>
            </div>
            
            <div class="anim-fade-up max-w-3xl" style="--delay: 0.6s">
              <span class="text-xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-700 leading-tight">
                <span class="text-blue-600">P</span>emeriksaan 
                <span class="text-blue-600">I</span>ndikator 
                <span class="text-blue-600">J</span>iwa 
                <span class="mx-2 text-slate-900 font-bold">&</span> 
                <span class="text-blue-600">A</span>nalisa 
                <span class="text-blue-600">R</span>isiko
              </span>
            </div>
          </h1>

          <div class="anim-fade-up flex items-center gap-4 mt-6 opacity-40 group" style="--delay: 0.8s">
            <div class="h-[1px] w-12 bg-gradient-to-r from-transparent to-slate-400"></div>
            <span class="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase group-hover:text-blue-600 transition-colors duration-500">Puskesmas Sekadau</span>
            <div class="h-[1px] w-12 bg-gradient-to-l from-transparent to-slate-400"></div>
          </div>
        </div>

        <!-- Descriptive Subtitle -->
        <p
          class="anim-fade-up text-slate-500 max-w-xl mx-auto text-base md:text-lg leading-relaxed font-semibold italic opacity-80"
          style="--delay: 0.9s"
        >
          "Kesehatan jiwa anda adalah prioritas kami. <br class="hidden sm:block" /> Mulai deteksi dini dengan platform PIJAR sekarang."
        </p>

        <!-- Premium CTA -->
        <div class="flex flex-col items-center gap-8 anim-fade-up" style="--delay: 1s">
          <router-link
            to="/identitas"
            class="group relative inline-flex items-center justify-center gap-4 px-16 py-6 bg-slate-900 hover:bg-blue-600 text-white font-black text-xl rounded-2xl shadow-2xl shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2"
          >
            <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="material-symbols-outlined text-[28px] animate-pulse">radar</span>
            <span>Mulai Pemeriksaan</span>
            <span class="material-symbols-outlined text-[24px] group-hover:translate-x-3 transition-transform duration-500">arrow_forward</span>
          </router-link>

          <!-- Floating Info Pills -->
          <div class="flex flex-wrap items-center justify-center gap-4">
            <div
              v-for="(pill, i) in pills"
              :key="pill.label"
              class="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-slate-100/50 text-slate-500 text-[11px] font-bold shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300"
            >
              <div :class="['w-6 h-6 rounded-lg flex items-center justify-center bg-opacity-10', pill.iconBg]">
                <span :class="['material-symbols-outlined text-[16px]', pill.iconCls]">{{ pill.icon }}</span>
              </div>
              {{ pill.label }}
            </div>
          </div>
        </div>

        <!-- 3D Magnetic Instrument Cards -->
        <div
          ref="cardsRef"
          class="w-full grid grid-cols-1 gap-6 mt-12 md:grid-cols-2 lg:grid-cols-4 p-4"
        >
          <div
            v-for="(card, idx) in instrumentCards"
            :key="card.title"
            class="card-container"
            :style="{ '--card-i': idx }"
            @mousemove="handleCardTilt($event, idx)"
            @mouseleave="resetCardTilt(idx)"
          >
            <div
              :ref="el => cardElements[idx] = el"
              :class="[
                'card-3d relative bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col gap-6 text-left border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500',
                cardsVisible ? 'card-visible' : '',
              ]"
            >
              <div class="relative z-10">
                <div class="flex justify-between items-start mb-6">
                  <div :class="['p-4 rounded-2xl shadow-sm transition-transform duration-500', card.iconBg]">
                    <span class="material-symbols-outlined text-[32px]">{{ card.icon }}</span>
                  </div>
                  <span :class="['px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2', card.badgeCls]">
                    {{ card.usia }}
                  </span>
                </div>
                
                <h3 class="text-xl font-black text-slate-800 mb-2 leading-tight">{{ card.title }}</h3>
                <p class="text-xs text-slate-400 font-medium leading-relaxed mb-6">{{ card.desc }}</p>
                
                <div class="mt-auto flex items-center justify-between opacity-50">
                   <span class="text-[9px] font-black font-mono tracking-tighter uppercase whitespace-nowrap">{{ card.sub }}</span>
                   <span class="material-symbols-outlined text-[18px]">read_more</span>
                </div>
              </div>
              
              <!-- Subtle card glow -->
              <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-50/50 to-transparent rounded-b-[2rem] -z-10"></div>
            </div>
          </div>
        </div>

        <!-- Refined How-It-Works -->
        <div ref="stepsRef" class="w-full mt-20 relative px-4">
          <div class="flex flex-col items-center mb-12">
            <h3 :class="['text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-3 anim-scroll-fade', stepsVisible ? 'anim-scroll-visible' : '']">Workflow</h3>
            <h2 :class="['text-3xl font-black text-slate-800 anim-scroll-fade', stepsVisible ? 'anim-scroll-visible' : '']" style="transition-delay: 0.1s">Tiga Langkah Mudah</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div v-for="(step, si) in steps" :key="step.num" 
              :class="['step-card group relative p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/20 transition-all duration-500 hover:shadow-2xl hover:border-blue-100 overflow-hidden', stepsVisible ? 'step-visible' : '']"
              :style="{ '--step-i': si }"
            >
              <div class="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-150 transition-all duration-700">
                <span class="text-8xl font-black">{{ step.num }}</span>
              </div>
              <div class="relative z-10">
                <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg mb-6 shadow-xl shadow-blue-500/20 group-hover:rotate-[360deg] transition-transform duration-1000">
                  {{ step.num }}
                </div>
                <h4 class="text-lg font-black text-slate-800 mb-3">{{ step.title }}</h4>
                <p class="text-xs text-slate-400 font-medium leading-relaxed">{{ step.desc }}</p>
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
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

/* ── Mouse Interaction States ── */
const mousePos = reactive({ x: 0, y: 0 });
const scrolled = ref(false);

const handleGlobalMouseMove = (e) => {
  mousePos.x = (e.clientX / window.innerWidth) - 0.5;
  mousePos.y = (e.clientY / window.innerHeight) - 0.5;
};

const handleScroll = () => {
  scrolled.value = window.scrollY > 50;
};

/* ── 3D Magnetic Cards Logic ── */
const cardElements = ref([]);
const handleCardTilt = (e, idx) => {
  const el = cardElements.value[idx];
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -10;
  const rotateY = ((x - centerX) / centerX) * 10;
  
  el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
};

const resetCardTilt = (idx) => {
  const el = cardElements.value[idx];
  if (el) el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
};

/* ── Particle Styles ── */
const particleStyle = (n) => {
  const sizes = [4, 6, 8, 12, 16];
  const size = sizes[n % sizes.length];
  const duration = 15 + (n * 2);
  const left = (n * 8) + 4;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${(n * 7) + 10}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${n * -1.5}s`
  };
};

/* ── Intersection Observer for scroll-triggered animations ── */
const cardsRef = ref(null);
const stepsRef = ref(null);
const cardsVisible = ref(false);
const stepsVisible = ref(false);

let observer = null;

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("mousemove", handleGlobalMouseMove);
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (e.target === cardsRef.value) cardsVisible.value = true;
        if (e.target === stepsRef.value) stepsVisible.value = true;
      });
    },
    { threshold: 0.1 },
  );
  if (cardsRef.value) observer.observe(cardsRef.value);
  if (stepsRef.value) observer.observe(stepsRef.value);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("mousemove", handleGlobalMouseMove);
  observer?.disconnect();
});

/* ── UI Data ── */
const pills = [
  { icon: "schedule", iconCls: "text-blue-500", iconBg: "bg-blue-500", label: "Cepat (5 Menit)" },
  { icon: "lock", iconCls: "text-emerald-500", iconBg: "bg-emerald-500", label: "Privasi Terjamin" },
  { icon: "workspace_premium", iconCls: "text-violet-500", iconBg: "bg-violet-500", label: "Standar Medis" },
];

const instrumentCards = [
  {
    title: "MMYS Anak",
    icon: "child_care",
    iconBg: "bg-sky-50 text-sky-600",
    usia: "Usia 7–9",
    badgeCls: "bg-white border-sky-100 text-sky-600",
    desc: "Deteksi dini kesehatan emosional khusus untuk anak tingkat Sekolah Dasar.",
    sub: "Mini MindHEAR Youth Scale",
  },
  {
    title: "MMYS Remaja",
    icon: "face",
    iconBg: "bg-violet-50 text-violet-600",
    usia: "Usia 10–17",
    badgeCls: "bg-white border-violet-100 text-violet-600",
    desc: "Khusus untuk remaja SMP/SMA guna memantau perkembangan psikologis.",
    sub: "Mini MindHEAR Youth Scale",
  },
  {
    title: "Depresi & Cemas",
    icon: "psychology",
    iconBg: "bg-emerald-50 text-emerald-600",
    usia: "Dewasa (≥18)",
    badgeCls: "bg-white border-emerald-100 text-emerald-600",
    desc: "Instrumen PHQ-4 untuk mendeteksi gejala gangguan kecemasan & depresi.",
    sub: "Patient Health Questionnaire-4",
  },
  {
    title: "Mama Care",
    icon: "pregnant_woman",
    iconBg: "bg-rose-50 text-rose-600",
    usia: "Ibu Hamil/Nifas",
    badgeCls: "bg-white border-rose-100 text-rose-600",
    desc: "Membantu ibu mendeteksi gejala depresi pasca melahirkan (Postnatal).",
    sub: "Edinburgh Depression Scale",
  },
];

const steps = [
  {
    num: "01",
    title: "Input Data Diri",
    desc: "Lengkapi identitas singkat. Tenang, data anda aman dalam enkripsi medis kami.",
  },
  {
    num: "02",
    title: "Jawab Jujur",
    desc: "Berikan jawaban paling jujur terkait kondisi yang anda rasakan saat ini.",
  },
  {
    num: "03",
    title: "Hasil Instan",
    desc: "Sistem akan menganalisis indikator risiko & memberikan rekomendasi klinis segera.",
  },
];
</script>

<style scoped>
/* ═══════════════════ THEME STYLES ═══════════════════ */
.bg-dot-pattern {
  background-image: radial-gradient(#0f4b80 1px, transparent 1px);
}

.blob {
  position: absolute;
  border-radius: 9999px;
  animation: blob-float 20s ease-in-out infinite;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.blob-1 {
  top: -10%; left: -5%; width: 700px; height: 700px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.05));
}
.blob-2 {
  bottom: -10%; right: -5%; width: 600px; height: 600px;
  background: linear-gradient(315deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  animation-delay: -5s;
}
.blob-3 {
  top: 40%; right: 10%; width: 300px; height: 300px;
  background: rgba(139, 92, 246, 0.08);
  animation-delay: -10s;
}

@keyframes blob-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 40px) scale(1.1); }
}

.floating-particle {
  position: absolute;
  background: #3b82f6;
  border-radius: 50%;
  opacity: 0.12;
  filter: blur(2px);
  animation: float-around linear infinite;
}

@keyframes float-around {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 0.15; }
  80% { opacity: 0.15; }
  100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
}

/* ═══════════════════ MOTION: PIJAR STAGGERed ═══════════════════ */
.stagger-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(50px);
  animation: staggerIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--char-i) * 0.1s + 0.3s);
}

@keyframes staggerIn {
  to { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════ MOTION: FADE-IN-UP ═══════════════════ */
.anim-fade-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0s);
}
@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════ 3D CARD EFFECTS ═══════════════════ */
.card-container {
  perspective: 1000px;
}
.card-3d {
  opacity: 0;
  transform: translateY(60px);
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
}
.card-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ═══════════════════ STEP ANIMS ═══════════════════ */
.anim-scroll-fade {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s ease;
}
.anim-scroll-visible {
  opacity: 1; transform: translateY(0);
}

.step-card {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--step-i) * 0.2s);
}
.step-visible {
  opacity: 1; transform: translateY(0);
}

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(0,0,0,0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
