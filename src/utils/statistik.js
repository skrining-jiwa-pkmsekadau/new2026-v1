// Logika hitung statistik ringkasan dashboard.
//
// Diekstrak dari computed di Dashboard.vue agar angka yang dilaporkan ke
// Dinas Kesehatan dapat diuji secara terisolasi: Dashboard.vue tidak punya
// component test, sehingga uji mutasi membuktikan kesalahan predikat di sini
// lolos tanpa terdeteksi. Fungsi murni ini menutup celah tersebut.
//
// Predikat WAJIB identik dengan versi inline sebelumnya — menukar kategori
// mengubah angka laporan dan dianggap cacat.
export function hitungStatistikSkrining(baris) {
  const data = Array.isArray(baris) ? baris : [];
  return {
    mMysAnak: data.filter((x) => x.instrumen === "MMYS_ANAK").length,
    mMysRemaja: data.filter((x) => x.instrumen === "MMYS_REMAJA").length,
    phq4: data.filter((x) => x.instrumen === "PHQ4").length,
    epds: data.filter((x) => x.instrumen === "EPDS").length,
    risikoTinggi: data.filter((x) => x.tingkat_risiko === "High Risk").length,
    risikoSedang: data.filter((x) => x.tingkat_risiko === "Moderate Risk").length,
    risikoRendah: data.filter((x) => x.tingkat_risiko === "Low Risk").length,
  };
}
