/**
 * kontakKrisis.test.js — Menjaga agar nomor bantuan krisis tetap
 * dapat dihubungi. Kesalahan format di sini berarti seseorang dengan
 * pikiran bunuh diri menekan tautan yang tidak berfungsi.
 */
import { describe, it, expect } from 'vitest'
import {
  KONTAK_SEJIWA,
  KONTAK_DARURAT,
  KONTAK_KRISIS,
  tautanTelepon,
  tautanWhatsApp,
} from '@/constants/kontakKrisis'

describe('daftar kontak krisis', () => {
  it('memuat minimal dua jalur bantuan', () => {
    // Penanganan krisis tidak boleh bergantung pada satu titik saja.
    expect(KONTAK_KRISIS.length).toBeGreaterThanOrEqual(2)
    expect(KONTAK_KRISIS).toContain(KONTAK_SEJIWA)
    expect(KONTAK_KRISIS).toContain(KONTAK_DARURAT)
  })

  it('SEJIWA tampil lebih dulu daripada gawat darurat umum', () => {
    // Untuk krisis kesehatan jiwa, konseling adalah jalur pertama.
    expect(KONTAK_KRISIS[0]).toBe(KONTAK_SEJIWA)
  })

  it('setiap kontak punya nama, keterangan, nomor, dan tampilan', () => {
    for (const k of KONTAK_KRISIS) {
      expect(k.nama, 'nama').toBeTruthy()
      expect(k.keterangan, `${k.nama}.keterangan`).toBeTruthy()
      expect(k.nomor, `${k.nama}.nomor`).toBeTruthy()
      expect(k.tampilan, `${k.nama}.tampilan`).toBeTruthy()
    }
  })

  it('nomor hanya berisi angka, tanpa spasi/tanda hubung/plus', () => {
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

  it('tidak ada nomor seluler pribadi yang tertinggal', () => {
    // Nomor pribadi tidak dapat menjamin ketersediaan 24 jam, sehingga
    // tidak layak dipakai pada jalur krisis. Hanya layanan resmi.
    for (const k of KONTAK_KRISIS) {
      expect(
        k.nomor.startsWith('628'),
        `${k.nama} memakai nomor seluler pribadi (${k.nomor})`,
      ).toBe(false)
    }
  })

  it('keterangan menyebut ketersediaan layanan secara jujur', () => {
    // Pasien harus tahu apakah nomor aktif 24 jam atau hanya jam kerja.
    for (const k of KONTAK_KRISIS) {
      expect(
        /24 jam|WIB|WITA|WIT|Senin|jam/i.test(k.keterangan),
        `${k.nama}.keterangan tidak menyebut ketersediaan`,
      ).toBe(true)
    }
  })
})

describe('tautanTelepon', () => {
  it('nomor layanan pendek TIDAK diberi awalan +', () => {
    // 'tel:+119' tidak dapat didial oleh ponsel — ini pernah salah.
    expect(tautanTelepon(KONTAK_SEJIWA)).toBe('tel:119')
    expect(tautanTelepon(KONTAK_SEJIWA)).not.toContain('+')
    expect(tautanTelepon(KONTAK_DARURAT)).toBe('tel:119')
  })

  it('nomor internasional diberi awalan +', () => {
    // Menjaga jalur ini tetap benar bila nomor Puskesmas ditambahkan.
    const contoh = { nomor: '6285173358826', internasional: true }
    expect(tautanTelepon(contoh)).toBe('tel:+6285173358826')
  })

  it('semua kontak menghasilkan tautan tel: yang valid', () => {
    for (const k of KONTAK_KRISIS) {
      expect(tautanTelepon(k)).toMatch(/^tel:\+?\d+$/)
    }
  })
})

describe('tautanWhatsApp', () => {
  it('tidak ada kontak krisis saat ini yang memakai WhatsApp', () => {
    // Nomor layanan pendek 119 tidak punya WhatsApp. Tombolnya tidak
    // boleh muncul, karena tautan wa.me/119 mengarah ke ketiadaan.
    for (const k of KONTAK_KRISIS) {
      expect(k.whatsapp, `${k.nama}.whatsapp`).toBe(false)
    }
  })

  it('membentuk tautan wa.me yang benar bila nanti dipakai', () => {
    const contoh = { nomor: '6285173358826', whatsapp: true }
    const url = tautanWhatsApp(contoh)
    expect(url).toMatch(/^https:\/\/wa\.me\/6285173358826\?text=/)
    const text = new URL(url).searchParams.get('text')
    expect(text).toBeTruthy()
    expect(text).toContain('skrining')
  })
})
