import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { formatPesanTelegram, samarkanNama } from '../supabase/functions/notify-telegram/message.ts'

describe('notifikasi Telegram skrining', () => {
  it('menyamarkan nama dengan jumlah bintang tetap', () => {
    expect(samarkanNama('Banu Prasetya')).toBe('B*** P***a')
    expect(samarkanNama('  Siti   Nur Aisyah  ')).toBe('S*** N*** A***h')
    expect(samarkanNama('Andi')).toBe('A***')
    expect(samarkanNama('Éva 李')).toBe('É*** 李***')
    expect(samarkanNama('')).toBe('Pasien')
  })

  it('membuat pesan tanpa identitas langsung atau data klinis rinci', () => {
    const pesan = formatPesanTelegram({
      namaTersamar: 'B*** P***a',
      jumlahRiwayat: 3,
      skriningSebelumnya: '14 Juni 2026',
      instrumen: 'PHQ-4',
      risiko: 'Low Risk',
      lokasi: 'SMP Negeri 1 Sekadau',
      waktu: '3 September 2026, 10.35 WIB',
      kode: 'a81f2d3c',
    })

    expect(pesan).toContain('Pasien: B*** P***a')
    expect(pesan).toContain('Skrining ke: 3')
    expect(pesan).toContain('Skrining sebelumnya: 14 Juni 2026')
    expect(pesan).toContain('Risiko: Low Risk')
    expect(pesan).not.toContain('Banu Prasetya')
    expect(pesan).not.toMatch(/NIK|nomor hp|jawaban|kesimpulan klinis/i)
  })

  it('menyatakan belum ada untuk skrining pertama', () => {
    const pesan = formatPesanTelegram({
      namaTersamar: 'A***',
      jumlahRiwayat: 1,
      skriningSebelumnya: null,
      instrumen: 'EPDS',
      risiko: 'High Risk',
      lokasi: 'Puskesmas Sekadau',
      waktu: '3 September 2026, 10.35 WIB',
      kode: '12345678',
    })

    expect(pesan).toContain('Skrining sebelumnya: Belum ada')
  })

  it('webhook memakai outbox minimal dan memiliki redrive', () => {
    const sql = readFileSync(fileURLToPath(new URL('../db/10_notifikasi_telegram.sql', import.meta.url)), 'utf8')
    const edge = readFileSync(fileURLToPath(new URL('../supabase/functions/notify-telegram/index.ts', import.meta.url)), 'utf8')

    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS public\.telegram_notification_outbox/)
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.next_telegram_notification/)
    expect(sql).toMatch(/attempt < 10/)
    expect(edge).toContain("webhook.table !== 'telegram_notification_outbox'")
    expect(edge).toContain("payload.type === 'REDRIVE'")
    expect(edge).not.toContain('console.log')
  })
})
