/**
 * kebijakanPrivasi.js — Sumber tunggal isi pemberitahuan privasi.
 *
 * Dasar hukum: UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
 * Pasal 4 menempatkan "data dan informasi kesehatan" sebagai DATA
 * PRIBADI SPESIFIK, yang pemrosesannya memerlukan persetujuan eksplisit
 * dari subjek data.
 *
 * ────────────────────────────────────────────────────────────────
 * MENGUBAH ISI KEBIJAKAN
 *
 * Bila ada perubahan yang MATERIAL — misalnya tujuan pemrosesan,
 * penerima data, atau masa penyimpanan — WAJIB menaikkan VERSI_KEBIJAKAN.
 *
 * Alasannya: setiap baris skrining menyimpan `consent_version`. Tanpa
 * kenaikan versi, tidak ada cara membuktikan pasien menyetujui isi yang
 * mana. Perbaikan salah tulis atau susunan kalimat tidak perlu menaikkan
 * versi.
 * ────────────────────────────────────────────────────────────────
 */

/**
 * Versi kebijakan yang berlaku. Disimpan bersama setiap baris skrining
 * sebagai bukti isi mana yang disetujui pasien.
 */
export const VERSI_KEBIJAKAN = '1.0'

/** Tanggal berlaku versi di atas, untuk ditampilkan ke pasien. */
export const TANGGAL_BERLAKU = '2026-08-28'

/**
 * Pengendali data: pihak yang menentukan tujuan dan mengendalikan
 * pemrosesan. Akun Supabase dikelola Puskesmas, sehingga Puskesmas
 * yang menjadi pengendali — bukan Dinas Kesehatan.
 */
export const PENGENDALI_DATA = {
  nama: 'UPTD Puskesmas Sekadau',
  wilayah: 'Kabupaten Sekadau, Kalimantan Barat',
}

/**
 * Kontak pengaduan privasi — jalur resmi bagi warga untuk menggunakan
 * haknya atas data pribadinya.
 *
 * Alamat ini adalah alamat instansi, bukan pribadi, sehingga tetap
 * berlaku meskipun petugasnya berganti. Pastikan kotak masuknya
 * benar-benar dibaca secara berkala — alamat pengaduan yang tidak
 * pernah dibuka sama buruknya dengan tidak menyediakan alamat.
 */
export const KONTAK_PENGADUAN = {
  keterangan:
    'Kirim surel ke alamat di bawah, atau sampaikan langsung ke petugas pendaftaran UPTD Puskesmas Sekadau',
  telepon: null,
  email: 'kejiwaan.pkmsekadau@gmail.com',
  sementara: false,
}

/**
 * Masa penyimpanan data.
 *
 * Data skrining adalah bagian dari rekam medis. Angka 25 tahun mengikuti
 * ketentuan penyimpanan rekam medis pada fasilitas pelayanan kesehatan.
 *
 * TODO: konfirmasi ke penanggung jawab rekam medis Puskesmas apakah
 * angka ini sesuai kebijakan internal yang berlaku.
 */
export const MASA_SIMPAN = '25 tahun sejak kunjungan terakhir'

/** Jenis data yang dikumpulkan, dikelompokkan agar mudah dibaca warga. */
export const DATA_DIKUMPULKAN = [
  {
    kelompok: 'Identitas',
    rincian: 'Nama lengkap, NIK, tanggal lahir, jenis kelamin, nomor HP, alamat, kecamatan, desa',
  },
  {
    kelompok: 'Latar belakang',
    rincian: 'Pendidikan terakhir, pekerjaan, nama sekolah atau kampus (bila pelajar/mahasiswa)',
  },
  {
    kelompok: 'Kesehatan',
    rincian: 'Status kehamilan atau nifas, jawaban kuesioner skrining kesehatan jiwa, skor, dan tingkat risiko',
  },
  {
    kelompok: 'Pelaksanaan',
    rincian: 'Tanggal dan tempat skrining',
  },
]

/** Tujuan pemrosesan. */
export const TUJUAN_PEMROSESAN = [
  'Deteksi dini masalah kesehatan jiwa agar dapat ditindaklanjuti tenaga kesehatan.',
  'Menentukan tindak lanjut yang sesuai, seperti konseling, pemeriksaan lanjutan, atau rujukan.',
  'Mencegah pengulangan skrining dalam masa jeda 90 hari.',
  'Pelaporan program kesehatan jiwa kepada Dinas Kesehatan.',
]

/**
 * Penerima data selain Puskesmas.
 *
 * Data diekspor secara berkala dan dikirim ke Dinas Kesehatan untuk
 * ditindaklanjuti ke ASIK / SatuSehat. Ini WAJIB disebutkan: pasien
 * berhak tahu datanya keluar dari Puskesmas.
 */
export const PENERIMA_DATA = [
  {
    pihak: 'Dinas Kesehatan Kabupaten Sekadau',
    tujuan:
      'Tindak lanjut program dan pelaporan. Data diteruskan ke aplikasi ASIK / SatuSehat milik Kementerian Kesehatan atau sistem sejenis.',
  },
  {
    pihak: 'Tenaga medis dan tenaga kesehatan UPTD Puskesmas Sekadau',
    tujuan:
      'Membaca hasil skrining untuk memberikan tindak lanjut, sesuai kewenangan masing-masing.',
  },
]

/**
 * Hak subjek data menurut UU 27/2022 Pasal 5 sampai 13, ditulis dengan
 * bahasa yang dapat dipahami warga.
 */
export const HAK_PASIEN = [
  'Mengetahui data apa saja yang disimpan tentang Anda dan untuk apa digunakan.',
  'Meminta salinan data Anda.',
  'Meminta perbaikan bila ada data yang salah.',
  'Meminta penghapusan data, sepanjang tidak bertentangan dengan ketentuan penyimpanan rekam medis.',
  'Menarik persetujuan. Penarikan tidak membatalkan pemrosesan yang sudah terjadi sebelumnya.',
  'Mengajukan keberatan atau pengaduan mengenai penggunaan data Anda.',
]

/**
 * Batas usia yang memerlukan persetujuan orang tua atau wali.
 *
 * Sesuai UU 27/2022, persetujuan bagi anak diberikan oleh orang tua atau
 * wali. Kuesioner MMYS untuk usia 7-9 tahun bahkan diisi oleh orang tua
 * atau pengasuh (juknis KJ.02.02/B.III/1107/2025 hal. 4).
 */
export const USIA_PERLU_WALI = 18

/** Ringkasan singkat untuk gerbang persetujuan, sebelum uraian penuh. */
export const RINGKASAN_CONSENT = [
  'Kami mengumpulkan identitas dan jawaban kuesioner kesehatan jiwa Anda.',
  'Data dipakai untuk menentukan tindak lanjut oleh tenaga kesehatan Puskesmas.',
  'Hasilnya dilaporkan ke Dinas Kesehatan dan diteruskan ke sistem ASIK / SatuSehat.',
  'Data hanya dapat dilihat oleh petugas Puskesmas yang berwenang.',
  'Anda dapat menarik persetujuan kapan saja dengan menghubungi Puskesmas.',
]
