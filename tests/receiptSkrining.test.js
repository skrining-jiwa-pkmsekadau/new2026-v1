import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { cocokkanReceipt, kodeReceipt, bolehRetry } from '@/utils/receiptSkrining'

describe('bukti penerimaan skrining', () => {
  const id = '123e4567-e89b-42d3-a456-426614174000'

  it('hanya menerima receipt UUID yang sama dengan submission_id', () => {
    expect(cocokkanReceipt(id, id)).toBe(id)
    expect(() => cocokkanReceipt('123e4567-e89b-42d3-a456-426614174001', id)).toThrow('tidak sesuai')
    expect(() => cocokkanReceipt(null, id)).toThrow('tidak sesuai')
  })

  it('menampilkan kode pendek tanpa data pasien', () => {
    expect(kodeReceipt(id)).toBe('123e4567')
  })

  it('hanya retry otomatis untuk status respons sementara', () => {
    expect(bolehRetry(0)).toBe(true)
    expect(bolehRetry(503)).toBe(true)
    expect(bolehRetry(429)).toBe(true)
    expect(bolehRetry(400)).toBe(false)
  })

  it('RPC hanya mengembalikan receipt yang ditemukan di tabel', () => {
    const sql = readFileSync(fileURLToPath(new URL('../db/09_receipt_skrining.sql', import.meta.url)), 'utf8')
    expect(sql).toMatch(/DO UPDATE SET submission_id = EXCLUDED\.submission_id/i)
    expect(sql).toMatch(/WHERE screenings\.jawaban = EXCLUDED\.jawaban/i)
    expect(sql).toMatch(/RETURNING submission_id INTO v_receipt/i)
  })
})
