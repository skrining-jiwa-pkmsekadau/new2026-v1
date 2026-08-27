-- ================================================================
-- 02_pisah_identitas.sql
--
-- TUJUAN: memulihkan fitur autofill identitas TANPA membuka kembali
-- kebocoran data pasien.
--
-- LATAR BELAKANG
-- --------------
-- 01_kunci_kebocoran.sql mempersempit cek_riwayat_nik() menjadi 3 kolom
-- tanggal, karena versi 19-kolom dapat dipanggil oleh peran `anon` dan
-- membocorkan nama, tanggal lahir, nomor HP, alamat, serta tingkat
-- risiko untuk NIK apa pun.
--
-- Efek sampingnya: fitur autofill di src/views/Identitas.vue
-- (isiIdentitasDariRiwayat) kehilangan sumber datanya dan berhenti
-- bekerja.
--
-- SOLUSI: dua fungsi dengan tingkat akses berbeda.
--
--   cek_riwayat_nik(p_nik)       anon boleh      3 kolom tanggal
--                                                gate jeda 90 hari
--
--   ambil_identitas_nik(p_nik)   HANYA admin     identitas lengkap
--                                                autofill formulir
--
-- KONSEKUENSI YANG DISENGAJA
-- --------------------------
-- Autofill hanya bekerja bila petugas login sebagai admin. Pasien yang
-- mengisi formulir sendiri tanpa login TIDAK mendapat autofill.
--
-- Itu memang seharusnya: mengisi otomatis nama, alamat, dan nomor HP
-- seseorang hanya dari NIK adalah kebocoran data, bukan fitur — siapa
-- pun yang mengetahui NIK orang lain dapat memanen identitasnya.
--
-- DUA LAPIS PENGAMANAN
-- --------------------
--  1. GRANT EXECUTE hanya kepada `authenticated` (bukan `anon`).
--  2. Pemeriksaan is_admin() DI DALAM fungsi. Lapis kedua ini penting:
--     `authenticated` mencakup SETIAP pengguna yang berhasil login,
--     bukan hanya admin. Tanpa lapis ini, akun biasa apa pun dapat
--     memanen identitas pasien.
--
-- YANG TIDAK DILAKUKAN
-- --------------------
--  - TIDAK mengubah, menghapus, atau memindahkan satu baris data pun.
--  - TIDAK menyentuh cek_riwayat_nik (tetap seperti hasil 01).
--  - TIDAK mengubah logika skoring.
--
-- CARA PAKAI
-- ----------
--  1. Jalankan SELURUH berkas ini di Supabase SQL Editor.
--  2. Jalankan blok VERIFIKASI di bagian bawah.
--  3. Deploy client, lalu uji autofill dalam keadaan login sebagai admin.
-- ================================================================


-- ── Fungsi baru: identitas lengkap, khusus admin ─────────────────
DROP FUNCTION IF EXISTS public.ambil_identitas_nik(TEXT);

CREATE FUNCTION public.ambil_identitas_nik(p_nik TEXT)
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
-- WAJIB pada SECURITY DEFINER: mencegah pembajakan resolusi nama objek.
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Lapis kedua: `authenticated` mencakup semua pengguna yang login,
  -- jadi keanggotaan admin harus diperiksa secara eksplisit di sini.
  IF NOT public.is_admin() THEN
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
  'Identitas lengkap pasien untuk autofill formulir. HANYA untuk admin: '
  'GRANT terbatas ke authenticated DAN memeriksa is_admin() di dalam '
  'fungsi. JANGAN pernah memberi EXECUTE kepada anon — itu akan '
  'mengubahnya menjadi alat pemanen identitas dari NIK.';


-- ── Hak akses ────────────────────────────────────────────────────
-- PostgreSQL memberi EXECUTE kepada PUBLIC secara default pada fungsi
-- baru; cabut lebih dulu agar GRANT di bawah benar-benar bermakna.
REVOKE EXECUTE ON FUNCTION public.ambil_identitas_nik(TEXT) FROM PUBLIC;

-- anon TIDAK diberi hak apa pun di fungsi ini.
GRANT EXECUTE ON FUNCTION public.ambil_identitas_nik(TEXT) TO authenticated;


-- ================================================================
-- VERIFIKASI — semua perintah di bawah hanya membaca.
-- ================================================================

-- (a) Fungsi ada, SECURITY DEFINER, dan search_path terpasang.
SELECT
  p.proname                   AS fungsi,
  p.prosecdef                 AS security_definer,
  p.proconfig                 AS config_search_path,
  CASE
    WHEN p.prosecdef AND p.proconfig IS NULL THEN 'RENTAN — search_path belum dipasang'
    WHEN p.prosecdef THEN 'AMAN'
    ELSE 'bukan SECURITY DEFINER'
  END AS status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('cek_riwayat_nik', 'ambil_identitas_nik', 'simpan_skrining', 'is_admin')
ORDER BY p.proname;

-- (b) anon TIDAK boleh muncul untuk ambil_identitas_nik.
--     PUBLIC juga tidak boleh muncul.
SELECT
  p.proname AS fungsi,
  CASE WHEN acl.grantee = 0 THEN 'PUBLIC'
       ELSE pg_get_userbyid(acl.grantee) END AS pemegang_hak,
  acl.privilege_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
WHERE n.nspname = 'public'
  AND p.proname IN ('cek_riwayat_nik', 'ambil_identitas_nik')
ORDER BY p.proname, pemegang_hak;

-- (c) Uji fungsional sebagai admin di SQL Editor.
--     Ganti NIK dengan NIK yang benar-benar ada. Karena SQL Editor
--     berjalan sebagai pemilik (bukan lewat auth), is_admin() akan
--     mengembalikan FALSE dan fungsi ini WAJIB menolak.
--     Penolakan itu justru bukti pengamanannya bekerja.
-- SELECT * FROM public.ambil_identitas_nik('6109XXXXXXXXXXXX');

-- (d) cek_riwayat_nik tetap hanya 3 kolom tanggal.
SELECT pg_get_function_result(p.oid) AS kolom_kembalian_cek_riwayat
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'cek_riwayat_nik';

-- (e) Jumlah baris tidak berubah.
SELECT COUNT(*) AS total_baris_screenings FROM public.screenings;
