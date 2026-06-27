# Database Scripts

Folder berisi SQL scripts untuk Supabase. Jalankan di **Supabase SQL Editor**.

## File

- `simpan_skrining.sql` - RPC function untuk menyimpan data skrining (skor dihitung di server)
- `cek_riwayat_nik.sql` - RPC function untuk memeriksa riwayat skrining berdasarkan NIK
- `fix_risiko_lama.sql` - Migrasi untuk normalisasi format `tingkat_risiko` data lama

## Cara pakai

1. Buka Supabase Dashboard -> SQL Editor
2. Copy-paste isi file -> Run