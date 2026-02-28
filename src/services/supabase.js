import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://cnernzpzhjcmmhfpamwo.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZXJuenB6aGpjbW1oZnBhbXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDc3NjMsImV4cCI6MjA4NzM4Mzc2M30.WGkJggavu929wAJbCu6QoVqtPDKqP7miO-4vLbDdOlA'

export const db = createClient(SUPABASE_URL, SUPABASE_ANON)
