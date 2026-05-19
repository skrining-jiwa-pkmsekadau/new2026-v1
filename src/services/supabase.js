import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON

export const db = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
