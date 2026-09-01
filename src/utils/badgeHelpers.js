import { hitungSkor } from "@/utils/skoring";

export function instrLabelText(i) {
  return { MMYS_ANAK: "MMYS Anak", MMYS_REMAJA: "MMYS Remaja", PHQ4: "PHQ-4", EPDS: "EPDS" }[i] || i;
}

export function instrBadgeCls(i) {
  const m = { MMYS_ANAK: "bg-sky-50 text-sky-600 border-sky-200", MMYS_REMAJA: "bg-violet-50 text-violet-600 border-violet-200", PHQ4: "bg-orange-50 text-orange-600 border-orange-200", EPDS: "bg-pink-50 text-pink-600 border-pink-200" };
  return "px-2 py-0.5 rounded-full text-[10px] font-bold border " + (m[i] || "bg-slate-50 text-slate-500 border-slate-200");
}

export function riskBadgeCls(r) {
  const m = { "High Risk": "bg-red-50 text-red-600 border-red-200", "Moderate Risk": "bg-amber-50 text-amber-600 border-amber-200", "Low Risk": "bg-emerald-50 text-emerald-600 border-emerald-200" };
  return "px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap " + (m[r] || "bg-slate-50 text-slate-500 border-slate-200");
}

export function hasilPanduanExport(d) {
  if (Array.isArray(d.jawaban)) {
    const hasil = hitungSkor(d.instrumen, d.jawaban);
    if (hasil) return hasil;
  }
  return null;
}

export function risikoExport(d) {
  return hasilPanduanExport(d)?.risk_level || d.tingkat_risiko || "-";
}
