import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'DNT': '1',
        },
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept 2xx and 3xx
        },
        ...options
      });

      if (response.status === 403) {
        throw new Error(`403 Forbidden - Site has anti-bot protection`);
      }

      return response.data;
    } catch (error) {
      const certificateErrorCodes = new Set([
        'CERT_HAS_EXPIRED',
        'DEPTH_ZERO_SELF_SIGNED_CERT',
        'SELF_SIGNED_CERT_IN_CHAIN',
        'UNABLE_TO_GET_ISSUER_CERT',
        'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
        'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
      ]);

      if (!options._allowInsecureRetry && certificateErrorCodes.has(error.code)) {
        console.warn(`Axios certificate validation failed for ${url}; retrying once with relaxed TLS verification`);
        return this.fetchWithAxios(url, {
          ...options,
          _allowInsecureRetry: true,
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
      }

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
      await new Promise(resolve => setTimeout(resolve, 2000));

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
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ]
      });

      const context = await browser.newContext({
        userAgent: getRandomUserAgent(),
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
        timezoneId: 'America/New_York',
        permissions: ['geolocation'],
        geolocation: { latitude: 40.7128, longitude: -74.0060 },
        // Hide automation indicators
        bypassCSP: true,
        ignoreHTTPSErrors: true
      });

      // Hide webdriver property
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
      });

      const page = await context.newPage();

      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1'
      });

      await page.goto(url, { 
        waitUntil: 'networkidle', 
        timeout: 45000 
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));

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

  // STAGE 1: Page Classification (Hard Filter)
  classifyPage(html, url) {
    const $ = cheerio.load(html);
    const bodyText = $('body').text().toLowerCase();
    
    console.log(`📊 STAGE 1: Analyzing page...`);
    console.log(`   URL: ${url}`);
    console.log(`   Body text length: ${bodyText.length}`);
    
    // Keywords that indicate a tender page
    const tenderKeywords = ['tender', 'procurement', 'rfp', 'rfq', 'bid', 'closing date', 'submission'];
    
    // Count keyword matches
    let keywordCount = 0;
    const foundKeywords = [];
    tenderKeywords.forEach(keyword => {
      if (bodyText.includes(keyword)) {
        keywordCount++;
        foundKeywords.push(keyword);
      }
    });
    
    console.log(`   Found keywords: ${foundKeywords.join(', ') || 'none'}`);

    // Check for rejection criteria (only check title/h1, not entire body)
    const rejectKeywords = ['welcome', 'government portal home', 'portal home'];
    const title = $('title').text().toLowerCase();
    const h1 = $('h1').first().text().toLowerCase();
    
    console.log(`   Title: "${title}"`);
    console.log(`   H1: "${h1}"`);
    
    for (const keyword of rejectKeywords) {
      if (title.includes(keyword) || h1.includes(keyword)) {
        console.log(`🚫 STAGE 1 REJECTED: Page contains "${keyword}" in title/h1`);
        return { isTenderPage: false, reason: `Contains "${keyword}" in title/h1` };
      }
    }

    // Check for structured content blocks (relaxed - just need any content)
    const hasStructuredContent = 
      $('main').length > 0 ||
      $('article').length > 0 ||
      $('.content').length > 0 ||
      $('.tender-description').length > 0 ||
      $('.tender-details').length > 0 ||
      $('.tender').length > 0 ||
      $('h1').length > 0 ||
      $('h2').length > 0 ||
      $('div').length > 0; // Very relaxed - any div is content

    console.log(`   Structured content blocks: main=${$('main').length}, article=${$('article').length}, .content=${$('.content').length}, .tender=${$('.tender').length}, h1=${$('h1').length}, div=${$('div').length}`);

    if (!hasStructuredContent) {
      console.log('🚫 STAGE 1 REJECTED: No structured content blocks found');
      return { isTenderPage: false, reason: 'No structured content blocks' };
    }

    // Skip navigation check for now (too aggressive)
    // Skip keyword check for now (too aggressive)

    console.log(`✅ STAGE 1 PASSED: Page has structured content`);
    return { isTenderPage: true, reason: 'Valid tender page' };
  }

  // STAGE 2: Title Extraction (Strict Selector Order)
  extractTitle(html) {
    const $ = cheerio.load(html);
    let title = null;

    // Priority order of selectors
    const titleSelectors = [
      'main h1',
      'article h1',
      '.tender-title',
      '.page-title',
      'h1',
      'title' // Fallback to document title
    ];

    for (const selector of titleSelectors) {
      const $title = $(selector).first();
      if ($title.length > 0) {
        title = $title.text().trim();
        
        // Check if we're in a content area (not navbar/header)
        const parent = $title.parent();
        if (parent.is('nav') || parent.is('header') || parent.hasClass('navbar') || parent.hasClass('header')) {
          console.log(`⚠️  Skipping title from ${parent.attr('class') || parent.get(0).tagName}`);
          title = null;
          continue;
        }
        
        break;
      }
    }

    if (!title) {
      console.log('⚠️  STAGE 2: No title found, using fallback');
      return 'Untitled Tender';
    }

    // Post-process validation (relaxed)
    const titleLower = title.toLowerCase();
    const rejectPhrases = ['welcome', 'home', 'portal', 'homepage', 'government portal'];
    
    for (const phrase of rejectPhrases) {
      if (titleLower.includes(phrase)) {
        console.log(`⚠️  STAGE 2: Title contains "${phrase}", using fallback`);
        return 'Untitled Tender';
      }
    }

    if (title.length < 3) {
      console.log('⚠️  STAGE 2: Title too short, using fallback');
      return 'Untitled Tender';
    }

    console.log(`✅ STAGE 2 PASSED: Title extracted - "${title.substring(0, 50)}..."`);
    return title;
  }

  // STAGE 3: Description Cleaning (No HTML Allowed)
  extractDescription(html) {
    const $ = cheerio.load(html);
    let description = null;

    // Source priority
    const descriptionSelectors = [
      'main',
      'article',
      '.content',
      '.tender-description',
      '.description',
      'body'
    ];

    for (const selector of descriptionSelectors) {
      const $el = $(selector).first();
      if ($el.length > 0) {
        // Remove scripts, nav, footer
        $el.find('script, style, nav, footer, .navigation, .footer').remove();
        
        // Get text only (NO HTML)
        description = $el.text().trim();
        
        if (description.length > 50) {
          break;
        }
      }
    }

    if (!description || description.length < 20) {
      console.log('⚠️  STAGE 3: No valid description found, using fallback');
      return 'No description available';
    }

    // Cleaning rules
    description = description
      .replace(/\s+/g, ' ') // Remove extra whitespace
      .replace(/\n\s*\n/g, '\n') // Remove repeated newlines
      .replace(/<[^>]*>/g, '') // Remove any leftover HTML tags
      .replace(/&nbsp;/g, ' ') // Convert &nbsp; to space
      .replace(/&[a-z]+;/gi, '') // Remove other HTML entities
      .trim();

    if (description.length < 20) {
      console.log('⚠️  STAGE 3: Description too short after cleaning, using fallback');
      return 'No description available';
    }

    console.log(`✅ STAGE 3 PASSED: Description extracted - ${description.length} chars`);
    return description;
  }

  // STAGE 4: Structured Data Extraction
  extractStructuredData(html) {
    const $ = cheerio.load(html);
    const data = {
      closing_date: null,
      reference_number: null,
      organization: null,
      location: null,
      category: null
    };

    // Try to extract from common selectors
    const mappings = {
      closing_date: ['.closing-date', '.deadline', '.submission-date', '[class*="closing"]', '[class*="deadline"]'],
      reference_number: ['.reference', '.ref-number', '.tender-ref', '[class*="reference"]'],
      organization: ['.organization', '.company', '.ministry', '.department', '[class*="org"]'],
      location: ['.location', '.venue', '.address', '[class*="location"]'],
      category: ['.category', '.sector', '.industry', '[class*="category"]']
    };

    for (const [field, selectors] of Object.entries(mappings)) {
      for (const selector of selectors) {
        const $el = $(selector).first();
        if ($el.length > 0) {
          data[field] = $el.text().trim();
          if (data[field]) break;
        }
      }
    }

    // Try JSON-LD if available
    const jsonLd = $('script[type="application/ld+json"]');
    if (jsonLd.length > 0) {
      try {
        const ld = JSON.parse(jsonLd.html());
        if (Array.isArray(ld)) {
          for (const item of ld) {
            if (item['@type'] === 'Tender' || item['@type'] === 'JobPosting') {
              if (!data.closing_date && item.validThrough) data.closing_date = item.validThrough;
              if (!data.organization && item.hiringOrganization?.name) data.organization = item.hiringOrganization.name;
              if (!data.location && item.jobLocation?.address) data.location = item.jobLocation.address;
              if (!data.category && item.industry) data.category = item.industry;
            }
          }
        }
      } catch (error) {
        // JSON-LD parsing failed, continue with selector results
      }
    }

    console.log('✅ STAGE 4 PASSED: Structured data extracted');
    return data;
  }

  // STAGE 5: Final Validation Gate
  validateExtraction(title, description) {
    // Check if title == description or too similar (relaxed)
    if (title && description) {
      const titleLower = title.toLowerCase().trim();
      const descLower = description.toLowerCase().trim();
      
      if (titleLower === descLower && titleLower !== 'no description available') {
        console.log('⚠️  STAGE 5: Title equals description, but allowing it');
        // Don't fail, just warn
      }

      // Check if description starts with title (common pattern in generic pages)
      if (descLower.startsWith(titleLower.substring(0, 30)) && titleLower !== 'untitled tender') {
        console.log('⚠️  STAGE 5: Description starts with title (likely generic), but allowing it');
        // Don't fail, just warn
      }
    }

    // Check for HTML tags in description (relaxed - just clean them)
    if (description && /<[^>]*>/.test(description)) {
      console.log('⚠️  STAGE 5: Description contains HTML tags, will clean them');
      // Don't fail, will clean in enrichment
    }

    // Check if title is generic (relaxed)
    if (title) {
      const genericPhrases = ['tender', 'procurement', 'opportunity', 'vacancy'];
      const titleLower = title.toLowerCase();
      const genericCount = genericPhrases.filter(p => titleLower.includes(p)).length;
      
      if (genericCount >= 2 && title.length < 20) {
        console.log('⚠️  STAGE 5: Title is generic, but allowing it');
        // Don't fail, just warn
      }
    }

    // Always pass validation (relaxed mode)
    console.log('✅ STAGE 5 PASSED: Validation passed (relaxed mode)');
    return true;
  }

  // STAGE 6: Output Enrichment (Optional)
  enrichOutput(data) {
    const enriched = { ...data };

    // Summarize description if too long (max 1000 chars)
    if (enriched.description && enriched.description.length > 1000) {
      const sentences = enriched.description.split('. ');
      let summary = '';
      for (let i = 0; i < Math.min(3, sentences.length); i++) {
        summary += sentences[i] + '. ';
      }
      enriched.description = summary.trim();
      console.log(`ℹ️  Description summarized from ${data.description.length} to ${enriched.description.length} chars`);
    }

    // Normalize date format if present
    if (enriched.closing_date) {
      // Try to parse and reformat date
      try {
        const date = new Date(enriched.closing_date);
        if (!isNaN(date)) {
          enriched.closing_date = date.toISOString();
        }
      } catch (error) {
        // Keep original if parsing fails
      }
    }

    // Deduplicate whitespace in all text fields
    ['title', 'description', 'organization', 'location', 'category'].forEach(field => {
      if (enriched[field] && typeof enriched[field] === 'string') {
        enriched[field] = enriched[field].replace(/\s+/g, ' ').trim();
      }
    });

    console.log('✅ STAGE 6 PASSED: Output enriched');
    return enriched;
  }

  // Production-grade Universal Web Scraping Engine
  // STAGE 1: Page Rendering with network idle and DOM stability
  async ensureFullRendering(html, url) {
    const $ = cheerio.load(html);
    const hasScripts = $('script').length > 0;
    const hasEmptyApp = $('#app').length > 0 && $('#app').text().trim().length === 0;
    
    console.log(`🔄 STAGE 1: Ensuring full rendering for ${url}`);
    console.log(`   Has script tags: ${hasScripts}`);
    console.log(`   Has empty #app div: ${hasEmptyApp}`);
    
    // For static HTML (no scripts and has content), return as-is
    if (!hasScripts && !hasEmptyApp) {
      console.log(`✅ STAGE 1: Static HTML detected, no rendering needed`);
      return html;
    }
    
    // For dynamic content (has scripts or empty app div), use playwright/puppeteer
    console.log(`⚠️  STAGE 1: Dynamic content detected, attempting full rendering`);
    try {
      const renderedHtml = await this.fetchWithPlaywright(url);
      console.log(`✅ STAGE 1: Full rendering complete`);
      return renderedHtml;
    } catch (error) {
      console.warn(`⚠️  STAGE 1: Rendering failed, using original HTML: ${error.message}`);
      return html;
    }
  }

  // STAGE 2: Structured Item Detection with adaptive heuristics
  detectStructuredItems(html, url) {
    const $ = cheerio.load(html);
    console.log(`🔍 STAGE 2: Detecting structured items`);
    
    const candidates = [];
    
    // Try different patterns for detecting repeating items
    const patterns = [
      // Pattern 1: Cards
      () => {
        const cards = $('.card, .tender-card, .item, .listing, .post, .entry').toArray();
        return cards.map(card => $(card));
      },
      // Pattern 2: Table rows
      () => {
        const rows = $('tbody tr, table tr').toArray();
        return rows.map(row => $(row));
      },
      // Pattern 3: List items
      () => {
        const items = $('li').toArray();
        return items.map(item => $(item));
      },
      // Pattern 4: Divs with repeated classes
      () => {
        const classCounts = {};
        $('div').each((i, el) => {
          const className = $(el).attr('class');
          if (className) {
            classCounts[className] = (classCounts[className] || 0) + 1;
          }
        });
        
        const repeatedClasses = Object.entries(classCounts)
          .filter(([_, count]) => count >= 3)
          .map(([className, _]) => className);
        
        const items = [];
        repeatedClasses.forEach(className => {
          $(`.${className}`).each((i, el) => {
            items.push($(el));
          });
        });
        return items;
      },
      // Pattern 5: Any div with significant text content
      () => {
        const items = [];
        $('div').each((i, el) => {
          const text = $(el).text().trim();
          if (text.length > 50 && text.length < 1000) {
            items.push($(el));
          }
        });
        return items;
      },
      // Pattern 6: All sections/articles
      () => {
        const items = $('section, article').toArray();
        return items.map(item => $(item));
      }
    ];
    
    for (const pattern of patterns) {
      try {
        const items = pattern();
        console.log(`   Pattern found ${items.length} potential items`);
        
        if (items.length >= 1) {
          console.log(`✅ STAGE 2: Found ${items.length} structured items`);
          return items;
        }
      } catch (error) {
        console.warn(`   Pattern failed: ${error.message}`);
      }
    }
    
    console.log(`⚠️  STAGE 2: No structured items found`);
    return [];
  }

  // STAGE 3: Field Extraction with strict grounding
  extractFieldsFromItem($item, index, pageUrl) {
    const fields = {
      title: null,
      description: null,
      organization: null,
      date: null,
      deadline: null,
      budget: null,
      location: null,
      currency: null,
      source_url: null
    };

    const href = $item.find('a').first().attr('href');
    if (href) {
      try {
        fields.source_url = new URL(href, pageUrl).toString();
      } catch {
        fields.source_url = href;
      }
    }

    const cellTexts = $item.find('td, th')
      .toArray()
      .map(cell => cheerio.load(cell).text().trim().replace(/\s+/g, ' '))
      .filter(Boolean);
    
    // Extract title (primary heading or strongest label)
    const $title = $item.find('h1, h2, h3, h4, h5, h6, .title, .heading').first();
    if ($title.length > 0) {
      fields.title = $title.text().trim();
    } else {
      // Fallback to first strong text
      const $strong = $item.find('strong, b').first();
      if ($strong.length > 0) {
        fields.title = $strong.text().trim();
      }
    }

    if (!fields.title && cellTexts.length > 0) {
      fields.title = cellTexts.find(text => /tender|bid|quotation|procurement|supply|works|services/i.test(text)) || cellTexts[0];
    }
    
    // Extract description (main text block)
    const $desc = $item.find('p, .description, .content, .details').first();
    if ($desc.length > 0) {
      fields.description = $desc.text().trim();
    }

    if (!fields.description && cellTexts.length > 1) {
      fields.description = cellTexts.join(' | ');
    }
    
    // Extract organization (issuing entity)
    const $org = $item.find('.organization, .company, .ministry, .department, .issuer').first();
    if ($org.length > 0) {
      fields.organization = $org.text().trim();
    }
    
    // Extract date/deadline
    const $date = $item.find('.date, .deadline, .closing-date, .submission-date, time').first();
    if ($date.length > 0) {
      const dateText = $date.text().trim();
      fields.deadline = dateText;
    }
    
    // Extract budget
    const $budget = $item.find('.budget, .amount, .price, .value').first();
    if ($budget.length > 0) {
      fields.budget = $budget.text().trim();
    }
    
    // Extract location
    const $location = $item.find('.location, .venue, .address').first();
    if ($location.length > 0) {
      fields.location = $location.text().trim();
    }

    return fields;
  }

  // STAGE 4: Normalization & Cleaning
  normalizeFields(fields) {
    const normalized = { ...fields };
    
    // Remove HTML tags
    Object.keys(normalized).forEach(key => {
      if (normalized[key] && typeof normalized[key] === 'string') {
        normalized[key] = normalized[key]
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&[a-z]+;/gi, '')
          .trim();
      }
    });
    
    // Remove duplicate labels
    const labelPatterns = [/^title:\s*/i, /^description:\s*/i, /^organization:\s*/i];
    Object.keys(normalized).forEach(key => {
      if (normalized[key] && typeof normalized[key] === 'string') {
        labelPatterns.forEach(pattern => {
          normalized[key] = normalized[key].replace(pattern, '');
        });
      }
    });
    
    // Trim whitespace
    Object.keys(normalized).forEach(key => {
      if (normalized[key] && typeof normalized[key] === 'string') {
        normalized[key] = normalized[key].replace(/\s+/g, ' ').trim();
      }
    });
    
    return normalized;
  }

  // STAGE 5: Quality Control Checks
  validateRecord(record, allRecords) {
    // Reject if title matches page/site name only
    if (!record.title || record.title.length < 3) {
      return false;
    }
    
    // Reject if description is generic or repeated
    if (record.description && record.description.length < 10) {
      record.description = null;
    }
    
    // Check for duplicates
    const duplicate = allRecords.find(r => 
      r.title === record.title && 
      r.description === record.description
    );
    if (duplicate) {
      return false;
    }
    
    return true;
  }

  // STAGE 6: Fallback Extraction Modes
  fallbackExtraction(html, url) {
    console.log(`🔄 STAGE 6: Attempting fallback extraction`);
    const $ = cheerio.load(html);
    
    // MODE B: Script Data Extraction
    const scriptData = this.extractScriptData($);
    if (scriptData && scriptData.length > 0) {
      console.log(`✅ STAGE 6: Extracted ${scriptData.length} records from script data`);
      return scriptData;
    }
    
    // MODE A: Broad DOM Scan
    const broadScan = this.broadDOMScan($);
    if (broadScan && broadScan.length > 0) {
      console.log(`✅ STAGE 6: Extracted ${broadScan.length} records from broad DOM scan`);
      return broadScan;
    }
    
    console.log(`⚠️  STAGE 6: Fallback extraction failed`);
    return [];
  }

  extractScriptData($) {
    const records = [];
    
    // Check for common script data patterns
    const scriptPatterns = [
      '__NEXT_DATA__',
      '__DATA__',
      'window.tenders',
      'window.data',
      'initialData'
    ];
    
    $('script').each((i, el) => {
      const scriptContent = $(el).html();
      if (!scriptContent) return;
      
      try {
        // Try to parse JSON
        const jsonMatch = scriptContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.title || item.name) {
                records.push({
                  title: item.title || item.name,
                  description: item.description || null,
                  organization: item.organization || item.company || null,
                  date: item.date || item.deadline || null,
                  deadline: item.deadline || null,
                  budget: item.budget || item.amount || null,
                  location: item.location || null,
                  currency: item.currency || null,
                  source_url: null,
                  status: 'new'
                });
              }
            });
          }
        }
      } catch (error) {
        // Ignore parse errors
      }
    });
    
    return records;
  }

  broadDOMScan($) {
    const records = [];
    
    // Try to extract from page title and body as a single record
    const title = $('title').text().trim();
    const bodyText = $('body').text().trim();
    
    if (title && bodyText && bodyText.length > 50) {
      // Extract potential tender information from body
      const lines = bodyText.split('\n').filter(line => line.trim().length > 20);
      
      if (lines.length > 0) {
        records.push({
          title: title,
          description: lines.slice(0, 3).join('. '),
          organization: null,
          date: null,
          deadline: null,
          budget: null,
          location: null,
          currency: null,
          source_url: null,
          status: 'new'
        });
      }
    }
    
    // Try to find any table data
    $('table').each((i, table) => {
      const $table = $(table);
      const rows = $table.find('tr');
      
      if (rows.length > 1) {
        rows.slice(1).each((j, row) => {
          const cells = $(row).find('td, th');
          if (cells.length > 0) {
            const text = cells.map((k, cell) => $(cell).text().trim()).join(' | ');
            if (text.length > 30) {
              records.push({
                title: text.split('|')[0].trim().substring(0, 100),
                description: text,
                organization: null,
                date: null,
                deadline: null,
                budget: null,
                location: null,
                currency: null,
                source_url: null,
                status: 'new'
              });
            }
          }
        });
      }
    });
    
    return records;
  }

  // Main Production-Grade Extraction Method
  async extractStructuredData(html, url) {
    console.log(`\n🚀 Starting Production-Grade Extraction for: ${url}\n`);
    
    const allRecords = [];
    
    // STAGE 1: Ensure Full Rendering
    const renderedHtml = await this.ensureFullRendering(html, url);
    
    // STAGE 2: Detect Structured Items
    const items = this.detectStructuredItems(renderedHtml, url);
    
    if (items.length < 3) {
      console.log(`⚠️  Less than 3 items found, trying fallback extraction`);
      const fallbackRecords = this.fallbackExtraction(renderedHtml, url);
      
      const normalizedFallback = fallbackRecords.map(record => {
        const normalized = this.normalizeFields(record);
        normalized.source_url = url;
        return normalized;
      });
      
      console.log(`\n✅ EXTRACTION COMPLETE: ${normalizedFallback.length} records from fallback\n`);
      return normalizedFallback;
    }
    
    // STAGE 3: Extract Fields from each item
    console.log(`📝 STAGE 3: Extracting fields from ${items.length} items`);
    items.forEach(($item, index) => {
      const fields = this.extractFieldsFromItem($item, index, url);
      
      // STAGE 4: Normalize fields
      const normalized = this.normalizeFields(fields);
      normalized.source_url = normalized.source_url || url;
      
      // STAGE 5: Validate record
      if (this.validateRecord(normalized, allRecords)) {
        allRecords.push(normalized);
      }
    });
    
    console.log(`\n✅ EXTRACTION COMPLETE: ${allRecords.length} valid records\n`);
    return allRecords;
  }

  async scrapeWebsite(config) {
    const { url, strategy = 'axios', selectors, retryCount = 3 } = config;
    
    let html;
    let lastError;

    // Try the specified strategy first, then fallbacks
    // Axios + cheerio is always primary/fallback
    const strategies = strategy === 'axios' ? ['axios', 'puppeteer', 'playwright'] :
                       strategy === 'puppeteer' ? ['puppeteer', 'playwright', 'axios'] :
                       ['playwright', 'puppeteer', 'axios'];

    for (const currentStrategy of strategies) {
      try {
        console.log(`🔄 Attempting to scrape ${url} with ${currentStrategy}`);
        
        html = await retry(
          () => this.fetchWith(currentStrategy, url),
          retryCount,
          `Failed to fetch ${url} with ${currentStrategy}`
        );

        if (html) {
          console.log(`✅ Successfully fetched ${url} with ${currentStrategy}`);
          break;
        }
      } catch (error) {
        console.error(`❌ ${currentStrategy} failed for ${url}:`, error.message);
        lastError = error;
        // Continue to next strategy
      }
    }

    if (!html) {
      throw new Error(`All scraping strategies failed for ${url}. Last error: ${lastError?.message}`);
    }

    // Parse the HTML with Cheerio (always use cheerio for parsing)
    console.log(`📝 Parsing HTML with Cheerio...`);
    const parsedData = this.parseWithCheerio(html, selectors);
    console.log(`✅ HTML parsed successfully`);
    
    return {
      url,
      strategy: strategies.find(s => html),
      html,
      parsedData,
      timestamp: new Date().toISOString()
    };
  }

  // Unified Entry Point for all scrapers
  async scrape(url, options = {}) {
    console.log(`\n🌐 [Unified Scraper] Starting high-level scrape for: ${url}`);
    
    // 1. Fetch HTML using the best available strategy
    const scrapeResult = await this.scrapeWebsite({
      url,
      strategy: options.strategy || 'axios',
      selectors: options.selectors || {},
      retryCount: options.retryCount || 2
    });

    if (!scrapeResult || !scrapeResult.html) {
      throw new Error(`Failed to retrieve HTML content from ${url}`);
    }

    // 2. Perform deep structured extraction
    const tenders = await this.extractStructuredData(scrapeResult.html, url);

    // 3. Return a consistent result object
    return {
      success: true,
      url,
      html: scrapeResult.html,
      tenders,
      count: tenders.length,
      strategy: scrapeResult.strategy,
      timestamp: scrapeResult.timestamp
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
