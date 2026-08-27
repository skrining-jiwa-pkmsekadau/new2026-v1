/**
 * kontakKrisis.test.js — Menjaga agar nomor bantuan krisis tetap
 * dapat dihubungi. Kesalahan format di sini berarti seseorang dengan
 * pikiran bunuh diri menekan tautan yang tidak berfungsi.
 */
import { describe, it, expect } from 'vitest'
import {
  KONTAK_LOKAL,
  KONTAK_NASIONAL,
  KONTAK_KRISIS,
  tautanTelepon,
  tautanWhatsApp,
} from '@/constants/kontakKrisis'

describe('daftar kontak krisis', () => {
  it('memuat kontak lokal DAN jalur nasional sebagai cadangan', () => {
    // Penanganan krisis tidak boleh bergantung pada satu nomor saja.
    expect(KONTAK_KRISIS.length).toBeGreaterThanOrEqual(2)
    expect(KONTAK_KRISIS).toContain(KONTAK_LOKAL)
    expect(KONTAK_KRISIS).toContain(KONTAK_NASIONAL)
  })

  it('kontak lokal tampil lebih dulu', () => {
    expect(KONTAK_KRISIS[0]).toBe(KONTAK_LOKAL)
  })

  it('setiap kontak punya nama, keterangan, nomor, dan tampilan', () => {
    for (const k of KONTAK_KRISIS) {
      expect(k.nama, 'nama').toBeTruthy()
      expect(k.keterangan, `${k.nama}.keterangan`).toBeTruthy()
      expect(k.nomor, `${k.nama}.nomor`).toBeTruthy()
      expect(k.tampilan, `${k.nama}.tampilan`).toBeTruthy()
    }
  })

  it('nomor hanya berisi angka (tanpa spasi, tanda hubung, atau plus)', () => {
    // Tautan tel:/wa.me akan rusak bila nomor memuat pemisah.
    for (const k of KONTAK_KRISIS) {
      expect(k.nomor, `${k.nama}.nomor`).toMatch(/^\d+$/)
    }
  })

  it('tampilan dan nomor merujuk deret angka yang sama', () => {
    for (const k of KONTAK_KRISIS) {
      const angkaTampilan = k.tampilan.replace(/\D/g, '')
      expect(
        angkaTampilan.startsWith(k.nomor),
        `${k.nama}: tampilan "${k.tampilan}" tidak cocok dengan nomor "${k.nomor}"`,
      ).toBe(true)
    }
  })
})

describe('tautanTelepon', () => {
  it('nomor internasional diberi awalan +', () => {
    expect(tautanTelepon(KONTAK_LOKAL)).toBe('tel:+6285173358826')
  })

  it('nomor layanan pendek TIDAK diberi awalan +', () => {
    // 'tel:+119' tidak dapat didial oleh ponsel — ini pernah salah.
    expect(tautanTelepon(KONTAK_NASIONAL)).toBe('tel:119')
    expect(tautanTelepon(KONTAK_NASIONAL)).not.toContain('+')
  })

  it('semua kontak menghasilkan tautan tel: yang valid', () => {
    for (const k of KONTAK_KRISIS) {
      expect(tautanTelepon(k)).toMatch(/^tel:\+?\d+$/)
    }
  })
})

describe('tautanWhatsApp', () => {
  it('memakai domain wa.me dengan nomor E.164 tanpa plus', () => {
    expect(tautanWhatsApp(KONTAK_LOKAL)).toMatch(
      /^https:\/\/wa\.me\/6285173358826\?text=/,
    )
  })

  it('menyertakan pesan pembuka yang sudah ter-encode', () => {
    const url = tautanWhatsApp(KONTAK_LOKAL)
    const text = new URL(url).searchParams.get('text')
    expect(text).toBeTruthy()
    expect(text).toContain('skrining')
  })

  it('hanya kontak berpenanda whatsapp yang boleh dipakai', () => {
    // Menghindari tautan WhatsApp ke nomor layanan pendek seperti 119.
    expect(KONTAK_LOKAL.whatsapp).toBe(true)
    expect(KONTAK_NASIONAL.whatsapp).toBe(false)
  })
})

describe('penanda nomor sementara', () => {
  /**
   * Test ini SENGAJA gagal setelah nomor resmi dipasang, sebagai
   * pengingat untuk menghapus penanda `sementara` dan blok TODO
   * di src/constants/kontakKrisis.js.
   *
   * Bila test ini gagal karena nomor sudah resmi: ubah `sementara`
   * menjadi false dan sesuaikan test ini.
   */
  it('[SEMENTARA] kontak lokal masih memakai nomor non-resmi', () => {
    expect(KONTAK_LOKAL.sementara).toBe(true)
  })

  it('jalur nasional bukan nomor sementara', () => {
    expect(KONTAK_NASIONAL.sementara).toBe(false)
  })
})
