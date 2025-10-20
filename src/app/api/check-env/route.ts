import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_API_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_API_KEY?.length || 0,
    keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_API_KEY?.substring(0, 20) || 'NOT SET',
    allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
  })
}

