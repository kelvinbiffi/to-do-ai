import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/whatsapp/validate-token
 * 
 * Valida se um número WhatsApp está vinculado a um usuário
 * Usado pelo n8n para verificar se o usuário pode usar o agente
 * 
 * Query params:
 * - phone_number: "+5511999999999" (obrigatório)
 * 
 * Resposta:
 * {
 *   found: true,
 *   user_id: "uuid-do-usuario",
 *   email: "user@email.com"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phoneNumber = searchParams.get('phone_number')

    console.log('📱 [WhatsApp Validate] Checking phone:', phoneNumber)

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'phone_number query parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createSimpleSupabaseClient()

    // Buscar número WhatsApp vinculado
    const { data: whatsappRecord, error: whatsappError } = await supabase
      .from('user_whatsapp_numbers')
      .select('user_id')
      .eq('phone_number', phoneNumber)
      .single()

    if (whatsappError && whatsappError.code !== 'PGRST116') {
      // PGRST116 = no rows found (normal)
      console.error('❌ [WhatsApp Validate] Database error:', whatsappError.message)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Número não encontrado
    if (!whatsappRecord) {
      console.log('⚠️ [WhatsApp Validate] Phone number not found:', phoneNumber)
      return NextResponse.json(
        {
          found: false,
          message: 'This phone number is not registered',
        },
        { status: 404 }
      )
    }

    // Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', whatsappRecord.user_id)
      .single()

    if (userError || !user) {
      console.error('❌ [WhatsApp Validate] User not found:', whatsappRecord.user_id)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Buscar token ativo do usuário (get most recent)
    const { data: authTokens, error: tokenError } = await supabase
      .from('auth_tokens')
      .select('token, created_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    // Get the most recent active token
    const authToken = authTokens && authTokens.length > 0 ? authTokens[0] : null

    if (tokenError && tokenError.code !== 'PGRST116') {
      console.error('❌ [WhatsApp Validate] Error fetching token:', tokenError.message)
    }

    // Atualizar last_used
    const { error: updateError } = await supabase
      .from('user_whatsapp_numbers')
      .update({ last_used: new Date().toISOString() })
      .eq('phone_number', phoneNumber)

    if (updateError) {
      console.error('⚠️ [WhatsApp Validate] Error updating last_used:', updateError.message)
    }

    console.log('✅ [WhatsApp Validate] Phone found for user:', user.id)

    return NextResponse.json(
      {
        found: true,
        user_id: user.id,
        email: user.email,
        auth_token: authToken?.token || null,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ [WhatsApp Validate] Error:', err.message)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
