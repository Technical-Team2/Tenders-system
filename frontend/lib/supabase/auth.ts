import { createClient } from './server'
import { revalidatePath } from 'next/cache'

export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // If signup successful and user is created, ensure profile exists
  if (data.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: metadata?.full_name || data.user.email?.split('@')[0],
        role: 'user'
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
    }
  }

  revalidatePath('/', 'layout')
  return { success: true, data }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // If sign-in successful, ensure user profile exists
  if (data.user) {
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
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          role: 'user'
        })

      if (profileError) {
        console.error('Error creating user profile during sign-in:', profileError)
      }
    }
  }

  revalidatePath('/', 'layout')
  return { success: true, data }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return user
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return false
  }

  return data.role === 'admin'
}
