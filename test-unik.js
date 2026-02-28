// For the sake of logic test without credentials, let's mock the data array 
const mockData = [
  { id: 1, nik: '123', tanggal_skrining: '2026-01-10T10:00:00Z', tingkat_risiko: 'Low Risk', instrumen: 'PHQ4' },
  { id: 2, nik: '123', tanggal_skrining: '2026-05-10T10:00:00Z', tingkat_risiko: 'High Risk', instrumen: 'PHQ4' },
  { id: 3, nik: '456', tanggal_skrining: '2026-02-15T08:00:00Z', tingkat_risiko: 'Moderate Risk', instrumen: 'EPDS' },
  { id: 4, nik: '789', tanggal_skrining: '2025-11-20T09:00:00Z', tingkat_risiko: 'Low Risk', instrumen: 'MMYS_ANAK' },
  { id: 5, nik: '789', tanggal_skrining: '2026-01-05T09:00:00Z', tingkat_risiko: 'Moderate Risk', instrumen: 'MMYS_ANAK' }
];

console.log("Total Screenings (store.semuaData):", mockData.length);

// Emulate dataUnik computed
const map = {};
mockData.forEach(d => {
  const nik = d.nik;
  if (!map[nik] || new Date(d.tanggal_skrining) > new Date(map[nik].tanggal_skrining)) {
    map[nik] = d;
  }
});
const dataUnik = Object.values(map);

console.log("Total Unique Patients (dataUnik):", dataUnik.length);
console.log("\nLatest Data per Unique NIK:");
dataUnik.forEach(d => {
  console.log(`- NIK: ${d.nik}, Latest Date: ${d.tanggal_skrining}, Risk: ${d.tingkat_risiko}`);
});

// Emulate riwayatPasien computed for NIK '123'
const riwayatPasien123 = mockData
  .filter(d => d.nik === '123')
  .sort((a,b) => new Date(b.tanggal_skrining) - new Date(a.tanggal_skrining));

console.log("\nRiwayat History for NIK '123' (Expected: May first, then Jan):");
riwayatPasien123.forEach(d => {
  console.log(`- Date: ${d.tanggal_skrining}, Risk: ${d.tingkat_risiko}`);
});
