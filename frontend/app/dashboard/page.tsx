import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardPageClient } from '../(dashboard)/dashboard-page-client'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      redirect('/signin')
    }

    return <DashboardPageClient />
  } catch (error) {
    console.error('Dashboard error:', error)
    redirect('/signin')
  }
}
