-- ================================================================
-- 00_diagnostik.sql — HANYA MEMBACA. Tidak mengubah data & izin.
--
-- Tujuan: memetakan kondisi keamanan DB yang sebenarnya sebelum
-- 01_lockdown.sql dijalankan. Semua perintah di sini SELECT.
--
-- Cara pakai: Supabase Dashboard -> SQL Editor -> jalankan per blok,
-- lalu salin hasilnya untuk ditinjau.
-- ================================================================


-- ── 1. Apakah RLS aktif & dipaksa pada screenings? ──────────────
-- relrowsecurity = true  -> RLS aktif
-- relforcerowsecurity    -> RLS juga berlaku bagi pemilik tabel
SELECT
  c.relname                AS tabel,
  c.relrowsecurity         AS rls_aktif,
  c.relforcerowsecurity    AS rls_dipaksa,
  pg_get_userbyid(c.relowner) AS pemilik
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'screenings';


-- ── 2. Policy apa saja yang ada, dan untuk role apa? ────────────
-- Ini yang menjawab pertanyaan kunci: apakah anon punya policy
-- INSERT / UPDATE / DELETE yang permisif.
SELECT
  policyname AS nama_policy,
  cmd        AS perintah,
  permissive,
  roles,
  qual       AS using_expr,
  with_check AS with_check_expr
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'screenings'
ORDER BY cmd, policyname;


-- ── 3. Privilege level tabel: siapa boleh apa? ──────────────────
-- Yang WAJIB tidak muncul di sini untuk anon: INSERT, UPDATE, DELETE.
-- (SELECT untuk anon juga sebaiknya dicabut; RPC tidak membutuhkannya.)
SELECT
  grantee   AS role,
  privilege_type AS privilege
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'screenings'
  AND grantee IN ('anon', 'authenticated', 'PUBLIC', 'service_role')
ORDER BY grantee, privilege_type;


-- ── 4. Kolom NOT NULL & default — konteks untuk constraint 23502 ─
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'screenings'
ORDER BY ordinal_position;


-- ── 5. Fungsi: SECURITY DEFINER? search_path terpasang? ─────────
-- prosecdef = true  -> SECURITY DEFINER
-- proconfig harus memuat search_path=... ; NULL = kerentanan
SELECT
  p.proname                    AS fungsi,
  pg_get_userbyid(p.proowner)  AS pemilik,
  p.prosecdef                  AS security_definer,
  p.proconfig                  AS config_search_path,
  pg_get_function_identity_arguments(p.oid) AS argumen
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('simpan_skrining', 'is_admin', 'cek_riwayat_nik')
ORDER BY p.proname;


-- ── 6. Siapa boleh EXECUTE fungsi-fungsi itu? ───────────────────
-- PUBLIC tidak boleh muncul di sini.
SELECT
  p.proname AS fungsi,
  a.grantee,
  a.privilege_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
JOIN LATERAL (
  SELECT
    CASE WHEN acl.grantee = 0 THEN 'PUBLIC'
         ELSE pg_get_userbyid(acl.grantee) END AS grantee,
    acl.privilege_type
) a ON TRUE
WHERE n.nspname = 'public'
  AND p.proname IN ('simpan_skrining', 'is_admin', 'cek_riwayat_nik')
ORDER BY p.proname, a.grantee;


-- ── 7. Definisi is_admin() dan cek_riwayat_nik() ────────────────
-- Perlu ditinjau: is_admin() dipakai sebagai dasar policy, jadi ia
-- tidak boleh membaca tabel yang RLS-nya bergantung pada is_admin()
-- (rekursi), dan cek_riwayat_nik() adalah oracle NIK bagi anon.
SELECT p.proname, pg_get_functiondef(p.oid) AS definisi
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_admin', 'cek_riwayat_nik');


-- ── 8. Berapa baris yang sebenarnya tersimpan? ──────────────────
-- Dijalankan sebagai pemilik di SQL Editor, jadi menembus RLS.
-- Catat angkanya: harus sama sebelum & sesudah 01_lockdown.sql.
SELECT
  COUNT(*)                              AS total_baris,
  COUNT(*) FILTER (WHERE is_valid)      AS baris_valid,
  MIN(tanggal_skrining)                 AS skrining_pertama,
  MAX(tanggal_skrining)                 AS skrining_terakhir,
  COUNT(DISTINCT nik)                   AS nik_unik
FROM public.screenings;


-- ── 9. Indikasi baris palsu / rusak akibat RPC fail-open ────────
-- Baris dengan skor NULL atau di luar rentang instrumen adalah
-- tanda payload cacat yang lolos karena RPC tidak memvalidasi.
SELECT
  instrumen,
  tingkat_risiko,
  COUNT(*) AS jumlah,
  COUNT(*) FILTER (WHERE skor_total IS NULL) AS skor_null,
  COUNT(*) FILTER (WHERE jawaban IS NULL
                      OR jsonb_typeof(jawaban) <> 'array') AS jawaban_bukan_array,
  COUNT(*) FILTER (WHERE jsonb_typeof(jawaban) = 'array'
                      AND jsonb_array_length(jawaban) <> CASE
                            WHEN instrumen IN ('MMYS_ANAK','MMYS_REMAJA') THEN 6
                            WHEN instrumen = 'PHQ4' THEN 4
                            WHEN instrumen = 'EPDS' THEN 10
                          END) AS panjang_jawaban_salah
FROM public.screenings
GROUP BY instrumen, tingkat_risiko
ORDER BY instrumen, tingkat_risiko;


-- ── 10. Nilai tingkat_risiko yang ada (deteksi enum lama) ───────
-- Nilai selain High/Moderate/Low Risk tidak terhitung oleh
-- GrafikMudah.vue dan hilang dari statistik dashboard.
SELECT tingkat_risiko, COUNT(*) AS jumlah
FROM public.screenings
GROUP BY tingkat_risiko
ORDER BY jumlah DESC;
