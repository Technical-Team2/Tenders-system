'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { AssistantContent } from './assistant-content'
import type { Tender } from '@/lib/types'

export function AssistantPageClient() {
  const [recentTenders, setRecentTenders] = useState<Tender[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchRecentTenders = async () => {
      try {
        const tenders = await apiClient.getTenders({ limit: '10' })

        if (!isMounted) return

        setRecentTenders(tenders as Tender[])
      } catch (error) {
        console.error('Failed to fetch recent tenders:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchRecentTenders()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Loading assistant data...
      </div>
    )
  }

  return <AssistantContent recentTenders={recentTenders} />
}
