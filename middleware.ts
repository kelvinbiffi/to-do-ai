import { NextResponse, type NextRequest } from 'next/server'

// FORCE RELOAD: 2024-10-18-v3
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Check if authenticated via cookie
  const userCookie = request.cookies.get('user_id')?.value
  const isAuthenticated = !!userCookie

  console.log(`🛡️ [MIDDLEWARE v2] ${pathname} - Auth: ${isAuthenticated ? '✅ YES' : '❌ NO'}`)
  console.log(`🍪 [MIDDLEWARE] Cookie value: "${userCookie || 'EMPTY'}"`)
  console.log(`🍪 [MIDDLEWARE] All cookies: ${JSON.stringify(Object.fromEntries(request.cookies))}`)

  // If not authenticated and not login, redirect
  if (!isAuthenticated && !pathname.startsWith('/login') && !pathname.startsWith('/api')) {
    console.log(`🔒 [MIDDLEWARE] Not authenticated - redirecting to /login`)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated and tries to access login, redirect to home
  if (isAuthenticated && pathname.startsWith('/login')) {
    console.log(`✅ [MIDDLEWARE] Already authenticated - redirecting to /`)
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

