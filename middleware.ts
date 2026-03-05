import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/login')) return NextResponse.next()
  if (pathname.startsWith('/api/auth')) return NextResponse.next()

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
