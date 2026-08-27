<template>
  <div
    class="app-root bg-background-warm text-slate-800 font-body min-h-screen noise-texture"
  >
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <ToastContainer />

    <!-- Global loading overlay (saat router sedang validasi auth) -->
    <transition name="fade">
      <div
        v-if="isNavigating"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p class="text-sm text-slate-600 font-medium">Memuat...</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useDashboardStore } from "@/stores/dashboardStore";
import ToastContainer from "@/components/ToastContainer.vue";

const dashStore = useDashboardStore();
const router = useRouter();

const isNavigating = ref(false);

router.beforeEach(() => {
  isNavigating.value = true;
});
router.afterEach(() => {
  isNavigating.value = false;
});
router.onError(() => {
  isNavigating.value = false;
});

// Check admin session on app mount
onMounted(() => {
  dashStore.cekSession();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
}
</style>
