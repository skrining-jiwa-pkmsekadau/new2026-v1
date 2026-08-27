/**
 * kontakKrisis.js — Nomor bantuan untuk situasi krisis kesehatan jiwa.
 *
 * Dipakai oleh PanelKrisis.vue, yang muncul saat responden mengakui
 * pikiran mencelakai diri sendiri (EPDS item 10, nilai >= NILAI_KRISIS_E10)
 * atau saat hasil skrining tergolong High Risk.
 *
 * ────────────────────────────────────────────────────────────────
 * KEPUTUSAN: HANYA JALUR RESMI
 *
 * Nomor seluler sementara (nomor pribadi petugas) sudah DIHAPUS dari
 * berkas ini. Alasannya: nomor pada jalur krisis yang tidak dijawab
 * berarti seseorang dengan pikiran bunuh diri menelepon ke kehampaan,
 * dan nomor pribadi tidak dapat menjamin ketersediaan 24 jam.
 *
 * Yang tersisa adalah layanan resmi Kementerian Kesehatan:
 *   - SEJIWA (119 ekstensi 8) — konseling kesehatan jiwa, 24 jam
 *   - 119                     — gawat darurat medis
 *
 * MENAMBAH NOMOR PUSKESMAS DI KEMUDIAN HARI
 * Boleh, dan sebaiknya ditaruh PALING ATAS agar pasien lebih dahulu
 * terhubung ke layanan setempat. Syarat yang harus dipenuhi:
 *   1. Dijawab manusia, bukan mesin penjawab.
 *   2. Tersedia 24 jam. Bila hanya jam kerja, tulis jam layanannya
 *      secara jujur di kolom `keterangan` — jangan biarkan pasien
 *      menduga nomor itu selalu aktif.
 *   3. Petugas yang menjawab tahu ini jalur krisis kesehatan jiwa.
 *   4. Pemilik nomor mengetahui nomornya tampil publik.
 *
 * Contoh bentuk entri Puskesmas:
 *
 *   export const KONTAK_LOKAL = {
 *     nama: 'UPTD Puskesmas Sekadau',
 *     keterangan: 'Poli jiwa / IGD — Senin s.d. Jumat, 07.00-14.00 WIB',
 *     nomor: '62XXXXXXXXXXX',
 *     tampilan: '+62 XXX-XXXX-XXXX',
 *     internasional: true,
 *     whatsapp: true,
 *   }
 *
 * lalu masukkan ke KONTAK_KRISIS sebagai elemen pertama.
 * Jangan pernah menyisakan hanya satu jalur: bila nomor setempat tidak
 * terjawab, jalur nasional harus tetap ada sebagai cadangan.
 * ────────────────────────────────────────────────────────────────
 */

/**
 * SEJIWA — layanan konseling kesehatan jiwa Kementerian Kesehatan,
 * diakses melalui nomor darurat 119 lalu memilih ekstensi 8.
 */
export const KONTAK_SEJIWA = {
  nama: 'SEJIWA — Kemenkes',
  keterangan: 'Konseling kesehatan jiwa, 24 jam. Tekan 119 lalu pilih ekstensi 8.',
  nomor: '119',
  tampilan: '119 ext. 8',
  // Nomor layanan pendek: JANGAN diberi awalan '+', karena 'tel:+119'
  // tidak dapat didial oleh ponsel.
  internasional: false,
  whatsapp: false,
}

/**
 * Layanan gawat darurat medis nasional. Ditampilkan terpisah dari SEJIWA
 * karena pasien dalam bahaya langsung perlu ambulans, bukan konseling.
 */
export const KONTAK_DARURAT = {
  nama: 'Gawat Darurat Nasional',
  keterangan: 'Ambulans dan kegawatdaruratan medis, 24 jam.',
  nomor: '119',
  tampilan: '119',
  internasional: false,
  whatsapp: false,
}

/** Urutan tampil di panel krisis. */
export const KONTAK_KRISIS = [KONTAK_SEJIWA, KONTAK_DARURAT]

/**
 * Tautan panggilan telepon untuk sebuah kontak.
 *
 * Awalan '+' hanya untuk nomor E.164. Nomor layanan pendek seperti 119
 * harus ditulis apa adanya; 'tel:+119' gagal didial.
 */
export function tautanTelepon(kontak) {
  return kontak.internasional ? `tel:+${kontak.nomor}` : `tel:${kontak.nomor}`
}

/**
 * Tautan WhatsApp dengan pesan pembuka yang sudah terisi, sehingga
 * pasien tidak perlu memikirkan cara memulai percakapan.
 *
 * Hanya untuk kontak yang benar-benar punya WhatsApp. Nomor layanan
 * pendek seperti 119 tidak punya.
 */
export function tautanWhatsApp(kontak) {
  const pesan = encodeURIComponent(
    'Selamat siang, saya baru mengisi skrining kesehatan jiwa PIJAR dan ingin berbicara dengan petugas.',
  )
  return `https://wa.me/${kontak.nomor}?text=${pesan}`
}
