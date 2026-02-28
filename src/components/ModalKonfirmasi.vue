<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        @click="handleCancel"
      ></div>
      <div
        class="relative z-10 bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
      >
        <!-- Icon -->
        <div class="pt-6 pb-2 flex justify-center">
          <div
            :class="[
              'w-14 h-14 rounded-full flex items-center justify-center',
              iconBg,
            ]"
          >
            <span
              :class="['material-symbols-outlined text-[28px]', iconColor]"
              >{{ iconName }}</span
            >
          </div>
        </div>
        <!-- Content -->
        <div class="px-6 pb-2 text-center">
          <h3 class="text-base font-bold text-slate-800 mb-1">{{ title }}</h3>
          <p class="text-sm text-slate-500 leading-relaxed">{{ message }}</p>
        </div>
        <!-- Buttons -->
        <div class="px-6 pb-6 pt-4 flex gap-3">
          <button
            @click="handleCancel"
            class="flex-1 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white text-slate-600 font-semibold text-sm transition-all"
          >
            {{ cancelText }}
          </button>
          <button
            @click="handleConfirm"
            :class="[
              'flex-1 py-3 rounded-xl font-bold text-sm transition-all text-white shadow-md',
              confirmBtnClass,
            ]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  type: { type: String, default: "danger" }, // 'danger' | 'warning' | 'info'
  title: { type: String, default: "Konfirmasi" },
  message: { type: String, default: "Apakah Anda yakin?" },
  confirmText: { type: String, default: "Ya, Lanjutkan" },
  cancelText: { type: String, default: "Batal" },
});

const emit = defineEmits(["confirm", "cancel"]);

const iconName = computed(
  () =>
    ({
      danger: "warning",
      warning: "help",
      info: "info",
    })[props.type] || "warning",
);

const iconBg = computed(
  () =>
    ({
      danger: "bg-red-100",
      warning: "bg-amber-100",
      info: "bg-blue-100",
    })[props.type] || "bg-red-100",
);

const iconColor = computed(
  () =>
    ({
      danger: "text-red-500",
      warning: "text-amber-500",
      info: "text-blue-500",
    })[props.type] || "text-red-500",
);

const confirmBtnClass = computed(
  () =>
    ({
      danger: "bg-red-500 hover:bg-red-600",
      warning: "bg-amber-500 hover:bg-amber-600",
      info: "bg-blue-500 hover:bg-blue-600",
    })[props.type] || "bg-red-500 hover:bg-red-600",
);

function handleConfirm() {
  emit("confirm");
}
function handleCancel() {
  emit("cancel");
}
</script>
