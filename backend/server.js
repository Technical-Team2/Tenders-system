import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

// Route imports
import authRoutes from './routes/auth.js'
import tendersRoutes from './routes/tenders.js'
import applicationsRoutes from './routes/applications.js'
import tenderSourcesRoutes from './routes/tender-sources.js'
import aiRoutes from './routes/ai.js'
import emailRoutes from './routes/email.js'
import scrapeTenders from './routes/scrape-tenders.js'
import companyRoutes from './routes/company.js'

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
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
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

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tenders', tendersRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/tender-sources', tenderSourcesRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/scrape-tenders', scrapeTenders)
app.use('/api/companies', companyRoutes)

app.use('/scrape', scrapeTenders)

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend server running on http://0.0.0.0:${PORT}`)
  console.log(`Backend API origin is configured by deployment environment`)
  console.log('Available endpoints:')
  console.log('  POST /api/auth/signin - User sign in')
  console.log('  POST /api/auth/signup - User sign up')
  console.log('  GET /api/tenders - List tenders')
  console.log('  GET /api/tenders/:id - Get tender by id')
  console.log('  GET /api/applications - List applications')
  console.log('  GET /api/tender-sources - List tender sources')
  console.log('  POST /api/ai/score-tender - Score a tender')
  console.log('  POST /api/scrape-tenders - Scrape single tender source')
  console.log('  POST /scrape - Scrape one or more tender sources')
  console.log('  GET /api/scrape-tenders/status/:jobId - Get job status')
  console.log('  GET /health - Health check')
  console.log('  GET /api/companies - List company profiles')
})

export default app
