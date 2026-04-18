import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface AuthCallbackPageProps {
  searchParams: { code?: string; error?: string }
}

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const supabase = await createClient()

  if (searchParams.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(searchParams.code)
    
    if (!error && data.user) {
      // Ensure user profile exists for OAuth sign-ins
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || 
                       data.user.user_metadata?.name || 
                       data.user.email?.split('@')[0],
            role: 'user'
          })

        if (profileError) {
          console.error('Error creating user profile during OAuth callback:', profileError)
        }
      }
      
      redirect('/dashboard')
    }
  }

  // Handle error case or missing code
  redirect('/signin?error=auth_failed')
}
