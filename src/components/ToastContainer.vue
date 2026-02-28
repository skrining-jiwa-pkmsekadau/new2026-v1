<template>
  <div
    id="toast-container"
    class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5"
  >
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
        <span class="material-symbols-outlined text-[20px]">{{ t.icon }}</span>
        <span>{{ t.msg }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from "@/composables/useToast";

const { toasts } = useToast();
</script>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.3s ease;
}
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
