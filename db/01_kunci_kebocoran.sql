-- ================================================================
-- 01_kunci_kebocoran.sql
--
-- TUJUAN: menutup kebocoran data pasien (PHI) yang AKTIF saat ini.
--
-- MASALAH YANG DIPERBAIKI
-- -----------------------
-- Fungsi cek_riwayat_nik() saat ini mengembalikan 19 kolom, termasuk
-- nama_lengkap, tanggal_lahir, jenis_kelamin, nomor_hp, alamat,
-- kecamatan, desa, pendidikan, pekerjaan, nama_sekolah, dan
-- tingkat_risiko.
--
-- Fungsi itu SECURITY DEFINER (menembus RLS) dan dapat dipanggil oleh
-- peran `anon`. Anon key aplikasi ada di dalam bundle JavaScript dan
-- dapat diambil siapa pun dari browser. Akibatnya, siapa pun dapat
-- mengirim NIK apa saja dan menerima identitas lengkap beserta hasil
-- skrining kesehatan jiwa orang tersebut.
--
-- Client sebenarnya hanya memakai SATU field: tanggal_skrining
-- (src/views/Identitas.vue), untuk menghitung masa jeda 90 hari.
--
-- YANG DILAKUKAN SKRIP INI
-- ------------------------
--  1. Mempersempit cek_riwayat_nik() menjadi 3 kolom non-identitas
--     yang cukup untuk gate 90 hari.
--  2. Memindahkan perhitungan 90 hari ke dalam fungsi (server), bukan
--     lagi dihitung di browser.
--  3. Menambahkan SET search_path pada fungsi SECURITY DEFINER yang
--     belum memilikinya (mitigasi privilege escalation).
--  4. Mencabut EXECUTE dari PUBLIC, lalu memberikannya secara eksplisit
--     hanya kepada anon dan authenticated.
--
-- YANG TIDAK DILAKUKAN
-- --------------------
--  - TIDAK menghapus, mengubah, atau memindahkan satu baris data pun.
--  - TIDAK menyentuh tabel screenings.
--  - TIDAK mengubah logika skoring.
--
-- CARA PAKAI
-- ----------
--  1. Jalankan db/00c_sebelum_kunci.sql untuk mencatat kondisi awal.
--  2. Jalankan SELURUH berkas ini di Supabase SQL Editor.
--  3. Jalankan blok VERIFIKASI di bagian bawah berkas ini.
--  4. Deploy perubahan client (src/views/Identitas.vue) SETELAH ini.
--
-- URUTAN PENTING: fungsi lama mengembalikan 19 kolom, fungsi baru 3
-- kolom. Client versi lama hanya membaca `tanggal_skrining`, yang tetap
-- ada di kontrak baru, sehingga client lama TIDAK rusak oleh skrip ini.
-- Jadi aman menjalankan SQL ini lebih dulu, deploy client kemudian.
-- ================================================================


-- ── LANGKAH 1: ganti cek_riwayat_nik dengan versi minimal ────────
--
-- Tipe kembalian berubah, jadi fungsi lama harus di-DROP lebih dulu.
-- CREATE OR REPLACE tidak dapat mengubah signature RETURNS TABLE.
DROP FUNCTION IF EXISTS public.cek_riwayat_nik(TEXT);

CREATE FUNCTION public.cek_riwayat_nik(p_nik TEXT)
RETURNS TABLE (
  -- Tanggal skrining terakhir. Satu-satunya field yang dipakai client.
  tanggal_skrining TEXT,
  -- Tanggal paling awal NIK ini boleh diskrining lagi.
  tanggal_boleh_skrining_ulang TEXT,
  -- Keputusan gate 90 hari, dihitung di server.
  boleh_skrining_ulang BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
-- WAJIB pada SECURITY DEFINER: tanpa ini, peran yang dapat membuat
-- objek di schema lain berpotensi membajak resolusi nama dan
-- mengeksekusi SQL sebagai pemilik fungsi.
SET search_path TO 'public', 'pg_temp'
AS $function$
  -- Hanya kembalikan 1 baris (skrining terakhir). Tidak ada riwayat
  -- lengkap, tidak ada identitas, tidak ada tingkat risiko.
  --
  -- Catatan privasi yang masih tersisa: fungsi ini tetap membocorkan
  -- "apakah NIK ini pernah diskrining" kepada pemanggil anonim. Itu
  -- konsekuensi tak terhindarkan dari gate 90 hari di form publik.
  -- Penutupan penuh memerlukan pemindahan gate ke dalam
  -- simpan_skrining() disertai rate limit / CAPTCHA — dikerjakan
  -- terpisah. Yang ditutup di sini adalah kebocoran identitas.
  SELECT
    LEFT(s.tanggal_skrining::TEXT, 10) AS tanggal_skrining,
    LEFT((s.tanggal_skrining::DATE + INTERVAL '90 days')::TEXT, 10)
      AS tanggal_boleh_skrining_ulang,
    CURRENT_DATE >= (s.tanggal_skrining::DATE + INTERVAL '90 days')::DATE
      AS boleh_skrining_ulang
  FROM public.screenings AS s
  WHERE TRIM(s.nik::TEXT) = TRIM(p_nik)
    AND COALESCE(s.is_valid, TRUE) = TRUE
  ORDER BY s.tanggal_skrining DESC
  LIMIT 1;
$function$;

COMMENT ON FUNCTION public.cek_riwayat_nik(TEXT) IS
  'Gate jeda 90 hari untuk form skrining publik. Sengaja HANYA '
  'mengembalikan data tanggal — JANGAN tambahkan kolom identitas '
  '(nama, alamat, nomor HP) atau tingkat_risiko: fungsi ini dapat '
  'dipanggil oleh peran anon dan bersifat SECURITY DEFINER.';


-- ── LANGKAH 2: kunci search_path pada simpan_skrining ────────────
--
-- Fungsi ini SECURITY DEFINER tanpa search_path. Tidak perlu
-- mengubah isinya, cukup memasang konfigurasinya.
ALTER FUNCTION public.simpan_skrining(JSONB)
  SET search_path TO 'public', 'pg_temp';


-- ── LANGKAH 3: kunci search_path pada is_admin ───────────────────
--
-- is_admin() hanya membandingkan auth.uid() dengan sebuah UUID, jadi
-- tidak menyentuh tabel dan aman dipakai di policy RLS (tidak ada
-- rekursi). Tetap perlu search_path karena SECURITY DEFINER.
--
-- CATATAN: UUID admin masih di-hardcode di dalam fungsi ini. Bila
-- akun tersebut hilang, TIDAK ADA yang dapat membuka dashboard.
-- Perbaikannya (tabel admin) dikerjakan terpisah agar langkah ini
-- tetap kecil dan mudah dibatalkan.
ALTER FUNCTION public.is_admin()
  SET search_path TO 'public', 'pg_temp';


-- ── LANGKAH 4: rapikan hak EXECUTE ───────────────────────────────
--
-- PostgreSQL memberi EXECUTE kepada PUBLIC secara default pada setiap
-- fungsi baru. GRANT ke anon menjadi tidak bermakna selama PUBLIC
-- masih memegang hak yang sama. Cabut dulu, lalu beri eksplisit.
REVOKE EXECUTE ON FUNCTION public.cek_riwayat_nik(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.simpan_skrining(JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;

-- Form skrining publik tidak memerlukan login, jadi anon tetap perlu
-- memanggil kedua fungsi ini.
GRANT EXECUTE ON FUNCTION public.cek_riwayat_nik(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.simpan_skrining(JSONB) TO anon, authenticated;

-- is_admin() dipakai oleh router guard SETELAH login, dan akan dipakai
-- oleh policy RLS. Anon tidak perlu memanggilnya.
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- ================================================================
-- VERIFIKASI — jalankan setelah skrip di atas selesai.
-- Semua perintah di bawah hanya membaca.
-- ================================================================

-- (a) Ketiga fungsi WAJIB punya search_path.
--     Kolom config_search_path tidak boleh NULL.
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
  AND p.proname IN ('simpan_skrining', 'is_admin', 'cek_riwayat_nik')
ORDER BY p.proname;

-- (b) cek_riwayat_nik WAJIB hanya mengembalikan 3 kolom tanggal.
--     Tidak boleh ada nama_lengkap / alamat / nomor_hp / tingkat_risiko.
SELECT
  p.proname AS fungsi,
  pg_get_function_result(p.oid) AS kolom_kembalian
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'cek_riwayat_nik';

-- (c) PUBLIC tidak boleh lagi muncul sebagai pemegang EXECUTE.
SELECT
  p.proname AS fungsi,
  CASE WHEN acl.grantee = 0 THEN 'PUBLIC'
       ELSE pg_get_userbyid(acl.grantee) END AS pemegang_hak,
  acl.privilege_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
WHERE n.nspname = 'public'
  AND p.proname IN ('simpan_skrining', 'is_admin', 'cek_riwayat_nik')
ORDER BY p.proname, pemegang_hak;

-- (d) Uji fungsional: gate 90 hari masih bekerja.
--     Ganti NIK di bawah dengan NIK yang benar-benar ada di tabel.
--     Harus mengembalikan tepat 1 baris berisi 3 kolom tanggal.
-- SELECT * FROM public.cek_riwayat_nik('6109XXXXXXXXXXXX');

-- (e) Jumlah baris HARUS tetap sama seperti sebelum skrip dijalankan.
--     Bandingkan dengan hasil db/00c_sebelum_kunci.sql.
SELECT COUNT(*) AS total_baris_screenings FROM public.screenings;
