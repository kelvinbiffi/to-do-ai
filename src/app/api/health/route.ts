import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = 
    process.env.NEXT_PUBLIC_SUPABASE_API_KEY || 
    process.env.SUPABASE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const n8nWebhook = process.env.N8N_WEBHOOK_URL

  const isSupabaseConfigured = supabaseUrl && supabaseKey && supabaseKey.length > 100

  return NextResponse.json({
    status: isSupabaseConfigured ? 'OK' : 'ERROR',
    environment: {
      supabaseUrl: !!supabaseUrl,
      supabaseKey: !!supabaseKey,
      supabaseKeyIsValid: (supabaseKey?.length || 0) > 100,
      supabaseKeyLength: supabaseKey?.length || 0,
      baseUrl: !!baseUrl,
      n8nWebhook: !!n8nWebhook,
    },
    message: isSupabaseConfigured 
      ? '✅ Supabase configurado corretamente!' 
      : '❌ Configuração do Supabase inválida. Verifique o arquivo .env',
  })
}

