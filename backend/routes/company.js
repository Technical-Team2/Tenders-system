import express from 'express';
import { createClient } from '@supabase/supabase-js';
import CompanyScraper from '../services/companyScraper.js';
import dotenv from 'dotenv';

dotenv.config();
console.log('🚀 Company routes module loaded');

const router = express.Router();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const scraper = new CompanyScraper();

// GET all company profiles
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single company profile
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Extract company info from URL
router.post('/extract', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const profile = await scraper.scrapeCompany(url);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to map profile data to DB schema
const mapToDb = (profile) => ({
  name: profile.name,
  website: profile.website || profile.url,
  tagline: profile.tagline,
  description: profile.description,
  about: profile.about,
  industry: profile.industry,
  intelligence_summary: profile.intelligence_summary || profile.intelligenceSummary,
  contacts: profile.contacts,
  social_links: profile.social_links || profile.socialLinks,
  services: profile.services,
  products: profile.products,
  technologies: profile.technologies,
  branch_locations: profile.branch_locations || profile.branchLocations,
  registration_numbers: profile.registration_numbers || profile.registrationNumbers,
  value_propositions: profile.value_propositions || profile.valuePropositions,
  target_customers: profile.target_customers || profile.targetCustomers,
  company_positioning: profile.company_positioning || profile.companyPositioning,
  operational_capabilities: profile.operational_capabilities || profile.operationalCapabilities,
  automation_capabilities: profile.automation_capabilities || profile.automationCapabilities,
  integrations: profile.integrations,
  keywords: profile.keywords,
  team: profile.team,
  digital_presence: profile.digital_presence || profile.digitalPresence,
  og_data: profile.og_data || profile.ogData,
  schema_org: profile.schema_org || profile.schemaOrg,
  business_category: profile.business_category || profile.businessCategory,
  business_type: profile.business_type || profile.businessType,
  year_founded: profile.year_founded || profile.yearFounded,
  company_size: profile.company_size || profile.companySize,
  headquarters: profile.headquarters,
  raw_data: profile.raw_data || profile,
  updated_at: new Date().toISOString()
});

// POST Create or Upsert company profile
router.post('/', async (req, res) => {
  try {
    const dbData = mapToDb(req.body);
    const { data, error } = await supabase
      .from('company_info')
      .upsert(dbData, { onConflict: 'website' })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT Update company profile
router.put('/:id', async (req, res) => {
  try {
    const dbData = mapToDb(req.body);
    // Remove website from update to avoid constraint issues if changed to something that exists
    // (though usually ID is the primary key and website is unique)
    delete dbData.created_at; // Ensure we don't overwrite creation time

    const { data, error } = await supabase
      .from('company_info')
      .update(dbData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE company profile
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('company_info')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
