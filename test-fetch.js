import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://cnernzpzhjcmmhfpamwo.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZXJuenB6aGpjbW1oZnBhbXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDc3NjMsImV4cCI6MjA4NzM4Mzc2M30.WGkJggavu929wAJbCu6QoVqtPDKqP7miO-4vLbDdOlA'

const db = createClient(SUPABASE_URL, SUPABASE_ANON)

async function test() {
  const { data, error } = await db.from('screenings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching data:', error)
  } else {
    console.log('--- RECENT SCREENINGS DATA ---')
    data.forEach(row => {
      console.log(`\nNama: ${row.nama_lengkap}`)
      console.log(`Keys:`, Object.keys(row).join(', '))
      console.log(`Raw Object:`, JSON.stringify(row, null, 2))
    })
  }
}

test()
