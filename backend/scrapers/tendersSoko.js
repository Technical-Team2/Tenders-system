import MultiLayerScraper from '../services/scraper.js';

const scraper = new MultiLayerScraper();

export async function scrape(url) {
  try {
    const result = await scraper.scrape(url);
    
    // If unified scraper already found tenders, return them
    if (result.tenders && result.tenders.length > 0) {
      return result.tenders;
    }

    // Fallback/Override logic if unified fails but we have HTML
    const items = scraper.detectStructuredItems(result.html, url);
    if (items && items.length > 0) {
      return items.map((item, index) => {
        const fields = scraper.extractFieldsFromItem(item, index, url);
        return scraper.normalizeFields(fields);
      }).filter(item => scraper.validateRecord(item, []));
    }
    
    return [];
  } catch (error) {
    console.error(`TendersSoko scrape failed:`, error.message);
    throw error;
  }
}

export default {
  scrape
};
