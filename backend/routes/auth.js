import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()

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
    const { data, error } = await client.auth.getUser()

    if (error) {
      return res.status(500).json({ error: error.message })
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
      return res.status(500).json({ error: error.message })
    }

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
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Something went wrong!' })
  }
})

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const client = await getSupabase()
    const { error } = await client.auth.signOut()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ message: 'Signed out successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Something went wrong!' })
  }
})

export default router
