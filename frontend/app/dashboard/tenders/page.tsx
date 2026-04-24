import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TendersPageClient } from '../../(dashboard)/tenders/tenders-page-client'

export default async function TendersPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/signin')
  }

  return <TendersPageClient />
}
