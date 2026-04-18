import OpenAI from 'openai';

class AIProcessor {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async cleanData(rawText) {
    try {
      const prompt = `
        Clean and structure the following raw scraped text into a clean, readable format.
        Remove HTML artifacts, normalize whitespace, and organize the content logically.

        Raw text:
        ${rawText}

        Return a JSON object with:
        {
          "cleanedText": "clean, readable text",
          "type": "tender|company|other",
          "confidence": 0.0-1.0,
          "keyPoints": ["point1", "point2", ...]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error cleaning data:', error.message);
      return {
        cleanedText: rawText.replace(/\s+/g, ' ').trim(),
        type: 'other',
        confidence: 0.5,
        keyPoints: []
      };
    }
  }

  async classifyTender(tender) {
    try {
      const prompt = `
        Analyze this tender opportunity and classify it with relevant tags and priority score.

        Tender data:
        Title: ${tender.title}
        Description: ${tender.description}
        Organization: ${tender.organization}
        Deadline: ${tender.deadline}
        Budget: ${tender.budget}

        Return a JSON object with:
        {
          "sector": "construction|healthcare|IT|education|transportation|energy|other",
          "priority": "high|medium|low",
          "score": 0.0-1.0,
          "tags": ["tag1", "tag2", ...],
          "estimatedValue": "value_range",
          "complexity": "simple|moderate|complex",
          "requirements": ["req1", "req2", ...]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error classifying tender:', error.message);
      return {
        sector: 'other',
        priority: 'medium',
        score: 0.5,
        tags: [],
        estimatedValue: 'unknown',
        complexity: 'moderate',
        requirements: []
      };
    }
  }

  async enrichCompany(company) {
    try {
      const prompt = `
        Enrich and normalize this company information using AI analysis.

        Company data:
        Name: ${company.name}
        Description: ${company.description}
        Industry: ${company.industry}
        Website: ${company.website}
        Contacts: ${JSON.stringify(company.contacts)}

        Return a JSON object with:
        {
          "normalizedIndustry": "standardized_industry_name",
          "companySize": "small|medium|large|enterprise",
          "businessType": "government|private|nonprofit|academic",
          "reliabilityScore": 0.0-1.0,
          "specializations": ["spec1", "spec2", ...],
          "geographicScope": "local|regional|national|international",
          "keyServices": ["service1", "service2", ...],
          "riskLevel": "low|medium|high"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error enriching company:', error.message);
      return {
        normalizedIndustry: company.industry || 'other',
        companySize: 'medium',
        businessType: 'private',
        reliabilityScore: 0.5,
        specializations: [],
        geographicScope: 'local',
        keyServices: [],
        riskLevel: 'medium'
      };
    }
  }

  async extractTenderDetails(html, url) {
    try {
      const prompt = `
        Extract detailed tender information from this HTML content.

        URL: ${url}
        HTML content: ${html.substring(0, 4000)}

        Return a JSON object with:
        {
          "title": "tender title",
          "reference": "tender reference number",
          "description": "detailed description",
          "organization": "issuing organization",
          "deadline": "ISO datetime",
          "budget": "budget amount or range",
          "requirements": ["req1", "req2", ...],
          "contactInfo": {
            "person": "contact person",
            "email": "contact email",
            "phone": "contact phone"
          },
          "documents": ["doc1_url", "doc2_url", ...],
          "categories": ["cat1", "cat2", ...]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1200
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error extracting tender details:', error.message);
      return {
        title: null,
        reference: null,
        description: null,
        organization: null,
        deadline: null,
        budget: null,
        requirements: [],
        contactInfo: {},
        documents: [],
        categories: []
      };
    }
  }

  async summarizeTender(tender) {
    try {
      const prompt = `
        Create a concise summary of this tender for quick review.

        Tender data:
        Title: ${tender.title}
        Description: ${tender.description}
        Organization: ${tender.organization}
        Deadline: ${tender.deadline}
        Budget: ${tender.budget}
        Requirements: ${tender.requirements?.join(', ')}

        Return a JSON object with:
        {
          "summary": "2-3 sentence summary",
          "keyHighlights": ["highlight1", "highlight2", ...],
          "actionItems": ["action1", "action2", ...],
          "timeToDeadline": "X days/weeks",
          "suitabilityScore": 0.0-1.0
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 600
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error summarizing tender:', error.message);
      return {
        summary: tender.description || 'No description available',
        keyHighlights: [],
        actionItems: [],
        timeToDeadline: 'Unknown',
        suitabilityScore: 0.5
      };
    }
  }

  async validateJSON(jsonString, context = '') {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (error) {
      console.error(`Invalid JSON in ${context}:`, error.message);
      return false;
    }
  }

  async retryWithValidation(aiFunction, ...args) {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await aiFunction(...args);
        
        // Validate the result is properly structured
        if (typeof result === 'object' && result !== null) {
          return result;
        } else {
          throw new Error('Invalid result format');
        }
      } catch (error) {
        console.error(`AI processing attempt ${i + 1} failed:`, error.message);
        if (i === maxRetries - 1) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
}

export default AIProcessor;
