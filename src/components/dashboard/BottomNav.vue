<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-around px-2 py-2">
    <!-- Menu Items -->
    <button
      v-for="m in menuItems"
      :key="m.key"
      @click="$emit('update:activeView', m.key)"
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
      @click="$emit('refresh')"
      class="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all relative"
    >
      <span class="material-symbols-outlined text-[18px] mb-0.5" :class="{ 'animate-spin': isLoading }">refresh</span>
      <span class="text-[9px] font-bold">Refresh</span>
    </button>

    <button
      @click="$emit('logout')"
      class="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all relative"
    >
      <span class="material-symbols-outlined text-[18px] mb-0.5">logout</span>
      <span class="text-[9px] font-bold">Keluar</span>
    </button>
  </nav>
</template>

<script setup>
defineProps({
  menuItems: { type: Array, required: true },
  activeView: { type: String, required: true },
  isLoading: { type: Boolean, default: false },
});

defineEmits(["update:activeView", "refresh", "logout"]);
</script>
