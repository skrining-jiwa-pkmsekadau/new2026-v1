import { bolehRetry, cocokkanReceipt } from '@/utils/receiptSkrining'

const tunggu = (ms) => {
  const { promise, resolve } = Promise.withResolvers()
  setTimeout(resolve, ms)
  return promise
}

export function buatPayloadSkrining(store) {
  const pasien = store.patientData
  return {
    submission_id: store.ensureSubmissionId(),
    nama_lengkap: pasien.nama_lengkap,
    nik: pasien.nik,
    tanggal_lahir: pasien.tanggal_lahir,
    usia: pasien.usia,
    jenis_kelamin: pasien.jenis_kelamin,
    nomor_hp: pasien.nomor_hp || '-',
    is_hamil_nifas: pasien.is_hamil_nifas,
    alamat: pasien.alamat,
    kecamatan: pasien.kecamatan,
    desa: pasien.desa,
    pendidikan: pasien.pendidikan,
    pekerjaan: pasien.pekerjaan,
    nama_sekolah: pasien.nama_sekolah || null,
    tanggal_skrining: pasien.tanggal_skrining,
    tempat_skrining: pasien.tempat_skrining,
    instrumen: store.instrumen,
    jawaban: [...store.answers],
    consent_at: store.consentAt,
    consent_version: store.consentVersion,
    consent_wali: store.consentWali,
  }
}

export async function simpanSkriningDenganReceipt(store, rpc, delay = tunggu) {
  const payload = buatPayloadSkrining(store)
  let receipt
  let error
  let status

  for (let attempt = 1; attempt <= 3; attempt++) {
    ({ data: receipt, error, status } = await rpc('simpan_skrining', { payload_data: payload }))
    if (!error) break
    if (!bolehRetry(status) || attempt === 3) throw error
    await delay(300 * attempt)
  }

  cocokkanReceipt(receipt, payload.submission_id)
  return { receipt, payload }
}
