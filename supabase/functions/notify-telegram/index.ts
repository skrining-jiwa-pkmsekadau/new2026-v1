import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { formatPesanTelegram, samarkanNama } from './message.ts'

type OutboxRecord = { submission_id?: string | null }
type InsertWebhook = {
  type?: string
  table?: string
  schema?: string
  record?: OutboxRecord
}
type ScreeningRecord = {
  nama_lengkap: string | null
  nik: string | null
  tanggal_skrining: string | null
  submitted_at: string | null
  tempat_skrining: string | null
  instrumen: string | null
  tingkat_risiko: string | null
  submission_id: string
}

const wajibEnv = (nama: string): string => {
  const nilai = Deno.env.get(nama)
  if (!nilai) throw new Error(`Secret ${nama} belum dikonfigurasi`)
  return nilai
}

const formatTanggalWib = (tanggal: string | null | undefined): string => {
  if (!tanggal) return 'Waktu tidak tersedia'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeZone: 'Asia/Pontianak',
  }).format(new Date(`${tanggal}T00:00:00+07:00`))
}

const formatWaktuWib = (waktu: string | null | undefined): string => {
  if (!waktu) return 'Waktu tidak tersedia'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Pontianak',
  }).format(new Date(waktu)) + ' WIB'
}

async function markFailed(supabase: SupabaseClient, submissionId: string): Promise<void> {
  await supabase
    .from('telegram_notification_log')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('submission_id', submissionId)
}

async function kirimNotifikasi(
  supabase: SupabaseClient,
  submissionId: string,
  token: string,
  chatId: string,
): Promise<'sent' | 'duplicate' | 'failed'> {
  const { data: claimed, error: claimError } = await supabase.rpc(
    'claim_telegram_notification',
    { p_submission_id: submissionId },
  )
  if (claimError) return 'failed'
  if (claimed !== true) return 'duplicate'

  try {
    const { data: recordData, error: recordError } = await supabase
      .from('screenings')
      .select('nama_lengkap,nik,tanggal_skrining,submitted_at,tempat_skrining,instrumen,tingkat_risiko,submission_id')
      .eq('submission_id', submissionId)
      .single()
    const record = recordData as ScreeningRecord | null
    if (recordError || !record?.nik) throw new Error('Screening lookup failed')

    const [jumlahResult, sebelumnyaResult] = await Promise.all([
      supabase
        .from('screenings')
        .select('*', { count: 'exact', head: true })
        .eq('nik', record.nik)
        .eq('is_valid', true),
      supabase
        .from('screenings')
        .select('tanggal_skrining')
        .eq('nik', record.nik)
        .eq('is_valid', true)
        .neq('submission_id', submissionId)
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .order('tanggal_skrining', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])
    if (jumlahResult.error || sebelumnyaResult.error) throw new Error('History lookup failed')

    const pesan = formatPesanTelegram({
      namaTersamar: samarkanNama(record.nama_lengkap ?? ''),
      jumlahRiwayat: jumlahResult.count ?? 1,
      skriningSebelumnya: sebelumnyaResult.data?.tanggal_skrining
        ? formatTanggalWib(sebelumnyaResult.data.tanggal_skrining)
        : null,
      instrumen: record.instrumen ?? '-',
      risiko: record.tingkat_risiko ?? '-',
      lokasi: record.tempat_skrining || 'Puskesmas Sekadau',
      waktu: record.submitted_at
        ? formatWaktuWib(record.submitted_at)
        : formatTanggalWib(record.tanggal_skrining),
      kode: submissionId.slice(0, 8),
    })

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: pesan,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(2500),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok || result?.ok !== true) throw new Error('Telegram delivery failed')

    const { error: updateError } = await supabase
      .from('telegram_notification_log')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('submission_id', submissionId)
    if (updateError) throw new Error('Notification status update failed')
    return 'sent'
  } catch {
    await markFailed(supabase, submissionId)
    return 'failed'
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  if (req.headers.get('x-webhook-secret') !== wajibEnv('WEBHOOK_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  let payload: InsertWebhook | { type?: 'REDRIVE' | 'TEST' }
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const supabase = createClient(
    wajibEnv('SUPABASE_URL'),
    wajibEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
  const token = wajibEnv('TELEGRAM_BOT_TOKEN')
  const chatId = wajibEnv('TELEGRAM_CHAT_ID')

  if (payload.type === 'TEST') {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: 'PIJAR — Tes notifikasi berhasil.' }),
      signal: AbortSignal.timeout(2500),
    }).catch(() => null)
    return Response.json({ ok: response?.ok === true }, { status: response?.ok ? 200 : 502 })
  }

  let submissionId: string | null | undefined
  if (payload.type === 'REDRIVE') {
    const { data, error } = await supabase.rpc('next_telegram_notification')
    if (error) return new Response('Redrive claim failed', { status: 500 })
    submissionId = data
    if (!submissionId) return Response.json({ ok: true, idle: true })
  } else {
    const webhook = payload as InsertWebhook
    if (
      webhook.type !== 'INSERT' ||
      webhook.schema !== 'public' ||
      webhook.table !== 'telegram_notification_outbox'
    ) return new Response('Ignored', { status: 202 })
    submissionId = webhook.record?.submission_id
  }

  if (!submissionId) return new Response('Missing submission_id', { status: 400 })
  const status = await kirimNotifikasi(supabase, submissionId, token, chatId)
  return Response.json({ ok: status !== 'failed', status }, { status: status === 'failed' ? 502 : 200 })
})
