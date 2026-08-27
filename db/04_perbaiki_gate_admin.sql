-- ================================================================
-- 04_perbaiki_gate_admin.sql
--
-- MENDESAK: menutup kebocoran identitas pasien yang masih aktif.
--
-- MASALAH
-- -------
-- Setelah 02_pisah_identitas.sql dijalankan, fungsi
-- ambil_identitas_nik() TERNYATA masih dapat dipanggil oleh peran
-- `anon`, dan pemeriksaan admin di dalamnya TIDAK PERNAH berjalan.
--
-- Bukti dari uji langsung ke produksi:
--   POST /rest/v1/rpc/ambil_identitas_nik  {"p_nik":"abc"}   -> 200 []
-- Seharusnya 42501. Karena RAISE EXCEPTION berada di baris pertama
-- fungsi (sebelum query apa pun), jawaban 200 membuktikan RAISE tidak
-- pernah dieksekusi. Untuk NIK yang benar-benar ada, identitas lengkap
-- akan keluar kepada pemanggil anonim.
--
-- DUA SEBAB
-- ---------
-- 1. LOGIKA TIGA-NILAI SQL.
--    is_admin() berisi:  SELECT auth.uid() = '<uuid>'::uuid
--    Bagi pemanggil anonim auth.uid() bernilai NULL, dan
--    NULL = uuid  menghasilkan NULL (bukan FALSE).
--    Akibatnya:  NOT is_admin()  ->  NOT NULL  ->  NULL
--    dan  IF NULL THEN  tidak masuk cabang, sehingga RAISE dilewati.
--
--    Ini juga MEMPENGARUHI POLICY RLS di 03_rls.sql yang memakai
--    USING (public.is_admin()). Untungnya policy menolak baris saat
--    ekspresi bernilai NULL, jadi arah kegagalannya aman (menolak).
--    Tetap diperbaiki agar perilakunya tegas, bukan kebetulan.
--
-- 2. DEFAULT PRIVILEGE SUPABASE.
--    Supabase memberi EXECUTE langsung kepada peran `anon` dan
--    `authenticated` untuk setiap fungsi baru di schema public.
--    REVOKE ... FROM PUBLIC tidak menyentuh pemberian langsung itu,
--    sehingga anon tetap memegang EXECUTE.
--
-- YANG DILAKUKAN
-- --------------
--  1. is_admin() dibungkus COALESCE agar SELALU boolean, tidak NULL.
--  2. Pemeriksaan di ambil_identitas_nik memakai IS NOT TRUE (aman
--     terhadap NULL), bukan NOT.
--  3. REVOKE EXECUTE ... FROM anon secara EKSPLISIT.
--
-- YANG TIDAK DILAKUKAN
-- --------------------
--  - TIDAK mengubah, menghapus, atau memindahkan satu baris data pun.
--  - TIDAK menyentuh tabel screenings.
--
-- CARA PAKAI
-- ----------
--  1. Jalankan SELURUH berkas ini di Supabase SQL Editor.
--  2. Jalankan blok VERIFIKASI di bawah.
--  3. Jalankan UJI DARI LUAR — ini satu-satunya bukti yang sah,
--     karena SQL Editor berjalan sebagai pemilik, bukan sebagai anon.
-- ================================================================


-- ── LANGKAH 1: is_admin() tidak boleh pernah mengembalikan NULL ──
--
-- COALESCE(..., FALSE) membuat pemanggil anonim mendapat FALSE, bukan
-- NULL, sehingga setiap pemeriksaan boolean di sisi pemakai berperilaku
-- sebagaimana diharapkan.
--
-- CATATAN: UUID admin masih ditulis langsung di sini. Bila akun itu
-- hilang, TIDAK ADA yang dapat membuka dashboard. Penggantian dengan
-- tabel admin dikerjakan terpisah agar langkah ini tetap kecil.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT COALESCE(auth.uid() = '7b169563-8103-4c01-aef0-f3f22857b4ea'::uuid, FALSE);
$function$;

COMMENT ON FUNCTION public.is_admin() IS
  'TRUE hanya untuk akun admin. WAJIB memakai COALESCE: bagi pemanggil '
  'anonim auth.uid() bernilai NULL sehingga perbandingan menghasilkan '
  'NULL, dan NULL akan melewati pemeriksaan IF NOT ... di pemanggilnya.';


-- ── LANGKAH 2: gate admin yang aman terhadap NULL ────────────────
--
-- IS NOT TRUE menangkap ketiga kemungkinan: FALSE, NULL, dan TRUE.
-- Hanya TRUE yang boleh lolos.
CREATE OR REPLACE FUNCTION public.ambil_identitas_nik(p_nik TEXT)
RETURNS TABLE (
  tanggal_skrining TEXT,
  instrumen TEXT,
  tingkat_risiko TEXT,
  jumlah_riwayat INTEGER,
  skrining_ke INTEGER,
  tanggal_boleh_skrining_ulang TEXT,
  boleh_skrining_ulang BOOLEAN,
  nama_lengkap TEXT,
  tanggal_lahir TEXT,
  jenis_kelamin TEXT,
  nomor_hp TEXT,
  is_hamil_nifas BOOLEAN,
  alamat TEXT,
  kecamatan TEXT,
  desa TEXT,
  pendidikan TEXT,
  pekerjaan TEXT,
  nama_sekolah TEXT,
  tempat_skrining TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- IS NOT TRUE, BUKAN NOT: bila is_admin() bernilai NULL, `NOT NULL`
  -- juga NULL dan IF-nya terlewati sepenuhnya.
  IF public.is_admin() IS NOT TRUE THEN
    RAISE EXCEPTION 'Akses ditolak: hanya admin dapat mengambil data identitas pasien.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH riwayat AS (
    SELECT
      s.*,
      COUNT(*) OVER ()::INTEGER AS jml_riwayat,
      ROW_NUMBER() OVER (ORDER BY s.tanggal_skrining ASC)::INTEGER AS urutan
    FROM public.screenings AS s
    WHERE TRIM(s.nik::TEXT) = TRIM(p_nik)
      AND COALESCE(s.is_valid, TRUE) = TRUE
  )
  SELECT
    LEFT(r.tanggal_skrining::TEXT, 10),
    COALESCE(r.instrumen::TEXT, '-'),
    COALESCE(r.tingkat_risiko::TEXT, '-'),
    r.jml_riwayat,
    r.urutan,
    LEFT((r.tanggal_skrining::DATE + INTERVAL '90 days')::TEXT, 10),
    CURRENT_DATE >= (r.tanggal_skrining::DATE + INTERVAL '90 days')::DATE,
    COALESCE(r.nama_lengkap::TEXT, ''),
    LEFT(r.tanggal_lahir::TEXT, 10),
    COALESCE(r.jenis_kelamin::TEXT, ''),
    COALESCE(r.nomor_hp::TEXT, ''),
    COALESCE(r.is_hamil_nifas, FALSE),
    COALESCE(r.alamat::TEXT, ''),
    COALESCE(r.kecamatan::TEXT, ''),
    COALESCE(r.desa::TEXT, ''),
    COALESCE(r.pendidikan::TEXT, ''),
    COALESCE(r.pekerjaan::TEXT, ''),
    COALESCE(r.nama_sekolah::TEXT, ''),
    COALESCE(r.tempat_skrining::TEXT, '')
  FROM riwayat AS r
  ORDER BY r.tanggal_skrining DESC
  LIMIT 5;
END;
$function$;

COMMENT ON FUNCTION public.ambil_identitas_nik(TEXT) IS
  'Identitas lengkap pasien untuk autofill formulir. HANYA admin. '
  'Dua lapis: EXECUTE dicabut dari anon DAN is_admin() diperiksa di '
  'dalam fungsi memakai IS NOT TRUE. JANGAN pernah memberi EXECUTE '
  'kepada anon — itu mengubahnya menjadi alat pemanen identitas.';


-- ── LANGKAH 3: cabut EXECUTE dari anon secara eksplisit ──────────
--
-- Supabase memberi EXECUTE langsung kepada anon untuk fungsi baru di
-- schema public. REVOKE ... FROM PUBLIC TIDAK menyentuh pemberian
-- langsung tersebut, jadi anon harus dicabut namanya sendiri.
REVOKE EXECUTE ON FUNCTION public.ambil_identitas_nik(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ambil_identitas_nik(TEXT) FROM anon;
GRANT  EXECUTE ON FUNCTION public.ambil_identitas_nik(TEXT) TO authenticated;

-- is_admin() juga tidak perlu dipanggil anon.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Formulir publik memang membutuhkan kedua fungsi di bawah, jadi anon
-- tetap diberi hak. Ditulis eksplisit agar tidak bergantung pada
-- default privilege yang bisa berubah.
GRANT EXECUTE ON FUNCTION public.cek_riwayat_nik(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.simpan_skrining(JSONB) TO anon, authenticated;


-- ================================================================
-- VERIFIKASI DI DALAM SQL EDITOR — semuanya hanya membaca.
-- ================================================================

-- (a) is_admin() sudah memakai COALESCE.
SELECT pg_get_functiondef(p.oid) AS definisi_is_admin
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'is_admin';

-- (b) anon TIDAK boleh muncul untuk ambil_identitas_nik maupun is_admin.
--     anon BOLEH muncul untuk cek_riwayat_nik dan simpan_skrining.
SELECT
  p.proname AS fungsi,
  CASE WHEN acl.grantee = 0 THEN 'PUBLIC'
       ELSE pg_get_userbyid(acl.grantee) END AS pemegang_hak,
  acl.privilege_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
WHERE n.nspname = 'public'
  AND p.proname IN ('ambil_identitas_nik', 'is_admin', 'cek_riwayat_nik', 'simpan_skrining')
ORDER BY p.proname, pemegang_hak;

-- (c) Seluruh fungsi SECURITY DEFINER wajib punya search_path.
SELECT
  p.proname AS fungsi,
  p.prosecdef AS security_definer,
  p.proconfig AS config_search_path,
  CASE
    WHEN p.prosecdef AND p.proconfig IS NULL THEN 'RENTAN'
    WHEN p.prosecdef THEN 'AMAN'
    ELSE 'bukan SECURITY DEFINER'
  END AS status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('ambil_identitas_nik', 'is_admin', 'cek_riwayat_nik', 'simpan_skrining')
ORDER BY p.proname;

-- (d) is_admin() di SQL Editor mengembalikan FALSE (bukan NULL), karena
--     SQL Editor tidak berjalan melalui auth. FALSE = perilaku benar.
SELECT public.is_admin() AS is_admin_di_sql_editor;

-- (e) Jumlah baris tidak berubah. Harus tetap 96.
SELECT COUNT(*) AS total_baris_screenings FROM public.screenings;


-- ================================================================
-- UJI DARI LUAR — WAJIB. Ini satu-satunya bukti yang sah.
--
-- SQL Editor berjalan sebagai pemilik basis data, sehingga TIDAK dapat
-- membuktikan apa yang dilihat peran anon.
--
-- Ganti <ANON_KEY> dan <PROJECT_REF>, lalu jalankan di terminal:
--
--   curl -s -o /dev/null -w "%{http_code}\n" -X POST \
--     "https://<PROJECT_REF>.supabase.co/rest/v1/rpc/ambil_identitas_nik" \
--     -H "apikey: <ANON_KEY>" \
--     -H "Authorization: Bearer <ANON_KEY>" \
--     -H "Content-Type: application/json" \
--     -d '{"p_nik":"abc"}'
--
--   SEBELUM perbaikan : 200   (kebocoran — gate terlewati)
--   SESUDAH perbaikan : 401 atau 403 dengan kode 42501
--
-- Gate 90 hari harus TETAP berfungsi untuk anon:
--
--   curl -s -X POST \
--     "https://<PROJECT_REF>.supabase.co/rest/v1/rpc/cek_riwayat_nik" \
--     -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>" \
--     -H "Content-Type: application/json" \
--     -d '{"p_nik":"6109XXXXXXXXXXXX"}'
--
--   Harus 200 dan HANYA memuat 3 kolom tanggal.
--
-- Lalu uji melalui aplikasi:
--   1. Formulir publik masih dapat menyimpan skrining.
--   2. Dashboard admin masih menampilkan data.
--   3. Autofill NIK bekerja saat login admin, dan TIDAK bekerja
--      saat tidak login.
-- ================================================================
