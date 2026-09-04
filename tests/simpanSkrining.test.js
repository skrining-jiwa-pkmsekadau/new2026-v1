import { describe, expect, it, vi } from 'vitest'
import { simpanSkriningDenganReceipt } from '@/services/simpanSkrining'

const store = () => ({
  patientData: {
    nama_lengkap: 'Pasien Uji', nik: '0000000000000000', tanggal_lahir: '2000-01-01',
    usia: 26, jenis_kelamin: 'L', nomor_hp: '-', is_hamil_nifas: false,
    alamat: 'Uji', kecamatan: 'Sekadau Hilir', desa: 'Uji', pendidikan: 'SMA',
    pekerjaan: 'Pelajar', nama_sekolah: 'Sekolah Uji', tanggal_skrining: '2026-09-04',
    tempat_skrining: 'Sekolah Uji',
  },
  instrumen: 'PHQ4',
  answers: [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
  consentAt: '2026-09-04T00:00:00.000Z', consentVersion: '1.0', consentWali: false,
  submissionId: '123e4567-e89b-42d3-a456-426614174000',
  ensureSubmissionId() { return this.submissionId },
})

describe('simpan skrining sebelum hasil', () => {
  it('baru sukses bila receipt database cocok', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: '123e4567-e89b-42d3-a456-426614174000', error: null, status: 200,
    })

    const result = await simpanSkriningDenganReceipt(store(), rpc)

    expect(result.receipt).toBe('123e4567-e89b-42d3-a456-426614174000')
    expect(rpc).toHaveBeenCalledOnce()
  })

  it('menolak receipt yang tidak cocok', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: '123e4567-e89b-42d3-a456-426614174999', error: null, status: 200,
    })

    await expect(simpanSkriningDenganReceipt(store(), rpc)).rejects.toThrow('tidak sesuai')
  })

  it('retry gangguan sementara dengan submission_id yang sama', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: null, error: new Error('sementara'), status: 503 })
      .mockResolvedValueOnce({ data: '123e4567-e89b-42d3-a456-426614174000', error: null, status: 200 })

    await simpanSkriningDenganReceipt(store(), rpc, async () => {})

    expect(rpc).toHaveBeenCalledTimes(2)
    expect(rpc.mock.calls[0][1].payload_data.submission_id)
      .toBe(rpc.mock.calls[1][1].payload_data.submission_id)
  })
})
