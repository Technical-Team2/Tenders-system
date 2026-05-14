import OpenAI from 'openai';

class AIProcessor {
  constructor() {
    this.enabled = false;
    this.openai = null;

    // Only enable if API key is present
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        this.enabled = true;
        console.log('✅ AI Processor enabled (OPENAI_API_KEY found)');
      } catch (error) {
        console.warn('⚠️  Failed to initialize OpenAI:', error.message);
        this.enabled = false;
      }
    } else {
      console.log('⚠️  AI Processor disabled (OPENAI_API_KEY not set)');
    }
  }

  isEnabled() {
    return this.enabled;
  }

  async cleanData(rawText) {
    // Return early if AI is disabled
    if (!this.enabled) {
      return {
        cleanedText: rawText.replace(/\s+/g, ' ').trim(),
        type: 'other',
        confidence: 0.5,
        keyPoints: []
      };
    }

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
    // Return early if AI is disabled
    if (!this.enabled) {
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
    // Return early if AI is disabled
    if (!this.enabled) {
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
    // Return early if AI is disabled
    if (!this.enabled) {
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

  async analyzeTenderCompatibility(tender, companyProfile) {
    // Return early if AI is disabled
    if (!this.enabled) {
      return {
        qualification_assessment: { is_recommended: false, qualification_level: "Unknown", confidence_level: "Low" },
        scores: { final_match_score: 0 },
        strategic_analysis: { why_it_matches: "AI Processor Disabled" }
      };
    }

    try {
      const prompt = `
        You are an expert procurement intelligence and tender qualification AI system.
        Analyze the following tender against the provided company profile.

        ==================================================
        COMPANY PROFILE:
        ${JSON.stringify(companyProfile, null, 2)}

        TENDER DATA:
        ${JSON.stringify(tender, null, 2)}
        ==================================================

        Analyze the tender against the company profile using the following dimensions:
        1. INDUSTRY ALIGNMENT
        2. SERVICE/SCOPE MATCH
        3. FINANCIAL CAPACITY
        4. EXPERIENCE MATCH
        5. CERTIFICATION & COMPLIANCE MATCH
        6. GEOGRAPHIC FEASIBILITY
        7. TIMELINE & EXECUTION FEASIBILITY
        8. COMPETITION/COMPLEXITY RISK
        9. TENDER READINESS
        10. OVERALL STRATEGIC FIT

        SCORING INSTRUCTIONS:
        Generate weighted scores from 0–100 for each dimension.
        Compute a final_match_score.
        
        RISK DETECTION:
        Detect missing certifications, insufficient experience, budget overreach, staffing limitations, etc.

        Return STRICT JSON ONLY in the following format:
        {
          "tender_summary": {
            "title": "",
            "organization": "",
            "sector": "",
            "location": "",
            "scope_summary": "",
            "estimated_complexity": "",
            "estimated_competition_level": ""
          },
          "qualification_assessment": {
            "is_recommended": true/false,
            "qualification_level": "Excellent|Strong|Moderate|Weak|Not Recommended",
            "confidence_level": "High|Medium|Low"
          },
          "scores": {
            "industry_alignment": 0,
            "service_match": 0,
            "financial_capacity": 0,
            "experience_match": 0,
            "certification_match": 0,
            "geographic_match": 0,
            "execution_feasibility": 0,
            "strategic_fit": 0,
            "final_match_score": 0
          },
          "strengths": [],
          "weaknesses": [],
          "risks": [],
          "missing_requirements": [],
          "strategic_analysis": {
            "why_it_matches": "",
            "why_it_may_fail": "",
            "recommended_action": "",
            "partnership_needed": false,
            "bid_readiness": ""
          },
          "feasibility_analysis": {
            "operational_feasibility": "",
            "financial_feasibility": "",
            "technical_feasibility": "",
            "overall_feasibility": ""
          }
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // Using 4o for deeper analysis as requested
        messages: [{ role: "system", content: "You are a professional bid evaluation expert." }, { role: "user", content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error in Procurement Intelligence Analysis:', error.message);
      return {
        error: error.message,
        qualification_assessment: { is_recommended: false, qualification_level: "Error", confidence_level: "None" }
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
