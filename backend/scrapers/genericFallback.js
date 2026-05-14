import MultiLayerScraper from '../services/scraper.js';

const scraper = new MultiLayerScraper();

export async function scrape(url) {
  try {
    const result = await scraper.scrape(url);
    
    // Always return the tenders found by the unified scraper
    return result.tenders || [];
  } catch (error) {
    console.error(`Generic fallback scrape failed for ${url}:`, error.message);
    throw error;
  }
}

export default {
  scrape
};
