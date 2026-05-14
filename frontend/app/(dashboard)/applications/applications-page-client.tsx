'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { Loader } from '@/components/ui/loader'
import type { Application } from '@/lib/types'
import { ApplicationsContent } from './applications-content'

export function ApplicationsPageClient() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchApplications = async () => {
      try {
        const data = await apiClient.getApplications()
        if (isMounted) {
          setApplications(data as Application[])
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchApplications()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <Loader label="Loading applications..." className="p-0" />
  }

  return <ApplicationsContent applications={applications} />
}
