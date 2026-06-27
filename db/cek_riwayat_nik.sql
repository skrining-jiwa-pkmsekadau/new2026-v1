-- ================================================================
-- RPC: cek_riwayat_nik
-- Dipakai halaman Identitas untuk memeriksa apakah NIK sudah pernah
-- skrining dalam jeda 90 hari dan mengambil identitas terakhir pasien.
--
-- Jalankan file ini di Supabase SQL Editor.
-- DROP FUNCTION hanya menghapus RPC lama, bukan data screenings.
-- ================================================================

DROP FUNCTION IF EXISTS public.cek_riwayat_nik(TEXT);
DROP FUNCTION IF EXISTS public.cek_riwayat_nik(VARCHAR);

CREATE OR REPLACE FUNCTION public.cek_riwayat_nik(p_nik TEXT)
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH riwayat AS (
    SELECT
      s.*,
      COUNT(*) OVER ()::INTEGER AS jumlah_riwayat,
      ROW_NUMBER() OVER (ORDER BY s.tanggal_skrining ASC)::INTEGER AS skrining_ke
    FROM public.screenings AS s
    WHERE TRIM(s.nik::TEXT) = TRIM(p_nik)
      AND COALESCE(s.is_valid, TRUE) = TRUE
  )
  SELECT
    LEFT(r.tanggal_skrining::TEXT, 10) AS tanggal_skrining,
    COALESCE(r.instrumen::TEXT, '-') AS instrumen,
    COALESCE(r.tingkat_risiko::TEXT, '-') AS tingkat_risiko,
    r.jumlah_riwayat,
    r.skrining_ke,
    LEFT((r.tanggal_skrining::DATE + INTERVAL '90 days')::TEXT, 10) AS tanggal_boleh_skrining_ulang,
    CURRENT_DATE >= (r.tanggal_skrining::DATE + INTERVAL '90 days')::DATE AS boleh_skrining_ulang,
    COALESCE(r.nama_lengkap::TEXT, '') AS nama_lengkap,
    LEFT(r.tanggal_lahir::TEXT, 10) AS tanggal_lahir,
    COALESCE(r.jenis_kelamin::TEXT, '') AS jenis_kelamin,
    COALESCE(r.nomor_hp::TEXT, '') AS nomor_hp,
    COALESCE(r.is_hamil_nifas, FALSE) AS is_hamil_nifas,
    COALESCE(r.alamat::TEXT, '') AS alamat,
    COALESCE(r.kecamatan::TEXT, '') AS kecamatan,
    COALESCE(r.desa::TEXT, '') AS desa,
    COALESCE(r.pendidikan::TEXT, '') AS pendidikan,
    COALESCE(r.pekerjaan::TEXT, '') AS pekerjaan,
    COALESCE(r.nama_sekolah::TEXT, '') AS nama_sekolah,
    COALESCE(r.tempat_skrining::TEXT, '') AS tempat_skrining
  FROM riwayat AS r
  ORDER BY r.tanggal_skrining DESC
  LIMIT 5;
$$;

GRANT EXECUTE ON FUNCTION public.cek_riwayat_nik(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.cek_riwayat_nik(TEXT) TO authenticated;