-- ================================================================
-- 05_tabel_admin.sql
--
-- TUJUAN: menghapus satu titik kegagalan tunggal pada akses dashboard.
--
-- MASALAH
-- -------
-- is_admin() saat ini membandingkan auth.uid() dengan satu UUID yang
-- ditulis langsung di dalam fungsi:
--
--     SELECT COALESCE(auth.uid() = '7b169563-...'::uuid, FALSE);
--
-- Akibatnya:
--   - Hanya SATU akun yang dapat membuka dashboard.
--   - Bila akun itu terhapus, pemiliknya pindah tugas, atau UUID-nya
--     berubah, TIDAK ADA seorang pun yang dapat mengakses data pasien.
--   - Menambah atau mengganti admin memerlukan akses SQL Editor dan
--     penulisan ulang fungsi (DDL) — bukan pekerjaan yang wajar untuk
--     tugas administratif sehari-hari.
--
-- SOLUSI: tabel admin_users. Menambah atau mencabut admin menjadi
-- sekadar INSERT / UPDATE satu baris.
--
-- YANG TIDAK DILAKUKAN
-- --------------------
--  - TIDAK mengubah, menghapus, atau memindahkan satu baris data
--    pasien pun. Tabel screenings tidak disentuh.
--  - TIDAK mengubah tanda tangan is_admin(), sehingga seluruh policy
--    RLS di 03_rls.sql tetap berlaku tanpa perlu diubah.
--
-- ================================================================
-- PENTING — URUTAN AMAN
-- ================================================================
-- Skrip ini MEMASUKKAN UUID admin yang sekarang ke dalam tabel LEBIH
-- DAHULU, baru kemudian mengubah is_admin() untuk membaca tabel itu.
-- Dengan urutan ini akses admin tidak pernah terputus.
--
-- Jalankan SELURUH berkas dalam SATU kali eksekusi (satu transaksi),
-- jangan sepotong-sepotong.
-- ================================================================

BEGIN;

-- ── LANGKAH 1: tabel daftar admin ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  -- Merujuk akun Supabase Auth. ON DELETE CASCADE: bila akunnya
  -- dihapus, barisnya ikut hilang sehingga tidak ada admin "hantu".
  user_id    UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  -- Email disimpan hanya agar daftar admin dapat dibaca manusia.
  -- Bukan sumber kebenaran; yang menentukan tetap user_id.
  email      TEXT,
  -- Nama petugas, untuk keperluan audit.
  nama       TEXT,
  -- Pencabutan akses dilakukan dengan aktif = FALSE, BUKAN DELETE,
  -- agar jejak siapa yang pernah menjadi admin tetap ada.
  aktif      BOOLEAN NOT NULL DEFAULT TRUE,
  dibuat_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  catatan    TEXT
);

COMMENT ON TABLE public.admin_users IS
  'Daftar akun yang boleh mengakses dashboard. Dibaca oleh is_admin(), '
  'yang menjadi dasar seluruh policy RLS pada tabel screenings. '
  'Cabut akses dengan aktif = FALSE, jangan DELETE, agar jejak audit '
  'tetap ada.';

-- Indeks untuk pencarian admin aktif.
CREATE INDEX IF NOT EXISTS idx_admin_users_aktif
  ON public.admin_users (user_id) WHERE aktif;


-- ── LANGKAH 2: pindahkan admin yang sekarang ke dalam tabel ──────
-- WAJIB dijalankan SEBELUM is_admin() diubah, agar akses tidak
-- terputus. UUID di bawah adalah nilai yang sebelumnya ditulis
-- langsung di dalam is_admin().
INSERT INTO public.admin_users (user_id, email, nama, catatan)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'Dipindahkan dari UUID yang sebelumnya di-hardcode di is_admin().'
FROM auth.users AS u
WHERE u.id = '7b169563-8103-4c01-aef0-f3f22857b4ea'::uuid
ON CONFLICT (user_id) DO NOTHING;

-- Pemeriksaan keselamatan: bila tabel kosong, seluruh transaksi
-- dibatalkan. Tanpa ini, is_admin() akan selalu FALSE dan dashboard
-- terkunci untuk semua orang.
DO $$
DECLARE
  v_jumlah INT;
BEGIN
  SELECT COUNT(*) INTO v_jumlah FROM public.admin_users WHERE aktif;
  IF v_jumlah = 0 THEN
    RAISE EXCEPTION
      'Dibatalkan: tidak ada admin aktif di admin_users. Mengubah is_admin() sekarang akan mengunci dashboard untuk semua orang. Periksa apakah UUID admin masih ada di auth.users.';
  END IF;
  RAISE NOTICE 'Admin aktif terdaftar: % baris.', v_jumlah;
END;
$$;


-- ── LANGKAH 3: is_admin() membaca tabel ──────────────────────────
--
-- CATATAN REKURSI — penting.
-- Fungsi ini dipakai di dalam policy RLS pada tabel screenings.
-- Ia membaca admin_users, dan admin_users SENGAJA TIDAK memakai RLS
-- yang bergantung pada is_admin() (lihat langkah 4). Bila kelak RLS
-- pada admin_users dibuat memakai is_admin(), akan terjadi rekursi
-- tak berujung dan SELURUH dashboard mati.
--
-- SECURITY DEFINER membuat fungsi berjalan sebagai pemiliknya,
-- sehingga dapat membaca admin_users tanpa memberi hak baca kepada
-- pengguna biasa.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
  -- COALESCE wajib: bagi pemanggil anonim auth.uid() adalah NULL, dan
  -- tanpa COALESCE hasilnya NULL yang akan melewati pemeriksaan
  -- IF NOT ... di sisi pemanggil.
  SELECT COALESCE(
    EXISTS (
      SELECT 1
      FROM public.admin_users AS a
      WHERE a.user_id = auth.uid()
        AND a.aktif
    ),
    FALSE
  );
$function$;

COMMENT ON FUNCTION public.is_admin() IS
  'TRUE bila auth.uid() terdaftar aktif di admin_users. Dasar seluruh '
  'policy RLS pada screenings. JANGAN membuat RLS pada admin_users '
  'yang memakai is_admin() — itu menimbulkan rekursi dan mematikan '
  'dashboard.';

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- ── LANGKAH 4: kunci tabel admin_users ───────────────────────────
--
-- Tabel ini menentukan siapa yang boleh melihat seluruh data pasien,
-- sehingga tidak boleh dapat dibaca atau diubah dari aplikasi.
-- Pengelolaannya HANYA melalui SQL Editor sebagai pemilik.
--
-- RLS diaktifkan TANPA policy apa pun: artinya semua akses melalui
-- API ditolak secara baku, sementara pemilik (SQL Editor) dan fungsi
-- SECURITY DEFINER seperti is_admin() tetap dapat membacanya.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.admin_users FROM PUBLIC;
REVOKE ALL ON TABLE public.admin_users FROM anon;
REVOKE ALL ON TABLE public.admin_users FROM authenticated;

COMMIT;


-- ================================================================
-- VERIFIKASI — jalankan setelah transaksi di atas berhasil.
-- ================================================================

-- (a) Daftar admin. Harus memuat minimal satu baris aktif.
SELECT user_id, email, nama, aktif, dibuat_at
FROM public.admin_users
ORDER BY dibuat_at;

-- (b) is_admin() sudah membaca tabel, bukan UUID hardcode.
--     Definisinya harus memuat 'admin_users'.
SELECT
  CASE
    WHEN pg_get_functiondef(p.oid) LIKE '%admin_users%' THEN 'SUDAH memakai tabel'
    ELSE 'MASIH UUID hardcode'
  END AS status_is_admin
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'is_admin';

-- (c) Di SQL Editor, is_admin() WAJIB mengembalikan FALSE, bukan NULL.
--     SQL Editor tidak berjalan melalui auth, jadi FALSE = benar.
SELECT public.is_admin() AS is_admin_di_sql_editor;

-- (d) anon dan authenticated tidak boleh punya hak apa pun di
--     admin_users. Kueri ini idealnya mengembalikan NOL baris.
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'admin_users'
  AND grantee IN ('anon', 'authenticated', 'PUBLIC');

-- (e) RLS aktif di admin_users.
SELECT c.relrowsecurity AS rls_aktif
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'admin_users';

-- (f) Data pasien tidak tersentuh. Harus tetap 96.
SELECT COUNT(*) AS total_baris_screenings FROM public.screenings;


-- ================================================================
-- CARA MENGELOLA ADMIN
-- ================================================================
-- Semua perintah di bawah dijalankan di Supabase SQL Editor.
--
-- MENAMBAH ADMIN BARU
-- 1. Buat akunnya lebih dahulu: Supabase Dashboard -> Authentication
--    -> Users -> Add user (isi email dan sandi).
-- 2. Daftarkan berdasarkan email:
--
--    INSERT INTO public.admin_users (user_id, email, nama, catatan)
--    SELECT id, email, 'Nama Petugas', 'Ditambahkan <tanggal>'
--    FROM auth.users WHERE email = 'petugas@contoh.id'
--    ON CONFLICT (user_id) DO UPDATE SET aktif = TRUE;
--
-- MENCABUT AKSES  (jangan DELETE — jejak audit harus tetap ada)
--
--    UPDATE public.admin_users SET aktif = FALSE
--    WHERE email = 'petugas@contoh.id';
--
-- MEMULIHKAN AKSES
--
--    UPDATE public.admin_users SET aktif = TRUE
--    WHERE email = 'petugas@contoh.id';
--
-- MELIHAT DAFTAR ADMIN
--
--    SELECT email, nama, aktif, dibuat_at FROM public.admin_users
--    ORDER BY aktif DESC, dibuat_at;
--
-- ================================================================
-- BILA DASHBOARD TERKUNCI UNTUK SEMUA ORANG
-- ================================================================
-- Penyebab paling mungkin: tidak ada baris aktif di admin_users, atau
-- user_id tidak cocok dengan akun yang dipakai login.
--
-- Periksa UUID akun yang benar:
--
--    SELECT id, email, last_sign_in_at FROM auth.users
--    ORDER BY last_sign_in_at DESC NULLS LAST;
--
-- lalu daftarkan UUID tersebut memakai perintah INSERT di atas.
--
-- Data pasien tidak pernah terpengaruh oleh perubahan izin di berkas
-- ini — bila dashboard kosong, datanya tetap utuh dan hanya tidak
-- terlihat sampai admin terdaftar dengan benar.
-- ================================================================
