'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { TendersListContent } from './tenders-list-content'
import type { Tender, TenderSource } from '@/lib/types'

export function TendersPageClient() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [sources, setSources] = useState<TenderSource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchTenders = async () => {
      try {
        const [tendersData, sourcesData] = await Promise.all([
          apiClient.getTenders(),
          apiClient.getTenderSources(),
        ])

        if (!isMounted) return

        setTenders(tendersData as Tender[])
        setSources((sourcesData as TenderSource[]).filter((source) => source.is_active))
      } catch (error) {
        console.error('Failed to fetch tenders:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTenders()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Loading tenders...
      </div>
    )
  }

  const sectors = [...new Set(tenders.map((tender) => tender.sector).filter(Boolean))] as string[]

  return (
    <TendersListContent
      tenders={tenders}
      sources={sources}
      sectors={sectors}
    />
  )
}
