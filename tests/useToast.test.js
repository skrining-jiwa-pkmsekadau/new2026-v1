/**
 * useToast.test.js — Menjaga pesan notifikasi tetap terlihat, terisolasi,
 * dan terhapus tepat waktu agar validasi formulir tidak terlewat pengguna.
 */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { useToast } from '@/composables/useToast'

let toast

beforeEach(() => {
  vi.useFakeTimers()
  toast = useToast()
  toast.bersihkanToast()
})

afterEach(() => {
  toast.bersihkanToast()
  vi.useRealTimers()
})

describe('useToast', () => {
  it('menambahkan toast dan mengembalikan id', () => {
    const id = toast.showToast('Berhasil disimpan', 'success')

    expect(id).toEqual(expect.any(Number))
    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]).toMatchObject({
      id,
      msg: 'Berhasil disimpan',
      type: 'success',
    })
  })

  it.each([
    ['success', 'check_circle'],
    ['error', 'error'],
    ['info', 'info'],
    ['warning', 'warning'],
  ])('memasang ikon %s sesuai tipe', (type, icon) => {
    toast.showToast('Pesan', type)

    expect(toast.toasts.value[0].icon).toBe(icon)
  })

  it('memakai ikon info untuk tipe yang tidak dikenal', () => {
    toast.showToast('Pesan', 'lainnya')

    expect(toast.toasts.value[0].icon).toBe('info')
  })

  it('menghapus toast otomatis setelah durasi selesai', () => {
    toast.showToast('Pesan', 'info')

    vi.advanceTimersByTime(3499)
    expect(toast.toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(toast.toasts.value).toHaveLength(0)
  })

  it.each([
    ['error', 6000],
    ['warning', 5000],
    ['success', 3500],
    ['info', 3500],
  ])('mempertahankan durasi baku tipe %s sampai batas %ims', (type, duration) => {
    toast.showToast('Validasi formulir', type)

    vi.advanceTimersByTime(duration - 1)
    expect(toast.toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(toast.toasts.value).toHaveLength(0)
  })

  it('memberi waktu lebih panjang untuk error daripada success', () => {
    toast.showToast('Galat validasi', 'error')
    toast.showToast('Berhasil', 'success')

    vi.advanceTimersByTime(3500)
    expect(toast.toasts.value.map(({ type }) => type)).toEqual(['error'])
  })

  it('menerapkan durasi ms eksplisit di atas durasi baku', () => {
    toast.showToast('Pesan singkat', 'error', 100)

    vi.advanceTimersByTime(99)
    expect(toast.toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(toast.toasts.value).toHaveLength(0)
  })

  it('menutup toast yang dipilih tanpa mengganggu toast lain', () => {
    const pertama = toast.showToast('Pertama', 'info')
    const kedua = toast.showToast('Kedua', 'info')

    toast.tutupToast(pertama)

    expect(toast.toasts.value.map(({ id }) => id)).toEqual([kedua])
  })

  it('aman dipanggil untuk id yang sudah hilang', () => {
    const id = toast.showToast('Pesan', 'success')
    vi.advanceTimersByTime(3500)

    expect(() => toast.tutupToast(id)).not.toThrow()
    expect(toast.toasts.value).toHaveLength(0)
  })

  it('mengosongkan seluruh toast', () => {
    toast.showToast('Pertama', 'info')
    toast.showToast('Kedua', 'error')

    toast.bersihkanToast()

    expect(toast.toasts.value).toEqual([])
  })

  it('membersihkan timer tertunda tanpa menghidupkan kembali daftar', () => {
    toast.showToast('Pesan', 'error')
    toast.bersihkanToast()

    expect(() => vi.advanceTimersByTime(60000)).not.toThrow()
    expect(toast.toasts.value).toEqual([])
  })

  it('mempertahankan urutan panggilan dan jadwal tiap toast secara mandiri', () => {
    const panjang = toast.showToast('Error', 'error')
    const pendek = toast.showToast('Success', 'success')

    expect(toast.toasts.value.map(({ id }) => id)).toEqual([panjang, pendek])
    vi.advanceTimersByTime(3500)
    expect(toast.toasts.value.map(({ id }) => id)).toEqual([panjang])
    vi.advanceTimersByTime(2500)
    expect(toast.toasts.value).toEqual([])
  })

  it('selalu menghasilkan id unik dan tidak memakai ulang id', () => {
    const pertama = toast.showToast('Pertama')
    toast.tutupToast(pertama)
    const kedua = toast.showToast('Kedua')

    expect(kedua).not.toBe(pertama)
  })
})
