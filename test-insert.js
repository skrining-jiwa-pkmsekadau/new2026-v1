const url = "https://cnernzpzhjcmmhfpamwo.supabase.co/rest/v1/screenings";
const headers = {
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZXJuenB6aGpjbW1oZnBhbXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDc3NjMsImV4cCI6MjA4NzM4Mzc2M30.WGkJggavu929wAJbCu6QoVqtPDKqP7miO-4vLbDdOlA",
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};
const payload = {
  "nama_lengkap": "TEST_INSERT_BOT",
  "nik": "1234567890123456",
  "nomor_hp": "081234567890",
  "is_valid": true,
  "usia": 20,
  "jenis_kelamin": "L",
  "skor_total": 0,
  "tingkat_risiko": "Low Risk"
};
fetch(url, { method: "POST", headers, body: JSON.stringify(payload) })
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(e => console.error(e.message));
