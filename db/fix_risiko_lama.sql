-- ================================================================
-- FIX: Update data Johan & Jini yang tersimpan dengan format lama
-- Jalankan SEKALI di Supabase SQL Editor
-- ================================================================

UPDATE screenings SET tingkat_risiko = 'High Risk' 
WHERE tingkat_risiko IN ('BERAT', 'DEPRESI_DAN_KECEMASAN', 'DEPRESI');

UPDATE screenings SET tingkat_risiko = 'Moderate Risk' 
WHERE tingkat_risiko IN ('RINGAN', 'KECEMASAN', 'PERLU_MONITORING');

UPDATE screenings SET tingkat_risiko = 'Low Risk' 
WHERE tingkat_risiko = 'TIDAK_ADA';
