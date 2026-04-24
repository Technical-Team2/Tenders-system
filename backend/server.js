import dotenv from "dotenv"
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
const PORT = process.env.PORT || 3001

// Lazy load Supabase
let supabase = null
async function getSupabase() {
  if (!supabase) {
    const { createClient } = await import('@supabase/supabase-js')
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
  return supabase
}

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://yourdomain.com'
    : 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check (before Supabase middleware - works without database)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Attach supabase to requests (only for API routes)
app.use('/api', async (req, res, next) => {
  try {
    req.supabase = await getSupabase()
    next()
  } catch (error) {
    console.error('Failed to initialize Supabase:', error)
    res.status(500).json({ error: 'Database connection failed' })
  }
})

// Lazy load routes
app.use('/api/auth', async (req, res, next) => {
  const authRoutes = await import('./routes/auth.js')
  authRoutes.default(req, res, next)
})

app.use('/api/tenders', async (req, res, next) => {
  const tendersRoutes = await import('./routes/tenders.js')
  tendersRoutes.default(req, res, next)
})

app.use('/api/applications', async (req, res, next) => {
  const applicationsRoutes = await import('./routes/applications.js')
  applicationsRoutes.default(req, res, next)
})

app.use('/api/tender-sources', async (req, res, next) => {
  const tenderSourcesRoutes = await import('./routes/tender-sources.js')
  tenderSourcesRoutes.default(req, res, next)
})

app.use('/api/ai', async (req, res, next) => {
  const aiRoutes = await import('./routes/ai.js')
  aiRoutes.default(req, res, next)
})

app.use('/api/email', async (req, res, next) => {
  const emailRoutes = await import('./routes/email.js')
  emailRoutes.default(req, res, next)
})

app.use('/api/scrape-tenders', async (req, res, next) => {
  const scrapeTenders = await import('./routes/scrape-tenders.js')
  scrapeTenders.default(req, res, next)
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`)
  console.log('Available endpoints:')
  console.log('  POST /api/auth/signin - User sign in')
  console.log('  POST /api/auth/signup - User sign up')
  console.log('  GET /api/tenders - List tenders')
  console.log('  GET /api/tenders/:id - Get tender by id')
  console.log('  GET /api/applications - List applications')
  console.log('  GET /api/tender-sources - List tender sources')
  console.log('  POST /api/ai/score-tender - Score a tender')
  console.log('  POST /api/scrape-tenders - Scrape single tender source')
  console.log('  GET /api/scrape-tenders/status/:jobId - Get job status')
  console.log('  GET /health - Health check')
})

export default app
