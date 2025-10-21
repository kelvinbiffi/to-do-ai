import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Verificar cookies
  const userId = request.cookies.get('user_id')?.value
  const authToken = request.cookies.get('auth_token')?.value
  const isLoggedIn = !!(userId || authToken)

  // 🛡️ Debug
  console.log(`\n🛡️ [MIDDLEWARE] ${pathname} | Logged: ${isLoggedIn}`)

  // ===== CENÁRIO 1: Não autenticado tenta acessar rota protegida =====
  if (!isLoggedIn && pathname !== '/login' && !pathname.startsWith('/api')) {
    console.log(`   ➡️ Redirecting to /login`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ===== CENÁRIO 2: Já autenticado acessa /login =====
  if (isLoggedIn && pathname === '/login') {
    // Pega os query params
    const whatsappParam = request.nextUrl.searchParams.get('whatsapp')
    const numberParam = request.nextUrl.searchParams.get('number')
    const phoneNumber = whatsappParam || numberParam

    if (phoneNumber) {
      // Redireciona para WhatsApp authenticated com o número
      const redirectUrl = new URL(`/whatsapp-authenticated?number=${encodeURIComponent(phoneNumber)}`, request.url)
      console.log(`   ➡️ Redirecting to /whatsapp-authenticated?number=${phoneNumber}`)
      return NextResponse.redirect(redirectUrl)
    } else {
      // Redireciona para home
      console.log(`   ➡️ Redirecting to /`)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ===== DEFAULT: Deixa passar =====
  console.log(`   ✅ Pass through`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

