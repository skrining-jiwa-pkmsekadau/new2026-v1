-- ================================================================
-- RPC: simpan_skrining
-- Menerima jawaban mentah dari client, menghitung skor/risiko di server,
-- lalu menyimpan ke tabel screenings.
-- 
-- PENTING: Jalankan SQL ini di Supabase SQL Editor untuk membuat function.
-- ================================================================

CREATE OR REPLACE FUNCTION simpan_skrining(payload_data JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_instrumen TEXT;
  v_jawaban JSONB;
  v_skor_total INT := 0;
  v_skor_detail JSONB := '{}'::JSONB;
  v_tingkat_risiko TEXT := 'Low Risk';
  v_kesimpulan_klinis TEXT := '';
  v_rekomendasi JSONB := '[]'::JSONB;
  v_skor_a INT;
  v_skor_b INT;
  v_hasil_a TEXT;
  v_hasil_b TEXT;
  v_q1_a INT;
  v_q3_a INT;
  v_q1_b INT;
  v_q3_b INT;
  v_phq2 INT;
  v_gad2 INT;
  v_total_epds INT;
  v_flag_e10 BOOLEAN;
  v_jwb JSONB;
BEGIN
  v_instrumen := payload_data->>'instrumen';
  v_jawaban := payload_data->'jawaban';

  -- ========== MMYS (ANAK & REMAJA) ==========
  IF v_instrumen IN ('MMYS_ANAK', 'MMYS_REMAJA') THEN
    -- Skala A (index 0,1,2) dan Skala B (index 3,4,5)
    v_q1_a := (v_jawaban->0->>'value')::INT;
    v_q3_a := (v_jawaban->2->>'value')::INT;
    v_q1_b := (v_jawaban->3->>'value')::INT;
    v_q3_b := (v_jawaban->5->>'value')::INT;

    v_skor_a := (v_jawaban->0->>'value')::INT + (v_jawaban->1->>'value')::INT + (v_jawaban->2->>'value')::INT;
    v_skor_b := (v_jawaban->3->>'value')::INT + (v_jawaban->4->>'value')::INT + (v_jawaban->5->>'value')::INT;
    v_skor_total := v_skor_a + v_skor_b;

    -- Interpretasi Skala A
    IF v_q1_a = 1 AND v_q3_a = 1 THEN v_hasil_a := 'BERAT';
    ELSIF v_q1_a = 1 OR v_q3_a = 1 THEN v_hasil_a := 'RINGAN';
    ELSE v_hasil_a := 'TIDAK_ADA';
    END IF;

    -- Interpretasi Skala B
    IF v_q1_b = 1 AND v_q3_b = 1 THEN v_hasil_b := 'BERAT';
    ELSIF v_q1_b = 1 OR v_q3_b = 1 THEN v_hasil_b := 'RINGAN';
    ELSE v_hasil_b := 'TIDAK_ADA';
    END IF;

    -- Ambil level tertinggi
    IF v_hasil_a = 'BERAT' OR v_hasil_b = 'BERAT' THEN v_tingkat_risiko := 'High Risk';
    ELSIF v_hasil_a = 'RINGAN' OR v_hasil_b = 'RINGAN' THEN v_tingkat_risiko := 'Moderate Risk';
    ELSE v_tingkat_risiko := 'Low Risk';
    END IF;

    v_skor_detail := jsonb_build_object('skor_A', v_skor_a, 'skor_B', v_skor_b, 'hasil_A', v_hasil_a, 'hasil_B', v_hasil_b);

  -- ========== PHQ4 ==========
  ELSIF v_instrumen = 'PHQ4' THEN
    v_phq2 := (v_jawaban->0->>'value')::INT + (v_jawaban->1->>'value')::INT;
    v_gad2 := (v_jawaban->2->>'value')::INT + (v_jawaban->3->>'value')::INT;
    v_skor_total := v_phq2 + v_gad2;

    IF v_phq2 >= 3 AND v_gad2 >= 3 THEN v_tingkat_risiko := 'High Risk';
    ELSIF v_phq2 >= 3 THEN v_tingkat_risiko := 'Moderate Risk';
    ELSIF v_gad2 >= 3 THEN v_tingkat_risiko := 'Moderate Risk';
    ELSE v_tingkat_risiko := 'Low Risk';
    END IF;

    v_skor_detail := jsonb_build_object('skor_phq2', v_phq2, 'skor_gad2', v_gad2);

  -- ========== EPDS ==========
  ELSIF v_instrumen = 'EPDS' THEN
    v_total_epds := 0;
    v_flag_e10 := FALSE;

    FOR i IN 0..9 LOOP
      v_jwb := v_jawaban->i;
      v_total_epds := v_total_epds + (v_jwb->>'value')::INT;
      IF v_jwb->>'id' = 'E10' AND (v_jwb->>'value')::INT > 0 THEN
        v_flag_e10 := TRUE;
      END IF;
    END LOOP;

    v_skor_total := v_total_epds;

    IF v_total_epds >= 13 OR v_flag_e10 THEN v_tingkat_risiko := 'High Risk';
    ELSIF v_total_epds >= 9 THEN v_tingkat_risiko := 'Moderate Risk';
    ELSE v_tingkat_risiko := 'Low Risk';
    END IF;

    v_skor_detail := jsonb_build_object('flag_e10', v_flag_e10);

  ELSE
    RAISE EXCEPTION 'Instrumen tidak dikenali: %', v_instrumen;
  END IF;

  -- ========== INSERT ke tabel screenings ==========
  INSERT INTO screenings (
    nama_lengkap, nik, tanggal_lahir, usia, jenis_kelamin,
    nomor_hp, is_hamil_nifas, alamat, kecamatan, desa,
    pendidikan, pekerjaan, nama_sekolah, tanggal_skrining, tempat_skrining,
    instrumen, is_valid, jawaban,
    skor_total, skor_detail, tingkat_risiko, kesimpulan_klinis, rekomendasi
  ) VALUES (
    payload_data->>'nama_lengkap',
    payload_data->>'nik',
    (payload_data->>'tanggal_lahir')::DATE,
    (payload_data->>'usia')::INT,
    payload_data->>'jenis_kelamin',
    payload_data->>'nomor_hp',
    (payload_data->>'is_hamil_nifas')::BOOLEAN,
    payload_data->>'alamat',
    payload_data->>'kecamatan',
    payload_data->>'desa',
    payload_data->>'pendidikan',
    payload_data->>'pekerjaan',
    payload_data->>'nama_sekolah',
    (payload_data->>'tanggal_skrining')::DATE,
    payload_data->>'tempat_skrining',
    v_instrumen,
    TRUE,
    v_jawaban,
    v_skor_total,
    v_skor_detail,
    v_tingkat_risiko,
    '', -- kesimpulan_klinis bisa di-generate dari tingkat_risiko di query dashboard
    '[]'::JSONB -- rekomendasi juga
  );
END;
$$;

-- Grant akses untuk anon (publik) karena form skrining tidak perlu login
GRANT EXECUTE ON FUNCTION simpan_skrining(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION simpan_skrining(JSONB) TO authenticated;
