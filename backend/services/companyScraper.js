import axios from 'axios';
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
      businessType: [
        { element: '[itemprop="businessType"]', text: true },
        { element: '[class*="business-type"]', text: true },
        { element: '[id*="business-type"]', text: true }
      ],
      missionStatement: [
        { element: '.mission-statement', text: true },
        { element: '[itemprop="mission"]', text: true },
        { element: '[class*="mission"]', text: true },
        { element: '[id*="mission"]', text: true }
      ],
      corporatePurpose: [
        { element: '.purpose', text: true },
        { element: '[class*="purpose"]', text: true },
        { element: '[id*="purpose"]', text: true }
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

      await new Promise(resolve => setTimeout(resolve, 2000));

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
    const aboutText = this.normalizeText($('body').text());
    const hostname = this.getHostname(url);
    const companyInfo = {
      url,
      name: null,
      tagline: null,
      description: null,
      about: null,
      industry: null,
      businessCategory: null,
      businessType: null,
      yearFounded: null,
      companySize: null,
      headquarters: null,
      missionStatement: null,
      corporatePurpose: null,
      branchLocations: [],
      registrationNumbers: [],
      services: [],
      products: [],
      technologies: [],
      platforms: [],
      businessFocus: [],
      operationalCapabilities: [],
      valuePropositions: [],
      companyPositioning: [],
      targetCustomers: [],
      automationCapabilities: [],
      integrations: [],
      keywords: [],
      metaDescription: null,
      pageTitle: null,
      canonicalUrl: null,
      ogData: {},
      schemaOrg: {},
      contacts: {
        phones: [],
        emails: [],
        addresses: [],
        whatsapp: [],
        contactForms: [],
        supportLinks: [],
      },
      website: url,
      socialLinks: {},
      digitalPresence: {},
      intelligenceSummary: null,
      team: [],
      extractedAt: new Date().toISOString(),
    };

    companyInfo.name = this.extractField($, this.companySelectors.name);
    companyInfo.description = this.extractField($, this.companySelectors.description) || $('meta[property="og:description"]').attr('content') || null;
    companyInfo.industry = this.extractField($, this.companySelectors.industry);
    companyInfo.pageTitle = this.cleanText($('title').first().text());
    companyInfo.metaDescription = $('meta[name="description"]').attr('content') || null;
    companyInfo.canonicalUrl = $('link[rel="canonical"]').attr('href') || null;
    companyInfo.tagline = this.extractTagline($, companyInfo.name);
    companyInfo.missionStatement = this.extractMissionStatement($, aboutText);
    companyInfo.corporatePurpose = this.extractCorporatePurpose($, aboutText);
    companyInfo.businessType = this.extractField($, this.companySelectors.businessType) || this.inferBusinessType(aboutText);
    companyInfo.about = this.extractAboutText($, companyInfo.description || companyInfo.missionStatement || companyInfo.corporatePurpose);

    const yearMatch = aboutText.match(/(Founded|Established|Since)[^\d]*(\d{4})/i);
    if (yearMatch) companyInfo.yearFounded = yearMatch[2];
    companyInfo.companySize = companyInfo.companySize || this.extractCompanySize(aboutText);
    companyInfo.headquarters = companyInfo.headquarters || this.extractHeadquarters(aboutText);

    const regMatches = aboutText.match(/(Reg(istration)?( No\.?| Number)?[:\s]*[A-Z0-9\-]+)/gi);
    if (regMatches) companyInfo.registrationNumbers = regMatches.map(s => s.split(/[:\s]+/).pop());

    $('address, .branch, .location, .office').each((i, el) => {
      const txt = this.cleanText($(el).text());
      if (txt) companyInfo.branchLocations.push(txt);
    });

    companyInfo.services = this.extractOfferings($, aboutText, 'service');
    companyInfo.products = this.extractOfferings($, aboutText, 'product');
    companyInfo.technologies = this.extractTechnologies(aboutText);
    companyInfo.platforms = this.extractKeywordMatches(aboutText, this.platformKeywords);
    companyInfo.integrations = this.extractIntegrations(aboutText);
    companyInfo.businessFocus = this.inferBusinessFocus(aboutText);
    companyInfo.operationalCapabilities = this.extractInsightPhrases($, aboutText, /capabilities|operations|workflow|process|delivery|expertise|what we do/i);
    companyInfo.valuePropositions = this.extractInsightPhrases($, aboutText, /why choose|benefits|value|outcomes|results|advantages/i);
    companyInfo.companyPositioning = this.inferPositioning(aboutText);
    companyInfo.targetCustomers = this.extractTargetCustomers(aboutText);
    companyInfo.automationCapabilities = this.extractAutomationCapabilities(aboutText);
    companyInfo.businessCategory = this.inferBusinessCategory(companyInfo, aboutText);
    companyInfo.businessType = this.inferBusinessType(aboutText);
    if (!companyInfo.industry) companyInfo.industry = this.inferIndustry(aboutText);

    $('a[href^="mailto:"]').each((i, el) => {
      const email = ($(el).attr('href') || '').replace('mailto:', '').split('?')[0].trim();
      if (email) companyInfo.contacts.emails.push(email);
    });
    $('a[href^="tel:"]').each((i, el) => {
      const phone = ($(el).attr('href') || '').replace('tel:', '').trim();
      if (phone) companyInfo.contacts.phones.push(phone);
    });
    $('a[href*="wa.me"], a[href*="whatsapp.com"]').each((i, el) => {
      const wa = this.absoluteUrl($(el).attr('href'), url);
      if (wa) companyInfo.contacts.whatsapp.push(wa);
    });
    $('form').each((i, el) => {
      const formText = $(el).text().toLowerCase();
      if (/contact|support|get in touch|message/.test(formText)) companyInfo.contacts.contactForms.push(this.absoluteUrl($(el).attr('action'), url) || 'Embedded contact form');
    });
    $('address, .address, .location, [class*="address"], [class*="office"]').each((i, el) => {
      const addr = this.cleanText($(el).text());
      if (addr) companyInfo.contacts.addresses.push(addr);
    });
    $('a[href*="contact"], a[href*="support"], a[href*="help"], a[href*="ticket"]').each((i, el) => {
      const href = this.absoluteUrl($(el).attr('href'), url);
      if (href) companyInfo.contacts.supportLinks.push(href);
    });
    companyInfo.contacts.emails.push(...(aboutText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []));
    companyInfo.contacts.phones.push(...(aboutText.match(/(?:\+?\d[\d\s().-]{7,}\d)/g) || []));

    companyInfo.socialLinks = this.extractSocialLinks($);
    companyInfo.keywords = ($('meta[name="keywords"]').attr('content') || '').split(',').map(s => s.trim()).filter(Boolean);
    companyInfo.ogData = {
      title: $('meta[property="og:title"]').attr('content') || null,
      description: $('meta[property="og:description"]').attr('content') || null,
      image: $('meta[property="og:image"]').attr('content') || null,
      url: $('meta[property="og:url"]').attr('content') || null,
      siteName: $('meta[property="og:site_name"]').attr('content') || null,
      type: $('meta[property="og:type"]').attr('content') || null,
    };
    companyInfo.website = companyInfo.canonicalUrl || companyInfo.ogData.url || url;

    companyInfo.digitalPresence = {
      hostname,
      pageTitle: companyInfo.pageTitle,
      metaDescription: companyInfo.metaDescription,
      canonicalUrl: companyInfo.canonicalUrl,
      openGraph: companyInfo.ogData,
      keywordCount: companyInfo.keywords.length,
      socialProfileCount: Object.values(companyInfo.socialLinks).filter(Boolean).length,
      hasContactForm: companyInfo.contacts.contactForms.length > 0,
      hasStructuredData: false,
    };

    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        this.flattenSchemaEntities(json).forEach(entity => {
          const type = String(entity['@type'] || '');
          if (!/Organization|LocalBusiness|Corporation|Company|ProfessionalService|SoftwareApplication|Product/i.test(type)) return;
          companyInfo.schemaOrg = Object.keys(companyInfo.schemaOrg).length ? companyInfo.schemaOrg : entity;
          companyInfo.digitalPresence.hasStructuredData = true;
          if (entity.name && /Organization|LocalBusiness|Corporation|Company|ProfessionalService/i.test(type)) companyInfo.name = entity.name;
          if (entity.description) companyInfo.description = entity.description;
          if (entity.address) {
            const schemaAddress = this.formatSchemaAddress(entity.address);
            if (schemaAddress) {
              companyInfo.contacts.addresses.push(schemaAddress);
              if (!companyInfo.headquarters) companyInfo.headquarters = schemaAddress;
            }
          }
          if (entity.email) companyInfo.contacts.emails.push(entity.email);
          if (entity.telephone) companyInfo.contacts.phones.push(entity.telephone);
          if (entity.foundingDate && !companyInfo.yearFounded) companyInfo.yearFounded = String(entity.foundingDate).slice(0, 4);
          if (entity.numberOfEmployees && !companyInfo.companySize) companyInfo.companySize = this.normalizeEmployeeCount(entity.numberOfEmployees);
          if (entity.employee && !companyInfo.companySize) companyInfo.companySize = this.normalizeEmployeeCount(entity.employee);
          if (entity.mission && !companyInfo.missionStatement) companyInfo.missionStatement = this.cleanText(entity.mission);
          if (entity.description && !companyInfo.corporatePurpose) companyInfo.corporatePurpose = this.cleanText(entity.description);
          if (entity.sameAs && Array.isArray(entity.sameAs)) this.mergeSocialLinks(companyInfo.socialLinks, entity.sameAs);
          if (entity.founder) companyInfo.team.push(this.schemaName(entity.founder));
          if (entity.employee) companyInfo.team.push(this.schemaName(entity.employee));
          if (/Product|SoftwareApplication/i.test(type) && entity.name) companyInfo.products.push(entity.name);
        });
      } catch (e) {}
    });

    $('[class*="team"], [class*="leadership"], [class*="founder"], [class*="staff"], [class*="member"], [class*="person"]').each((i, el) => {
      const txt = this.cleanText($(el).text());
      if (txt && txt.length < 140) companyInfo.team.push(txt);
    });

    companyInfo.services = this.uniqueClean(companyInfo.services, 24);
    companyInfo.products = this.uniqueClean(companyInfo.products, 24);
    companyInfo.technologies = this.uniqueClean(companyInfo.technologies, 32);
    companyInfo.platforms = this.uniqueClean(companyInfo.platforms, 24);
    companyInfo.businessFocus = this.uniqueClean(companyInfo.businessFocus, 12);
    companyInfo.operationalCapabilities = this.uniqueClean(companyInfo.operationalCapabilities, 12);
    companyInfo.valuePropositions = this.uniqueClean(companyInfo.valuePropositions, 10);
    companyInfo.companyPositioning = this.uniqueClean(companyInfo.companyPositioning, 8);
    companyInfo.targetCustomers = this.uniqueClean(companyInfo.targetCustomers, 10);
    companyInfo.automationCapabilities = this.uniqueClean(companyInfo.automationCapabilities, 10);
    companyInfo.integrations = this.uniqueClean(companyInfo.integrations, 16);
    companyInfo.contacts.emails = this.uniqueClean(companyInfo.contacts.emails.map(email => email.toLowerCase()), 12);
    companyInfo.contacts.phones = this.uniqueClean(companyInfo.contacts.phones.map(phone => phone.replace(/[^\d+().\-\s]/g, '')), 12);
    companyInfo.contacts.addresses = this.uniqueClean(companyInfo.contacts.addresses, 8);
    companyInfo.contacts.whatsapp = this.uniqueClean(companyInfo.contacts.whatsapp, 6);
    companyInfo.contacts.contactForms = this.uniqueClean(companyInfo.contacts.contactForms, 6);
    companyInfo.contacts.supportLinks = this.uniqueClean(companyInfo.contacts.supportLinks, 8);
    companyInfo.branchLocations = this.uniqueClean(companyInfo.branchLocations, 8);
    companyInfo.team = this.uniqueClean(companyInfo.team, 12);
    companyInfo.keywords = this.uniqueClean(companyInfo.keywords, 24);
    companyInfo.registrationNumbers = this.uniqueClean(companyInfo.registrationNumbers, 8);
    companyInfo.intelligenceSummary = this.buildIntelligenceSummary(companyInfo);

    return this.cleanCompanyData(companyInfo);
  }

  get technologyKeywords() {
    return [
      'React', 'Next.js', 'Node.js', 'Express', 'JavaScript', 'TypeScript', 'Python', 'Django', 'Flask',
      'Angular', 'Vue', 'Svelte', 'AWS', 'Azure', 'Google Cloud', 'GCP', 'Supabase', 'Firebase',
      'OpenAI', 'AI', 'Machine Learning', 'LLM', 'API', 'REST API', 'GraphQL', 'Webhook', 'CRM',
      'Salesforce', 'HubSpot', 'Zoho', 'Microsoft Dynamics', 'SAP', 'Oracle', 'PostgreSQL', 'MySQL',
      'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'Shopify', 'WordPress', 'WhatsApp', 'Twilio',
      'Stripe', 'Zapier', 'Make', 'n8n', 'Slack', 'Microsoft Teams', '.NET', 'C#', 'Java', 'PHP',
      'Ruby', 'Go', 'Tailwind', 'Bootstrap'
    ];
  }

  get platformKeywords() {
    return [
      'AWS', 'Azure', 'Google Cloud', 'Supabase', 'Firebase', 'OpenAI', 'Salesforce', 'HubSpot',
      'Zoho', 'Shopify', 'WordPress', 'WhatsApp Business', 'Twilio', 'Stripe', 'Zapier', 'Make',
      'n8n', 'Slack', 'Microsoft Teams', 'Microsoft Dynamics', 'SAP', 'Oracle'
    ];
  }

  cleanText(value) {
    if (!value) return null;
    return String(value).replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();
  }

  normalizeText(value) {
    return this.cleanText(value) || '';
  }

  uniqueClean(items, limit = 20) {
    const seen = new Set();
    return (items || [])
      .map(item => this.cleanText(item))
      .filter(item => item && item.length > 1 && item.length < 220)
      .filter(item => {
        const key = item.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);
  }

  absoluteUrl(href, baseUrl) {
    if (!href) return null;
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return href;
    }
  }

  getHostname(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  extractTagline($, name) {
    const candidates = [
      $('[class*="tagline"]').first().text(),
      $('[class*="subtitle"]').first().text(),
      $('[class*="hero"] h2').first().text(),
      $('h1').first().next('p').text(),
      $('meta[property="og:title"]').attr('content'),
    ];
    return this.uniqueClean(candidates, 1)
      .find(item => !name || item.toLowerCase() !== String(name).toLowerCase()) || null;
  }

  extractAboutText($, fallback) {
    const aboutSelector = 'section, article, div';
    const about = $(aboutSelector).filter((i, el) => /about|who we are|our company|overview/i.test($(el).text())).first().text();
    const text = this.cleanText(about) || this.cleanText(fallback);
    return text && text.length > 700 ? `${text.slice(0, 697)}...` : text;
  }

  extractMissionStatement($, bodyText) {
    const direct = this.extractField($, this.companySelectors.missionStatement) || this.extractSectionSnippet($, /mission|our mission|mission statement/i);
    if (direct) return direct;
    return this.extractSentence(bodyText, /(mission|purpose|vision)/i);
  }

  extractCorporatePurpose($, bodyText) {
    const direct = this.extractField($, this.companySelectors.corporatePurpose) || this.extractSectionSnippet($, /purpose|corporate purpose|our purpose|vision|why we exist/i);
    if (direct) return direct;
    const sentence = this.extractSentence(bodyText, /(purpose|vision|why we exist|our why)/i);
    return sentence ? sentence : null;
  }

  extractHeadquarters(text) {
    const patterns = [
      /Headquarters?:?\s*([^\.\n]{3,90})/i,
      /Headquartered in\s*([^\.\n]{3,90})/i,
      /Based in\s*([^\.\n]{3,90})/i,
      /Located in\s*([^\.\n]{3,90})/i,
      /HQ:?\s*([^\.\n]{3,90})/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return this.cleanText(match[1]);
    }
    return null;
  }

  extractCompanySize(text) {
    const rangeMatch = text.match(/(\d{1,3}(?:,\d{3})?)(?:\s*-\s*(\d{1,3}(?:,\d{3})?))?\s+(employees|team members|staff|people|personnel|workers)/i);
    if (rangeMatch) {
      const start = rangeMatch[1].replace(/,/g, '');
      const end = rangeMatch[2] ? rangeMatch[2].replace(/,/g, '') : null;
      return end ? `${start}-${end} employees` : `${start} employees`;
    }
    const labelMatch = text.match(/\b(small|micro|medium|large|enterprise)\b\s+(business|company|team|organization)/i);
    if (labelMatch) return `${labelMatch[1]} ${labelMatch[2]}`;
    return null;
  }

  normalizeEmployeeCount(value) {
    if (!value) return null;
    if (typeof value === 'number') return this.employeeRangeFromNumber(value);
    if (typeof value === 'string') {
      const cleaned = value.replace(/,/g, '').trim();
      const rangeMatch = cleaned.match(/(\d+)\s*-\s*(\d+)/);
      if (rangeMatch) return `${rangeMatch[1]}-${rangeMatch[2]} employees`;
      const singleMatch = cleaned.match(/\d+/);
      if (singleMatch) return this.employeeRangeFromNumber(Number(singleMatch[0]));
      return this.cleanText(value);
    }
    if (Array.isArray(value)) return this.normalizeEmployeeCount(value[0]);
    if (typeof value === 'object') return this.normalizeEmployeeCount(value.name || value.value || value['@type']);
    return null;
  }

  employeeRangeFromNumber(num) {
    if (num <= 10) return `${num} employees`;
    if (num <= 50) return '10-50 employees';
    if (num <= 100) return '50-100 employees';
    if (num <= 250) return '100-250 employees';
    if (num <= 500) return '250-500 employees';
    if (num <= 1000) return '500-1000 employees';
    return '1000+ employees';
  }

  extractSectionSnippet($, regex) {
    const candidates = [];
    $('section, article, div, p, li').each((i, el) => {
      const text = this.cleanText($(el).text());
      if (text && regex.test(text) && text.length > 40 && text.length < 320) {
        candidates.push(text);
      }
    });
    return candidates.sort((a, b) => a.length - b.length)[0] || null;
  }

  extractSentence(text, regex) {
    const matches = text.match(/[^.!?]*([.!?]|$)/g) || [];
    for (const sentence of matches) {
      if (regex.test(sentence)) {
        const clean = this.cleanText(sentence);
        if (clean && clean.length > 30) return clean;
      }
    }
    return null;
  }

  extractOfferings($, bodyText, type) {
    const sectionRegex = type === 'product'
      ? /products|platform|pricing|plans|apps|tools|modules|features/i
      : /services|solutions|what we do|offerings|capabilities|expertise|consulting|automation|development/i;
    const itemSelector = [
      'li', 'a', 'h2', 'h3', 'h4',
      '[class*="service"]', '[class*="solution"]', '[class*="product"]',
      '[class*="feature"]', '[class*="offering"]', '[class*="capability"]',
      '[class*="card"]'
    ].join(', ');
    const candidates = [];

    $('nav a, header a, footer a').each((i, el) => {
      const text = this.cleanText($(el).text());
      if (text && sectionRegex.test(text)) candidates.push(text);
    });

    $('section, article, main div, ul, ol').each((i, el) => {
      const sectionText = this.cleanText($(el).text()) || '';
      if (!sectionRegex.test(sectionText)) return;
      $(el).find(itemSelector).each((j, item) => {
        const text = this.cleanOfferingText($(item).text());
        if (text) candidates.push(text);
      });
    });

    const nounPattern = type === 'product'
      ? /([A-Z][A-Za-z0-9+&/\-\s]{2,45})\s+(platform|suite|product|tool|app|software|dashboard|portal|system)/g
      : /([A-Z][A-Za-z0-9+&/\-\s]{2,45})\s+(services|solutions|development|integration|consulting|automation|support|management|optimization|implementation)/g;
    for (const match of bodyText.matchAll(nounPattern)) {
      candidates.push(`${match[1]} ${match[2]}`);
    }

    if (type === 'service') {
      [
        'AI Automation', 'CRM Integration', 'Web Development', 'WhatsApp Automation', 'WhatsApp Bots',
        'Lead Management', 'Customer Support Automation', 'Cloud Solutions', 'Workflow Automation',
        'API Integration', 'Digital Transformation', 'Data Analytics', 'Business Intelligence',
        'Mobile App Development', 'Software Development', 'Customer Experience Automation'
      ].forEach(label => {
        if (new RegExp(`\\b${this.escapeRegex(label)}\\b`, 'i').test(bodyText)) candidates.push(label);
      });
    }

    return this.uniqueClean(candidates, 32)
      .filter(item => !this.isJunkOffering(item))
      .slice(0, 24);
  }

  cleanOfferingText(value) {
    const text = this.cleanText(value);
    if (!text || text.length < 3 || text.length > 90) return null;
    if (this.isJunkOffering(text)) return null;
    return text.replace(/\s+(Learn More|Read More)$/i, '');
  }

  isJunkOffering(text) {
    if (!text) return true;
    if (/^(learn more|read more|get started|contact|home|about|blog|services|solutions|products|features|pricing|platform)$/i.test(text)) return true;
    if (/^(we|our|the)\s/i.test(text)) return true;
    if (/[a-z][A-Z]/.test(text)) return true;
    if (text.split(/\s+/).length > 8) return true;
    return false;
  }

  extractKeywordMatches(text, keywords) {
    return keywords.filter(keyword => new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'i').test(text));
  }

  extractTechnologies(text) {
    return this.extractKeywordMatches(text, this.technologyKeywords);
  }

  extractIntegrations(text) {
    const integrations = this.platformKeywords.filter(keyword => new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'i').test(text));
    const integrationMatches = text.match(/(?:integrates? with|connected to|syncs? with|integration with)\s+([A-Za-z0-9+&,\-/\s]{3,80})/gi) || [];
    integrationMatches.forEach(match => integrations.push(match.replace(/^(integrates? with|connected to|syncs? with|integration with)\s+/i, '')));
    return integrations;
  }

  inferBusinessFocus(text) {
    const signals = [
      ['customer experience automation', /customer experience|customer engagement|CX|support automation/i],
      ['workflow automation', /workflow automation|process automation|automate workflows/i],
      ['CRM optimization', /CRM|customer relationship|sales pipeline|lead management/i],
      ['digital transformation', /digital transformation|modernization|digitize/i],
      ['AI-powered operations', /AI-powered|artificial intelligence|machine learning|OpenAI|LLM/i],
      ['business automation', /business automation|operations automation|automation platform/i],
      ['cloud solutions', /cloud solutions|cloud infrastructure|AWS|Azure|Google Cloud/i],
      ['software development', /software development|web development|mobile app|custom software/i],
      ['data and analytics', /analytics|business intelligence|dashboard|data platform/i],
    ];
    return signals.filter(([, regex]) => regex.test(text)).map(([label]) => label);
  }

  inferPositioning(text) {
    const positioning = [];
    if (/AI|automation|intelligent/i.test(text)) positioning.push('AI-enabled business operations partner');
    if (/SME|small business|startup|mid-market|enterprise/i.test(text)) positioning.push('Solutions provider for defined customer segments');
    if (/end-to-end|full-service|turnkey/i.test(text)) positioning.push('End-to-end delivery and implementation provider');
    if (/CRM|customer|support|sales/i.test(text)) positioning.push('Customer engagement and revenue operations specialist');
    if (/cloud|API|integration|platform/i.test(text)) positioning.push('Technology integration and platform modernization provider');
    return positioning;
  }

  extractInsightPhrases($, bodyText, sectionRegex) {
    const candidates = [];
    $('section, article, div').each((i, el) => {
      const sectionText = this.cleanText($(el).text()) || '';
      if (!sectionRegex.test(sectionText)) return;
      $(el).find('li, h3, h4, p').each((j, item) => {
        const text = this.cleanText($(item).text());
        if (text && text.length >= 8 && text.length <= 120) candidates.push(text);
      });
    });
    const sentenceMatches = bodyText.match(/[^.!?]*(automate|optimize|improve|integrate|deliver|scale|streamline|support|manage)[^.!?]*[.!?]/gi) || [];
    candidates.push(...sentenceMatches.map(sentence => sentence.replace(/[.!?]$/, '')));
    return candidates;
  }

  extractTargetCustomers(text) {
    const customers = [];
    const patterns = [
      ['SMEs and growing businesses', /SMEs|small and medium|small businesses|growing businesses/i],
      ['Enterprise teams', /enterprise|large organizations|corporate teams/i],
      ['Startups', /startups|founders|early-stage/i],
      ['Sales and marketing teams', /sales teams|marketing teams|lead generation|revenue teams/i],
      ['Customer support teams', /support teams|contact centers|customer service/i],
      ['Healthcare organizations', /healthcare|clinics|hospitals|medical/i],
      ['Retail and ecommerce businesses', /retail|ecommerce|e-commerce|online stores/i],
      ['Government and public sector', /government|public sector|municipal/i],
    ];
    patterns.forEach(([label, regex]) => {
      if (regex.test(text)) customers.push(label);
    });
    return customers;
  }

  extractAutomationCapabilities(text) {
    const capabilities = [];
    const patterns = [
      ['Lead management automation', /lead management|lead capture|lead nurturing/i],
      ['Customer support automation', /support automation|chatbot|helpdesk|ticket automation/i],
      ['WhatsApp automation', /WhatsApp|wa\.me/i],
      ['CRM automation', /CRM automation|CRM integration|sales automation/i],
      ['Workflow automation', /workflow automation|process automation/i],
      ['AI assistants and bots', /AI assistant|chatbot|virtual assistant|bot/i],
      ['API and webhook automation', /API|webhook|integration automation/i],
      ['Reporting automation', /automated reporting|dashboard|analytics automation/i],
    ];
    patterns.forEach(([label, regex]) => {
      if (regex.test(text)) capabilities.push(label);
    });
    return capabilities;
  }

  inferBusinessCategory(info, text) {
    if (/agency|studio/i.test(text)) return 'Agency / Studio';
    if (/SaaS|software as a service|platform/i.test(text)) return 'SaaS / Platform';
    if (/consulting|consultancy|advisor/i.test(text)) return 'Consulting';
    if (/automation|AI|software|development|cloud|API/i.test(text) || info.technologies.length) return 'Technology Services';
    if (/manufacturing|factory|industrial/i.test(text)) return 'Industrial / Manufacturing';
    if (/retail|ecommerce|store/i.test(text)) return 'Retail / Ecommerce';
    return info.industry || null;
  }

  inferBusinessType(text) {
    if (/B2B|businesses|enterprises|companies|organizations/i.test(text)) return 'B2B';
    if (/consumer|customers|shoppers|individuals/i.test(text)) return 'B2C';
    if (/marketplace/i.test(text)) return 'Marketplace';
    if (/nonprofit|non-profit|NGO/i.test(text)) return 'Nonprofit';
    return null;
  }

  inferIndustry(text) {
    const industries = [
      ['Information Technology', /software|technology|IT services|cloud|API|automation|AI/i],
      ['Marketing and Sales Technology', /marketing|sales|CRM|lead generation/i],
      ['Customer Experience', /customer experience|customer support|contact center|engagement/i],
      ['Healthcare', /healthcare|medical|clinic|hospital/i],
      ['Financial Services', /finance|banking|payments|insurance|fintech/i],
      ['Retail and Ecommerce', /retail|ecommerce|e-commerce|shopify|online store/i],
      ['Education', /education|learning|training|school|university/i],
    ];
    const match = industries.find(([, regex]) => regex.test(text));
    return match ? match[0] : null;
  }

  extractSocialLinks($) {
    const socials = { linkedin: null, facebook: null, instagram: null, twitter: null, youtube: null, tiktok: null, github: null };
    $('a[href]').each((i, el) => this.mergeSocialLinks(socials, [$(el).attr('href')]));
    return socials;
  }

  mergeSocialLinks(socials, links) {
    links.forEach(link => {
      if (!link) return;
      if (/linkedin\.com/i.test(link)) socials.linkedin = link;
      if (/facebook\.com/i.test(link)) socials.facebook = link;
      if (/instagram\.com/i.test(link)) socials.instagram = link;
      if (/(twitter\.com|x\.com)/i.test(link)) socials.twitter = link;
      if (/youtube\.com|youtu\.be/i.test(link)) socials.youtube = link;
      if (/tiktok\.com/i.test(link)) socials.tiktok = link;
      if (/github\.com/i.test(link)) socials.github = link;
    });
  }

  flattenSchemaEntities(json) {
    const items = Array.isArray(json) ? json : [json];
    return items.flatMap(item => item?.['@graph'] && Array.isArray(item['@graph']) ? item['@graph'] : [item]).filter(Boolean);
  }

  formatSchemaAddress(address) {
    if (typeof address === 'string') return address;
    if (Array.isArray(address)) return address.map(item => this.formatSchemaAddress(item)).join('; ');
    return this.uniqueClean([
      address.streetAddress,
      address.addressLocality,
      address.addressRegion,
      address.postalCode,
      address.addressCountry,
    ], 8).join(', ');
  }

  schemaName(value) {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(item => this.schemaName(item)).filter(Boolean).join(', ');
    return value.name || JSON.stringify(value);
  }

  buildIntelligenceSummary(info) {
    const name = info.name || this.getHostname(info.url) || 'This company';
    const category = info.businessCategory || info.industry || 'business';
    const focus = info.businessFocus.slice(0, 3).join(', ');
    const services = info.services.slice(0, 3).join(', ');
    const customers = info.targetCustomers.slice(0, 2).join(' and ');
    const focusPart = focus || services ? ` focused on ${focus || services}` : '';
    const customerPart = customers ? ` for ${customers}` : '';
    const categoryPart = /services|solutions|operations/i.test(category)
      ? `a company in ${category.toLowerCase()}`
      : `a ${category.toLowerCase()} company`;
    return `${name} is ${categoryPart}${focusPart}${customerPart}.`;
  }

  escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
