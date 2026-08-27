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
  v_nilai_e10 INT;
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
    IF v_hasil_a = 'BERAT' OR v_hasil_b = 'BERAT' THEN 
      v_tingkat_risiko := 'High Risk';
      v_kesimpulan_klinis := 'Hasil skrining menunjukkan kemungkinan gejala kecemasan dan/atau depresi berat. Perlu penanganan segera.';
      v_rekomendasi := '["Konseling awal segera oleh Perawat atau Bidan yang bersifat suportif.", "Penegakan diagnosis keperawatan dan asuhan keperawatan jiwa pada anak dan remaja oleh Perawat.", "Tatalaksana medis segera oleh Dokter Puskesmas.", "Assessment dan tatalaksana psikologis oleh Psikolog Klinis.", "Pemeriksaan lanjut untuk menegakkan diagnosa awal oleh Dokter/Psikolog Klinis.", "Lakukan evaluasi setelah 3 bulan. Rujuk ke Rumah Sakit (FKTL) yang memiliki fasilitas kesehatan jiwa/tumbuh kembang jika tidak ada perbaikan.", "Rujuk SEGERA jika ada: perilaku melukai diri/dorongan bunuh diri, luka/memar fisik, gangguan tumbuh kembang, atau kondisi medis berat."]'::JSONB;
    ELSIF v_hasil_a = 'RINGAN' OR v_hasil_b = 'RINGAN' THEN 
      v_tingkat_risiko := 'Moderate Risk';
      v_kesimpulan_klinis := 'Hasil skrining menunjukkan kemungkinan gejala kecemasan dan/atau depresi ringan yang perlu ditindaklanjuti.';
      v_rekomendasi := '["Konseling awal oleh Perawat atau Bidan yang bersifat suportif untuk mengidentifikasi dan membantu mengurangi keluhan.", "Penegakan diagnosis keperawatan dan pemberian asuhan keperawatan jiwa pada anak dan remaja oleh Perawat.", "Tatalaksana medis oleh Dokter Puskesmas sesuai kompetensi.", "Assessment dan tatalaksana psikologis oleh Psikolog Klinis (jika tersedia).", "Pemeriksaan lanjut untuk menegakkan diagnosa awal oleh Dokter/Psikolog Klinis."]'::JSONB;
    ELSE 
      v_tingkat_risiko := 'Low Risk';
      v_kesimpulan_klinis := 'Hasil skrining tidak menunjukkan kemungkinan gejala kecemasan maupun depresi yang signifikan.';
      v_rekomendasi := '["Edukasi kesehatan jiwa: definisi kesehatan jiwa, pentingnya menjaga kesehatan mental, dan sistem deteksi mandiri.", "Penguatan faktor protektif: dorong keterlibatan dalam kegiatan ekstrakurikuler, hobi positif, dan relasi sosial yang sehat.", "Edukasi P3LP (Pertolongan Pertama pada Luka Psikologis) kepada orang tua/pengasuh.", "Edukasi pengasuhan yang sehat jiwa kepada orang tua/pengasuh.", "Lakukan pemeriksaan kesehatan jiwa berkala minimal 1 kali per tahun."]'::JSONB;
    END IF;

    v_skor_detail := jsonb_build_object('skor_A', v_skor_a, 'skor_B', v_skor_b, 'hasil_A', v_hasil_a, 'hasil_B', v_hasil_b);

  -- ========== PHQ4 ==========
  ELSIF v_instrumen = 'PHQ4' THEN
    v_phq2 := (v_jawaban->0->>'value')::INT + (v_jawaban->1->>'value')::INT;
    v_gad2 := (v_jawaban->2->>'value')::INT + (v_jawaban->3->>'value')::INT;
    v_skor_total := v_phq2 + v_gad2;

    IF v_phq2 >= 3 AND v_gad2 >= 3 THEN 
      v_tingkat_risiko := 'High Risk';
      v_kesimpulan_klinis := 'Hasil skrining PHQ-4 menunjukkan kemungkinan gejala depresi DAN kecemasan secara bersamaan (PHQ-2 ≥ 3 dan GAD-2 ≥ 3). Perlu penanganan segera.';
      v_rekomendasi := '["Konseling awal segera oleh Perawat atau Bidan yang bersifat suportif.", "Pemeriksaan kesehatan jiwa menyeluruh oleh Dokter atau Psikolog Klinis.", "Tatalaksana komprehensif sesuai kompetensi tenaga medis di Puskesmas.", "Rujuk ke FKTL jika: depresi berat, indikasi membahayakan diri/orang lain, atau gejala kecemasan tidak membaik lebih dari 1 bulan."]'::JSONB;
    ELSIF v_phq2 >= 3 THEN 
      v_tingkat_risiko := 'Moderate Risk';
      v_kesimpulan_klinis := 'Hasil skrining PHQ-4 menunjukkan kemungkinan adanya gejala depresi (skor PHQ-2 ≥ 3). Diperlukan pemeriksaan dan tindak lanjut lebih lanjut.';
      v_rekomendasi := '["Konseling awal oleh Perawat atau Bidan yang bersifat suportif.", "Pemeriksaan kesehatan jiwa oleh Dokter atau Psikolog Klinis untuk menegakkan diagnosis medis.", "Tatalaksana sesuai kompetensi tenaga medis dan kesehatan di Puskesmas.", "Rujuk ke FKTL jika: depresi berat atau ada indikasi membahayakan diri sendiri atau orang lain."]'::JSONB;
    ELSIF v_gad2 >= 3 THEN 
      v_tingkat_risiko := 'Moderate Risk';
      v_kesimpulan_klinis := 'Hasil skrining PHQ-4 menunjukkan kemungkinan adanya gejala kecemasan (skor GAD-2 ≥ 3). Diperlukan pemeriksaan dan tindak lanjut lebih lanjut.';
      v_rekomendasi := '["Konseling awal oleh Perawat atau Bidan yang bersifat suportif.", "Pemeriksaan kesehatan jiwa oleh Dokter atau Psikolog Klinis untuk menegakkan diagnosis medis.", "Tatalaksana sesuai kompetensi tenaga medis dan kesehatan di Puskesmas.", "Rujuk ke FKTL jika: gejala tidak membaik lebih dari 1 bulan pasca konseling atau ada indikasi ketergantungan obat cemas."]'::JSONB;
    ELSE 
      v_tingkat_risiko := 'Low Risk';
      v_kesimpulan_klinis := 'Hasil skrining PHQ-4 tidak menunjukkan gejala depresi maupun kecemasan yang signifikan.';
      v_rekomendasi := '["Edukasi kesehatan jiwa: tanda sehat jiwa dan faktor protektif.", "Ajarkan teknik manajemen stres dan coping stress yang sehat.", "Edukasi P3LP (Pertolongan Pertama pada Luka Psikologis).", "Pertahankan gaya hidup sehat: olahraga teratur, tidur cukup, dan hubungan sosial yang positif."]'::JSONB;
    END IF;

    v_skor_detail := jsonb_build_object('skor_phq2', v_phq2, 'skor_gad2', v_gad2);

  -- ========== EPDS ==========
  -- Juknis KJ.02.05/B.III/92/2025 hal. 11:
  --   0-12 : tidak menunjukkan gejala signifikan
  --          (9-12 -> tambahkan anjuran skrining ulang pada ANC berikutnya)
  --   >=13 : terindikasi kemungkinan gejala depresi
  --   <13 namun item 10 dijawab "Ya, agak sering" (nilai 3) -> setara >=13
  --
  -- Ambang ini WAJIB sama dengan NILAI_ESKALASI_E10 di src/utils/skoring.js.
  -- Dijaga oleh tests/kontrak-jawaban.test.js.
  ELSIF v_instrumen = 'EPDS' THEN
    v_total_epds := 0;
    v_nilai_e10 := 0;

    FOR i IN 0..9 LOOP
      v_jwb := v_jawaban->i;
      v_total_epds := v_total_epds + (v_jwb->>'value')::INT;
      IF v_jwb->>'id' = 'E10' THEN
        v_nilai_e10 := (v_jwb->>'value')::INT;
      END IF;
    END LOOP;

    -- Hanya nilai 3 ("Ya, agak sering") yang mengeskalasi risiko.
    -- Nilai 1 dan 2 tidak mengeskalasi, tetapi client tetap memunculkan
    -- panel krisis lewat NILAI_KRISIS_E10 = 2.
    v_flag_e10 := COALESCE(v_nilai_e10, 0) >= 3;

    v_skor_total := v_total_epds;

    IF v_total_epds >= 13 OR v_flag_e10 THEN 
      v_tingkat_risiko := 'High Risk';
      v_kesimpulan_klinis := 'Hasil skrining EPDS mengindikasikan kemungkinan gejala depresi pada ibu hamil/nifas (skor ≥ 13 atau jawaban "Ya, agak sering" pada pertanyaan 10). Diperlukan penanganan segera.';
      v_rekomendasi := '["Konseling awal segera oleh Perawat atau Bidan yang bersifat suportif.", "Pemeriksaan kesehatan jiwa untuk menegakkan diagnosis oleh Dokter atau Psikolog Klinis.", "Tatalaksana komprehensif sesuai kompetensi tenaga medis dan kesehatan di Puskesmas.", "Segera rujuk ke FKTL jika ada indikasi membahayakan diri sendiri atau orang lain.", "Pastikan pendampingan intensif dari keluarga terdekat selama proses pemulihan."]'::JSONB;
    ELSIF v_total_epds >= 9 THEN 
      v_tingkat_risiko := 'Low Risk';
      v_kesimpulan_klinis := 'Hasil skrining EPDS tidak menunjukkan gejala depresi yang signifikan (skor 0-12). Karena skor berada pada rentang 9-12, lakukan skrining ulang pada kunjungan ANC berikutnya.';
      v_rekomendasi := '["Berikan edukasi kesehatan jiwa: tanda sehat jiwa pada ibu, faktor protektif, latihan manajemen dan coping stress.", "Edukasi pengasuhan positif.", "Skor 9-12: lakukan skrining ulang pada kunjungan ANC berikutnya.", "Pantau kondisi ibu secara berkala oleh Bidan atau Perawat.", "Tingkatkan dukungan sosial dan emosional dari keluarga terdekat."]'::JSONB;
    ELSE 
      v_tingkat_risiko := 'Low Risk';
      v_kesimpulan_klinis := 'Hasil skrining EPDS tidak menunjukkan gejala depresi yang signifikan (skor 0-12).';
      v_rekomendasi := '["Edukasi kesehatan jiwa: tanda sehat jiwa pada ibu dan faktor protektif kesehatan jiwa.", "Latihan manajemen stres dan coping stress yang sehat selama masa kehamilan/nifas.", "Edukasi pengasuhan positif dan perawatan bayi yang menyenangkan.", "Jaga dukungan sosial dari keluarga dan tenaga kesehatan."]'::JSONB;
    END IF;

    -- nilai_e10 disimpan mentah untuk audit klinis dan agar UI dapat
    -- memunculkan panel krisis pada record yang dimuat ulang dari DB.
    v_skor_detail := jsonb_build_object(
      'flag_e10', v_flag_e10,
      'nilai_e10', v_nilai_e10,
      'perlu_skrining_ulang', (v_total_epds BETWEEN 9 AND 12 AND NOT v_flag_e10)
    );

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
    v_kesimpulan_klinis,
    v_rekomendasi
  );
END;
$$;

-- Grant akses untuk anon (publik) karena form skrining tidak perlu login
GRANT EXECUTE ON FUNCTION simpan_skrining(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION simpan_skrining(JSONB) TO authenticated;
