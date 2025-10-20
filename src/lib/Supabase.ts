import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = 
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY || 
  process.env.SUPABASE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  ''

// ============================================
// Simple database client (no Auth system)
// Just queries the users table directly
// ============================================
export function createSimpleSupabaseClient() {
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

// ============================================
// Browser client (for future use)
// ============================================
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  // Use simple client without Auth
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

