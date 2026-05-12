const SCRAPERS = {
  tendersGoKe: () => import('../scrapers/tendersGoKe.js'),
  tendersSoko: () => import('../scrapers/tendersSoko.js'),
  genericFallback: () => import('../scrapers/genericFallback.js'),
};

export function detectSource(url) {
  if (url.includes('tenders.go.ke')) return 'tendersGoKe';
  if (url.includes('tendersoko.com')) return 'tendersSoko';
  return 'genericFallback';
}

export async function scrapeTenders(url) {
  const source = detectSource(url);

  try {
    const scraperModule = await SCRAPERS[source]();
    const scraper = scraperModule.default || scraperModule;
    const data = await scraper.scrape(url);

    return {
      success: true,
      source,
      data,
    };
  } catch (err) {
    console.error(`Scrape failed for ${source} (${url}):`, err.message);
    return {
      success: false,
      source,
      error: err.message,
      data: [],
    };
  }
}

export async function scrapeMultiple(urls) {
  return Promise.all(urls.map(url => scrapeTenders(url)));
}

export default {
  detectSource,
  scrapeTenders,
  scrapeMultiple,
};
