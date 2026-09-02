import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { useSkriningStore } from '@/stores/skriningStore'

const baca = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8')

beforeEach(() => setActivePinia(createPinia()))

describe('kontrak penyimpanan skrining serentak', () => {

  it('dua pasien berurutan selalu mendapat submission_id berbeda', () => {
    const store = useSkriningStore()
    store.setPatientData({ nik: 'synthetic-a' })
    const pasienA = store.ensureSubmissionId()

    store.setPatientData({ nik: 'synthetic-b' })
    const pasienB = store.ensureSubmissionId()

    expect(pasienA).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(pasienB).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(pasienB).not.toBe(pasienA)
    expect(store.ensureSubmissionId()).toBe(pasienB)
  })

  it('perubahan jawaban membuat submission_id baru', () => {
    const store = useSkriningStore()
    store.setPatientData({ nik: 'synthetic-a' })
    store.setAnswer(0, { id: 'PHQ1', value: 0 })
    const sebelum = store.ensureSubmissionId()

    store.setAnswer(0, { id: 'PHQ1', value: 1 })

    expect(store.ensureSubmissionId()).not.toBe(sebelum)
  })
  it('migrasi mengunci submission_id dan RPC idempoten', () => {
    const sql = baca('../db/08_idempotensi_skrining.sql')

    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS submission_id UUID/i)
    expect(sql).toMatch(/CREATE UNIQUE INDEX idx_screenings_submission_id/i)
    expect(sql).toMatch(/ON CONFLICT \(submission_id\).*DO NOTHING/is)
    expect(sql).toMatch(/RETURNS UUID/i)
  })
})
