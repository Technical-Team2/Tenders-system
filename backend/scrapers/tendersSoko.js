import MultiLayerScraper from '../services/scraper.js';

const scraper = new MultiLayerScraper();

export async function scrape(url) {
  try {
    const result = await scraper.scrape(url);
    const items = scraper.detectStructuredItems(result.html, url);
    
    if (items && items.length > 0) {
      return items.map((item, index) => {
        const fields = scraper.extractFieldsFromItem(item, index, url);
        return scraper.normalizeFields(fields);
      }).filter(item => scraper.validateRecord(item, []));
    }
    
    return [scraper.enrichOutput({
      title: scraper.extractTitle(result.html),
      description: scraper.extractDescription(result.html),
      ...scraper.extractStructuredData(result.html),
      source_url: url
    })];
  } catch (error) {
    console.error(`TendersSoko scrape failed:`, error.message);
    throw error;
  }
}

export default {
  scrape
};
