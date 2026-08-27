-- ================================================================
-- 03_rls.sql
--
-- TUJUAN: mencegah kemungkinan SELURUH DATA PASIEN dihapus atau dibaca
-- oleh siapa pun yang memegang anon key.
--
-- MASALAH YANG DIPERBAIKI
-- -----------------------
-- Hasil audit privilege tabel screenings menunjukkan peran `anon`
-- memegang: DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE,
-- UPDATE.
--
-- Anon key aplikasi ada di dalam bundle JavaScript dan dapat diambil
-- siapa pun dari browser dalam satu permintaan. Dengan hak TRUNCATE dan
-- DELETE di atas, pemegang key itu secara teknis dapat menghapus
-- seluruh data pasien.
--
-- Sudah dikonfirmasi bahwa RLS belum menghalangi: permintaan
--   POST /rest/v1/screenings  dengan body {}
-- dijawab 23502 (pelanggaran NOT NULL), BUKAN 42501 (pelanggaran
-- policy). Artinya permintaan itu lolos pemeriksaan keamanan dan hanya
-- berhenti di constraint kolom.
--
-- Data belum hilang semata-mata karena belum ada yang mencoba.
--
-- MENGAPA anon TIDAK PERLU HAK APA PUN
-- ------------------------------------
-- Formulir publik menulis melalui RPC simpan_skrining() yang
-- SECURITY DEFINER — fungsi itu berjalan sebagai pemiliknya, sehingga
-- INSERT tetap berhasil meskipun anon tidak punya hak di tabel.
-- Pembacaan riwayat juga lewat RPC (cek_riwayat_nik). Dashboard admin
-- membaca sebagai `authenticated`, bukan `anon`.
--
-- YANG TIDAK DILAKUKAN
-- --------------------
--  - TIDAK ada DELETE, TRUNCATE, DROP, atau UPDATE terhadap data.
--  - Hanya izin dan policy yang berubah. Seluruh baris tetap utuh.
--
-- ================================================================
-- PERIKSA INI SEBELUM MENJALANKAN
-- ================================================================
-- Setelah RLS aktif, dashboard membaca data HANYA jika is_admin()
-- mengembalikan TRUE untuk akun yang login. is_admin() saat ini
-- membandingkan auth.uid() dengan satu UUID yang ditulis langsung di
-- dalam fungsi.
--
-- LANGKAH WAJIB: login ke dashboard aplikasi, lalu jalankan di
-- SQL Editor:
--
--     SELECT auth.uid();
--
-- Bila hasilnya BUKAN UUID yang ada di dalam is_admin(), JANGAN
-- lanjutkan — dashboard akan berhenti menampilkan data. Perbaiki dulu
-- UUID di is_admin(), atau ganti dengan tabel admin.
--
-- Bila terjadi kesalahan: data TETAP UTUH, hanya tidak terlihat.
-- Cara membatalkan ada di blok ROLLBACK di bagian bawah berkas ini.
--
-- AMBIL BACKUP CSV TERBARU SEBELUM MENJALANKAN.
-- ================================================================


-- ── LANGKAH 1: cabut seluruh hak tabel dari anon ─────────────────
-- Termasuk TRUNCATE dan DELETE. Formulir publik tidak memerlukannya
-- karena menulis lewat RPC SECURITY DEFINER.
REVOKE ALL ON TABLE public.screenings FROM anon;

-- PUBLIC juga dicabut: hak yang diberikan ke PUBLIC berlaku bagi setiap
-- peran, sehingga membuat REVOKE di atas tidak bermakna bila dilewatkan.
REVOKE ALL ON TABLE public.screenings FROM PUBLIC;

-- `authenticated` tetap memerlukan SELECT dan DELETE untuk dashboard.
-- Tanpa INSERT dan UPDATE: penulisan tetap harus lewat RPC agar skor
-- selalu dihitung di server dan tidak dapat dimanipulasi dari client.
REVOKE ALL ON TABLE public.screenings FROM authenticated;
GRANT SELECT, DELETE ON TABLE public.screenings TO authenticated;


-- ── LANGKAH 2: aktifkan Row Level Security ───────────────────────
-- Tanpa ini, hak tabel di atas adalah satu-satunya penghalang. Dengan
-- RLS aktif dan tanpa policy yang cocok, semua akses ditolak secara
-- baku (default deny).
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;


-- ── LANGKAH 3: policy khusus admin ───────────────────────────────
-- Dibuat idempoten: DROP IF EXISTS lebih dulu agar berkas ini aman
-- dijalankan berulang, apa pun kondisi awalnya.
--
-- is_admin() aman dipakai di sini: fungsi itu hanya membandingkan
-- auth.uid() dengan sebuah UUID dan TIDAK membaca tabel apa pun,
-- sehingga tidak menimbulkan rekursi dengan policy ini sendiri.
DROP POLICY IF EXISTS "admin_baca_screenings" ON public.screenings;
CREATE POLICY "admin_baca_screenings"
  ON public.screenings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_hapus_screenings" ON public.screenings;
CREATE POLICY "admin_hapus_screenings"
  ON public.screenings
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Sengaja TIDAK ada policy INSERT maupun UPDATE untuk peran mana pun.
-- Satu-satunya jalur penulisan adalah RPC simpan_skrining(), yang
-- SECURITY DEFINER sehingga menembus RLS sebagai pemiliknya.


-- ================================================================
-- VERIFIKASI — jalankan setelah skrip di atas selesai.
-- ================================================================

-- (a) RLS harus aktif.
SELECT
  c.relname AS tabel,
  c.relrowsecurity AS rls_aktif,
  CASE WHEN c.relrowsecurity THEN 'AMAN' ELSE 'RLS MASIH MATI' END AS status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'screenings';

-- (b) Policy terpasang untuk SELECT dan DELETE.
SELECT policyname, cmd, roles, qual AS using_expr
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'screenings'
ORDER BY cmd, policyname;

-- (c) anon TIDAK boleh punya hak apa pun. Kueri ini idealnya
--     mengembalikan NOL baris untuk anon.
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'screenings'
  AND grantee IN ('anon', 'authenticated', 'PUBLIC')
ORDER BY grantee, privilege_type;

-- (d) Jumlah baris WAJIB tetap sama seperti sebelum skrip dijalankan.
--     Bandingkan dengan hasil db/00c_sebelum_kunci.sql.
SELECT COUNT(*) AS total_baris_screenings FROM public.screenings;

-- (e) RPC penulisan masih berfungsi (instrumen sengaja tidak dikenali
--     agar fungsi menolak SEBELUM INSERT, jadi tidak ada data masuk).
--     Harus muncul pesan 'Instrumen tidak dikenali'. Bila justru muncul
--     galat izin, berarti langkah 1 terlalu ketat.
-- SELECT public.simpan_skrining('{"instrumen":"UJI_TOLAK","jawaban":[]}'::JSONB);


-- ================================================================
-- UJI DARI LUAR (jalankan di terminal, bukan di SQL Editor)
-- ================================================================
-- Ganti <ANON_KEY> dan <PROJECT_REF> sesuai proyek.
--
-- 1. INSERT anonim HARUS ditolak dengan kode 42501, bukan 23502:
--
--    curl -s -X POST \
--      "https://<PROJECT_REF>.supabase.co/rest/v1/screenings" \
--      -H "apikey: <ANON_KEY>" \
--      -H "Authorization: Bearer <ANON_KEY>" \
--      -H "Content-Type: application/json" \
--      -d '{}'
--
--    Sebelum: 23502 (null value ... violates not-null constraint)
--    Sesudah: 42501 (permission denied / violates row-level security)
--
-- 2. SELECT anonim harus ditolak atau kosong:
--
--    curl -s "https://<PROJECT_REF>.supabase.co/rest/v1/screenings?select=nik&limit=1" \
--      -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>"
--
-- 3. Formulir skrining publik di aplikasi HARUS tetap dapat menyimpan.
-- 4. Dashboard admin HARUS tetap dapat menampilkan data.
--
-- Poin 3 dan 4 wajib diuji melalui aplikasi, bukan hanya lewat SQL.


-- ================================================================
-- CARA MEMBATALKAN (hanya bila dashboard berhenti menampilkan data)
-- ================================================================
-- Menonaktifkan RLS memulihkan tampilan dashboard dengan segera, TETAPI
-- juga membuka kembali akses tulis anonim. Gunakan hanya sebagai
-- tindakan darurat sementara, lalu perbaiki is_admin() dan aktifkan
-- kembali RLS.
--
--   ALTER TABLE public.screenings DISABLE ROW LEVEL SECURITY;
--
-- Data tidak pernah terpengaruh oleh perubahan izin di berkas ini.
