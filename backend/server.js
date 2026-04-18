import dotenv from "dotenv"
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createClient } from '@supabase/supabase-js'
import scrapeTenders from './routes/scrape-tenders.js'
import authRoutes from './routes/auth.js'
import ScrapingScheduler from './jobs/scrapeJob.js'

const app = express()
const PORT = process.env.PORT || 3001

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Attach supabase
app.use((req, res, next) => {
  req.supabase = supabase
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/scrape-tenders', scrapeTenders)

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
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

// Initialize scraping scheduler
const scheduler = new ScrapingScheduler()

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`)
  console.log('Production scraping system initialized')
  console.log('Available endpoints:')
  console.log('  POST /api/scrape-tenders - Scrape single tender source')
  console.log('  POST /api/scrape-tenders/batch - Batch scrape multiple sources')
  console.log('  GET /api/scrape-tenders/status/:jobId - Get job status')
  console.log('  GET /api/scrape-tenders/queue-stats - Get queue statistics')
  console.log('  GET /api/scrape-tenders/history - Get job history')
  console.log('  POST /api/scrape-tenders/emergency - Emergency high-priority scraping')
  console.log('  POST /api/scrape-tenders/company - Scrape company information')
  console.log('  GET /api/scrape-tenders/stats - Get scraping statistics')
  console.log('  POST /api/scrape-tenders/cleanup - Clean up old logs')
})