import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Send email notification
router.post('/send-alert', async (req, res) => {
  try {
    const { tender_id, message, recipient_email } = req.body

    // Here you would integrate with an email service like SendGrid, Nodemailer, etc.
    // For now, just log the email request
    console.log('Email alert requested:', {
      tender_id,
      message,
      recipient_email,
      timestamp: new Date().toISOString()
    })

    res.json({ message: 'Email alert processed', status: 'logged' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
