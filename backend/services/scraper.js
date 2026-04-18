import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { chromium } from 'playwright';
import { getRandomUserAgent, delay, retry } from '../utils/antiBlock.js';

class MultiLayerScraper {
  constructor() {
    this.strategies = ['axios', 'puppeteer', 'playwright'];
  }

  async fetchWithAxios(url, options = {}) {
    try {
      await delay(Math.random() * 2000 + 1000); // 1-3 second delay
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000,
        ...options
      });

      return response.data;
    } catch (error) {
      console.error('Axios fetch failed:', error.message);
      throw error;
    }
  }

  async fetchWithPuppeteer(url, options = {}) {
    let browser;
    try {
      await delay(Math.random() * 3000 + 2000); // 2-5 second delay
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      await page.setUserAgent(getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });

      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Wait for content to load
      await page.waitForTimeout(2000);

      const html = await page.content();
      return html;
    } catch (error) {
      console.error('Puppeteer fetch failed:', error.message);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async fetchWithPlaywright(url, options = {}) {
    let browser;
    try {
      await delay(Math.random() * 4000 + 3000); // 3-7 second delay
      
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      const context = await browser.newContext({
        userAgent: getRandomUserAgent(),
        viewport: { width: 1920, height: 1080 }
      });

      const page = await context.newPage();

      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });

      await page.goto(url, { 
        waitUntil: 'networkidle', 
        timeout: 30000 
      });

      // Wait for content to load
      await page.waitForTimeout(2000);

      const html = await page.content();
      return html;
    } catch (error) {
      console.error('Playwright fetch failed:', error.message);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  parseWithCheerio(html, selectors = {}) {
    const $ = cheerio.load(html);
    const results = {};

    Object.keys(selectors).forEach(key => {
      const selector = selectors[key];
      try {
        if (selector.multiple) {
          results[key] = $(selector.element).map((i, el) => {
            if (selector.text) {
              return $(el).text().trim();
            }
            if (selector.attr) {
              return $(el).attr(selector.attr);
            }
            return $(el).html();
          }).get();
        } else {
          const element = $(selector.element);
          if (selector.text) {
            results[key] = element.text().trim();
          }
          if (selector.attr) {
            results[key] = element.attr(selector.attr);
          }
          if (selector.html) {
            results[key] = element.html();
          }
        }
      } catch (error) {
        console.error(`Error parsing ${key}:`, error.message);
        results[key] = null;
      }
    });

    return results;
  }

  async scrapeWebsite(config) {
    const { url, strategy = 'axios', selectors, retryCount = 3 } = config;
    
    let html;
    let lastError;

    // Try the specified strategy first, then fallbacks
    const strategies = strategy === 'axios' ? ['axios', 'puppeteer', 'playwright'] :
                       strategy === 'puppeteer' ? ['puppeteer', 'playwright', 'axios'] :
                       ['playwright', 'puppeteer', 'axios'];

    for (const currentStrategy of strategies) {
      try {
        console.log(`Attempting to scrape ${url} with ${currentStrategy}`);
        
        html = await retry(
          () => this.fetchWith(currentStrategy, url),
          retryCount,
          `Failed to fetch ${url} with ${currentStrategy}`
        );

        if (html) {
          console.log(`Successfully fetched ${url} with ${currentStrategy}`);
          break;
        }
      } catch (error) {
        console.error(`${currentStrategy} failed for ${url}:`, error.message);
        lastError = error;
      }
    }

    if (!html) {
      throw new Error(`All scraping strategies failed for ${url}. Last error: ${lastError?.message}`);
    }

    // Parse the HTML with Cheerio
    const parsedData = this.parseWithCheerio(html, selectors);
    
    return {
      url,
      strategy: strategies.find(s => html),
      html,
      parsedData,
      timestamp: new Date().toISOString()
    };
  }

  async fetchWith(strategy, url) {
    switch (strategy) {
      case 'axios':
        return await this.fetchWithAxios(url);
      case 'puppeteer':
        return await this.fetchWithPuppeteer(url);
      case 'playwright':
        return await this.fetchWithPlaywright(url);
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }
}

export default MultiLayerScraper;
