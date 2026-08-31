<template>
  <div class="relative flex flex-col min-h-screen bg-[#F0F7FF]">
    <!-- Dekorasi BG -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]"
      ></div>
      <div
        class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px]"
      ></div>
    </div>

    <!-- HEADER -->
    <header class="sticky top-0 z-50 bg-[#0f4b80] px-4 py-4 shadow-lg">
      <div class="max-w-2xl mx-auto flex items-center gap-3">
        <button
          class="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
          @click="router.push('/')"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-white font-bold text-base leading-tight">
            Formulir Identitas Pasien
          </h1>
          <p class="text-blue-100 text-xs">Langkah 1 dari 3 — Data Diri</p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <div class="w-7 h-1.5 rounded-full bg-white"></div>
          <div class="w-7 h-1.5 rounded-full bg-white/30"></div>
          <div class="w-7 h-1.5 rounded-full bg-white/30"></div>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="flex-1 flex flex-col items-center px-4 py-8 relative z-10">
      <div class="w-full max-w-2xl flex flex-col gap-5">
        <!-- Alert 90 Hari -->
        <div class="bg-blue-50 border border-blue-200 shadow-sm rounded-2xl p-4 flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-blue-600 text-[18px]">info</span>
          </div>
          <div>
            <h3 class="text-sm font-bold text-blue-900 mb-1">Penting: Batas Waktu Skrining</h3>
            <p class="text-xs text-blue-800 leading-relaxed">
              Setiap pasien hanya diperbolehkan melakukan skrining <strong>1 kali dalam 90 hari (3 bulan)</strong>. Sistem akan otomatis menolak pengisian kuesioner jika belum melewati batas waktu tersebut.
            </p>
          </div>
        </div>

        <!-- Preview Instrumen -->
        <div
          v-if="instrumenPreview"
          :class="[
            'p-4 rounded-xl border-2 transition-all',
            instrumenPreview.bg,
            instrumenPreview.border,
          ]"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"
            >
              <span
                :class="[
                  'material-symbols-outlined text-[22px]',
                  instrumenPreview.iconColor,
                ]"
                >{{ instrumenPreview.icon }}</span
              >
            </div>
            <div>
              <p
                class="text-[11px] font-bold uppercase tracking-wide text-blue-400"
              >
                Instrumen yang akan digunakan
              </p>
              <p :class="['font-bold text-sm', instrumenPreview.text]">
                {{ instrumenPreview.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- FORM CARD -->
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
        >
          <!-- ── SEKSI 1: DATA DIRI ── -->
          <div
            class="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100"
          >
            <h2
              class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-blue-400 text-[16px]"
                >person</span
              >Data Diri
            </h2>
          </div>

          <div class="p-6 space-y-5">
            <!-- Nama Lengkap -->
            <div>
              <label for="f-nama" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Nama Lengkap <span class="text-red-400">*</span></label
              >
              <input
                  id="f-nama"
                v-model="form.nama"
                type="text"
                placeholder="Masukkan nama lengkap sesuai KTP"
                class="warm-input w-full px-4 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <!-- NIK -->
            <div>
              <label for="f-nik" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >NIK <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <span
                    class="material-symbols-outlined text-slate-400 text-[18px]"
                    >badge</span
                  >
                </span>
                <input
                  id="f-nik"
                  v-model="form.nik"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="16"
                  placeholder="16 digit Nomor Induk Kependudukan"
                  class="warm-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none font-mono"
                  @input="onNikInput"
                />
              </div>
              <p
                :class="[
                  'text-xs mt-1 ml-1',
                  form.nik.length === 16
                    ? 'text-emerald-500 font-semibold'
                    : 'text-slate-400',
                ]"
              >
                {{ form.nik.length }} / 16 digit
              </p>
              <!-- Banner riwayat NIK.
                   Dirender dengan markup biasa + state reaktif, bukan
                   v-html, sehingga tidak ada jalur injeksi HTML pada
                   form publik ini. -->
              <div
                v-if="nikStatus.memeriksa"
                class="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500"
                role="status"
                aria-live="polite"
              >
                <span
                  aria-hidden="true"
                  class="material-symbols-outlined text-[15px] animate-spin"
                  >progress_activity</span
                >
                Memeriksa riwayat...
              </div>

              <div
                v-else-if="nikStatus.status === 'diblokir'"
                class="mt-2 p-3 rounded-xl bg-rose-50 border-2 border-rose-200"
                role="status"
                aria-live="polite"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span
                    aria-hidden="true"
                    class="material-symbols-outlined text-rose-500 text-[18px]"
                    >block</span
                  >
                  <p class="text-xs font-bold text-rose-700">
                    Skrining Belum Dapat Dilakukan
                  </p>
                </div>
                <p class="text-[11px] text-rose-700 mb-2.5 leading-relaxed">
                  NIK ini belum dapat digunakan untuk skrining ulang karena
                  masih dalam masa jeda 90 hari.<br />
                  Dapat skrining kembali mulai:
                  <span class="font-bold text-rose-900 text-[13px]">{{
                    nikStatus.tanggalBoleh
                  }}</span>
                  <span
                    v-if="nikStatus.sisaHari !== null"
                    class="ml-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]"
                    >sisa {{ nikStatus.sisaHari }} hari</span
                  >
                </p>
                <p class="text-[10px] text-rose-500 italic">
                  Skrining hanya dapat dilakukan 1x dalam 90 hari.
                </p>
              </div>

              <div
                v-else-if="nikStatus.status === 'boleh_ulang'"
                class="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200"
                role="status"
                aria-live="polite"
              >
                <div class="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    class="material-symbols-outlined text-emerald-500 text-[16px]"
                    >check_circle</span
                  >
                  <p class="text-xs font-bold text-emerald-700">
                    NIK dapat digunakan untuk skrining ulang.
                  </p>
                </div>
                <p
                  v-if="nikStatus.terisiOtomatis"
                  class="text-[10px] text-emerald-600 mt-1.5 italic"
                >
                  Data identitas terakhir sudah diisi otomatis. Silakan periksa
                  kembali sebelum lanjut ke kuesioner.
                </p>
                <p v-else class="text-[10px] text-emerald-600 mt-1.5 italic">
                  Detail riwayat hanya dapat dilihat oleh admin melalui
                  dashboard.
                </p>
              </div>

              <div
                v-else-if="nikStatus.status === 'baru'"
                class="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700"
                role="status"
                aria-live="polite"
              >
                <span
                  aria-hidden="true"
                  class="material-symbols-outlined text-[15px]"
                  >check_circle</span
                >
                NIK dapat digunakan untuk skrining.
              </div>

              <div
                v-else-if="nikStatus.status === 'gagal'"
                class="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500"
                role="status"
                aria-live="polite"
              >
                <span
                  aria-hidden="true"
                  class="material-symbols-outlined text-[15px]"
                  >wifi_off</span
                >
                Tidak dapat memeriksa riwayat.
              </div>
            </div>

            <!-- Tanggal Lahir + Usia -->
            <div class="grid grid-cols-5 gap-3">
              <div class="col-span-3">
                <label for="f-tgl-lahir" class="block text-sm font-semibold text-slate-700 mb-1.5"
                  >Tanggal Lahir <span class="text-red-400">*</span></label
                >
                <input
                  id="f-tgl-lahir"
                  v-model="form.tglLahir"
                  type="date"
                  :max="hariIni()"
                  class="warm-input w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                  >Usia</label
                >
                <div
                  class="warm-input w-full px-3 py-2.5 rounded-lg text-sm bg-slate-50 flex items-center gap-2 min-h-[42px]"
                >
                  <span
                    class="material-symbols-outlined text-slate-400 text-[16px] shrink-0"
                    >cake</span
                  >
                  <span
                    v-if="usia >= 7"
                    class="text-slate-800 text-sm font-bold"
                    >{{ usia }} Tahun</span
                  >
                  <span
                    v-else-if="usia > 0"
                    class="text-red-500 text-sm font-bold"
                    >{{ usia }} Tahun</span
                  >
                  <span v-else class="text-slate-400 text-xs">Otomatis</span>
                </div>
              </div>
            </div>

            <!-- Jenis Kelamin -->
            <div>
              <!-- Kelompok pilihan tunggal berbasis tombol. Ditandai
                   role="radiogroup" + role="radio" + aria-checked agar
                   pembaca layar mengumumkannya sebagai satu pilihan,
                   bukan dua tombol lepas. -->
              <span
                id="lbl-gender"
                class="block text-sm font-semibold text-slate-700 mb-2"
                >Jenis Kelamin <span class="text-red-400">*</span></span
              >
              <div
                class="grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-labelledby="lbl-gender"
              >
                <button
                  type="button"
                  role="radio"
                  :aria-checked="form.gender === 'L'"
                  aria-label="Laki-laki"
                  @click="form.gender = 'L'"
                  :class="[
                    'gender-btn flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all',
                    form.gender === 'L'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300',
                  ]"
                >
                  <div
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                      form.gender === 'L'
                        ? 'border-blue-500'
                        : 'border-slate-300',
                    ]"
                  >
                    <div
                      :class="[
                        'w-2.5 h-2.5 rounded-full bg-blue-500 transition-all',
                        form.gender === 'L'
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      ]"
                    ></div>
                  </div>
                  <span
                    :class="[
                      'material-symbols-outlined text-[20px]',
                      form.gender === 'L' ? 'text-blue-500' : 'text-slate-400',
                    ]"
                    >male</span
                  >
                  <span class="text-sm font-medium text-slate-700"
                    >Laki-laki</span
                  >
                </button>
                <button
                  type="button"
                  role="radio"
                  :aria-checked="form.gender === 'P'"
                  aria-label="Perempuan"
                  @click="form.gender = 'P'"
                  :class="[
                    'gender-btn flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all',
                    form.gender === 'P'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-slate-200 hover:border-pink-300',
                  ]"
                >
                  <div
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                      form.gender === 'P'
                        ? 'border-pink-500'
                        : 'border-slate-300',
                    ]"
                  >
                    <div
                      :class="[
                        'w-2.5 h-2.5 rounded-full bg-pink-500 transition-all',
                        form.gender === 'P'
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      ]"
                    ></div>
                  </div>
                  <span
                    :class="[
                      'material-symbols-outlined text-[20px]',
                      form.gender === 'P' ? 'text-pink-500' : 'text-slate-400',
                    ]"
                    >female</span
                  >
                  <span class="text-sm font-medium text-slate-700"
                    >Perempuan</span
                  >
                </button>
              </div>
            </div>

            <!-- Nomor HP -->
            <div>
              <label for="f-hp" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Nomor HP <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <span
                    class="material-symbols-outlined text-slate-400 text-[18px]"
                    >phone</span
                  >
                </span>
                <input
                  id="f-hp"
                  v-model="form.hp"
                  type="tel"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  placeholder="Contoh: 08123456789"
                  class="warm-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none"
                  @input="form.hp = form.hp.replace(/\D/g, '')"
                />
              </div>
            </div>
          </div>

          <!-- ── SEKSI 2: ALAMAT ── -->
          <div
            class="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-b border-slate-100"
          >
            <h2
              class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-blue-400 text-[16px]"
                >location_on</span
              >Alamat &amp; Wilayah
            </h2>
          </div>

          <div class="p-6 space-y-5">
            <!-- Kecamatan -->
            <div>
              <label for="f-kecamatan" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Kecamatan <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <select
                  id="f-kecamatan"
                  v-model="form.kecamatan"
                  class="warm-input w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none appearance-none pr-10"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  <option v-for="kec in kecamatanList" :key="kec" :value="kec">
                    {{ kec }}
                  </option>
                </select>
                <span
                  class="absolute inset-y-0 right-3 flex items-center pointer-events-none"
                >
                  <span
                    class="material-symbols-outlined text-slate-400 text-[18px]"
                    >expand_more</span
                  >
                </span>
              </div>
            </div>

            <!-- Desa -->
            <div>
              <label for="f-desa" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Desa / Kelurahan <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <select
                  id="f-desa"
                  v-model="form.desa"
                  class="warm-input w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none appearance-none pr-10"
                >
                  <option value="">
                    {{
                      form.kecamatan
                        ? "-- Pilih Desa/Kelurahan --"
                        : "-- Pilih Kecamatan terlebih dahulu --"
                    }}
                  </option>
                  <option v-for="d in desaList" :key="d" :value="d">
                    {{ d }}
                  </option>
                </select>
                <span
                  class="absolute inset-y-0 right-3 flex items-center pointer-events-none"
                >
                  <span
                    class="material-symbols-outlined text-slate-400 text-[18px]"
                    >expand_more</span
                  >
                </span>
              </div>
            </div>

            <!-- Alamat -->
            <div>
              <label for="f-alamat" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Alamat Lengkap <span class="text-red-400">*</span></label
              >
              <textarea
                  id="f-alamat"
                v-model="form.alamat"
                rows="2"
                placeholder="Jl. Nama Jalan, No. Rumah, RT/RW"
                class="warm-input w-full px-4 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <!-- ── SEKSI 3: PENDIDIKAN & PEKERJAAN ── -->
          <div
            class="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-b border-slate-100"
          >
            <h2
              class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-blue-400 text-[16px]"
                >school</span
              >Pendidikan &amp; Pekerjaan
            </h2>
          </div>

          <div class="p-6 space-y-5">
            <!-- Pendidikan -->
            <div>
              <label for="f-pendidikan" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Pendidikan Terakhir <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]"
                  >school</span
                >
                <select
                  id="f-pendidikan"
                  v-model="form.pendidikan"
                  class="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none bg-white text-slate-700 text-sm font-medium appearance-none transition-all"
                >
                  <option value="">-- Pilih Pendidikan --</option>
                  <option v-for="p in pendidikanOptions" :key="p" :value="p">
                    {{ p }}
                  </option>
                </select>
                <span
                  class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px] pointer-events-none"
                  >expand_more</span
                >
              </div>
            </div>

            <!-- Pekerjaan -->
            <div>
              <label for="f-pekerjaan" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Pekerjaan <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]"
                  >work</span
                >
                <select
                  id="f-pekerjaan"
                  v-model="form.pekerjaan"
                  class="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none bg-white text-slate-700 text-sm font-medium appearance-none transition-all"
                >
                  <option value="">-- Pilih Pekerjaan --</option>
                  <option v-for="p in pekerjaanOptions" :key="p" :value="p">
                    {{ p }}
                  </option>
                </select>
                <span
                  class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px] pointer-events-none"
                  >expand_more</span
                >
              </div>
            </div>

            <!-- Nama Sekolah (Kondisional untuk Pelajar) -->
            <div v-if="form.pekerjaan === 'Pelajar'">
              <label for="f-sekolah" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Nama Sekolah <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]"
                  >account_balance</span
                >
                <select
                  id="f-sekolah"
                  v-model="form.namaSekolah"
                  class="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none bg-white text-slate-700 text-sm font-medium appearance-none transition-all"
                >
                  <option value="">-- Pilih Sekolah --</option>
                  <option v-for="s in namaSekolahOptions" :key="s" :value="s">
                    {{ s }}
                  </option>
                </select>
                <span
                  class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px] pointer-events-none"
                  >expand_more</span
                >
              </div>
            </div>

            <!-- Nama Kampus (Kondisional untuk Mahasiswa) -->
            <div v-if="form.pekerjaan === 'Mahasiswa'">
              <label for="f-kampus" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Nama Kampus <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]"
                  >account_balance</span
                >
                <select
                  id="f-kampus"
                  v-model="form.namaSekolah"
                  class="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none bg-white text-slate-700 text-sm font-medium appearance-none transition-all"
                >
                  <option value="">-- Pilih Kampus --</option>
                  <option v-for="k in namaKampusOptions" :key="k" :value="k">
                    {{ k }}
                  </option>
                </select>
                <span
                  class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px] pointer-events-none"
                  >expand_more</span
                >
              </div>
            </div>

            <!-- Tempat Skrining -->
            <div>
              <label for="f-tempat" class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Tempat Skrining <span class="text-red-400">*</span></label
              >
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]"
                  >location_on</span
                >
                <input
                  id="f-tempat"
                  v-model="form.tempatSkrining"
                  type="text"
                  placeholder="Contoh: Puskesmas Sekadau, SDN 01 Sekadau, Posyandu..."
                  class="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none bg-white text-slate-700 text-sm font-medium transition-all placeholder:text-slate-300"
                />
              </div>
              <p class="text-[11px] text-slate-400 mt-1 ml-1">
                Isi sesuai lokasi skrining dilakukan (Puskesmas, Sekolah,
                Posyandu, Rumah, dll.)
              </p>
            </div>
          </div>

          <!-- ── SEKSI 4: HAMIL/NIFAS (KONDISIONAL) ── -->
          <template v-if="showHamilSection">
            <div class="px-6 py-4 bg-rose-50 border-t border-b border-rose-100">
              <h2
                class="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2"
              >
                <span
                  class="material-symbols-outlined text-rose-400 text-[16px]"
                  >pregnant_woman</span
                >
                Kondisi Kehamilan
              </h2>
            </div>
            <div class="p-6">
              <p
                id="lbl-hamil"
                class="text-sm font-semibold text-slate-700 mb-3"
              >
                Apakah saat ini sedang hamil atau dalam masa nifas?
                <span class="text-red-400">*</span>
              </p>
              <div
                class="grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-labelledby="lbl-hamil"
              >
                <button
                  type="button"
                  role="radio"
                  :aria-checked="form.hamil === 'ya'"
                  aria-label="Ya, sedang hamil atau nifas"
                  @click="form.hamil = 'ya'"
                  :class="[
                    'hamil-btn flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    form.hamil === 'ya'
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-slate-200 hover:border-rose-300',
                  ]"
                >
                  <div
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                      form.hamil === 'ya'
                        ? 'border-rose-500'
                        : 'border-slate-300',
                    ]"
                  >
                    <div
                      :class="[
                        'w-2.5 h-2.5 rounded-full bg-rose-500 transition-all',
                        form.hamil === 'ya'
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      ]"
                    ></div>
                  </div>
                  <span class="text-sm font-semibold text-slate-700">Ya</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  :aria-checked="form.hamil === 'tidak'"
                  aria-label="Tidak sedang hamil atau nifas"
                  @click="form.hamil = 'tidak'"
                  :class="[
                    'hamil-btn flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    form.hamil === 'tidak'
                      ? 'border-slate-500 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-400',
                  ]"
                >
                  <div
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                      form.hamil === 'tidak'
                        ? 'border-slate-500'
                        : 'border-slate-300',
                    ]"
                  >
                    <div
                      :class="[
                        'w-2.5 h-2.5 rounded-full bg-slate-500 transition-all',
                        form.hamil === 'tidak'
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50',
                      ]"
                    ></div>
                  </div>
                  <span class="text-sm font-semibold text-slate-700"
                    >Tidak</span
                  >
                </button>
              </div>
            </div>
          </template>

          <!-- ── PERSETUJUAN ORANG TUA / WALI (usia < 18) ──
               UU 27/2022: persetujuan bagi anak diberikan oleh orang tua
               atau wali. Ditempatkan di sini, bukan di gerbang consent,
               karena usia baru diketahui setelah tanggal lahir diisi.
               Kuesioner MMYS usia 7-9 tahun bahkan diisi orang tua atau
               pengasuh (juknis KJ.02.02/B.III/1107/2025 hal. 4). -->
          <template v-if="perluPersetujuanWali">
            <div class="px-6 py-4 bg-amber-50 border-t border-b border-amber-200">
              <h2
                class="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2"
              >
                <span
                  aria-hidden="true"
                  class="material-symbols-outlined text-amber-500 text-[16px]"
                  >family_restroom</span
                >
                Persetujuan Orang Tua / Wali
              </h2>
            </div>
            <div class="p-6">
              <p class="text-sm text-slate-700 leading-relaxed mb-3">
                Usia pasien <strong>{{ usia }} tahun</strong>, di bawah 18 tahun.
                Persetujuan penggunaan data harus diberikan oleh orang tua atau
                wali, bukan oleh anak.
              </p>
              <div
                class="flex items-start gap-3 p-3.5 rounded-xl bg-white border-2 border-amber-200"
              >
                <input
                  id="setuju-wali"
                  :checked="store.consentWali"
                  type="checkbox"
                  class="mt-0.5 w-5 h-5 shrink-0 rounded border-2 border-slate-300 text-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                  @change="store.setConsentWali($event.target.checked)"
                />
                <label
                  for="setuju-wali"
                  class="text-sm text-slate-700 leading-relaxed cursor-pointer"
                >
                  Saya adalah <strong>orang tua atau wali</strong> dari pasien,
                  dan menyetujui pengumpulan serta penggunaan data anak untuk
                  keperluan skrining kesehatan jiwa dan tindak lanjutnya.
                </label>
              </div>
              <p class="text-[11px] text-amber-700 mt-2 ml-1 leading-relaxed">
                Skrining tidak dapat dilanjutkan tanpa persetujuan ini.
              </p>
            </div>
          </template>

          <!-- ── FOOTER FORM ── -->
          <div class="p-6 bg-slate-50 border-t border-slate-100">
            <button
              @click="submitIdentitas"
              :disabled="store.nikDiblokir"
              :class="[
                'w-full py-3.5 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 group',
                store.nikDiblokir
                  ? 'bg-slate-300 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-[#0f4b80] to-[#1e88e5] hover:from-[#0a355c] hover:to-[#1565c0]',
              ]"
            >
              <span>Lanjutkan ke Skrining</span>
              <span
                class="material-symbols-outlined group-hover:translate-x-1 transition-transform"
                >arrow_forward</span
              >
            </button>
            <p class="text-center text-xs text-slate-400 mt-3">
              <span class="material-symbols-outlined text-[14px] align-middle"
                >lock</span
              >
              Data Anda dijaga kerahasiaannya sesuai regulasi kesehatan.
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- FOOTER -->
    <footer
      class="relative z-10 py-6 text-center text-xs text-slate-400 no-print border-t border-slate-100 bg-white/50"
    >
      © 2026 Puskesmas Sekadau. Sistem Skrining Jiwa Terpadu.
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useSkriningStore } from "@/stores/skriningStore";
import { useToast } from "@/composables/useToast";
import { DATA_WILAYAH } from "@/constants/wilayah";
import { INSTRUMEN_INFO } from "@/constants/instrumen";
import { USIA_PERLU_WALI } from "@/constants/kebijakanPrivasi";
import {
  hitungUsia,
  nentukanInstrumen,
  hariIni,
  formatTanggalID,
} from "@/utils/helpers";
import { db } from "@/services/supabase";

const router = useRouter();
const store = useSkriningStore();
const { showToast } = useToast();

// ── Form Data (reactive, menggantikan getElementById) ──
const form = ref({
  nama: "",
  nik: "",
  tglLahir: "",
  gender: "",
  hp: "",
  kecamatan: "",
  desa: "",
  alamat: "",
  pendidikan: "",
  pekerjaan: "",
  namaSekolah: "",
  tempatSkrining: "",
  hamil: "",
});

const pendidikanOptions = [
  "Tidak Sekolah",
  "SD/Sederajat",
  "SMP/Sederajat",
  "SMA/Sederajat",
  "D3/D4",
  "S1",
  "S2/S3",
];

const pekerjaanOptions = [
  "ASN",
  "Pegawai Honorer",
  "BUMN",
  "TNI",
  "Polri",
  "Karyawan Swasta",
  "Wiraswasta /Pengusaha/ Pedagang",
  "Petani / Nelayan / Peternak",
  "Pekerja Lepas",
  "Pensiunan",
  "Pelajar",
  "Mahasiswa",
  "Ibu Rumah Tangga",
  "Tidak Bekerja",
  "Lainnya",
];


function normalisasiPilihan(value, options, alias = {}) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (options.includes(raw)) return raw;
  const normalized = raw.toLowerCase();
  const aliasValue = alias[normalized];
  if (aliasValue && options.includes(aliasValue)) return aliasValue;
  return options.find((option) => option.toLowerCase() === normalized) || "";
}
const namaSekolahOptions = [
  "SMA NEGERI 01",
  "SMA KARYA",
  "SMK KELING KUMANG",
  "SMK AMALIYAH",
  "SMK NEGERI 01",
  "SMA AL RAHMAH",
  "SMA NEGERI 02",
  "SMA NEGERI 05",
  "MTS AL RAHMAH",
  "SMP IT AR RAYYAN",
  "SMP NEGERI 10",
  "SMPK SANTO GABRIEL",
  "SMP NEGERI 01",
  "MTS NEGERI",
  "SMP NEGERI 05",
  "SMP NEGERI 03",
  "SDB SLAMET RIYADI",
  "SD SWASTA FILIPI",
  "SD NEGERI 01 SEKADAU",
  "SD NEGERI 04",
  "SD NEGERI 21",
  "SD /MIN SEKADAU",
  "SD NEGERI 14 SUNGAI PUTAT",
  "SD NEGERI 03",
  "SD NEGERI 47",
  "SD IT AR RAYYAN",
  "SD AL RAHMAH",
  "SD NEGERI 17",
  "SD NEGERI 18 PANGKIN",
  "SD NEGERI 06",
  "SD NEGERI 26 TERIBANG",
  "SD NEGERI 27",
  "SD NEGERI 44 SUNGAI AKAR",
  "SD NEGERI SEJIRAK EMPERANANG",
  "SD NEGERI 06 PENITI",
  "SD NEGERI 38 MERAH AIR",
  "SD NEGERI 19 SERIRANG",
  "SD NEGERI 20 SERAMPUK",
  "SD NEGERI 30 AMAK",
  "SD NEGERI 51",
  "SD NEGERI 46 ENSALANG",
  "SD NEGERI 41 ENSALI",
  "SD NEGERI 16 TELUK PASIR",
  "SD NEGERI 03 TANJUNG",
  "Lainnya",
];

const namaKampusOptions = [
  "Institute Keling Kumang",
  "Universitas Terbuka",
  "Lainnya",
];

// ── Computed ──
const usia = computed(() => hitungUsia(form.value.tglLahir));
const kecamatanList = computed(() => Object.keys(DATA_WILAYAH));
const desaList = computed(() => DATA_WILAYAH[form.value.kecamatan] || []);
const showHamilSection = computed(
  () => form.value.gender === "P" && usia.value >= 13,
);

/**
 * Pasien di bawah 18 tahun memerlukan persetujuan orang tua atau wali
 * (UU 27/2022). Usia baru dapat dihitung setelah tanggal lahir diisi,
 * karena itu konfirmasinya di sini dan bukan di gerbang consent.
 */
const perluPersetujuanWali = computed(
  () => usia.value > 0 && usia.value < USIA_PERLU_WALI,
);

const instrumenPreview = computed(() => {
  if (!form.value.tglLahir || !form.value.gender) return null;
  const hamil = form.value.hamil === "ya";
  const kode = nentukanInstrumen(usia.value, form.value.gender, hamil);
  return kode ? INSTRUMEN_INFO[kode] : null;
});

const identitasDariRiwayat = ref(false);
let sedangIsiRiwayat = false;

// Reset desa saat kecamatan berubah
watch(
  () => form.value.kecamatan,
  () => {
    if (!sedangIsiRiwayat) form.value.desa = "";
  },
);

// Reset namaSekolah saat pekerjaan bukan Pelajar/Mahasiswa
watch(
  () => form.value.pekerjaan,
  (newJob) => {
    if (!sedangIsiRiwayat && newJob !== "Pelajar" && newJob !== "Mahasiswa") {
      form.value.namaSekolah = "";
    }
  },
);

// Reset hamil saat gender/usia berubah dan section tersembunyi
watch(showHamilSection, (show) => {
  if (!sedangIsiRiwayat && !show) form.value.hamil = "";
});

function kosongkanIdentitasRiwayat() {
  if (!identitasDariRiwayat.value) return;
  sedangIsiRiwayat = true;
  form.value.nama = "";
  form.value.tglLahir = "";
  form.value.gender = "";
  form.value.hp = "";
  form.value.kecamatan = "";
  form.value.desa = "";
  form.value.alamat = "";
  form.value.pendidikan = "";
  form.value.pekerjaan = "";
  form.value.namaSekolah = "";
  form.value.tempatSkrining = "";
  form.value.hamil = "";
  sedangIsiRiwayat = false;
  identitasDariRiwayat.value = false;
}

async function isiIdentitasDariRiwayat(riwayat) {
  const tanggalLahir = riwayat.tanggal_lahir || "";
  const gender = riwayat.jenis_kelamin || "";
  const usiaRiwayat = hitungUsia(tanggalLahir);
  const pekerjaan = normalisasiPilihan(riwayat.pekerjaan, pekerjaanOptions, {
    pns: "ASN",
    asn: "ASN",
    siswa: "Pelajar",
    pelajar: "Pelajar",
    mahasiswa: "Mahasiswa",
    irt: "Ibu Rumah Tangga",
    ibu_rumah_tangga: "Ibu Rumah Tangga",
  });

  sedangIsiRiwayat = true;
  form.value.nama = riwayat.nama_lengkap || "";
  form.value.tglLahir = tanggalLahir;
  form.value.gender = gender;
  form.value.hp = riwayat.nomor_hp || "";
  form.value.kecamatan = normalisasiPilihan(riwayat.kecamatan, kecamatanList.value);
  form.value.alamat = riwayat.alamat || "";
  form.value.pendidikan = normalisasiPilihan(riwayat.pendidikan, pendidikanOptions);
  form.value.pekerjaan = pekerjaan;
  form.value.tempatSkrining = riwayat.tempat_skrining || "";
  form.value.hamil = gender === "P" && usiaRiwayat >= 13
    ? riwayat.is_hamil_nifas
      ? "ya"
      : "tidak"
    : "";

  await nextTick();
  form.value.desa = normalisasiPilihan(riwayat.desa, desaList.value);
  form.value.namaSekolah = pekerjaan === "Pelajar"
    ? normalisasiPilihan(riwayat.nama_sekolah, namaSekolahOptions)
    : pekerjaan === "Mahasiswa"
      ? normalisasiPilihan(riwayat.nama_sekolah, namaKampusOptions)
      : "";
  sedangIsiRiwayat = false;
  identitasDariRiwayat.value = true;
}
// ── Pemeriksaan riwayat NIK ──
//
// Dua RPC dengan tingkat akses berbeda (lihat db/02_pisah_identitas.sql):
//
//   cek_riwayat_nik(p_nik)      → anon boleh. HANYA data tanggal:
//       { tanggal_skrining, tanggal_boleh_skrining_ulang,
//         boleh_skrining_ulang }
//       Dipakai untuk gate jeda 90 hari di form publik.
//
//   ambil_identitas_nik(p_nik)  → HANYA admin yang login. Identitas
//       lengkap untuk mengisi form otomatis.
//
// Pemisahan ini wajib: fungsi lama mengembalikan 19 kolom termasuk nama,
// alamat, dan nomor HP kepada pemanggil anonim, sehingga siapa pun yang
// memegang anon key dapat memanen identitas pasien dari NIK saja.
//
// Konsekuensi yang disengaja: autofill hanya bekerja bila petugas login
// sebagai admin. Pasien yang mengisi sendiri tidak mendapat autofill.
const nikStatus = ref({
  // 'kosong' | 'baru' | 'diblokir' | 'boleh_ulang' | 'gagal'
  status: "kosong",
  memeriksa: false,
  tanggalBoleh: "",
  sisaHari: null,
  terisiOtomatis: false,
});
let nikDebounce = null;

function resetStatusNik() {
  nikStatus.value = {
    status: "kosong",
    memeriksa: false,
    tanggalBoleh: "",
    sisaHari: null,
    terisiOtomatis: false,
  };
  store.nikDiblokir = false;
  store.tanggalBolehSkrining = null;
}

function onNikInput() {
  form.value.nik = form.value.nik.replace(/\D/g, "");
  clearTimeout(nikDebounce);
  if (form.value.nik.length < 16) {
    resetStatusNik();
    kosongkanIdentitasRiwayat();
    return;
  }
  nikStatus.value.memeriksa = true;
  nikDebounce = setTimeout(() => cekRiwayatNIK(form.value.nik), 600);
}

/** Selisih hari kalender antara dua tanggal 'YYYY-MM-DD', bebas zona waktu. */
function selisihHariKalender(dariISO, sampaiISO) {
  const [y1, m1, d1] = dariISO.split("-").map(Number);
  const [y2, m2, d2] = sampaiISO.split("-").map(Number);
  return Math.round(
    (Date.UTC(y1, m1 - 1, d1) - Date.UTC(y2, m2 - 1, d2)) / 86400000,
  );
}

/**
 * Coba isi form dari riwayat. Hanya berhasil bila sesi aktif milik admin;
 * bila tidak, RPC menolak dan form dibiarkan kosong tanpa pesan error
 * — bagi pasien anonim ini perilaku normal, bukan kegagalan.
 *
 * @returns {Promise<boolean>} true bila form benar-benar terisi
 */
async function cobaIsiOtomatis(nik) {
  try {
    const { data, error } = await db.rpc("ambil_identitas_nik", { p_nik: nik });
    if (error || !data || data.length === 0) return false;
    await isiIdentitasDariRiwayat(data[0]);
    return true;
  } catch {
    return false;
  }
}

async function cekRiwayatNIK(nik) {
  store.nikDiblokir = false;
  store.tanggalBolehSkrining = null;
  try {
    const { data, error } = await db.rpc("cek_riwayat_nik", { p_nik: nik });
    if (error) throw error;

    // Belum pernah diskrining.
    if (!data || data.length === 0) {
      kosongkanIdentitasRiwayat();
      nikStatus.value = {
        status: "baru",
        memeriksa: false,
        tanggalBoleh: "",
        sisaHari: null,
        terisiOtomatis: false,
      };
      return;
    }

    const riwayat = data[0];
    const tglBolehISO = riwayat.tanggal_boleh_skrining_ulang;

    // Keputusan jeda 90 hari berasal dari SERVER, bukan hitungan tanggal
    // di browser. Jam perangkat pasien tidak lagi menentukan siapa yang
    // boleh diskrining.
    if (riwayat.boleh_skrining_ulang === false) {
      kosongkanIdentitasRiwayat();
      nikStatus.value = {
        status: "diblokir",
        memeriksa: false,
        tanggalBoleh: formatTanggalID(tglBolehISO),
        sisaHari: tglBolehISO
          ? selisihHariKalender(tglBolehISO, hariIni())
          : null,
        terisiOtomatis: false,
      };
      store.nikDiblokir = true;
      store.tanggalBolehSkrining = tglBolehISO;
      return;
    }

    const terisi = await cobaIsiOtomatis(nik);
    nikStatus.value = {
      status: "boleh_ulang",
      memeriksa: false,
      tanggalBoleh: "",
      sisaHari: null,
      terisiOtomatis: terisi,
    };
  } catch {
    // Gagal memeriksa: jangan blokir pasien karena gangguan jaringan.
    // Gate 90 hari tetap ditegakkan di server saat penyimpanan.
    nikStatus.value = {
      status: "gagal",
      memeriksa: false,
      tanggalBoleh: "",
      sisaHari: null,
      terisiOtomatis: false,
    };
  }
}

// ── Submit ──
function submitIdentitas() {
  if (nikStatus.value.memeriksa)
    return showToast(
      "Sedang memeriksa riwayat NIK, mohon tunggu...",
      "warning",
    );
  const f = form.value;
  if (!f.nama.trim()) return showToast("Nama lengkap harus diisi.", "error");
  if (!f.nik || f.nik.length !== 16)
    return showToast("NIK harus tepat 16 digit.", "error");
  if (!f.tglLahir) return showToast("Tanggal lahir harus diisi.", "error");
  if (usia.value < 7)
    return showToast("Usia minimal untuk skrining adalah 7 tahun.", "warning");
  if (!f.gender)
    return showToast("Pilih jenis kelamin terlebih dahulu.", "error");
  if (!f.hp.trim()) return showToast("Nomor HP harus diisi.", "error");
  if (!f.kecamatan)
    return showToast("Pilih kecamatan terlebih dahulu.", "error");
  if (!f.desa)
    return showToast("Pilih desa/kelurahan terlebih dahulu.", "error");
  if (!f.alamat.trim())
    return showToast("Alamat lengkap harus diisi.", "error");
  if (!f.pendidikan) return showToast("Pilih pendidikan terakhir.", "error");
  if (!f.pekerjaan.trim()) return showToast("Pekerjaan harus diisi.", "error");

  if (f.pekerjaan === "Pelajar" && !f.namaSekolah.trim())
    return showToast("Nama sekolah harus dipilih.", "error");
  if (f.pekerjaan === "Mahasiswa" && !f.namaSekolah.trim())
    return showToast("Nama kampus harus dipilih.", "error");

  if (!f.tempatSkrining.trim())
    return showToast("Tempat skrining harus diisi.", "error");

  let hamilNifas = false;
  if (showHamilSection.value) {
    if (!f.hamil) return showToast("Pilih status kehamilan / nifas.", "error");
    hamilNifas = f.hamil === "ya";
  }

  // Persetujuan orang tua/wali wajib untuk pasien di bawah 18 tahun.
  // Diperiksa di sini, bukan hanya dengan menonaktifkan tombol, agar
  // tidak dapat dilewati dari devtools.
  if (perluPersetujuanWali.value && !store.consentWali) {
    return showToast(
      "Centang persetujuan orang tua / wali terlebih dahulu.",
      "warning",
    );
  }

  if (store.nikDiblokir) {
    // tanggalBolehSkrining kini string 'YYYY-MM-DD' dari server,
    // bukan objek Date. formatTanggalID menerima string ISO.
    const tglBoleh = store.tanggalBolehSkrining
      ? formatTanggalID(store.tanggalBolehSkrining)
      : "-";
    showToast(
      `Skrining belum dapat dilakukan. Jadwal berikutnya: ${tglBoleh}`,
      "error",
    );
    return;
  }

  const instr = nentukanInstrumen(usia.value, f.gender, hamilNifas);
  if (!instr)
    return showToast(
      "Usia tidak memenuhi syarat skrining (min. 7 tahun).",
      "error",
    );

  store.setPatientData({
    nama_lengkap: f.nama.trim(),
    nik: f.nik,
    tanggal_lahir: f.tglLahir,
    usia: usia.value,
    jenis_kelamin: f.gender,
    nomor_hp: f.hp.trim(),
    is_hamil_nifas: hamilNifas,
    kecamatan: f.kecamatan,
    desa: f.desa,
    alamat: f.alamat.trim(),
    pendidikan: f.pendidikan,
    pekerjaan: f.pekerjaan.trim(),
    nama_sekolah: f.namaSekolah.trim() || null,
    tanggal_skrining: hariIni(),
    tempat_skrining: f.tempatSkrining.trim(),
  });
  store.setInstrumen(instr);
  store.currentQuestion = 0;
  store.answers = [];
  store.sudahSetujuJujur = false;

  router.push("/kuesioner");
}
</script>
