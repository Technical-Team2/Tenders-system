import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AIScoreResult {
  score: number
  breakdown: {
    sector_match: number
    budget_fit: number
    timeline: number
    requirements: number
    location: number
    competition: number
  }
  reasoning: string
  confidence: number
}

export interface ApplicationAssistance {
  emailDraft: string
  checklist: string[]
  requiredDocuments: string[]
  keyRequirements: string[]
  timeline: string[]
}

export interface CompanyExtraction {
  name: string
  emails: string[]
  phones: string[]
  address: string
  website: string
  description: string
  confidence: number
}

export async function scoreTender(
  tenderTitle: string,
  tenderDescription: string,
  companyProfile: {
    name: string
    description: string
    sectors: string[]
    locations: string[]
    certifications: string[]
  }
): Promise<AIScoreResult> {
  const prompt = `
You are an expert tender evaluation AI. Please analyze this tender opportunity against the company profile and provide a detailed score.

TENDER INFORMATION:
Title: ${tenderTitle}
Description: ${tenderDescription}

COMPANY PROFILE:
Name: ${companyProfile.name}
Description: ${companyProfile.description}
Target Sectors: ${companyProfile.sectors.join(', ')}
Preferred Locations: ${companyProfile.locations.join(', ')}
Certifications: ${companyProfile.certifications.join(', ')}

Please provide:
1. An overall score from 0-100
2. A breakdown of scores for each category (0-20 points each)
3. Detailed reasoning for your scoring
4. Confidence level in your assessment (0-100%)

Respond in JSON format:
{
  "score": number,
  "breakdown": {
    "sector_match": number,
    "budget_fit": number,
    "timeline": number,
    "requirements": number,
    "location": number,
    "competition": number
  },
  "reasoning": "detailed explanation",
  "confidence": number
}
`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert tender evaluation AI. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const result = JSON.parse(content) as AIScoreResult
    
    // Validate and normalize scores
    return {
      score: Math.min(100, Math.max(0, result.score)),
      breakdown: {
        sector_match: Math.min(20, Math.max(0, result.breakdown.sector_match)),
        budget_fit: Math.min(20, Math.max(0, result.breakdown.budget_fit)),
        timeline: Math.min(20, Math.max(0, result.breakdown.timeline)),
        requirements: Math.min(20, Math.max(0, result.breakdown.requirements)),
        location: Math.min(20, Math.max(0, result.breakdown.location)),
        competition: Math.min(20, Math.max(0, result.breakdown.competition)),
      },
      reasoning: result.reasoning,
      confidence: Math.min(100, Math.max(0, result.confidence))
    }
  } catch (error) {
    console.error('Error scoring tender:', error)
    throw new Error('Failed to score tender with AI')
  }
}

export async function generateApplicationAssistance(
  tenderTitle: string,
  tenderDescription: string,
  deadline: string
): Promise<ApplicationAssistance> {
  const prompt = `
You are an expert tender application assistant. Analyze this tender and provide comprehensive assistance for the application process.

TENDER DETAILS:
Title: ${tenderTitle}
Description: ${tenderDescription}
Deadline: ${deadline}

Please provide:
1. A professional email draft for initial inquiry
2. A comprehensive checklist of application requirements
3. List of required documents
4. Key requirements to highlight
5. Important timeline milestones

Respond in JSON format:
{
  "emailDraft": "professional email text",
  "checklist": ["item1", "item2", ...],
  "requiredDocuments": ["doc1", "doc2", ...],
  "keyRequirements": ["req1", "req2", ...],
  "timeline": ["milestone1", "milestone2", ...]
}
`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert tender application assistant. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from AI')
    }

    return JSON.parse(content) as ApplicationAssistance
  } catch (error) {
    console.error('Error generating application assistance:', error)
    throw new Error('Failed to generate application assistance')
  }
}

export async function extractCompanyInfo(websiteUrl: string): Promise<CompanyExtraction> {
  const prompt = `
You are an expert web scraping AI. Analyze the company website and extract structured information.

WEBSITE: ${websiteUrl}

Please extract:
1. Company name
2. Email addresses
3. Phone numbers
4. Physical address
5. Company description
6. Confidence score for extracted information

Respond in JSON format:
{
  "name": "company name",
  "emails": ["email1", "email2", ...],
  "phones": ["phone1", "phone2", ...],
  "address": "full address",
  "website": "website URL",
  "description": "company description",
  "confidence": number (0-100)
}
`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert web scraping AI. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const result = JSON.parse(content) as CompanyExtraction
    return {
      ...result,
      website: websiteUrl,
      confidence: Math.min(100, Math.max(0, result.confidence))
    }
  } catch (error) {
    console.error('Error extracting company info:', error)
    throw new Error('Failed to extract company information')
  }
}
