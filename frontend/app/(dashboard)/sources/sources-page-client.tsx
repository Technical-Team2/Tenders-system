'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { Loader } from '@/components/ui/loader'
import type { ScrapeLog, Tender, TenderSource } from '@/lib/types'
import { SourcesContent } from './sources-content'

export function SourcesPageClient() {
  const [sources, setSources] = useState<TenderSource[]>([])
  const [tenderCounts, setTenderCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchSources = async () => {
      try {
        const [sourcesData, tendersData] = await Promise.all([
          apiClient.getTenderSources(),
          apiClient.getTenders(),
        ])

        if (!isMounted) return

        const counts = (tendersData as Tender[]).reduce<Record<string, number>>((acc, tender) => {
          if (tender.source_id) {
            acc[tender.source_id] = (acc[tender.source_id] || 0) + 1
          }
          return acc
        }, {})

        setSources(sourcesData as TenderSource[])
        setTenderCounts(counts)
      } catch (error) {
        console.error('Failed to fetch sources:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchSources()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <Loader label="Loading sources..." className="p-0" />
  }

  return <SourcesContent sources={sources} scrapeLogs={[] as ScrapeLog[]} tenderCounts={tenderCounts} />
}
