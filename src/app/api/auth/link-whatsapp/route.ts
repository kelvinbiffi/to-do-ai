import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { successResponse, errorResponse } from '@/lib/ApiResponseHelper'

/**
 * POST /api/auth/link-whatsapp
 * Link a WhatsApp number to the currently authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone_number } = body

    if (!phone_number) {
      return errorResponse(
        'Phone number is required',
        400,
        { validationErrors: { phone_number: 'Phone number is required' } },
        'POST /api/auth/link-whatsapp'
      )
    }

    // Get user_id from cookie
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return errorResponse(
        'Unauthorized: User not authenticated',
        401,
        { reason: 'No user_id in cookies' },
        'POST /api/auth/link-whatsapp'
      )
    }

    const supabase = createSimpleSupabaseClient()

    // First, check if this WhatsApp number already exists
    const { data: existingNumber, error: checkError } = await supabase
      .from('user_whatsapp_numbers')
      .select('id, user_id')
      .eq('phone_number', phone_number)
      .single()

    if (existingNumber) {
      // Number exists
      if (existingNumber.user_id === userId) {
        // Already linked to this user
        return successResponse(
          {
            success: true,
            message: 'WhatsApp number already linked to this user',
            phone_number: phone_number,
          },
          'WhatsApp number already linked',
          200,
          'POST /api/auth/link-whatsapp'
        )
      } else {
        // Linked to different user - update to current user
        const { error: updateError } = await supabase
          .from('user_whatsapp_numbers')
          .update({ user_id: userId, last_used: new Date().toISOString() })
          .eq('phone_number', phone_number)

        if (updateError) {
          return errorResponse(
            'Failed to link WhatsApp number',
            500,
            { reason: updateError.message },
            'POST /api/auth/link-whatsapp'
          )
        }

        return successResponse(
          {
            success: true,
            message: 'WhatsApp number transferred to this account',
            phone_number: phone_number,
          },
          'WhatsApp number linked successfully',
          200,
          'POST /api/auth/link-whatsapp'
        )
      }
    } else {
      // Number doesn't exist - insert it
      const { data: newRecord, error: insertError } = await supabase
        .from('user_whatsapp_numbers')
        .insert({
          user_id: userId,
          phone_number: phone_number,
        })
        .select()
        .single()

      if (insertError) {
        return errorResponse(
          'Failed to link WhatsApp number',
          500,
          { reason: insertError.message },
          'POST /api/auth/link-whatsapp'
        )
      }

      return successResponse(
        {
          success: true,
          message: 'WhatsApp number linked successfully',
          phone_number: phone_number,
        },
        'WhatsApp number linked successfully',
        200,
        'POST /api/auth/link-whatsapp'
      )
    }
  } catch (err: any) {
    return errorResponse(
      err instanceof Error ? err : 'Unknown error',
      500,
      { endpoint: 'POST /api/auth/link-whatsapp' },
      'POST /api/auth/link-whatsapp'
    )
  }
}
