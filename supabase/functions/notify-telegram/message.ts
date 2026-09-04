export type TelegramMessageInput = {
  namaTersamar: string
  jumlahRiwayat: number
  skriningSebelumnya: string | null
  instrumen: string
  risiko: string
  lokasi: string
  waktu: string
  kode: string
}

const STAR = '***'

export function samarkanNama(nama: string): string {
  const bagian = Array.from(nama.trim().split(/\s+/).filter(Boolean))
  if (!bagian.length) return 'Pasien'

  return bagian.map((kata, index) => {
    const karakter = Array.from(kata)
    const awal = karakter[0] ?? ''
    const terakhir = index === bagian.length - 1 && bagian.length > 1
      ? karakter.at(-1) ?? ''
      : ''
    return awal + STAR + (karakter.length > 1 ? terakhir : '')
  }).join(' ')
}

export function formatPesanTelegram(input: TelegramMessageInput): string {
  return [
    'PIJAR — Skrining Baru',
    '',
    `Pasien: ${input.namaTersamar}`,
    `Skrining ke: ${input.jumlahRiwayat}`,
    `Skrining sebelumnya: ${input.skriningSebelumnya ?? 'Belum ada'}`,
    `Instrumen: ${input.instrumen}`,
    `Risiko: ${input.risiko}`,
    `Lokasi: ${input.lokasi}`,
    `Waktu: ${input.waktu}`,
    `Kode: ${input.kode}`,
    '',
    'Buka Dashboard PIJAR untuk melihat detail.',
  ].join('\n')
}
