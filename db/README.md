# Skrip Basis Data

Berkas SQL untuk Supabase. Jalankan di **Supabase Dashboard → SQL Editor**.

Aplikasi ini mengolah data kesehatan jiwa pasien nyata. Setiap berkas di
sini memuat blok verifikasi dan cara membatalkan; **jangan menjalankan
berkas apa pun tanpa membaca bagian atasnya lebih dahulu.**

## Urutan penerapan

Berkas bernomor dijalankan berurutan. Nomor menunjukkan urutan, bukan
kewajiban menjalankan semuanya sekaligus.

| Berkas | Tujuan | Status |
|---|---|---|
| `00_diagnostik.sql` | Memetakan kondisi keamanan. Hanya membaca. | alat bantu |
| `00c_sebelum_kunci.sql` | Mencatat kondisi awal sebagai pembanding. Hanya membaca. | alat bantu |
| `01_kunci_kebocoran.sql` | Persempit `cek_riwayat_nik` 19 → 3 kolom; pasang `search_path`. | sudah dijalankan |
| `02_pisah_identitas.sql` | Tambah `ambil_identitas_nik` khusus admin. | sudah dijalankan |
| `03_rls.sql` | Cabut hak `anon` di tabel; aktifkan RLS. | sudah dijalankan |
| `04_perbaiki_gate_admin.sql` | Perbaiki `is_admin()` yang mengembalikan `NULL`; cabut EXECUTE dari `anon`. | sudah dijalankan |
| `05_tabel_admin.sql` | Ganti UUID hardcode dengan tabel `admin_users`. | **belum** |
| `06_migrasi_epds.sql` | Hitung ulang data EPDS historis sesuai juknis. | **belum** |

Berkas lama, sudah tidak dipakai langsung:

- `simpan_skrining.sql` — definisi RPC penulisan. Rujukan; versi
  produksi lebih maju dan memuat `kesimpulan_klinis`.
- `cek_riwayat_nik.sql` — versi 19 kolom. **Jangan dijalankan**, sudah
  digantikan `01_kunci_kebocoran.sql`.
- `fix_risiko_lama.sql` — migrasi enum lama. Sudah dijalankan; memuat
  cacat (memetakan `'DEPRESI'` PHQ-4 ke High Risk tanpa filter
  instrumen). Digantikan `06_migrasi_epds.sql`.

## Sebelum menjalankan berkas yang mengubah apa pun

1. **Ambil backup CSV** tabel `screenings`. SQL Editor → `SELECT * FROM
   screenings` → Download CSV. Simpan **di luar** folder repo — berisi
   data pasien, dan `.gitignore` tidak melindungi dari `git add -f`.
2. **Catat jumlah baris**: `SELECT COUNT(*) FROM screenings;`
   Bandingkan setelah selesai. Tidak satu pun skrip di sini boleh
   mengubah jumlah baris.
3. Jalankan **seluruh** berkas dalam satu kali eksekusi, bukan
   sepotong-sepotong — beberapa dibungkus transaksi.

## Dua hal yang tidak bisa dibuktikan dari SQL Editor

**Apa yang dilihat peran `anon`.** SQL Editor berjalan sebagai pemilik
basis data, sehingga selalu lolos setiap pemeriksaan. Pengujian sah
harus dari luar:

```bash
# Harus 42501 — bukan 200, bukan 23502
curl -s -X POST "https://<PROJECT_REF>.supabase.co/rest/v1/rpc/ambil_identitas_nik" \
  -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" -d '{"p_nik":"abc"}'
```

**Bahwa dashboard masih berfungsi.** Harus dibuka dan dilihat sendiri.
Data tetap utuh walau tidak terlihat, tetapi dashboard kosong berarti
`is_admin()` tidak cocok dengan akun yang login.

## Kesalahan yang pernah terjadi — jangan diulang

**`NULL` bukan `FALSE` di SQL.** `is_admin()` semula berisi
`auth.uid() = '<uuid>'::uuid`. Bagi pemanggil anonim `auth.uid()`
bernilai `NULL`, dan `NULL = uuid` menghasilkan `NULL`. Akibatnya
`IF NOT is_admin() THEN RAISE ...` menjadi `IF NULL` yang **tidak masuk
cabang**, sehingga gate dilewati sepenuhnya. Selalu bungkus dengan
`COALESCE(..., FALSE)` dan periksa memakai `IS NOT TRUE`.

**`REVOKE FROM PUBLIC` tidak cukup di Supabase.** Supabase memberi
`EXECUTE` **langsung** kepada peran `anon` dan `authenticated` untuk
setiap fungsi baru di schema `public`. Mencabut dari `PUBLIC` tidak
menyentuh pemberian langsung itu. Cabut dari `anon` secara eksplisit.

**`SECURITY DEFINER` tanpa `SET search_path`** adalah jalur peningkatan
hak. Setiap fungsi `SECURITY DEFINER` di sini wajib memuat
`SET search_path TO 'public', 'pg_temp'`.

**Rekursi RLS.** `is_admin()` dipakai di dalam policy tabel
`screenings`. Setelah `05_tabel_admin.sql`, fungsi itu membaca tabel
`admin_users`. **Jangan** membuat policy RLS pada `admin_users` yang
memakai `is_admin()` — itu menimbulkan rekursi tak berujung dan
mematikan seluruh dashboard.

## Arsitektur akses yang berlaku

```
Formulir publik (anon)
  └─ simpan_skrining()      SECURITY DEFINER, menghitung skor di server
  └─ cek_riwayat_nik()      3 kolom tanggal saja, untuk gate 90 hari

Dashboard (authenticated + terdaftar di admin_users)
  └─ SELECT/DELETE screenings   lewat policy RLS is_admin()
  └─ ambil_identitas_nik()      identitas lengkap, untuk autofill
```

Peran `anon` **tidak memegang hak apa pun** di tabel `screenings`.
Penulisan hanya melalui RPC, sehingga skor selalu dihitung di server dan
tidak dapat dimanipulasi dari perangkat pasien.

## Mengelola admin

Setelah `05_tabel_admin.sql` dijalankan, penambahan admin tidak lagi
memerlukan penulisan ulang fungsi:

```sql
-- Buat akunnya lebih dahulu di Authentication → Users, lalu:
INSERT INTO public.admin_users (user_id, email, nama, catatan)
SELECT id, email, 'Nama Petugas', 'Ditambahkan <tanggal>'
FROM auth.users WHERE email = 'petugas@contoh.id'
ON CONFLICT (user_id) DO UPDATE SET aktif = TRUE;

-- Mencabut akses. Jangan DELETE — jejak audit harus tetap ada.
UPDATE public.admin_users SET aktif = FALSE WHERE email = 'petugas@contoh.id';
```

## Sinkronisasi dengan kode aplikasi

Ambang klinis ada di **dua tempat** dan wajib sama:

- `src/utils/skoring.js` — menentukan yang **dilihat** pasien
- `db/simpan_skrining.sql` — menentukan yang **disimpan** ke basis data

Bila berbeda, surat rujukan dan laporan akan bertentangan dengan hasil di
layar. `tests/kontrak-jawaban.test.js` membaca berkas SQL sebagai teks
dan menjaga keduanya tetap sinkron; jalankan `npm test` setelah mengubah
salah satunya.

Rujukan juknis ada di folder `panduan/`:
- MMYS V.1 — KJ.02.02/B.III/1107/2025
- PHQ-4 dan EPDS — KJ.02.05/B.III/92/2025
