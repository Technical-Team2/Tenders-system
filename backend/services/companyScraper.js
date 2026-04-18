import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { getRandomUserAgent, delay, retry } from '../utils/antiBlock.js';

class CompanyScraper {
  constructor() {
    this.companySelectors = {
      name: [
        { element: 'h1', text: true },
        { element: '.company-name', text: true },
        { element: '.organization-name', text: true },
        { element: '[property="og:title"]', attr: 'content' },
        { element: 'title', text: true }
      ],
      description: [
        { element: 'meta[name="description"]', attr: 'content' },
        { element: '[property="og:description"]', attr: 'content' },
        { element: '.company-description', text: true },
        { element: '.about-us', text: true },
        { element: '.description', text: true }
      ],
      industry: [
        { element: '.industry', text: true },
        { element: '.sector', text: true },
        { element: '.category', text: true },
        { element: '[property="business:category"]', attr: 'content' }
      ],
      contacts: [
        { element: '.contact', text: true },
        { element: '.phone', text: true },
        { element: '.email', text: true },
        { element: 'a[href^="tel:"]', attr: 'href' },
        { element: 'a[href^="mailto:"]', attr: 'href' }
      ],
      website: [
        { element: 'a[href^="http"]', attr: 'href' },
        { element: '[property="og:url"]', attr: 'content' },
        { element: 'link[rel="canonical"]', attr: 'href' }
      ],
      address: [
        { element: '.address', text: true },
        { element: '.location', text: true },
        { element: '[property="business:contact_data:street_address"]', attr: 'content' }
      ]
    };
  }

  async scrapeWithCheerio(url) {
    try {
      await delay(Math.random() * 2000 + 1000);
      
      const axios = require('axios');
      const response = await axios.get(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 30000
      });

      return this.extractCompanyInfo(response.data, url);
    } catch (error) {
      console.error('Cheerio scraping failed:', error.message);
      throw error;
    }
  }

  async scrapeWithPuppeteer(url) {
    let browser;
    try {
      await delay(Math.random() * 3000 + 2000);
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      await page.setUserAgent(getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      await page.waitForTimeout(2000);

      const html = await page.content();
      return this.extractCompanyInfo(html, url);
    } catch (error) {
      console.error('Puppeteer company scraping failed:', error.message);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  extractCompanyInfo(html, url) {
    const $ = cheerio.load(html);
    const companyInfo = {
      url,
      name: null,
      description: null,
      industry: null,
      contacts: {
        phone: null,
        email: null,
        address: null
      },
      website: url,
      socialLinks: [],
      extractedAt: new Date().toISOString()
    };

    // Extract name
    companyInfo.name = this.extractField($, this.companySelectors.name);

    // Extract description
    companyInfo.description = this.extractField($, this.companySelectors.description);

    // Extract industry
    companyInfo.industry = this.extractField($, this.companySelectors.industry);

    // Extract contacts
    const contacts = this.extractField($, this.companySelectors.contacts, true);
    if (Array.isArray(contacts)) {
      contacts.forEach(contact => {
        if (contact?.includes('tel:')) {
          companyInfo.contacts.phone = contact.replace('tel:', '');
        } else if (contact?.includes('mailto:')) {
          companyInfo.contacts.email = contact.replace('mailto:', '');
        } else if (contact?.match(/[\d\s\-\(\)]+/) && contact.length > 10) {
          companyInfo.contacts.phone = contact;
        } else if (contact?.includes('@')) {
          companyInfo.contacts.email = contact;
        }
      });
    }

    // Extract address
    companyInfo.contacts.address = this.extractField($, this.companySelectors.address);

    // Extract website
    const website = this.extractField($, this.companySelectors.website);
    if (website && website !== url) {
      companyInfo.website = website;
    }

    // Extract social links
    const socialLinks = [];
    $('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="linkedin.com"], a[href*="instagram.com"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !socialLinks.includes(href)) {
        socialLinks.push(href);
      }
    });
    companyInfo.socialLinks = socialLinks;

    // Clean and validate data
    return this.cleanCompanyData(companyInfo);
  }

  extractField($, selectors, multiple = false) {
    for (const selector of selectors) {
      try {
        let result;
        
        if (multiple) {
          result = $(selector.element).map((i, el) => {
            if (selector.text) {
              return $(el).text().trim();
            }
            if (selector.attr) {
              return $(el).attr(selector.attr);
            }
            return $(el).html();
          }).get();
        } else {
          const element = $(selector.element).first();
          if (selector.text) {
            result = element.text().trim();
          }
          if (selector.attr) {
            result = element.attr(selector.attr);
          }
          if (selector.html) {
            result = element.html();
          }
        }

        if (result && (multiple ? result.length > 0 : result.length > 0)) {
          return result;
        }
      } catch (error) {
        console.error(`Error with selector ${selector.element}:`, error.message);
      }
    }
    return multiple ? [] : null;
  }

  cleanCompanyData(data) {
    // Clean name
    if (data.name) {
      data.name = data.name.replace(/\s+/g, ' ').trim();
      // Remove common suffixes/prefixes
      data.name = data.name.replace(/^(Home|Welcome to|Welcome)\s+/i, '');
      data.name = data.name.replace(/\s*\|\s*.*$/, '');
    }

    // Clean description
    if (data.description) {
      data.description = data.description.replace(/\s+/g, ' ').trim();
      data.description = data.description.replace(/^[^a-zA-Z]*/, ''); // Remove non-letter start
      if (data.description.length > 500) {
        data.description = data.description.substring(0, 497) + '...';
      }
    }

    // Clean industry
    if (data.industry) {
      data.industry = data.industry.replace(/\s+/g, ' ').trim();
    }

    // Clean phone
    if (data.contacts.phone) {
      data.contacts.phone = data.contacts.phone.replace(/[^\d\+\-\(\)\s]/g, '');
    }

    // Clean email
    if (data.contacts.email) {
      data.contacts.email = data.contacts.email.toLowerCase().trim();
    }

    // Clean address
    if (data.contacts.address) {
      data.contacts.address = data.contacts.address.replace(/\s+/g, ' ').trim();
    }

    return data;
  }

  async scrapeCompany(url, strategy = 'cheerio') {
    try {
      console.log(`Scraping company info from: ${url} using ${strategy}`);
      
      let result;
      if (strategy === 'puppeteer') {
        result = await retry(() => this.scrapeWithPuppeteer(url), 2);
      } else {
        result = await retry(() => this.scrapeWithCheerio(url), 2);
      }

      console.log(`Successfully scraped company info from: ${url}`);
      return result;
    } catch (error) {
      console.error(`Failed to scrape company info from ${url}:`, error.message);
      
      // Try fallback strategy
      if (strategy === 'cheerio') {
        console.log(`Trying fallback strategy: puppeteer`);
        try {
          return await retry(() => this.scrapeWithPuppeteer(url), 2);
        } catch (fallbackError) {
          console.error(`Fallback strategy also failed for ${url}:`, fallbackError.message);
        }
      }
      
      throw error;
    }
  }
}

export default CompanyScraper;
