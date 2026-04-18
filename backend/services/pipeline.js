import { createClient } from '@supabase/supabase-js';
import MultiLayerScraper from './scraper.js';
import CompanyScraper from './companyScraper.js';
import AIProcessor from './aiProcessor.js';

class ScrapingPipeline {
  constructor() {
    this.scraper = new MultiLayerScraper();
    this.companyScraper = new CompanyScraper();
    this.aiProcessor = new AIProcessor();
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async processTenderSource(sourceConfig) {
    const { url, name, selectors, companyUrl } = sourceConfig;
    
    try {
      console.log(`Starting pipeline for source: ${name} (${url})`);
      
      // Step 1: Fetch and parse tender listings
      const scrapeResult = await this.scraper.scrapeWebsite({
        url,
        strategy: 'axios',
        selectors,
        retryCount: 3
      });

      // Step 2: Extract tender details using AI
      const tenderDetails = await this.aiProcessor.extractTenderDetails(
        scrapeResult.html, 
        url
      );

      // Step 3: Clean and structure the data
      const cleanedData = await this.aiProcessor.cleanData(
        JSON.stringify(tenderDetails)
      );

      // Step 4: Classify the tender
      const classification = await this.aiProcessor.classifyTender(tenderDetails);

      // Step 5: Extract company information if available
      let companyInfo = null;
      if (companyUrl) {
        try {
          companyInfo = await this.companyScraper.scrapeCompany(companyUrl);
          const enrichedCompany = await this.aiProcessor.enrichCompany(companyInfo);
          companyInfo = { ...companyInfo, ...enrichedCompany };
        } catch (error) {
          console.error(`Failed to scrape company info: ${error.message}`);
        }
      }

      // Step 6: Create tender record
      const tenderRecord = {
        title: tenderDetails.title || cleanedData.cleanedText.substring(0, 100),
        description: tenderDetails.description || cleanedData.cleanedText,
        organization: tenderDetails.organization || name,
        deadline: tenderDetails.deadline ? new Date(tenderDetails.deadline).toISOString() : null,
        budget: tenderDetails.budget,
        source_url: url,
        source_name: name,
        status: 'new',
        reference: tenderDetails.reference,
        requirements: tenderDetails.requirements || [],
        contact_info: tenderDetails.contactInfo || {},
        documents: tenderDetails.documents || [],
        categories: tenderDetails.categories || [],
        scraped_at: new Date().toISOString(),
        ...classification
      };

      // Step 7: Check for duplicates and store in database
      const storedTender = await this.storeTenderWithDeduplication(tenderRecord);

      // Step 8: Store company information if available
      if (companyInfo && storedTender) {
        await this.storeCompanyInfo(companyInfo, storedTender.id);
      }

      // Step 9: Log the scraping activity
      await this.logScrapingActivity({
        source_url: url,
        source_name: name,
        status: 'success',
        tenders_found: 1,
        strategy_used: scrapeResult.strategy,
        processing_time: Date.now()
      });

      console.log(`Pipeline completed successfully for: ${name}`);
      return {
        success: true,
        tender: storedTender,
        company: companyInfo,
        classification
      };

    } catch (error) {
      console.error(`Pipeline failed for ${name}:`, error.message);
      
      // Log the failure
      await this.logScrapingActivity({
        source_url: url,
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
        throw checkError;
      }

      if (existing) {
        console.log(`Tender already exists: ${tenderData.title}`);
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

        if (updateError) throw updateError;
        return updated;
      }

      // Insert new tender
      const { data: inserted, error: insertError } = await this.supabase
        .from('tenders')
        .insert(tenderData)
        .select()
        .single();

      if (insertError) throw insertError;
      return inserted;

    } catch (error) {
      console.error('Error storing tender:', error.message);
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
