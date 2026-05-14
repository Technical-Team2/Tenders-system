import MultiLayerScraper from '../services/scraper.js';

const scraper = new MultiLayerScraper();

export async function scrape(url) {
  try {
    // For general scraping, we use the multilayer fetch and then a basic parse
    const result = await scraper.scrape(url);
    
    // MultiLayerScraper already does some parsing, but we want to return a consistent format
    // usually an array of tender objects
    
    // If it's a list page, it might have multiple items
    const items = scraper.detectStructuredItems(result.html, url);
    
    if (items && items.length > 0) {
      return items.map((item, index) => {
        const fields = scraper.extractFieldsFromItem(item, index, url);
        return scraper.normalizeFields(fields);
      }).filter(item => scraper.validateRecord(item, []));
    }
    
    // If it's a single tender page
    const title = scraper.extractTitle(result.html);
    const description = scraper.extractDescription(result.html);
    const structuredData = scraper.extractStructuredData(result.html);
    
    if (scraper.validateExtraction(title, description)) {
      const tender = {
        title,
        description,
        ...structuredData,
        source_url: url
      };
      return [scraper.enrichOutput(tender)];
    }
    
    return [];
  } catch (error) {
    console.error(`Generic fallback scrape failed for ${url}:`, error.message);
    throw error;
  }
}

export default {
  scrape
};
