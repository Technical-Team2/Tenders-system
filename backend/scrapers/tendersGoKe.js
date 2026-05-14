import MultiLayerScraper from '../services/scraper.js';

const scraper = new MultiLayerScraper();

export async function scrape(url) {
  try {
    // Tenders.go.ke often requires rendering or specific headers
    const result = await scraper.scrape(url);
    
    // Attempt to detect items from the list
    const items = scraper.detectStructuredItems(result.html, url);
    
    if (items && items.length > 0) {
      return items.map((item, index) => {
        const fields = scraper.extractFieldsFromItem(item, index, url);
        return scraper.normalizeFields(fields);
      }).filter(item => scraper.validateRecord(item, []));
    }
    
    // Fallback to single item extraction
    const title = scraper.extractTitle(result.html);
    const description = scraper.extractDescription(result.html);
    const structuredData = scraper.extractStructuredData(result.html);
    
    return [scraper.enrichOutput({
      title,
      description,
      ...structuredData,
      source_url: url
    })];
  } catch (error) {
    console.error(`TendersGoKe scrape failed:`, error.message);
    throw error;
  }
}

export default {
  scrape
};
