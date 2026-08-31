<template>
  <!--
    Dua wadah terpisah, disengaja.

    Seluruh pesan validasi formulir di aplikasi ini disampaikan lewat
    toast. Tanpa aria-live, pengguna pembaca layar tidak mendapat pesan
    galat sama sekali — mereka menekan "Lanjutkan" dan tampak seolah
    tidak terjadi apa-apa.

    Pemisahan berdasarkan tingkat kepentingan:
      role="alert"  (assertive) untuk galat dan peringatan — memotong
                    bacaan yang sedang berjalan, karena pengguna perlu
                    tahu segera bahwa tindakannya gagal.
      role="status" (polite) untuk sukses dan info — menunggu jeda,
                    agar tidak memotong pembacaan lain.

    aria-atomic="false" supaya hanya pesan baru yang dibacakan, bukan
    seluruh isi wadah setiap kali ada penambahan.
  -->
  <div
    id="toast-container"
    class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5"
  >
    <div role="alert" aria-live="assertive" aria-atomic="false" class="contents">
      <TransitionGroup name="toast">
        <div
          v-for="t in toastPenting"
          :key="t.id"
          :class="['toast', t.type]"
        >
          <span aria-hidden="true" class="material-symbols-outlined text-[20px]">{{
            t.icon
          }}</span>
          <span>{{ t.msg }}</span>
        </div>
      </TransitionGroup>
    </div>

    <div role="status" aria-live="polite" aria-atomic="false" class="contents">
      <TransitionGroup name="toast">
        <div
          v-for="t in toastBiasa"
          :key="t.id"
          :class="['toast', t.type]"
        >
          <span aria-hidden="true" class="material-symbols-outlined text-[20px]">{{
            t.icon
          }}</span>
          <span>{{ t.msg }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useToast } from "@/composables/useToast";

const { toasts } = useToast();

/** Galat dan peringatan: perlu diumumkan segera. */
const toastPenting = computed(() =>
  toasts.value.filter((t) => t.type === "error" || t.type === "warning"),
);

/** Sukses dan info: cukup diumumkan saat ada jeda. */
const toastBiasa = computed(() =>
  toasts.value.filter((t) => t.type !== "error" && t.type !== "warning"),
);
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
