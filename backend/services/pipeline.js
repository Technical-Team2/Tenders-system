import { createClient } from '@supabase/supabase-js';
import MultiLayerScraper from './scraper.js';
import CompanyScraper from './companyScraper.js';
import AIProcessor from './aiProcessor.js';
import { scrapeTenders } from './scrapeRouter.js';

class ScrapingPipeline {
  constructor() {
    this.scraper = new MultiLayerScraper();
    this.companyScraper = new CompanyScraper();
    // AIProcessor is now optional - only instantiate if API key exists
    this.aiProcessor = new AIProcessor();
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // Helper function to normalize URL
  normalizeUrl(url) {
    if (!url) return url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  // Helper function to normalize numeric values
  normalizeNumber(value, fieldName = 'value') {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      if (isNaN(value)) {
        console.warn(`⚠️  ${fieldName}: NaN detected, converting to null`);
        return null;
      }
      return value;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === '-' || trimmed === 'N/A' || trimmed.toLowerCase() === 'null') {
        console.log(`ℹ️  ${fieldName}: Empty/null string detected, converting to null (original: "${value}")`);
        return null;
      }
      
      // Try to parse the number
      const parsed = parseFloat(trimmed.replace(/,/g, ''));
      if (isNaN(parsed)) {
        console.warn(`⚠️  ${fieldName}: Invalid number format, converting to null (original: "${value}")`);
        return null;
      }
      console.log(`✅ ${fieldName}: Normalized "${value}" → ${parsed}`);
      return parsed;
    }

    console.warn(`⚠️  ${fieldName}: Invalid type ${typeof value}, converting to null (original: ${JSON.stringify(value)})`);
    return null;
  }

  // Helper function to parse money strings (e.g., "KES 1,000,000", "$500,000")
  parseMoney(value, fieldName = 'money') {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return this.normalizeNumber(value, fieldName);
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      
      // Remove currency symbols and common patterns
      let cleaned = trimmed
        .replace(/[^\d.,-]/g, '') // Remove everything except digits, dots, commas, minus
        .replace(/,/g, ''); // Remove commas (thousands separators)
      
      // Handle empty after cleaning
      if (cleaned === '' || cleaned === '-' || cleaned === '.') {
        console.log(`ℹ️  ${fieldName}: Empty after cleaning, converting to null (original: "${value}")`);
        return null;
      }
      
      const parsed = parseFloat(cleaned);
      if (isNaN(parsed)) {
        console.warn(`⚠️  ${fieldName}: Failed to parse money, converting to null (original: "${value}")`);
        return null;
      }
      
      console.log(`💰 ${fieldName}: Parsed "${value}" → ${parsed}`);
      return parsed;
    }

    console.warn(`⚠️  ${fieldName}: Invalid type ${typeof value}, converting to null (original: ${JSON.stringify(value)})`);
    return null;
  }

  normalizeDate(value, fieldName = 'date') {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      console.warn(`Invalid ${fieldName} detected, converting to null (original: "${value}")`);
      return null;
    }

    return parsed.toISOString();
  }

  // Helper function to validate and sanitize tender data before insert
  validateTenderData(tenderData) {
    const validated = { ...tenderData };

    // Ensure categories is an array
    if (!Array.isArray(validated.categories)) {
      if (typeof validated.categories === 'string') {
        try {
          validated.categories = JSON.parse(validated.categories);
        } catch {
          validated.categories = [];
        }
      } else {
        validated.categories = [];
      }
    }

    // Ensure contact_info is an object
    if (typeof validated.contact_info !== 'object' || validated.contact_info === null) {
      if (typeof validated.contact_info === 'string') {
        try {
          validated.contact_info = JSON.parse(validated.contact_info);
        } catch {
          validated.contact_info = {};
        }
      } else {
        validated.contact_info = {};
      }
    }

    // Ensure documents is an array
    if (!Array.isArray(validated.documents)) {
      if (typeof validated.documents === 'string') {
        try {
          validated.documents = JSON.parse(validated.documents);
        } catch {
          validated.documents = [];
        }
      } else {
        validated.documents = [];
      }
    }

    // Ensure requirements is a string or array converted to string
    if (Array.isArray(validated.requirements)) {
      validated.requirements = validated.requirements.join(', ');
    } else if (typeof validated.requirements !== 'string') {
      validated.requirements = '';
    }

    // Ensure metadata is an object
    if (typeof validated.metadata !== 'object' || validated.metadata === null) {
      if (typeof validated.metadata === 'string') {
        try {
          validated.metadata = JSON.parse(validated.metadata);
        } catch {
          validated.metadata = {};
        }
      } else {
        validated.metadata = {};
      }
    }

    // Normalize all numeric fields
    // Budget - use parseMoney for currency values
    validated.budget = this.parseMoney(validated.budget, 'budget');

    // Score - use normalizeNumber for simple numeric scores
    validated.score = this.normalizeNumber(validated.score, 'score') || 0.5;

    // Priority - validate enum
    if (!['high', 'medium', 'low'].includes(validated.priority)) {
      validated.priority = 'medium';
    }

    // Handle any additional numeric fields that might be in the data
    // e.g., estimated_value, price, etc.
    if ('estimated_value' in validated) {
      validated.estimated_value = this.parseMoney(validated.estimated_value, 'estimated_value');
    }
    if ('price' in validated) {
      validated.price = this.parseMoney(validated.price, 'price');
    }
    if ('value' in validated) {
      validated.value = this.parseMoney(validated.value, 'value');
    }

    return validated;
  }

  getBaseTenderData(tenderData) {
    return {
      title: tenderData.title,
      description: tenderData.description,
      organization: tenderData.organization,
      sector: tenderData.sector,
      location: tenderData.location,
      deadline: tenderData.deadline,
      budget: tenderData.budget,
      currency: tenderData.currency || 'KES',
      source_id: tenderData.source_id || null,
      source_url: tenderData.source_url,
      status: tenderData.status || 'new'
    };
  }

  async processTenderSource(sourceConfig) {
    const { url, name, sourceId } = sourceConfig;
    const normalizedUrl = this.normalizeUrl(url);

    try {
      console.log(`Starting pipeline for source: ${name} (${normalizedUrl})`);
      const scrapeResult = await scrapeTenders(normalizedUrl);

      // Fetch company profile for intelligence matching
      const { data: companyProfile } = await this.supabase
        .from('company_info')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!scrapeResult.success) {
        return {
          success: false,
          source: scrapeResult.source,
          error: scrapeResult.error || 'Scraper failed',
          reason: 'Scraper failed',
          message: `Failed to scrape ${normalizedUrl}: ${scrapeResult.error || 'Unknown error'}`
        };
      }

      const extractedRecords = scrapeResult.data || [];

      if (extractedRecords.length === 0) {
        return {
          success: false,
          source: scrapeResult.source,
          error: 'No records found',
          reason: 'No records found',
          message: 'Page did not yield any extractable tender records.'
        };
      }

      const insertedTenders = [];
      const insertErrors = [];

      for (const extractedData of extractedRecords) {
        const tenderRecord = {
          title: extractedData.title || 'Untitled Tender',
          description: extractedData.description || 'No description available',
          organization: extractedData.organization || name,
          deadline: this.normalizeDate(extractedData.deadline || extractedData.date || extractedData.closing_date, 'deadline'),
          source_url: extractedData.source_url || normalizedUrl,
          source_id: sourceId || null,
          source_name: name,
          status: 'new',
          reference: extractedData.reference || null,
          requirements: [],
          contact_info: {},
          documents: [],
          categories: extractedData.category ? [extractedData.category] : [],
          scraped_at: new Date().toISOString(),
          sector: extractedData.sector || 'other',
          priority: 'medium',
          score: 0.5,
          location: extractedData.location,
          budget: extractedData.budget,
          metadata: {
            ...(extractedData.metadata || {}),
            extraction_method: scrapeResult.source,
            extraction_valid: true
          }
        };

        const validatedTender = this.validateTenderData(tenderRecord);

        try {
          const storedTender = await this.storeTenderWithDeduplication(validatedTender);
          
          // Perform Intelligence Analysis if AI is enabled and we have a company profile
          if (this.aiProcessor.isEnabled() && companyProfile) {
            console.log(`🤖 Analyzing compatibility for: ${storedTender.title}`);
            const analysis = await this.aiProcessor.analyzeTenderCompatibility(storedTender, companyProfile);
            
            if (analysis && analysis.scores) {
              await this.supabase
                .from('tender_scores')
                .upsert({
                  tender_id: storedTender.id,
                  score: analysis.scores.final_match_score,
                  breakdown: analysis
                });
              
              // Update tender status if it's highly recommended
              if (analysis.scores.final_match_score >= 80) {
                await this.supabase
                  .from('tenders')
                  .update({ status: 'recommended' })
                  .eq('id', storedTender.id);
              }
            }
          }

          insertedTenders.push(storedTender);
        } catch (error) {
          console.error(`Failed to process tender from ${normalizedUrl}: ${error.message}`);
          insertErrors.push(error.message);
        }
      }

      if (insertedTenders.length === 0) {
        return {
          success: false,
          source: scrapeResult.source,
          error: insertErrors[0] || 'No tenders were stored',
          reason: 'Database processing failed',
          message: `Extracted ${extractedRecords.length} tender(s), but none could be processed.`,
          extractedCount: extractedRecords.length,
          insertErrors
        };
      }

      return {
        success: true,
        source: scrapeResult.source,
        extractedCount: extractedRecords.length,
        count: insertedTenders.length,
        tenders: insertedTenders,
        insertErrors,
        message: `Successfully processed ${insertedTenders.length} tender(s) with intelligence matching`
      };
    } catch (error) {
      console.error(`Pipeline failed for ${name}:`, error.message);

      await this.logScrapingActivity({
        source_url: normalizedUrl,
        source_name: name,
        status: 'failed',
        error: error.message,
        tenders_found: 0
      });

      throw error;
    }
  }
  async storeTenderWithDeduplication(tenderData) {
    try {
      // Check for existing tender with same title and source
      const { data: existing, error: checkError } = await this.supabase
        .from('tenders')
        .select('id')
        .eq('title', tenderData.title)
        .eq('source_url', tenderData.source_url)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Supabase check error:', checkError);
        console.error('Error details:', checkError);
        throw checkError;
      }

      if (existing) {
        console.log(`📝 Tender already exists, updating: ${tenderData.title}`);
        // Update existing tender
        const { data: updated, error: updateError } = await this.supabase
          .from('tenders')
          .update({
            ...tenderData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) {
          if (updateError.code === 'PGRST204' || /column|schema cache/i.test(updateError.message || '')) {
            console.warn('Tender update used fields missing from the current database schema; retrying with base tender fields.');
            const { data: baseUpdated, error: baseUpdateError } = await this.supabase
              .from('tenders')
              .update({
                ...this.getBaseTenderData(tenderData),
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id)
              .select()
              .single();

            if (!baseUpdateError) {
              console.log(`✅ Tender updated successfully with base schema`);
              return baseUpdated;
            }

            console.error('❌ Supabase base update error:', baseUpdateError);
          }

          console.error('❌ Supabase update error:', updateError);
          console.error('Error details:', updateError);
          console.error('Failed field(s):', Object.keys(tenderData));
          throw updateError;
        }
        console.log(`✅ Tender updated successfully`);
        return updated;
      }

      // Insert new tender
      const { data: inserted, error: insertError } = await this.supabase
        .from('tenders')
        .insert(tenderData)
        .select()
        .single();

      if (insertError) {
        if (insertError.code === 'PGRST204' || /column|schema cache/i.test(insertError.message || '')) {
          console.warn('Tender insert used fields missing from the current database schema; retrying with base tender fields.');
          const { data: baseInserted, error: baseInsertError } = await this.supabase
            .from('tenders')
            .insert(this.getBaseTenderData(tenderData))
            .select()
            .single();

          if (!baseInsertError) {
            console.log(`✅ Tender inserted successfully with base schema`);
            return baseInserted;
          }

          console.error('❌ Supabase base insert error:', baseInsertError);
        }

        console.error('❌ Supabase insert error:', insertError);
        console.error('Error details:', insertError);
        console.error('Failed field(s):', Object.keys(tenderData));
        console.error('Field values:', JSON.stringify(tenderData, null, 2));
        throw insertError;
      }
      console.log(`✅ Tender inserted successfully`);
      return inserted;

    } catch (error) {
      console.error('❌ Error storing tender:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async storeCompanyInfo(companyInfo, tenderId) {
    try {
      const companyRecord = {
        name: companyInfo.name,
        description: companyInfo.description,
        industry: companyInfo.industry || companyInfo.normalizedIndustry,
        website: companyInfo.website,
        contacts: companyInfo.contacts,
        social_links: companyInfo.socialLinks,
        company_size: companyInfo.companySize,
        business_type: companyInfo.businessType,
        reliability_score: companyInfo.reliabilityScore,
        specializations: companyInfo.specializations,
        geographic_scope: companyInfo.geographicScope,
        key_services: companyInfo.keyServices,
        risk_level: companyInfo.riskLevel,
        extracted_at: companyInfo.extractedAt,
        tender_id: tenderId
      };

      const { data, error } = await this.supabase
        .from('companies')
        .upsert(companyRecord, {
          onConflict: 'name,website',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error storing company info:', error.message);
      throw error;
    }
  }

  async logScrapingActivity(logData) {
    try {
      const logRecord = {
        source_url: logData.source_url,
        source_name: logData.source_name,
        status: logData.status,
        tenders_found: logData.tenders_found || 0,
        strategy_used: logData.strategy_used || 'unknown',
        processing_time: logData.processing_time || 0,
        error: logData.error || null,
        scraped_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('scrape_logs')
        .insert(logRecord)
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error logging scraping activity:', error.message);
      // Don't throw here as logging failure shouldn't stop the pipeline
    }
  }

  async processBatch(sources) {
    const results = [];
    const concurrencyLimit = 3; // Process 3 sources at a time
    
    for (let i = 0; i < sources.length; i += concurrencyLimit) {
      const batch = sources.slice(i, i + concurrencyLimit);
      
      const batchPromises = batch.map(source => 
        this.processTenderSource(source).catch(error => ({
          success: false,
          source: source.name,
          error: error.message
        }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (i + concurrencyLimit < sources.length) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    return results;
  }

  async getScrapingStats() {
    try {
      const { data, error } = await this.supabase
        .from('scrape_logs')
        .select('status, tenders_found, scraped_at')
        .order('scraped_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const stats = {
        total_scrapes: data.length,
        successful_scrapes: data.filter(log => log.status === 'success').length,
        failed_scrapes: data.filter(log => log.status === 'failed').length,
        total_tenders: data.reduce((sum, log) => sum + (log.tenders_found || 0), 0),
        last_scrape: data[0]?.scraped_at || null
      };

      return stats;
    } catch (error) {
      console.error('Error getting scraping stats:', error.message);
      return {
        total_scrapes: 0,
        successful_scrapes: 0,
        failed_scrapes: 0,
        total_tenders: 0,
        last_scrape: null
      };
    }
  }

  async cleanupOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await this.supabase
        .from('scrape_logs')
        .delete()
        .lt('scraped_at', cutoffDate.toISOString())
        .select();

      if (error) throw error;
      
      console.log(`Cleaned up ${data.length} old log entries`);
      return data.length;
    } catch (error) {
      console.error('Error cleaning up old logs:', error.message);
      return 0;
    }
  }
}

export default ScrapingPipeline;

