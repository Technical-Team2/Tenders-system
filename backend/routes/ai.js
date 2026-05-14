import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Score tender
router.post('/score-tender', async (req, res) => {
  try {
    const { tender_id, criteria } = req.body

    // Simple scoring logic - in production, integrate with OpenAI
    const score = Math.floor(Math.random() * 40) + 60 // Random score between 60-100

    const { data, error } = await supabase
      .from('tender_scores')
      .insert([{ tender_id, score, criteria }])
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Extract company info
// In-memory persistence for last extracted company (per process)
let lastExtractedCompany = null;

// Enhanced company extraction endpoint
router.post('/extract-company', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing company website URL' });
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`;
    try {
      new URL(normalizedUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid company website URL' });
    }

    // Dynamically import scraper to avoid circular deps
    const CompanyScraper = (await import('../services/companyScraper.js')).default;
    const scraper = new CompanyScraper();
    const companyInfo = await scraper.scrapeCompany(normalizedUrl);

    // Persist in memory for modal persistence
    lastExtractedCompany = companyInfo;

    res.json(companyInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Application assistance
router.post('/application-assist', async (req, res) => {
  try {
    const { tender_id, company_info } = req.body

    // Simple assistance - in production, integrate with AI service
    const assistance = {
      suggested_approach: 'Focus on highlighting relevant experience and technical capabilities',
      key_points: [
        'Company registration and compliance',
        'Technical expertise and team qualifications',
        'Previous similar project experience',
        'Financial stability and resources'
      ],
      estimated_success_rate: '75%'
    }

    res.json(assistance)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
