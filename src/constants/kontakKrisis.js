/**
 * kontak-krisis.js — Nomor bantuan untuk situasi krisis kesehatan jiwa.
 *
 * Dipakai oleh PanelKrisis.vue, yang muncul saat responden mengakui
 * pikiran mencelakai diri sendiri (EPDS item 10, nilai >= NILAI_KRISIS_E10)
 * atau saat hasil skrining tergolong High Risk.
 *
 * ────────────────────────────────────────────────────────────────
 * PERINGATAN — SATU NOMOR MASIH SEMENTARA
 *
 * KONTAK_LOKAL di bawah adalah nomor sementara dan HARUS diganti
 * dengan nomor resmi UPTD Puskesmas Sekadau sebelum aplikasi dipakai
 * secara luas. Nomor pada jalur krisis yang tidak terjawab berarti
 * seseorang dengan pikiran bunuh diri menelepon ke kehampaan.
 *
 * Saat menggantinya, pastikan:
 *   1. Nomor dijawab manusia, bukan mesin penjawab
 *   2. Tersedia 24 jam, atau cantumkan jam layanan secara jujur
 *   3. Petugas yang menjawab tahu ini jalur krisis kesehatan jiwa
 *   4. Pemilik nomor mengetahui nomornya tampil publik
 *
 * KONTAK_NASIONAL sengaja didampingkan sebagai cadangan: bila nomor
 * lokal tidak terjawab, pasien masih punya jalur nasional. Jangan
 * menggantungkan penanganan krisis pada satu titik saja.
 * ────────────────────────────────────────────────────────────────
 */

/**
 * Kontak Puskesmas setempat.
 * TODO: ganti dengan nomor resmi UPTD Puskesmas Sekadau (lihat peringatan di atas).
 */
export const KONTAK_LOKAL = {
  nama: 'UPTD Puskesmas Sekadau',
  keterangan: 'Layanan kesehatan jiwa / IGD',
  // Format E.164 tanpa tanda plus, untuk tautan tel: dan wa.me
  nomor: '6285173358826',
  // Tampilan yang mudah dibaca dan diucapkan
  tampilan: '+62 851-7335-8826',
  // Nomor internasional -> tautan tel: diberi awalan '+'
  internasional: true,
  // Nomor ini berupa telepon seluler, jadi WhatsApp tersedia
  whatsapp: true,
  sementara: true,
}

/**
 * Hotline nasional kesehatan jiwa Kementerian Kesehatan (SEJIWA),
 * melalui layanan darurat 119 lalu pilih ekstensi 8.
 */
export const KONTAK_NASIONAL = {
  nama: 'SEJIWA — Kemenkes',
  keterangan: 'Hotline nasional kesehatan jiwa, 24 jam',
  nomor: '119',
  tampilan: '119 ext. 8',
  // Nomor layanan pendek: JANGAN diberi awalan '+', karena
  // 'tel:+119' tidak dapat didial oleh ponsel.
  internasional: false,
  whatsapp: false,
  sementara: false,
}

/** Urutan tampil di panel krisis: lokal dulu, lalu jalur nasional. */
export const KONTAK_KRISIS = [KONTAK_LOKAL, KONTAK_NASIONAL]

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
 */
export function tautanWhatsApp(kontak) {
  const pesan = encodeURIComponent(
    'Selamat siang, saya baru mengisi skrining kesehatan jiwa PIJAR dan ingin berbicara dengan petugas.',
  )
  return `https://wa.me/${kontak.nomor}?text=${pesan}`
}
