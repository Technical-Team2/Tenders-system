import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Debug logging
  console.log('Middleware - Path:', req.nextUrl.pathname)
  console.log('Middleware - Session exists:', !!session)
  console.log('Middleware - Session user:', session?.user?.email)

  // Allow access to auth pages and landing page without authentication
  const publicPaths = ['/landing', '/about', '/signin', '/signup', '/forgot-password', '/callback']
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path))

  console.log('Middleware - Is public path:', isPublicPath)

  // If user is not signed in and trying to access protected route, redirect to signin
  if (!session && !isPublicPath && req.nextUrl.pathname !== '/') {
    console.log('Middleware - Redirecting to signin (unauthenticated user)')
    const redirectUrl = new URL('/signin', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Allow authenticated users to access auth pages (they might want to sign out or switch accounts)
  // No redirect needed for auth pages when user is already authenticated
  console.log('Middleware - Allowing access to:', req.nextUrl.pathname)

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next|[^?]*\\.(?:html?|json|txt|js|css|png|jpg|jpeg|gif|svg|ico|woff2?)).*)',
  ],
}
