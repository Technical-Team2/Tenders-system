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

    // Persist in DB for permanent storage
    try {
      const dbData = {
        name: companyInfo.name,
        website: normalizedUrl,
        tagline: companyInfo.tagline,
        description: companyInfo.description,
        about: companyInfo.about,
        industry: companyInfo.industry,
        intelligence_summary: companyInfo.intelligenceSummary,
        contacts: companyInfo.contacts,
        social_links: companyInfo.socialLinks,
        services: companyInfo.services,
        products: companyInfo.products,
        technologies: companyInfo.technologies,
        branch_locations: companyInfo.branchLocations,
        registration_numbers: companyInfo.registrationNumbers,
        value_propositions: companyInfo.valuePropositions,
        target_customers: companyInfo.targetCustomers,
        company_positioning: companyInfo.companyPositioning,
        operational_capabilities: companyInfo.operationalCapabilities,
        automation_capabilities: companyInfo.automationCapabilities,
        integrations: companyInfo.integrations,
        keywords: companyInfo.keywords,
        team: companyInfo.team,
        digital_presence: companyInfo.digitalPresence,
        og_data: companyInfo.ogData,
        schema_org: companyInfo.schemaOrg,
        business_category: companyInfo.businessCategory,
        business_type: companyInfo.businessType,
        year_founded: companyInfo.yearFounded,
        company_size: companyInfo.companySize,
        headquarters: companyInfo.headquarters,
        raw_data: companyInfo,
        updated_at: new Date().toISOString()
      };

      await supabase
        .from('company_info')
        .upsert(dbData, { onConflict: 'website' });
        
      console.log(`✅ Persisted company info for ${normalizedUrl}`);
    } catch (dbError) {
      console.error('Failed to persist company info in DB:', dbError.message);
      // Don't fail the request if DB save fails
    }

    // Persist in memory for modal persistence (legacy support)
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
