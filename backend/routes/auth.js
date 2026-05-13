import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()
const ACCESS_COOKIE = 'ts_access_token'
const REFRESH_COOKIE = 'ts_refresh_token'

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim())
  const cookie = cookies.find((entry) => entry.startsWith(`${name}=`))
  if (!cookie) return null

  return decodeURIComponent(cookie.slice(name.length + 1))
}

function getCookieOptions(maxAge) {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge,
  }
}

function setSessionCookies(res, session) {
  if (!session?.access_token || !session?.refresh_token) return

  res.cookie(ACCESS_COOKIE, session.access_token, getCookieOptions(session.expires_in * 1000))
  res.cookie(REFRESH_COOKIE, session.refresh_token, getCookieOptions(30 * 24 * 60 * 60 * 1000))
}

function clearSessionCookies(res) {
  res.clearCookie(ACCESS_COOKIE, getCookieOptions(0))
  res.clearCookie(REFRESH_COOKIE, getCookieOptions(0))
}

// Lazy load Supabase client
let supabase = null
async function getSupabase() {
  if (!supabase) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables')
    }
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
  return supabase
}

// Get current user
router.get('/user', async (req, res) => {
  try {
    const client = await getSupabase()
    const authorization = req.headers.authorization
    let accessToken = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : getCookie(req, ACCESS_COOKIE)
    const refreshToken = getCookie(req, REFRESH_COOKIE)

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    let { data, error } = accessToken
      ? await client.auth.getUser(accessToken)
      : { data: null, error: new Error('Missing access token') }

    if (error && refreshToken) {
      const refreshed = await client.auth.refreshSession({ refresh_token: refreshToken })

      if (refreshed.error || !refreshed.data.session) {
        clearSessionCookies(res)
        return res.status(401).json({ error: 'Session expired' })
      }

      setSessionCookies(res, refreshed.data.session)
      accessToken = refreshed.data.session.access_token
      const userResult = await client.auth.getUser(accessToken)
      data = userResult.data
      error = userResult.error
    }

    if (error) {
      clearSessionCookies(res)
      return res.status(401).json({ error: error.message })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Something went wrong!' })
  }
})

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const client = await getSupabase()
    const { email, password } = req.body

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    setSessionCookies(res, data.session)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Something went wrong!' })
  }
})

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const client = await getSupabase()
    const { email, password, metadata } = req.body

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      const status = error.status || (error.message?.toLowerCase().includes('already') ? 409 : 400)
      return res.status(status).json({ error: error.message })
    }

    setSessionCookies(res, data.session)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Something went wrong!' })
  }
})

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const client = await getSupabase()
    const refreshToken = getCookie(req, REFRESH_COOKIE)

    if (refreshToken) {
      try {
        await client.auth.refreshSession({ refresh_token: refreshToken })
        await client.auth.signOut()
      } catch {
        // Cookie clearing below is the source of truth for browser logout.
      }
    }

    clearSessionCookies(res)
    res.json({ message: 'Signed out successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Something went wrong!' })
  }
})

export default router
