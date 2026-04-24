'use client'

import { useEffect, useState } from 'react'
import { DashboardContent } from './dashboard-content'
import { apiClient } from '@/lib/api/client'
import type { Application, DashboardStats, Tender, TenderSource } from '@/lib/types'

const emptyStats: DashboardStats = {
  totalTenders: 0,
  newTenders: 0,
  highScoreTenders: 0,
  applicationsInProgress: 0,
  submittedApplications: 0,
  upcomingDeadlines: 0,
  sourcesActive: 0,
}

function computeStats(tenders: Tender[], applications: Application[], sources: TenderSource[]): DashboardStats {
  const now = new Date()
  const nextWeek = new Date(now)
  nextWeek.setDate(now.getDate() + 7)

  return {
    totalTenders: tenders.length,
    newTenders: tenders.filter((tender) => tender.status === 'new').length,
    highScoreTenders: tenders.filter((tender) => (tender.tender_scores?.[0]?.score ?? 0) >= 80).length,
    applicationsInProgress: applications.filter((application) => application.status === 'draft').length,
    submittedApplications: applications.filter((application) => application.status === 'submitted').length,
    upcomingDeadlines: tenders.filter((tender) => {
      if (!tender.deadline) return false
      const deadline = new Date(tender.deadline)
      return deadline >= now && deadline <= nextWeek
    }).length,
    sourcesActive: sources.filter((source) => source.is_active).length,
  }
}

export function DashboardPageClient() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [recentTenders, setRecentTenders] = useState<Tender[]>([])
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchDashboardData = async () => {
      try {
        const [tenders, applications, sources] = await Promise.all([
          apiClient.getTenders(),
          apiClient.getApplications(),
          apiClient.getTenderSources(),
        ])

        if (!isMounted) return

        setRecentTenders((tenders as Tender[]).slice(0, 10))
        setRecentApplications((applications as Application[]).slice(0, 10))
        setStats(computeStats(tenders as Tender[], applications as Application[], sources as TenderSource[]))
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Loading dashboard data...
      </div>
    )
  }

  return (
    <DashboardContent
      stats={stats}
      recentTenders={recentTenders}
      recentApplications={recentApplications}
      scrapeLogs={[]}
    />
  )
}
