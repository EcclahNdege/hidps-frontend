import { updateSession } from './lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // This logic is not needed because the `updateSession` function handles
  // the session refresh.

  // if (
  //   request.nextUrl.pathname.startsWith('/login') ||
  //   request.nextUrl.pathname.startsWith('/signup')
  // ) {
  //   if (user) {
  //     return NextResponse.redirect(new URL('/dashboard', request.url))
  //   }
  //   return
  // }

  // if (
  //   !user &&
  //   !request.nextUrl.pathname.startsWith('/login') &&
  //   !request.nextUrl.pathname.startsWith('/signup')
  // ) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (image files)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
}