-- ================================================================
-- 00c_sebelum_kunci.sql — CATAT KONDISI AWAL. HANYA MEMBACA.
--
-- Jalankan SEBELUM db/01_kunci_kebocoran.sql, lalu simpan hasilnya.
-- Dipakai sebagai pembanding untuk membuktikan tidak ada data yang
-- hilang atau berubah setelah penguncian.
-- ================================================================

-- ── 1. Jumlah baris — angka ini HARUS sama setelah penguncian ────
SELECT
  COUNT(*)                          AS total_baris,
  COUNT(*) FILTER (WHERE is_valid)  AS baris_valid,
  COUNT(DISTINCT nik)               AS nik_unik,
  MIN(tanggal_skrining)             AS skrining_pertama,
  MAX(tanggal_skrining)             AS skrining_terakhir
FROM public.screenings;

-- ── 2. Sebaran per instrumen dan tingkat risiko ──────────────────
SELECT instrumen, tingkat_risiko, COUNT(*) AS jumlah
FROM public.screenings
GROUP BY instrumen, tingkat_risiko
ORDER BY instrumen, tingkat_risiko;

-- ── 3. Sidik jari data (checksum) ────────────────────────────────
-- Nilai ini berubah HANYA jika ada isi baris yang berubah.
-- Catat, lalu bandingkan setelah penguncian.
SELECT md5(string_agg(
         id::TEXT || COALESCE(tingkat_risiko, '') || COALESCE(skor_total::TEXT, ''),
         '|' ORDER BY id
       )) AS sidik_jari_data
FROM public.screenings;

-- ── 4. Baris EPDS yang perlu ditinjau ulang ──────────────────────
-- Menghitung ulang klasifikasi dari kolom jawaban (JSONB) untuk
-- membandingkannya dengan tingkat_risiko yang tersimpan.
--
-- Sesuai juknis KJ.02.05 hal. 11:
--   >= 13, atau item 10 bernilai 3  -> High Risk
--   sisanya (0-12)                  -> Low Risk
WITH epds AS (
  SELECT
    s.id,
    s.tanggal_skrining,
    s.tingkat_risiko AS risiko_tersimpan,
    s.skor_total     AS skor_tersimpan,
    (
      SELECT COALESCE(SUM((j->>'value')::INT), 0)
      FROM jsonb_array_elements(s.jawaban) AS j
    ) AS skor_hitung,
    (
      SELECT COALESCE(MAX((j->>'value')::INT), 0)
      FROM jsonb_array_elements(s.jawaban) AS j
      WHERE j->>'id' = 'E10'
    ) AS nilai_e10
  FROM public.screenings AS s
  WHERE s.instrumen = 'EPDS'
    AND jsonb_typeof(s.jawaban) = 'array'
)
SELECT
  id,
  tanggal_skrining,
  risiko_tersimpan,
  skor_tersimpan,
  skor_hitung,
  nilai_e10,
  CASE WHEN skor_hitung >= 13 OR nilai_e10 >= 3
       THEN 'High Risk' ELSE 'Low Risk' END AS risiko_seharusnya,
  CASE
    WHEN skor_tersimpan IS DISTINCT FROM skor_hitung THEN 'SKOR BEDA'
    WHEN risiko_tersimpan IS DISTINCT FROM
         (CASE WHEN skor_hitung >= 13 OR nilai_e10 >= 3
               THEN 'High Risk' ELSE 'Low Risk' END) THEN 'RISIKO BEDA'
    ELSE 'cocok'
  END AS catatan
FROM epds
ORDER BY catatan, tanggal_skrining DESC;

-- ── 5. Baris cacat akibat RPC tanpa validasi ─────────────────────
-- Panjang jawaban yang tidak sesuai instrumen, atau skor NULL,
-- menandakan payload rusak yang lolos tersimpan.
SELECT
  instrumen,
  COUNT(*) AS jumlah,
  COUNT(*) FILTER (WHERE skor_total IS NULL) AS skor_null,
  COUNT(*) FILTER (WHERE jawaban IS NULL
                      OR jsonb_typeof(jawaban) <> 'array') AS jawaban_bukan_array,
  COUNT(*) FILTER (
    WHERE jsonb_typeof(jawaban) = 'array'
      AND jsonb_array_length(jawaban) <> CASE
            WHEN instrumen IN ('MMYS_ANAK', 'MMYS_REMAJA') THEN 6
            WHEN instrumen = 'PHQ4' THEN 4
            WHEN instrumen = 'EPDS' THEN 10
          END
  ) AS panjang_jawaban_salah,
  COUNT(*) FILTER (WHERE nik IS NULL OR TRIM(nik::TEXT) !~ '^[0-9]{16}$') AS nik_tidak_valid
FROM public.screenings
GROUP BY instrumen
ORDER BY instrumen;

-- ── 6. Kondisi keamanan tabel saat ini ───────────────────────────
SELECT c.relrowsecurity AS rls_aktif, c.relforcerowsecurity AS rls_dipaksa
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'screenings';

SELECT policyname, cmd, roles, qual AS using_expr, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'screenings';

SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'screenings'
  AND grantee IN ('anon', 'authenticated', 'PUBLIC')
ORDER BY grantee, privilege_type;
