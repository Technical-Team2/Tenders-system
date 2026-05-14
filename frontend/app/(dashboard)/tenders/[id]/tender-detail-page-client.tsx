'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { Loader } from '@/components/ui/loader'
import type { Tender } from '@/lib/types'
import { TenderDetailContent } from './tender-detail-content'

export function TenderDetailPageClient({ id }: { id: string }) {
  const [tender, setTender] = useState<Tender | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchTender = async () => {
      try {
        const data = await apiClient.getTender(id)
        if (isMounted) {
          setTender(data as Tender)
        }
      } catch {
        if (isMounted) {
          setMissing(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTender()

    return () => {
      isMounted = false
    }
  }, [id])

  if (missing) {
    return <div className="p-8 text-sm text-muted-foreground">Tender not found.</div>
  }

  if (isLoading || !tender) {
    return <Loader label="Loading tender..." className="p-0" />
  }

  return <TenderDetailContent tender={tender} extractedDetails={null} application={null} />
}
