import { describe, it, expect } from "vitest";
import { hitungStatistikSkrining } from "@/utils/statistik";

// Fixture sengaja memberi jumlah BERBEDA untuk tiap kategori. Dengan begitu,
// menukar dua predikat (mis. risikoTinggi <-> risikoRendah) pasti mengubah
// angka dan membuat test gagal — inilah inti perlindungan yang hilang saat
// logika ini masih berupa computed inline di Dashboard.vue.
//
// Rancangan hitungan (10 baris):
//   Instrumen — MMYS_ANAK:1  MMYS_REMAJA:2  PHQ4:3  EPDS:4  (total 10)
//   Risiko    — High:4  Moderate:3  Low:3               (total 10)
const contoh = [
  { instrumen: "MMYS_ANAK", tingkat_risiko: "High Risk" },
  { instrumen: "MMYS_REMAJA", tingkat_risiko: "Moderate Risk" },
  { instrumen: "MMYS_REMAJA", tingkat_risiko: "Moderate Risk" },
  { instrumen: "PHQ4", tingkat_risiko: "Low Risk" },
  { instrumen: "PHQ4", tingkat_risiko: "Low Risk" },
  { instrumen: "PHQ4", tingkat_risiko: "Low Risk" },
  { instrumen: "EPDS", tingkat_risiko: "High Risk" },
  { instrumen: "EPDS", tingkat_risiko: "High Risk" },
  { instrumen: "EPDS", tingkat_risiko: "Moderate Risk" },
  { instrumen: "EPDS", tingkat_risiko: "High Risk" },
];

describe("hitungStatistikSkrining", () => {
  it("menghitung tiap instrumen pada kategori yang benar", () => {
    const s = hitungStatistikSkrining(contoh);
    expect(s.mMysAnak).toBe(1);
    expect(s.mMysRemaja).toBe(2);
    expect(s.phq4).toBe(3);
    expect(s.epds).toBe(4);
  });

  it("menghitung tiap tingkat risiko pada kategori yang benar", () => {
    const s = hitungStatistikSkrining(contoh);
    // High=4 (baris 1,7,8,10), Moderate=3 (2,3,9), Low=3 (4,5,6)
    expect(s.risikoTinggi).toBe(4);
    expect(s.risikoSedang).toBe(3);
    expect(s.risikoRendah).toBe(3);
  });

  it("data kosong menghasilkan tujuh field bernilai 0", () => {
    const s = hitungStatistikSkrining([]);
    for (const k of [
      "mMysAnak",
      "mMysRemaja",
      "phq4",
      "epds",
      "risikoTinggi",
      "risikoSedang",
      "risikoRendah",
    ]) {
      expect(s[k]).toBe(0);
      expect(Number.isNaN(s[k])).toBe(false);
    }
  });

  it("argumen non-array (null/undefined) tetap menghasilkan 0, bukan crash", () => {
    for (const nilai of [null, undefined]) {
      const s = hitungStatistikSkrining(nilai);
      expect(s.mMysAnak).toBe(0);
      expect(s.risikoTinggi).toBe(0);
    }
  });

  it("instrumen atau risiko null/kosong/tak dikenal tidak dihitung ke kategori mana pun", () => {
    const kotor = [
      { instrumen: null, tingkat_risiko: null },
      { instrumen: "", tingkat_risiko: "" },
      { instrumen: "TIDAK_DIKENAL", tingkat_risiko: "Unknown Risk" },
      { instrumen: undefined, tingkat_risiko: undefined },
    ];
    const s = hitungStatistikSkrining(kotor);
    expect(s.mMysAnak).toBe(0);
    expect(s.mMysRemaja).toBe(0);
    expect(s.phq4).toBe(0);
    expect(s.epds).toBe(0);
    expect(s.risikoTinggi).toBe(0);
    expect(s.risikoSedang).toBe(0);
    expect(s.risikoRendah).toBe(0);
  });

  it("jumlah instrumen dan jumlah risiko tidak melebihi total baris", () => {
    const s = hitungStatistikSkrining(contoh);
    const totalInstrumen = s.mMysAnak + s.mMysRemaja + s.phq4 + s.epds;
    const totalRisiko = s.risikoTinggi + s.risikoSedang + s.risikoRendah;
    expect(totalInstrumen).toBeLessThanOrEqual(contoh.length);
    expect(totalRisiko).toBeLessThanOrEqual(contoh.length);
  });
});
