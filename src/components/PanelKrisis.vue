<script setup>
/**
 * PanelKrisis — menampilkan nomor bantuan saat responden mengakui
 * pikiran mencelakai diri sendiri, atau saat hasil tergolong High Risk.
 *
 * Dipakai di dua tempat:
 *  1. Kuesioner.vue — segera setelah opsi item 10 EPDS dipilih, agar
 *     bantuan hadir pada saat pengakuan, bukan di akhir alur.
 *  2. Hasil.vue — pada hasil High Risk atau saat perlu_krisis menyala.
 *
 * Aksesibilitas: role="alert" agar pembaca layar langsung mengumumkan
 * panel ini, dan setiap nomor adalah tautan tel:/wa.me yang bisa
 * ditekan langsung dari ponsel.
 */
import { KONTAK_KRISIS, tautanTelepon, tautanWhatsApp } from '@/constants/kontakKrisis'

const props = defineProps({
  /** 'mendesak' saat item 10 positif; 'anjuran' untuk High Risk umum. */
  nada: {
    type: String,
    default: 'mendesak',
  },
  /** Sembunyikan saat mode cetak agar tidak ikut tercetak. */
  untukCetak: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <section
    role="alert"
    aria-labelledby="judul-panel-krisis"
    :class="[
      'rounded-2xl border-2 p-4 sm:p-5',
      nada === 'mendesak'
        ? 'bg-rose-50 border-rose-300'
        : 'bg-amber-50 border-amber-300',
      untukCetak ? '' : 'no-print',
    ]"
  >
    <div class="flex items-start gap-3">
      <span
        aria-hidden="true"
        :class="[
          'material-symbols-outlined text-[22px] shrink-0 mt-0.5',
          nada === 'mendesak' ? 'text-rose-600' : 'text-amber-600',
        ]"
        >support_agent</span
      >
      <div class="min-w-0 flex-1">
        <h2
          id="judul-panel-krisis"
          :class="[
            'text-sm font-bold leading-snug',
            nada === 'mendesak' ? 'text-rose-800' : 'text-amber-800',
          ]"
        >
          <template v-if="nada === 'mendesak'">
            Anda tidak sendirian. Bantuan tersedia sekarang.
          </template>
          <template v-else> Bantuan tersedia bila Anda membutuhkannya. </template>
        </h2>

        <p
          :class="[
            'text-xs leading-relaxed mt-1.5',
            nada === 'mendesak' ? 'text-rose-700' : 'text-amber-700',
          ]"
        >
          <template v-if="nada === 'mendesak'">
            Terima kasih sudah menjawab dengan jujur. Perasaan seperti ini berat
            untuk dipikul sendiri, dan ada petugas yang siap mendengarkan Anda.
            Silakan hubungi salah satu nomor di bawah ini.
          </template>
          <template v-else>
            Jika Anda merasa memerlukan seseorang untuk berbicara, silakan
            hubungi salah satu nomor berikut.
          </template>
        </p>

        <!-- Daftar kontak -->
        <ul class="mt-3 flex flex-col gap-2.5">
          <li
            v-for="kontak in KONTAK_KRISIS"
            :key="kontak.nomor + kontak.nama"
            class="rounded-xl bg-white/80 border border-slate-200 p-3"
          >
            <p class="text-xs font-bold text-slate-700">{{ kontak.nama }}</p>
            <p class="text-[11px] text-slate-500 mt-0.5">
              {{ kontak.keterangan }}
            </p>

            <div class="flex flex-wrap gap-2 mt-2">
              <a
                :href="tautanTelepon(kontak)"
                class="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-rose-600 hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 text-white text-sm font-bold transition-colors"
                :aria-label="`Telepon ${kontak.nama} di ${kontak.tampilan}`"
              >
                <span aria-hidden="true" class="material-symbols-outlined text-[18px]">call</span>
                {{ kontak.tampilan }}
              </a>

              <a
                v-if="kontak.whatsapp"
                :href="tautanWhatsApp(kontak)"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-lg border-2 border-emerald-600 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 text-emerald-700 text-sm font-bold transition-colors"
                :aria-label="`Kirim pesan WhatsApp ke ${kontak.nama}`"
              >
                <span aria-hidden="true" class="material-symbols-outlined text-[18px]">chat</span>
                WhatsApp
              </a>
            </div>
          </li>
        </ul>

        <p
          v-if="nada === 'mendesak'"
          class="text-[11px] text-rose-600 mt-3 leading-relaxed"
        >
          Bila Anda merasa dalam bahaya saat ini, segera datang ke IGD terdekat
          atau minta seseorang menemani Anda.
        </p>
      </div>
    </div>
  </section>
</template>
