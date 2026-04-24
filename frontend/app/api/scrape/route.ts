import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import * as cheerio from "cheerio"

// Keywords that indicate tender-related pages
const TENDER_KEYWORDS = [
  "tender", "tenders", "bid", "bids", "procurement", "rfp", "rfq", "quotation",
  "contract", "opportunity", "opportunities", "solicitation", "call for",
  "expression of interest", "eoi", "prequalification", "notice", "advertisement"
]

// Keywords that indicate relevant page links to follow
const RELEVANT_PAGE_KEYWORDS = [
  "tender", "tenders", "procurement", "bids", "opportunities", "contracts",
  "notices", "advertisement", "downloads", "documents"
]

interface ScrapedTender {
  title: string
  description?: string
  organization?: string
  deadline?: string
  budget?: number
  currency?: string
  source_url: string
  sector?: string
  location?: string
}

function normalizeUrl(base: string, href: string): string {
  try {
    if (href.startsWith("http")) return href
    if (href.startsWith("//")) return `https:${href}`
    if (href.startsWith("/")) {
      const url = new URL(base)
      return `${url.protocol}//${url.host}${href}`
    }
    return new URL(href, base).toString()
  } catch {
    return ""
  }
}

function extractDate(text: string): string | null {
  // Try various date formats
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
  ]
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      try {
        const dateStr = match[0]
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          return date.toISOString()
        }
      } catch {
        continue
      }
    }
  }
  return null
}

function extractBudget(text: string): { amount: number | null; currency: string } {
  const currencyPatterns = [
    { pattern: /(?:KES|Ksh|KSH)\s*([\d,]+(?:\.\d{2})?)/i, currency: "KES" },
    { pattern: /(?:USD|\$)\s*([\d,]+(?:\.\d{2})?)/i, currency: "USD" },
    { pattern: /(?:EUR|€)\s*([\d,]+(?:\.\d{2})?)/i, currency: "EUR" },
    { pattern: /(?:GBP|£)\s*([\d,]+(?:\.\d{2})?)/i, currency: "GBP" },
  ]
  
  for (const { pattern, currency } of currencyPatterns) {
    const match = text.match(pattern)
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ""))
      if (!isNaN(amount)) {
        return { amount, currency }
      }
    }
  }
  return { amount: null, currency: "KES" }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

function findRelevantLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html)
  const links: string[] = []
  
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")
    const text = $(el).text().toLowerCase()
    
    if (href) {
      const isRelevant = RELEVANT_PAGE_KEYWORDS.some(keyword => 
        text.includes(keyword) || href.toLowerCase().includes(keyword)
      )
      
      if (isRelevant) {
        const normalizedUrl = normalizeUrl(baseUrl, href)
        if (normalizedUrl && !links.includes(normalizedUrl)) {
          links.push(normalizedUrl)
        }
      }
    }
  })
  
  return links.slice(0, 5) // Limit to 5 relevant pages
}

function extractTendersFromPage(html: string, baseUrl: string, organization: string): ScrapedTender[] {
  const $ = cheerio.load(html)
  const tenders: ScrapedTender[] = []
  
  // Common selectors for tender listings
  const selectors = [
    "table tr",
    ".tender-item, .tender-row, .bid-item",
    "article, .post, .entry",
    ".list-item, .item",
    ".card, .notice",
    "li",
  ]
  
  // Try to find tender items using various selectors
  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const $el = $(el)
      const text = cleanText($el.text())
      
      // Check if this element contains tender-related content
      const hasTenderContent = TENDER_KEYWORDS.some(keyword => 
        text.toLowerCase().includes(keyword)
      )
      
      if (!hasTenderContent || text.length < 30) return
      
      // Try to extract title
      let title = ""
      const titleSelectors = ["h1", "h2", "h3", "h4", ".title", "a", "strong", "b", "td:first-child"]
      for (const ts of titleSelectors) {
        const titleEl = $el.find(ts).first()
        if (titleEl.length && titleEl.text().trim().length > 10) {
          title = cleanText(titleEl.text())
          break
        }
      }
      
      if (!title && text.length > 20) {
        // Use first 150 chars as title if no specific title found
        title = text.substring(0, 150)
      }
      
      if (!title || title.length < 10) return
      
      // Check for duplicates
      if (tenders.some(t => t.title === title)) return
      
      // Extract link
      let sourceUrl = baseUrl
      const link = $el.find("a").first()
      if (link.length) {
        const href = link.attr("href")
        if (href) {
          sourceUrl = normalizeUrl(baseUrl, href)
        }
      }
      
      // Extract other details
      const deadline = extractDate(text)
      const { amount: budget, currency } = extractBudget(text)
      const description = text.length > 150 ? text.substring(0, 500) : text
      
      tenders.push({
        title: title.substring(0, 255),
        description,
        organization,
        deadline: deadline || undefined,
        budget: budget || undefined,
        currency,
        source_url: sourceUrl,
        sector: guessSector(text),
        location: guessLocation(text),
      })
    })
    
    // If we found tenders with this selector, stop trying others
    if (tenders.length > 0) break
  }
  
  return tenders
}

function guessSector(text: string): string {
  const sectors: Record<string, string[]> = {
    "ICT": ["software", "ict", "technology", "computer", "it services", "digital"],
    "Construction": ["construction", "building", "civil works", "renovation", "infrastructure"],
    "Healthcare": ["medical", "health", "hospital", "pharmaceutical", "drugs"],
    "Education": ["education", "training", "school", "university", "college", "tvet"],
    "Agriculture": ["agriculture", "farming", "livestock", "seeds", "fertilizer"],
    "Energy": ["energy", "solar", "power", "electricity", "fuel"],
    "Transport": ["transport", "logistics", "vehicles", "fleet", "cargo"],
    "Consulting": ["consulting", "consultancy", "advisory", "professional services"],
    "Supplies": ["supply", "supplies", "equipment", "materials", "goods"],
  }
  
  const lowerText = text.toLowerCase()
  for (const [sector, keywords] of Object.entries(sectors)) {
    if (keywords.some(k => lowerText.includes(k))) {
      return sector
    }
  }
  return "General"
}

function guessLocation(text: string): string {
  const locations = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Nyeri", "Machakos",
    "Garissa", "Kakamega", "Kiambu", "Kenya", "East Africa", "Africa"
  ]
  
  for (const loc of locations) {
    if (text.toLowerCase().includes(loc.toLowerCase())) {
      return loc
    }
  }
  return "Kenya"
}

function scoreTender(tender: ScrapedTender): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {
    sector: 0,
    budget: 0,
    deadline: 0,
    requirements: 0,
    location: 0,
  }
  
  // Sector scoring
  const preferredSectors = ["ICT", "Consulting", "Supplies", "Construction"]
  if (tender.sector && preferredSectors.includes(tender.sector)) {
    breakdown.sector = 30
  } else {
    breakdown.sector = 15
  }
  
  // Budget scoring
  if (tender.budget) {
    if (tender.budget >= 1000000) breakdown.budget = 20
    else if (tender.budget >= 100000) breakdown.budget = 15
    else breakdown.budget = 10
  }
  
  // Deadline scoring (more time = better)
  if (tender.deadline) {
    const daysUntil = (new Date(tender.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    if (daysUntil > 14) breakdown.deadline = 10
    else if (daysUntil > 7) breakdown.deadline = 7
    else if (daysUntil > 0) breakdown.deadline = 3
  }
  
  // Requirements/description scoring
  if (tender.description && tender.description.length > 100) {
    breakdown.requirements = 25
  } else {
    breakdown.requirements = 10
  }
  
  // Location scoring
  if (tender.location === "Nairobi" || tender.location === "Kenya") {
    breakdown.location = 10
  } else {
    breakdown.location = 5
  }
  
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0)
  return { score: Math.min(score, 100), breakdown }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceId, sourceUrl, url } = body
    
    // Support both parameter names
    const finalUrl = sourceUrl || url
    
    if (!sourceId || !finalUrl) {
      return NextResponse.json({ error: "Source ID and URL are required" }, { status: 400 })
    }
    
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get source details
    const { data: source, error: sourceError } = await supabase
      .from("tender_sources")
      .select("*")
      .eq("id", sourceId)
      .single()
    
    if (sourceError || !source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 })
    }
    
    const organization = source.name || "Unknown"
    const allTenders: ScrapedTender[] = []
    
    // Fetch the main page
    const mainHtml = await fetchPage(finalUrl)
    if (!mainHtml) {
      // Log failure
      await supabase.from("scrape_logs").insert({
        source_id: sourceId,
        records_found: 0,
        status: "failed",
        error: "Failed to fetch main page",
      })
      
      return NextResponse.json({ error: "Failed to fetch the website" }, { status: 500 })
    }
    
    // Extract tenders from main page
    const mainTenders = extractTendersFromPage(mainHtml, finalUrl, organization)
    allTenders.push(...mainTenders)
    
    // Find and follow relevant links
    const relevantLinks = findRelevantLinks(mainHtml, finalUrl)
    
    for (const link of relevantLinks) {
      try {
        const pageHtml = await fetchPage(link)
        if (pageHtml) {
          const pageTenders = extractTendersFromPage(pageHtml, link, organization)
          // Only add unique tenders
          for (const tender of pageTenders) {
            if (!allTenders.some(t => t.title === tender.title)) {
              allTenders.push(tender)
            }
          }
        }
      } catch {
        // Continue with other links
      }
    }
    
    // Insert tenders into database
    let insertedCount = 0
    let duplicateCount = 0
    const insertErrors: string[] = []
    for (const tender of allTenders) {
      // Check if tender already exists
      const { data: existing, error: existingError } = await adminSupabase
        .from("tenders")
        .select("id")
        .eq("title", tender.title)
        .eq("source_url", tender.source_url)
        .single()

      if (existingError && existingError.code !== "PGRST116") {
        insertErrors.push(`Failed duplicate check for "${tender.title}": ${existingError.message}`)
        continue
      }

      if (existing) {
        duplicateCount++
        continue
      }

      // Insert tender
      const { data: newTender, error: insertError } = await adminSupabase
        .from("tenders")
        .insert({
          title: tender.title,
          description: tender.description,
          organization: tender.organization,
          sector: tender.sector,
          location: tender.location,
          deadline: tender.deadline,
          budget: tender.budget,
          currency: tender.currency,
          source_id: sourceId,
          source_url: tender.source_url,
          status: "new",
        })
        .select()
        .single()

      if (insertError || !newTender) {
        insertErrors.push(`Failed to insert "${tender.title}": ${insertError?.message || "Unknown insert error"}`)
        continue
      }

      // Calculate and insert score
      const { score, breakdown } = scoreTender(tender)
      const { error: scoreError } = await adminSupabase.from("tender_scores").insert({
        tender_id: newTender.id,
        score,
        breakdown,
      })

      if (scoreError) {
        console.error(`Failed to insert score for "${tender.title}":`, scoreError)
      }

      // Insert extracted details
      const { error: detailsError } = await adminSupabase.from("extracted_details").insert({
        tender_id: newTender.id,
        raw_text: tender.description,
      })

      if (detailsError) {
        console.error(`Failed to insert extracted details for "${tender.title}":`, detailsError)
      }

      insertedCount++
    }

    if (insertErrors.length > 0) {
      console.error("Scrape insert errors:", insertErrors)
    }
    
    // Update source last_scraped_at
    await adminSupabase
      .from("tender_sources")
      .update({ last_scraped_at: new Date().toISOString() })
      .eq("id", sourceId)
    
    // Log success
    await adminSupabase.from("scrape_logs").insert({
      source_id: sourceId,
      records_found: allTenders.length,
      status: insertErrors.length > 0 && insertedCount === 0 ? "failed" : "success",
      error: insertErrors.length > 0 ? insertErrors.slice(0, 3).join(" | ") : null,
    })
    
    const responseBody = {
      success: insertErrors.length === 0 || insertedCount > 0,
      tendersFound: allTenders.length,
      tendersInserted: insertedCount,
      duplicatesSkipped: duplicateCount,
      errors: insertErrors,
      message: `Found ${allTenders.length} tenders, inserted ${insertedCount} new tenders${duplicateCount ? `, skipped ${duplicateCount} duplicates` : ""}`,
    }

    return NextResponse.json(responseBody, {
      status: insertErrors.length > 0 && insertedCount === 0 ? 500 : 200,
    })
    
  } catch (error) {
    console.error("Scrape error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Scrape failed" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get('sourceId')
    const sourceUrl = searchParams.get('sourceUrl')
    const url = searchParams.get('url')
    
    // Support both parameter names
    const finalUrl = sourceUrl || url
    
    if (!sourceId || !finalUrl) {
      return NextResponse.json({ error: "Source ID and URL are required" }, { status: 400 })
    }
    
    // Create a POST request body and call the POST handler
    const body = JSON.stringify({ sourceId, sourceUrl: finalUrl })
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })
    
    return await POST(postRequest)
    
  } catch (error) {
    console.error("Scrape error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Scrape failed" 
    }, { status: 500 })
  }
}
