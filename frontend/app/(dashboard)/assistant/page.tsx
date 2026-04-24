import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AssistantPageClient } from './assistant-page-client'

export default async function AssistantPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/signin')
  }

  return <AssistantPageClient />
}
