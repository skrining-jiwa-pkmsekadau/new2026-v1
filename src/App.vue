<template>
  <div
    class="app-root bg-background-warm text-slate-800 font-display min-h-screen"
  >
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useDashboardStore } from "@/stores/dashboardStore";
import ToastContainer from "@/components/ToastContainer.vue";

const dashStore = useDashboardStore();

// Check admin session on app mount
onMounted(() => {
  dashStore.cekSession();
});
</script>
