type ScoreBreakdown = Record<string, number>

type ScoreResult = {
  score: number
  breakdown: ScoreBreakdown
  reasoning: string
  confidence: number
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
}

function extractKeywords(value: string) {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in',
    'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'with',
  ])

  return Array.from(
    new Set(
      normalizeText(value)
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word))
    )
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export async function scoreTender(
  title: string,
  description: string,
  companyProfile: string
): Promise<ScoreResult> {
  const tenderKeywords = extractKeywords(`${title} ${description}`)
  const profileKeywords = new Set(extractKeywords(companyProfile))
  const matchedKeywords = tenderKeywords.filter((keyword) => profileKeywords.has(keyword))

  const titleAlignment = clamp(
    Math.round((matchedKeywords.length / Math.max(tenderKeywords.length, 8)) * 100),
    20,
    95
  )
  const descriptionDepth = clamp(Math.min(description.length / 12, 100), 15, 100)
  const profileDepth = clamp(Math.min(companyProfile.length / 10, 100), 20, 100)
  const keywordCoverage = clamp(
    Math.round((matchedKeywords.length / Math.max(profileKeywords.size, 6)) * 100),
    10,
    90
  )

  const breakdown: ScoreBreakdown = {
    title_alignment: titleAlignment,
    requirements_match: keywordCoverage,
    description_quality: Math.round(descriptionDepth),
    profile_completeness: Math.round(profileDepth),
  }

  const score = Math.round(
    Object.values(breakdown).reduce((sum, value) => sum + value, 0) / Object.keys(breakdown).length
  )

  const reasoning = matchedKeywords.length > 0
    ? `Matched keywords: ${matchedKeywords.slice(0, 8).join(', ')}. The profile shows the strongest alignment with the tender's core themes.`
    : 'Limited direct keyword overlap was found, so this score is based more on general profile completeness and tender detail quality.'

  const confidence = clamp(45 + matchedKeywords.length * 8 + Math.round(descriptionDepth / 10), 50, 95)

  return {
    score,
    breakdown,
    reasoning,
    confidence,
  }
}

export async function generateApplicationAssistance(
  title: string,
  description: string,
  deadline: string
) {
  const keywords = extractKeywords(`${title} ${description}`).slice(0, 6)
  const checklist = [
    'Confirm eligibility requirements and mandatory documents.',
    'Tailor the executive summary to the buyer priorities.',
    'Prepare evidence for relevant past performance and case studies.',
    'Assign owners for technical, pricing, and compliance sections.',
    `Set an internal review date at least 48 hours before ${deadline}.`,
  ]

  return {
    summary: `Prepare a focused response for "${title}" with emphasis on ${keywords.join(', ') || 'the tender requirements'}.`,
    keyPoints: [
      'Lead with the strongest capability match in the opening section.',
      'Translate experience into measurable outcomes and delivery confidence.',
      'Address compliance and risk mitigation early in the proposal.',
    ],
    checklist,
    draftEmail: `Hello team,\n\nPlease begin drafting the response for "${title}". Prioritize our evidence around ${keywords.slice(0, 3).join(', ') || 'the main requirements'} and keep the final review scheduled ahead of ${deadline}.\n\nThanks.`,
  }
}

export async function extractCompanyInfo(websiteUrl: string) {
  const hostname = new URL(websiteUrl).hostname.replace(/^www\./, '')
  const companyName = hostname
    .split('.')[0]
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return {
    companyName,
    websiteUrl,
    summary: `${companyName} appears to be an organization reachable via ${hostname}. A deeper live extraction service can be layered in later if needed.`,
    capabilities: [
      'Business profile extraction',
      'Website-based company summarization',
      'Tender matching keyword suggestions',
    ],
    suggestedTenderKeywords: [
      companyName,
      'digital transformation',
      'professional services',
      'implementation support',
    ],
  }
}
