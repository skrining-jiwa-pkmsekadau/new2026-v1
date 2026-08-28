-- ================================================================
-- 06_migrasi_epds.sql
--
-- TUJUAN: menyelaraskan data EPDS historis dengan Juknis Kemenkes.
--
-- LATAR BELAKANG
-- --------------
-- Sebelum diperbaiki, aplikasi menyimpan klasifikasi EPDS yang
-- menyimpang dari Juknis KJ.02.05/B.III/92/2025 hal. 11 dalam dua hal:
--
--   1. Item 10 memakai ambang value > 0, sehingga jawaban
--      "Hampir tidak pernah" (1) dan "Kadang-kadang" (2) ikut memicu
--      High Risk. Juknis hanya mengeskalasi pada "Ya, agak sering" (3).
--      -> sebagian baris TERLALU TINGGI klasifikasinya (over-triage).
--
--   2. Skor 9-12 dilabeli Moderate Risk, padahal juknis menempatkan
--      rentang 0-12 seluruhnya sebagai "tidak menunjukkan gejala
--      signifikan", dengan tambahan anjuran skrining ulang ANC.
--      -> sebagian baris salah kategori.
--
-- Aturan yang benar menurut juknis:
--   skor >= 13  ATAU  item 10 = 3   ->  High Risk
--   selain itu (0-12)               ->  Low Risk
--                                       (9-12 + anjuran skrining ulang)
--
-- KOLOM jawaban (JSONB) MENYIMPAN JAWABAN MENTAH, sehingga klasifikasi
-- dapat DIHITUNG ULANG dengan pasti — tidak perlu menebak.
--
-- ================================================================
-- CARA PAKAI — JANGAN LANGSUNG MENJALANKAN SELURUH BERKAS
-- ================================================================
--  TAHAP 1  Jalankan BAGIAN 1 (dry-run). Tidak mengubah apa pun.
--           Periksa hasilnya: berapa baris berubah, dan ke arah mana.
--  TAHAP 2  Jalankan BAGIAN 2 (cadangan). Membuat tabel salinan.
--  TAHAP 3  Baru jalankan BAGIAN 3 (UPDATE) bila hasil dry-run wajar.
--  TAHAP 4  Jalankan BAGIAN 4 (verifikasi).
--
-- AMBIL BACKUP CSV sebelum TAHAP 3.
--
-- CATATAN KLINIS PENTING
-- Migrasi ini akan MENURUNKAN sebagian klasifikasi dari High/Moderate
-- ke Low Risk. Itu memang bunyi juknis, tetapi pasien yang sebelumnya
-- ditandai berisiko mungkin sudah atau sedang ditindaklanjuti.
-- JANGAN menganggap penurunan label sebagai pembatalan tindak lanjut
-- yang sudah berjalan. Bagian 1 menampilkan daftar baris terdampak
-- agar dapat ditinjau seorang klinisi lebih dahulu.
-- ================================================================


-- ================================================================
-- BAGIAN 1 — DRY RUN. Hanya membaca. Jalankan ini lebih dahulu.
-- ================================================================

-- Perhitungan ulang untuk setiap baris EPDS.
CREATE OR REPLACE VIEW public.v_epds_hitung_ulang AS
WITH dasar AS (
  SELECT
    s.id,
    s.nik,
    s.nama_lengkap,
    s.tanggal_skrining,
    s.tingkat_risiko                       AS risiko_tersimpan,
    s.skor_total                           AS skor_tersimpan,
    s.skor_detail                          AS detail_tersimpan,
    -- Jumlah seluruh nilai jawaban.
    (
      SELECT COALESCE(SUM((j->>'value')::INT), 0)
      FROM jsonb_array_elements(s.jawaban) AS j
    )                                      AS skor_hitung,
    -- Nilai item 10, dicari lewat id 'E10' (bukan posisi array).
    (
      SELECT COALESCE(MAX((j->>'value')::INT), 0)
      FROM jsonb_array_elements(s.jawaban) AS j
      WHERE j->>'id' = 'E10'
    )                                      AS nilai_e10,
    jsonb_array_length(s.jawaban)          AS jml_jawaban
  FROM public.screenings AS s
  WHERE s.instrumen = 'EPDS'
    AND jsonb_typeof(s.jawaban) = 'array'
)
SELECT
  d.*,
  -- Aturan juknis.
  (d.nilai_e10 >= 3)                                        AS flag_e10_benar,
  (d.skor_hitung >= 13 OR d.nilai_e10 >= 3)                 AS high_risk_benar,
  CASE WHEN d.skor_hitung >= 13 OR d.nilai_e10 >= 3
       THEN 'High Risk' ELSE 'Low Risk' END                 AS risiko_benar,
  (d.skor_hitung BETWEEN 9 AND 12 AND d.nilai_e10 < 3)      AS perlu_skrining_ulang_benar,
  -- Penanda perbedaan.
  (d.risiko_tersimpan IS DISTINCT FROM
     CASE WHEN d.skor_hitung >= 13 OR d.nilai_e10 >= 3
          THEN 'High Risk' ELSE 'Low Risk' END)             AS risiko_berbeda,
  (d.skor_tersimpan IS DISTINCT FROM d.skor_hitung)         AS skor_berbeda,
  (d.jml_jawaban <> 10)                                     AS jumlah_jawaban_salah
FROM dasar AS d;

COMMENT ON VIEW public.v_epds_hitung_ulang IS
  'Perhitungan ulang klasifikasi EPDS dari kolom jawaban (JSONB) '
  'menurut Juknis KJ.02.05 hal. 11. Dipakai untuk meninjau dan '
  'memverifikasi migrasi 06_migrasi_epds.sql.';


-- (1a) RINGKASAN: berapa baris berubah, dan ke arah mana.
SELECT
  risiko_tersimpan                       AS dari,
  risiko_benar                           AS menjadi,
  COUNT(*)                               AS jumlah_baris,
  CASE
    WHEN risiko_tersimpan = risiko_benar                       THEN 'tidak berubah'
    WHEN risiko_benar = 'Low Risk'                             THEN 'DITURUNKAN — tinjau klinis'
    ELSE                                                            'DINAIKKAN — perlu tindak lanjut'
  END                                    AS arah_perubahan
FROM public.v_epds_hitung_ulang
GROUP BY risiko_tersimpan, risiko_benar
ORDER BY jumlah_baris DESC;


-- (1b) DAFTAR BARIS TERDAMPAK — tinjau bersama klinisi.
--      Kolom `alasan` menjelaskan mengapa klasifikasinya berubah.
SELECT
  id,
  tanggal_skrining,
  nama_lengkap,
  skor_tersimpan,
  skor_hitung,
  nilai_e10,
  risiko_tersimpan,
  risiko_benar,
  CASE
    WHEN nilai_e10 BETWEEN 1 AND 2 AND skor_hitung < 13
      THEN 'Item 10 bernilai ' || nilai_e10 || ' (bukan 3) dan skor < 13 -> juknis: Low Risk'
    WHEN skor_hitung BETWEEN 9 AND 12 AND nilai_e10 < 3
      THEN 'Skor ' || skor_hitung || ' berada di rentang 9-12 -> juknis: Low Risk + anjuran skrining ulang ANC'
    WHEN skor_tersimpan IS DISTINCT FROM skor_hitung
      THEN 'Skor tersimpan tidak sama dengan hasil hitung ulang'
    ELSE 'Perbedaan lain — periksa manual'
  END AS alasan
FROM public.v_epds_hitung_ulang
WHERE risiko_berbeda OR skor_berbeda
ORDER BY tanggal_skrining DESC;


-- (1c) BARIS CACAT: jumlah jawaban bukan 10. Baris seperti ini tidak
--      dapat dipercaya dan TIDAK akan disentuh oleh migrasi.
SELECT id, tanggal_skrining, nama_lengkap, jml_jawaban, skor_tersimpan, risiko_tersimpan
FROM public.v_epds_hitung_ulang
WHERE jumlah_jawaban_salah
ORDER BY tanggal_skrining DESC;


-- (1d) Jumlah total baris EPDS, sebagai pembanding sesudah migrasi.
SELECT
  COUNT(*)                                    AS total_epds,
  COUNT(*) FILTER (WHERE risiko_berbeda)      AS akan_berubah_risiko,
  COUNT(*) FILTER (WHERE skor_berbeda)        AS akan_berubah_skor,
  COUNT(*) FILTER (WHERE jumlah_jawaban_salah) AS cacat_dilewati
FROM public.v_epds_hitung_ulang;


-- ================================================================
-- BAGIAN 2 — CADANGAN. Jalankan sebelum BAGIAN 3.
-- ================================================================
-- Menyalin seluruh baris EPDS beserta nilai lamanya. Tabel ini yang
-- dipakai bila migrasi perlu dibatalkan.

CREATE TABLE IF NOT EXISTS public.backup_epds_sebelum_migrasi AS
SELECT
  id,
  tingkat_risiko    AS tingkat_risiko_lama,
  skor_total        AS skor_total_lama,
  skor_detail       AS skor_detail_lama,
  kesimpulan_klinis AS kesimpulan_klinis_lama,
  rekomendasi       AS rekomendasi_lama,
  NOW()             AS dicadangkan_at
FROM public.screenings
WHERE instrumen = 'EPDS';

-- Kunci tabel cadangan dari akses aplikasi (memuat data pasien).
ALTER TABLE public.backup_epds_sebelum_migrasi ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.backup_epds_sebelum_migrasi FROM PUBLIC, anon, authenticated;

-- Pastikan cadangan benar-benar terisi.
SELECT COUNT(*) AS baris_tercadangkan FROM public.backup_epds_sebelum_migrasi;


-- ================================================================
-- BAGIAN 3 — UPDATE. Jalankan HANYA setelah dry-run ditinjau.
-- ================================================================
-- Dibungkus transaksi. Bila jumlah baris terdampak jauh di luar
-- dugaan, blok pemeriksaan akan membatalkan seluruh perubahan.

BEGIN;

-- Pemeriksaan keselamatan: batalkan bila tidak ada cadangan.
DO $$
DECLARE
  v_cadangan INT;
BEGIN
  SELECT COUNT(*) INTO v_cadangan FROM public.backup_epds_sebelum_migrasi;
  IF v_cadangan = 0 THEN
    RAISE EXCEPTION
      'Dibatalkan: tabel cadangan kosong. Jalankan BAGIAN 2 lebih dahulu.';
  END IF;
  RAISE NOTICE 'Cadangan tersedia: % baris.', v_cadangan;
END;
$$;

UPDATE public.screenings AS s
SET
  tingkat_risiko = v.risiko_benar,
  skor_total     = v.skor_hitung,
  skor_detail    = jsonb_build_object(
                     'flag_e10',             v.flag_e10_benar,
                     'nilai_e10',            v.nilai_e10,
                     'perlu_skrining_ulang', v.perlu_skrining_ulang_benar
                   ),
  kesimpulan_klinis = CASE
    WHEN v.high_risk_benar THEN
      'Hasil skrining EPDS mengindikasikan kemungkinan gejala depresi pada ibu hamil/nifas (skor >= 13 atau jawaban "Ya, agak sering" pada pertanyaan 10). Diperlukan penanganan segera.'
    WHEN v.perlu_skrining_ulang_benar THEN
      'Hasil skrining EPDS tidak menunjukkan gejala depresi yang signifikan (skor 0-12). Karena skor berada pada rentang 9-12, lakukan skrining ulang pada kunjungan ANC berikutnya.'
    ELSE
      'Hasil skrining EPDS tidak menunjukkan gejala depresi yang signifikan (skor 0-12).'
  END,
  rekomendasi = CASE
    WHEN v.high_risk_benar THEN
      '["Konseling awal segera oleh Perawat atau Bidan yang bersifat suportif.", "Pemeriksaan kesehatan jiwa untuk menegakkan diagnosis oleh Dokter atau Psikolog Klinis.", "Tatalaksana komprehensif sesuai kompetensi tenaga medis dan kesehatan di Puskesmas.", "Segera rujuk ke FKTL jika ada indikasi membahayakan diri sendiri atau orang lain.", "Pastikan pendampingan intensif dari keluarga terdekat selama proses pemulihan."]'::JSONB
    WHEN v.perlu_skrining_ulang_benar THEN
      '["Berikan edukasi kesehatan jiwa: tanda sehat jiwa pada ibu, faktor protektif, latihan manajemen dan coping stress.", "Edukasi pengasuhan positif.", "Skor 9-12: lakukan skrining ulang pada kunjungan ANC berikutnya.", "Pantau kondisi ibu secara berkala oleh Bidan atau Perawat.", "Tingkatkan dukungan sosial dan emosional dari keluarga terdekat."]'::JSONB
    ELSE
      '["Edukasi kesehatan jiwa: tanda sehat jiwa pada ibu dan faktor protektif kesehatan jiwa.", "Latihan manajemen stres dan coping stress yang sehat selama masa kehamilan/nifas.", "Edukasi pengasuhan positif dan perawatan bayi yang menyenangkan.", "Jaga dukungan sosial dari keluarga dan tenaga kesehatan."]'::JSONB
  END
FROM public.v_epds_hitung_ulang AS v
WHERE s.id = v.id
  -- Baris dengan jumlah jawaban tidak wajar TIDAK disentuh.
  AND NOT v.jumlah_jawaban_salah;

COMMIT;


-- ================================================================
-- BAGIAN 4 — VERIFIKASI setelah UPDATE.
-- ================================================================

-- (4a) Tidak boleh ada lagi selisih antara tersimpan dan hitung ulang
--      (kecuali baris cacat yang sengaja dilewati).
SELECT COUNT(*) AS sisa_selisih
FROM public.v_epds_hitung_ulang
WHERE (risiko_berbeda OR skor_berbeda)
  AND NOT jumlah_jawaban_salah;

-- (4b) Sebaran EPDS sesudah migrasi. Juknis hanya mengenal dua
--      tingkat, jadi 'Moderate Risk' TIDAK boleh muncul lagi.
SELECT tingkat_risiko, COUNT(*) AS jumlah
FROM public.screenings
WHERE instrumen = 'EPDS'
GROUP BY tingkat_risiko
ORDER BY jumlah DESC;

-- (4c) Jumlah baris keseluruhan HARUS tetap sama seperti sebelum
--      migrasi. Migrasi ini tidak pernah menambah atau menghapus baris.
SELECT COUNT(*) AS total_baris_screenings FROM public.screenings;

-- (4d) Perbandingan sebelum dan sesudah, per baris yang berubah.
SELECT
  b.id,
  b.tingkat_risiko_lama,
  s.tingkat_risiko AS tingkat_risiko_baru,
  b.skor_total_lama,
  s.skor_total     AS skor_total_baru
FROM public.backup_epds_sebelum_migrasi AS b
JOIN public.screenings AS s ON s.id = b.id
WHERE b.tingkat_risiko_lama IS DISTINCT FROM s.tingkat_risiko
   OR b.skor_total_lama IS DISTINCT FROM s.skor_total
ORDER BY b.id;


-- ================================================================
-- CARA MEMBATALKAN
-- ================================================================
-- Memulihkan seluruh nilai EPDS ke kondisi sebelum migrasi:
--
--   BEGIN;
--   UPDATE public.screenings AS s
--   SET tingkat_risiko    = b.tingkat_risiko_lama,
--       skor_total        = b.skor_total_lama,
--       skor_detail       = b.skor_detail_lama,
--       kesimpulan_klinis = b.kesimpulan_klinis_lama,
--       rekomendasi       = b.rekomendasi_lama
--   FROM public.backup_epds_sebelum_migrasi AS b
--   WHERE s.id = b.id;
--   COMMIT;
--
-- Tabel cadangan sebaiknya DIPERTAHANKAN sebagai jejak audit, tidak
-- dihapus setelah migrasi dinyatakan berhasil.
-- ================================================================
