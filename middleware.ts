import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function hasSessionCookie(req: NextRequest) {
  return req.cookies
    .getAll()
    .some((c) => c.name === 'next-auth.session-token' || c.name.startsWith('__Secure-next-auth.session-token'))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/login')) return NextResponse.next()
  if (pathname.startsWith('/api/auth')) return NextResponse.next()

  // Avoid redirect loops if Edge token decoding fails but the session cookie exists.
  if (pathname.startsWith('/dashboard')) {
    if (hasSessionCookie(req)) return NextResponse.next()

    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  const secret = process.env.NEXTAUTH_SECRET
  const token = await getToken({
    req,
    ...(secret ? { secret } : {}),
    secureCookie: process.env.NODE_ENV === 'production',
  })

  if (!token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/tasks/:path*', '/api/users/:path*', '/docs/:path*', '/api/docs/:path*'],
}
