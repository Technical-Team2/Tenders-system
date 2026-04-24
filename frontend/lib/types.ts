export interface TenderSource {
  id: string
  name: string
  base_url: string
  type: 'html' | 'api' | 'login'
  is_active: boolean
  last_scraped_at: string | null
  created_at: string
}

export interface Tender {
  id: string
  title: string
  description: string | null
  organization: string | null
  sector: string | null
  location: string | null
  deadline: string | null
  budget: number | null
  currency: string
  source_id: string | null
  source_url: string | null
  status: 'new' | 'reviewed' | 'applied' | 'ignored'
  created_at: string
  updated_at: string
  tender_sources?: TenderSource
  tender_scores?: TenderScore[]
}

export interface TenderScore {
  id: string
  tender_id: string
  score: number
  breakdown: {
    relevance?: number
    budget_fit?: number
    timeline?: number
    competition?: number
    win_probability?: number
  } | null
  created_at: string
}

export interface ExtractedDetails {
  id: string
  tender_id: string
  eligibility: string | null
  requirements: string | null
  submission_method: string | null
  contact_info: {
    name?: string
    email?: string
    phone?: string
  } | null
  raw_text: string | null
}

export interface Application {
  id: string
  tender_id: string
  status: 'draft' | 'submitted'
  notes: string | null
  documents: string[] | null
  submitted_at: string | null
  created_at: string
  tenders?: Tender
}

export interface ScrapeLog {
  id: string
  source_id: string
  run_time: string
  records_found: number
  status: 'success' | 'failed'
  error: string | null
  tender_sources?: TenderSource
}

export interface DashboardStats {
  totalTenders: number
  newTenders: number
  highScoreTenders: number
  applicationsInProgress: number
  submittedApplications: number
  upcomingDeadlines: number
  sourcesActive: number
}
