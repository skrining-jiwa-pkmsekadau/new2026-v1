<template>
  <div
    class="gradient-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
  >
    <!-- Grid pattern -->
    <div class="absolute inset-0 bg-grid-slate opacity-50"></div>

    <!-- Decorative blobs -->
    <div
      class="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-[100px]"
    ></div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-200/30 rounded-full blur-[100px]"
    ></div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30 mb-4"
        >
          <span class="material-symbols-outlined text-white text-[32px]"
            >admin_panel_settings</span
          >
        </div>
        <h1 class="text-2xl font-bold text-slate-800">Login Admin</h1>
        <p class="text-sm text-slate-500 mt-1">
          Sistem Skrining Jiwa — Puskesmas Sekadau
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5"
              >Email</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span
                  class="material-symbols-outlined text-slate-400 text-[20px]"
                  >mail</span
                >
              </span>
              <input
                v-model="email"
                type="email"
                placeholder="admin@puskesmas.go.id"
                required
                class="clean-input w-full pl-10 pr-4 py-3 rounded-xl text-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5"
              >Password</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <span
                  class="material-symbols-outlined text-slate-400 text-[20px]"
                  >lock</span
                >
              </span>
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="Masukkan password"
                required
                class="clean-input w-full pl-10 pr-12 py-3 rounded-xl text-sm placeholder:text-slate-400"
              />
              <button
                type="button"
                @click="showPwd = !showPwd"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <span class="material-symbols-outlined text-[20px]">{{
                  showPwd ? "visibility_off" : "visibility"
                }}</span>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMsg"
            class="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
          >
            <span class="material-symbols-outlined text-[18px]">error</span>
            <span>{{ errorMsg }}</span>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            :class="[
              'gradient-btn w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2',
              loading
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:shadow-blue-500/40 hover:-translate-y-0.5',
            ]"
          >
            <div v-if="loading" class="spinner"></div>
            <span v-else class="material-symbols-outlined text-[20px]"
              >login</span
            >
            <span>{{ loading ? "Masuk..." : "Masuk ke Dashboard" }}</span>
          </button>
        </form>
      </div>

      <!-- Back to Home -->
      <div class="text-center mt-6">
        <router-link
          to="/"
          class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium"
        >
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          Kembali ke Halaman Utama
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const dashStore = useDashboardStore();
const { showToast } = useToast();

const email = ref("");
const password = ref("");
const showPwd = ref(false);
const loading = ref(false);
const errorMsg = ref("");

async function handleLogin() {
  errorMsg.value = "";
  loading.value = true;
  try {
    await dashStore.login(email.value, password.value);
    showToast("Login berhasil! Selamat datang.", "success");
    router.push("/dashboard");
  } catch (err) {
    errorMsg.value =
      err?.message === "Invalid login credentials"
        ? "Email atau password salah."
        : err?.message || "Gagal login. Periksa koneksi internet.";
  } finally {
    loading.value = false;
  }
}
</script>
