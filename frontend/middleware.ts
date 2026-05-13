import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/landing', '/about', '/signin', '/signup', '/forgot-password', '/callback', '/', '/auth-test']

function isPublicPath(pathname: string) {
  return publicPaths.some((path) => pathname === path || (path !== '/' && pathname.startsWith(path)))
}

export async function middleware(req: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    if (isPublicPath(req.nextUrl.pathname)) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/signin', req.url))
  }

  let authenticated = false
  let setCookie: string | null = null

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/auth/user`, {
      headers: {
        cookie: req.headers.get('cookie') || '',
      },
      credentials: 'include',
      cache: 'no-store',
    })

    authenticated = response.ok
    setCookie = response.headers.get('set-cookie')
  } catch {
    authenticated = false
  }

  if (!authenticated && !isPublicPath(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  if (authenticated && (req.nextUrl.pathname === '/signin' || req.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  const response = NextResponse.next()
  if (setCookie) {
    response.headers.append('set-cookie', setCookie)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|json|txt|js|css|png|jpg|jpeg|gif|svg|ico|woff2?)).*)',
  ],
}
