<template>
  <div
    id="rujukan-print-area"
    class="relative flex flex-col min-h-screen bg-[#F0F7FF]"
  >
    <!-- BG Deko -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden no-print">
      <div
        class="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[90px]"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-50/40 rounded-full blur-[80px]"
      ></div>
    </div>

    <!-- HEADER (no-print) -->
    <header class="sticky top-0 z-50 bg-[#0f4b80] px-4 py-4 shadow-lg no-print">
      <div class="max-w-2xl mx-auto flex items-center gap-3">
        <button
          class="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
          @click="router.back()"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div class="flex-1">
          <h1 class="text-white font-bold text-base leading-tight">
            Surat Rujukan
          </h1>
          <p class="text-blue-100 text-xs">Pengantar Pemeriksaan Lanjutan</p>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="flex-1 flex flex-col items-center px-4 py-6 relative z-10 print:p-0 print:m-0 print:block">
      <div class="w-full max-w-2xl flex flex-col gap-5 print:block print:max-w-none print:w-full">
        <!-- FORM EDITABLE FIELDS (no-print) -->
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden no-print"
        >
          <div
            class="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-blue-500 text-[18px]"
              >edit_note</span
            >
            <h3
              class="text-xs font-bold text-slate-600 uppercase tracking-widest"
            >
              Lengkapi Data Surat
            </h3>
          </div>
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                  >Nomor Surat</label
                >
                <input
                  v-model="formSurat.nomorSurat"
                  type="text"
                  placeholder="440/XXX/PKM-SKD/2026"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-sm bg-slate-50"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                  >Tanggal Surat</label
                >
                <input
                  v-model="formSurat.tanggalSurat"
                  type="date"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-sm bg-slate-50"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Ditujukan Kepada</label
              >
              <input
                v-model="formSurat.tujuan"
                type="text"
                placeholder="dr. Sp.KJ / Poli Jiwa RSUD..."
                class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-sm bg-slate-50"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Tempat / Kota Tujuan</label
              >
              <input
                v-model="formSurat.kotaTujuan"
                type="text"
                placeholder="RSUD Sekadau / Kota Pontianak"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-sm bg-slate-50"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Keluhan / Observasi Singkat
                <span class="text-slate-400 font-normal"
                  >(Opsional)</span
                ></label
              >
              <textarea
                v-model="formSurat.keluhan"
                rows="2"
                placeholder="Contoh: Pasien tampak sangat murung, ada ide menyakiti diri..."
                class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-sm bg-slate-50 resize-none"
              ></textarea>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                  >Nama Petugas / Dokter</label
                >
                <input
                  v-model="formSurat.namaDokter"
                  type="text"
                  placeholder="dr. Nama Lengkap"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-sm bg-slate-50"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                  >NIP
                  <span class="text-slate-400 font-normal"
                    >(Opsional)</span
                  ></label
                >
                <input
                  v-model="formSurat.nipDokter"
                  type="text"
                  placeholder="NIP. xxxx..."
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-sm bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- SURAT PREVIEW (this is the printable part) -->
        <div
          id="surat-body"
          class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden print-full"
        >
          <div class="p-6 sm:p-8">
            <!-- KOP SURAT -->
            <div class="border-b border-black pb-0.5 mb-4">
              <div class="border-b-[3px] border-black pb-2">
                <div class="flex items-center gap-3 px-1">
                  <img
                    src="/sekadau.png"
                    alt="Logo Sekadau"
                    class="w-[65px] h-auto shrink-0 mix-blend-multiply"
                  />
                  <div class="flex-1 text-center text-black font-sans">
                    <p class="text-[15px] font-bold tracking-wide uppercase leading-tight">
                      PEMERINTAH KABUPATEN SEKADAU
                    </p>
                    <p class="text-[13px] tracking-wide uppercase leading-tight mt-0.5">
                      DINAS KESEHATAN, PENGENDALIAN PENDUDUK<br />
                      DAN KELUARGA BERENCANA
                    </p>
                    <h2 class="text-[20px] font-black uppercase tracking-widest leading-tight mt-0.5">
                      UPTD PUSKESMAS SEKADAU
                    </h2>
                    <p class="text-[11px] mt-1">
                      Jalan Merdeka Barat No. 57 Sekadau Hilir Kode Pos 79582
                    </p>
                    <p class="text-[11px] mt-0.5">
                      Telp. (0564)41290 Fax. (0564)41290 e-mail : <span class="text-blue-700 underline">puskesmas.sekadau@yahoo.com</span>
                    </p>
                  </div>
                  <img
                    src="/kesehatan.svg"
                    alt="Logo Bakti Husada"
                    class="w-[65px] h-auto shrink-0 mix-blend-multiply"
                  />
                </div>
              </div>
            </div>

            <!-- ISI SURAT -->
            <div
              class="text-[13px] text-slate-800 leading-snug space-y-2.5 font-[serif]"
              style="font-family: &quot;Times New Roman&quot;, serif"
            >
              <!-- Tanggal -->
              <p class="text-right">
                Sekadau, {{ formatTanggalSurat(formSurat.tanggalSurat) }}
              </p>

              <!-- Header -->
              <div class="space-y-0.5">
                <p>
                  Nomor &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                  {{
                    formSurat.nomorSurat ||
                    "..........................................."
                  }}
                </p>
                <p>Lampiran &nbsp;: 1 Berkas (Cetak Hasil Skrining)</p>
                <p>
                  Perihal &nbsp;&nbsp;&nbsp;&nbsp;:
                  <strong>Pengantar Pemeriksaan Lanjutan / Rujukan</strong>
                </p>
              </div>

              <!-- Tujuan -->
              <div>
                <p>Kepada Yth.</p>
                <p>
                  <strong>{{
                    formSurat.tujuan ||
                    "............................................"
                  }}</strong>
                </p>
                <p>di</p>
                <p>
                  <strong>{{
                    formSurat.kotaTujuan ||
                    "............................................"
                  }}</strong>
                </p>
              </div>

              <!-- Pembuka -->
              <p>Dengan hormat,</p>
              <p>
                Bersama surat ini kami memohon bantuan evaluasi klinis dan
                penanganan lebih lanjut terhadap pasien:
              </p>

              <!-- Data Pasien -->
              <table class="w-full text-[13px]">
                <tbody>
                  <tr>
                    <td class="py-0.5 align-top w-44">Nama</td>
                    <td class="py-0.5">
                      : <strong>{{ pasien.nama_lengkap || "-" }}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td class="py-0.5 align-top">NIK</td>
                    <td class="py-0.5">: {{ pasien.nik || "-" }}</td>
                  </tr>
                  <tr>
                    <td class="py-0.5 align-top">Umur / Tgl Lahir</td>
                    <td class="py-0.5">
                      : {{ pasien.usia || "-" }} Tahun /
                      {{ formatTanggalSurat(pasien.tanggal_lahir) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="py-0.5 align-top">Jenis Kelamin</td>
                    <td class="py-0.5">
                      :
                      {{
                        pasien.jenis_kelamin === "L"
                          ? "Laki-laki"
                          : pasien.jenis_kelamin === "P"
                            ? "Perempuan"
                            : "-"
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="py-0.5 align-top">Alamat Lengkap</td>
                    <td class="py-0.5">: {{ pasien.alamat || "-" }}</td>
                  </tr>
                  <tr>
                    <td class="py-0.5 align-top">Nomor Telepon/HP</td>
                    <td class="py-0.5">: {{ pasien.nomor_hp || "-" }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Hasil Skrining -->
              <p>
                Berdasarkan hasil deteksi dini melalui
                <strong>Sistem Skrining Jiwa (SSJ)</strong> pada tanggal
                <strong>{{
                  formatTanggalSurat(pasien.tanggal_skrining)
                }}</strong
                >, pasien tersebut menunjukkan hasil evaluasi dengan indikasi
                <strong>{{ hasil.badge || "Depresi Berat" }}</strong
                >.
              </p>

              <p>Berikut adalah ringkasan hasil skrining awal:</p>

              <table class="w-full text-[13px]">
                <tbody>
                  <tr>
                    <td class="py-0.5 align-top w-52">Instrumen Skrining</td>
                    <td class="py-0.5">: {{ instrumenNama }}</td>
                  </tr>
                  <tr>
                    <td class="py-0.5 align-top">Skor Skrining</td>
                    <td class="py-0.5">
                      : <strong>{{ hasil.skor_total ?? "-" }}</strong> ({{
                        hasil.risk_level || "-"
                      }})
                    </td>
                  </tr>
                  <tr v-if="formSurat.keluhan">
                    <td class="py-0.5 align-top">Keluhan/Observasi</td>
                    <td class="py-0.5">: {{ formSurat.keluhan }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Penutup -->
              <p>
                Mengingat kondisi tersebut, kami merujuk pasien ke fasilitas
                kesehatan yang Bapak/Ibu pimpin untuk mendapatkan penanganan
                serta pengobatan medis yang lebih komprehensif.
              </p>

              <p>
                Demikian surat pengantar ini kami sampaikan. Atas perhatian dan
                kerja sama sejawat, kami ucapkan terima kasih.
              </p>

              <!-- TTD -->
              <div class="mt-6 text-right">
                <p>Hormat kami,</p>
                <p class="text-xs text-slate-500">
                  Petugas / Dokter Pemeriksa Puskesmas Sekadau
                </p>
                <div class="h-16"></div>
                <p class="font-bold">
                  (
                  {{
                    formSurat.namaDokter ||
                    "........................................"
                  }}
                  )
                </p>
                <p v-if="formSurat.nipDokter" class="text-xs">
                  NIP. {{ formSurat.nipDokter }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- TOMBOL AKSI (no-print) -->
        <div class="flex flex-col sm:flex-row gap-3 no-print">
          <button
            @click="router.back()"
            class="flex-1 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]"
              >arrow_back</span
            >
            Kembali
          </button>
          <button
            @click="cetakSurat"
            class="flex-[2] py-3 rounded-xl bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] hover:from-[#0a355c] hover:to-[#1565c0] text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]">print</span>
            Cetak Surat Rujukan
          </button>
        </div>
      </div>
    </main>

    <footer
      class="relative z-10 py-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-white/50 no-print"
    >
      © 2026 Puskesmas Sekadau. Sistem Skrining Jiwa Terpadu.
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSkriningStore } from "@/stores/skriningStore";
import { INSTRUMEN_DATA } from "@/constants/instrumen";

const router = useRouter();
const store = useSkriningStore();

const formSurat = ref({
  nomorSurat: "",
  tanggalSurat: new Date().toISOString().split("T")[0],
  tujuan: "",
  kotaTujuan: "",
  keluhan: "",
  namaDokter: "",
  nipDokter: "",
});

onMounted(() => {
  if (
    !store.hasilSkrining?.skor_total &&
    store.hasilSkrining?.skor_total !== 0
  ) {
    router.replace("/");
  }
});

const pasien = computed(() => store.patientData);
const hasil = computed(() => store.hasilSkrining);
const instrumenNama = computed(() => {
  const d = INSTRUMEN_DATA[store.instrumen];
  return d ? d.nama_panjang || d.nama : store.instrumen || "-";
});

function formatTanggalSurat(str) {
  if (!str) return "...........................";
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return `${d.getUTCDate()} ${bulan[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function cetakSurat() {
  window.print();
}
</script>

<style scoped>
@media print {
  @page { margin: 1cm; size: A4 auto; }
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
  .print-full {
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
    page-break-inside: avoid;
  }
  #rujukan-print-area {
    background: white !important;
    min-height: auto !important;
    display: block !important;
  }
}
</style>
