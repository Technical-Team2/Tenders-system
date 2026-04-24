import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey
    })
    // Allow public access if Supabase is not configured
    return res
  }

  // Validate Supabase URL format
  try {
    new URL(supabaseUrl)
    if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
      throw new Error('Invalid URL protocol')
    }
  } catch (urlError) {
    console.error('Invalid Supabase URL format:', supabaseUrl, urlError)
    // Allow public access if Supabase URL is invalid
    return res
  }

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
  const publicPaths = ['/landing', '/about', '/signin', '/signup', '/forgot-password', '/callback', '/']
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path))

  console.log('Middleware - Is public path:', isPublicPath)

  // If user is not signed in and trying to access protected route, redirect to signin
  if (!session && !isPublicPath) {
    console.log('Middleware - Redirecting to signin (unauthenticated user)')
    const redirectUrl = new URL('/signin', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and trying to access signin/signup, redirect to dashboard
  if (session && (req.nextUrl.pathname === '/signin' || req.nextUrl.pathname === '/signup')) {
    console.log('Middleware - Redirecting to dashboard (already authenticated)')
    const redirectUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }

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
