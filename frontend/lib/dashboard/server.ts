import { createClient } from '@/lib/supabase/server'
import type { Application, DashboardStats, ScrapeLog, Tender } from '@/lib/types'

type DashboardPageData = {
  session: Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getSession']>>['data']['session']
  stats: DashboardStats
  recentTenders: Tender[]
  recentApplications: Application[]
  scrapeLogs: ScrapeLog[]
}

export async function getDashboardPageData(): Promise<DashboardPageData> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      session: null,
      stats: {
        totalTenders: 0,
        newTenders: 0,
        highScoreTenders: 0,
        applicationsInProgress: 0,
        submittedApplications: 0,
        upcomingDeadlines: 0,
        sourcesActive: 0,
      },
      recentTenders: [],
      recentApplications: [],
      scrapeLogs: [],
    }
  }

  const now = new Date()
  const nextWeek = new Date(now)
  nextWeek.setDate(now.getDate() + 7)

  const todayIso = now.toISOString()
  const nextWeekIso = nextWeek.toISOString()

  const [
    tendersResult,
    applicationsResult,
    scrapeLogsResult,
    activeSourcesResult,
  ] = await Promise.all([
    supabase
      .from('tenders')
      .select('*, tender_sources(*), tender_scores(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('applications')
      .select('*, tenders(*, tender_scores(*))')
      .order('created_at', { ascending: false }),
    supabase
      .from('scrape_logs')
      .select('*, tender_sources(*)')
      .order('run_time', { ascending: false })
      .limit(10),
    supabase
      .from('tender_sources')
      .select('id')
      .eq('is_active', true),
  ])

  const tenders = (tendersResult.data ?? []) as Tender[]
  const applications = (applicationsResult.data ?? []) as Application[]
  const scrapeLogs = (scrapeLogsResult.data ?? []) as ScrapeLog[]
  const activeSources = activeSourcesResult.data ?? []

  const highScoreTenders = tenders.filter(
    (tender) => (tender.tender_scores?.[0]?.score ?? 0) >= 80
  )
  const upcomingDeadlines = tenders.filter((tender) => {
    if (!tender.deadline) return false

    const deadline = new Date(tender.deadline)
    return deadline >= now && deadline <= nextWeek
  })

  return {
    session,
    stats: {
      totalTenders: tenders.length,
      newTenders: tenders.filter((tender) => tender.status === 'new').length,
      highScoreTenders: highScoreTenders.length,
      applicationsInProgress: applications.filter((application) => application.status === 'draft').length,
      submittedApplications: applications.filter((application) => application.status === 'submitted').length,
      upcomingDeadlines: upcomingDeadlines.length,
      sourcesActive: activeSources.length,
    },
    recentTenders: tenders.slice(0, 10),
    recentApplications: applications.slice(0, 10),
    scrapeLogs,
  }
}
