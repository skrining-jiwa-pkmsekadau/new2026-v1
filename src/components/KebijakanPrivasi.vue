<script setup>
/**
 * KebijakanPrivasi — isi pemberitahuan privasi, dipakai di dua tempat:
 *  1. Gerbang persetujuan sebelum formulir identitas (ringkas).
 *  2. Halaman /privasi yang dapat dibuka kapan saja (lengkap).
 *
 * Isinya berasal dari src/constants/kebijakanPrivasi.js agar hanya ada
 * satu sumber kebenaran; versi yang sama disimpan bersama tiap baris
 * skrining sebagai bukti persetujuan.
 */
import {
  VERSI_KEBIJAKAN,
  TANGGAL_BERLAKU,
  PENGENDALI_DATA,
  KONTAK_PENGADUAN,
  MASA_SIMPAN,
  DATA_DIKUMPULKAN,
  TUJUAN_PEMROSESAN,
  PENERIMA_DATA,
  HAK_PASIEN,
} from '@/constants/kebijakanPrivasi'

defineProps({
  /** true = tampilkan judul halaman penuh. */
  denganJudul: { type: Boolean, default: false },
})
</script>

<template>
  <div class="flex flex-col gap-5 text-slate-700">
    <div v-if="denganJudul">
      <h1 class="text-xl font-bold text-slate-800">
        Pemberitahuan Pelindungan Data Pribadi
      </h1>
      <p class="text-xs text-slate-500 mt-1">
        Versi {{ VERSI_KEBIJAKAN }} — berlaku sejak {{ TANGGAL_BERLAKU }}
      </p>
    </div>

    <!-- Pengendali -->
    <section>
      <h2 class="text-sm font-bold text-slate-800 mb-1.5">
        Siapa yang mengelola data Anda
      </h2>
      <p class="text-sm leading-relaxed">
        <strong>{{ PENGENDALI_DATA.nama }}</strong>, {{ PENGENDALI_DATA.wilayah }},
        bertanggung jawab atas pengumpulan dan penggunaan data pada layanan
        skrining ini.
      </p>
    </section>

    <!-- Data yang dikumpulkan -->
    <section>
      <h2 class="text-sm font-bold text-slate-800 mb-1.5">
        Data yang dikumpulkan
      </h2>
      <dl class="flex flex-col gap-2">
        <div
          v-for="d in DATA_DIKUMPULKAN"
          :key="d.kelompok"
          class="rounded-lg bg-slate-50 border border-slate-200 p-2.5"
        >
          <dt class="text-xs font-bold text-slate-700">{{ d.kelompok }}</dt>
          <dd class="text-xs text-slate-600 mt-0.5 leading-relaxed">
            {{ d.rincian }}
          </dd>
        </div>
      </dl>
      <p class="text-xs text-slate-500 mt-2 leading-relaxed">
        Jawaban kuesioner kesehatan jiwa termasuk
        <strong>data pribadi bersifat spesifik</strong> menurut Undang-Undang
        Nomor 27 Tahun 2022, sehingga memerlukan persetujuan Anda sebelum
        dikumpulkan.
      </p>
    </section>

    <!-- Tujuan -->
    <section>
      <h2 class="text-sm font-bold text-slate-800 mb-1.5">
        Untuk apa data digunakan
      </h2>
      <ul class="flex flex-col gap-1.5">
        <li
          v-for="t in TUJUAN_PEMROSESAN"
          :key="t"
          class="text-sm leading-relaxed flex gap-2"
        >
          <span aria-hidden="true" class="text-blue-400 shrink-0">&bull;</span>
          <span>{{ t }}</span>
        </li>
      </ul>
    </section>

    <!-- Penerima -->
    <section>
      <h2 class="text-sm font-bold text-slate-800 mb-1.5">
        Siapa saja yang dapat melihat data Anda
      </h2>
      <div class="flex flex-col gap-2">
        <div
          v-for="p in PENERIMA_DATA"
          :key="p.pihak"
          class="rounded-lg bg-amber-50 border border-amber-200 p-2.5"
        >
          <p class="text-xs font-bold text-amber-900">{{ p.pihak }}</p>
          <p class="text-xs text-amber-800 mt-0.5 leading-relaxed">
            {{ p.tujuan }}
          </p>
        </div>
      </div>
    </section>

    <!-- Masa simpan -->
    <section>
      <h2 class="text-sm font-bold text-slate-800 mb-1.5">
        Berapa lama data disimpan
      </h2>
      <p class="text-sm leading-relaxed">
        Data disimpan selama <strong>{{ MASA_SIMPAN }}</strong>, mengikuti
        ketentuan penyimpanan rekam medis pada fasilitas pelayanan kesehatan.
      </p>
    </section>

    <!-- Hak pasien -->
    <section>
      <h2 class="text-sm font-bold text-slate-800 mb-1.5">Hak Anda</h2>
      <ul class="flex flex-col gap-1.5">
        <li
          v-for="h in HAK_PASIEN"
          :key="h"
          class="text-sm leading-relaxed flex gap-2"
        >
          <span aria-hidden="true" class="text-emerald-500 shrink-0">&check;</span>
          <span>{{ h }}</span>
        </li>
      </ul>
    </section>

    <!-- Kontak -->
    <section>
      <h2 class="text-sm font-bold text-slate-800 mb-1.5">
        Cara menggunakan hak Anda
      </h2>
      <p class="text-sm leading-relaxed">{{ KONTAK_PENGADUAN.keterangan }}.</p>
      <p v-if="KONTAK_PENGADUAN.telepon" class="text-sm mt-1">
        Telepon:
        <a
          :href="`tel:${KONTAK_PENGADUAN.telepon}`"
          class="text-blue-600 underline font-semibold"
          >{{ KONTAK_PENGADUAN.telepon }}</a
        >
      </p>
      <p v-if="KONTAK_PENGADUAN.email" class="text-sm mt-1">
        Surel:
        <a
          :href="`mailto:${KONTAK_PENGADUAN.email}`"
          class="text-blue-600 underline font-semibold"
          >{{ KONTAK_PENGADUAN.email }}</a
        >
      </p>
    </section>

    <p class="text-[11px] text-slate-400 leading-relaxed border-t border-slate-200 pt-3">
      Pemberitahuan ini versi {{ VERSI_KEBIJAKAN }}, berlaku sejak
      {{ TANGGAL_BERLAKU }}. Versi yang Anda setujui dicatat bersama data
      skrining Anda.
    </p>
  </div>
</template>
