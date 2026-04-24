'use client'

import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const supabase = createClient()

// Email validation function
function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

// Additional email validation for common issues
function validateEmailAdvanced(email: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (!validateEmail(email)) {
    issues.push('Invalid email format')
  }
  
  if (email.length > 254) {
    issues.push('Email too long (max 254 characters)')
  }
  
  const [localPart] = email.split('@')
  if (localPart.length > 64) {
    issues.push('Email username too long (max 64 characters)')
  }
  
  const domain = email.split('@')[1]?.toLowerCase()
  const blockedDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com']
  if (blockedDomains.some(blocked => domain?.includes(blocked))) {
    issues.push('Disposable/temporary email domains not allowed')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  try {
    const emailValidation = validateEmailAdvanced(email)
    if (!emailValidation.isValid) {
      const error = emailValidation.issues.join(', ')
      toast.error(error)
      return { success: false, error }
    }

    const cleanEmail = email.trim().toLowerCase()
    console.log('Attempting signup with email:', cleanEmail)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/callback`
        }
      })

      if (error) {
        console.error('Supabase signup error:', error)
        
        // Handle specific rate limit error
        if (error.code === 'over_email_send_rate_limit' || error.message?.includes('email rate limit exceeded')) {
          const errorMessage = 'Too many signup attempts. Please wait a few minutes before trying again, or check your email for a confirmation link.'
          toast.error(errorMessage, {
            duration: 8000,
            description: 'Check your inbox for a previous confirmation email that may still be valid.'
          })
          return { success: false, error: errorMessage }
        }
        
        // Handle specific email validation errors
        if (error.code === 'invalid_email' || error.message?.includes('Invalid email')) {
          const errorMessage = 'Please provide a valid email address'
          toast.error(errorMessage, { duration: 5000 })
          return { success: false, error: errorMessage }
        }
        
        // Handle weak password errors
        if (error.code === 'weak_password' || error.message?.includes('weak password')) {
          const errorMessage = 'Password should be at least 6 characters'
          toast.error(errorMessage, { duration: 5000 })
          return { success: false, error: errorMessage }
        }
        
        // Handle user already exists error
        if (error.code === 'user_already_exists' || error.message?.includes('already registered')) {
          const errorMessage = 'An account with this email already exists. Please sign in instead.'
          toast.error(errorMessage, { duration: 5000 })
          return { success: false, error: errorMessage }
        }

        const errorMessage = error.message || 'Signup service temporarily unavailable'
        toast.error(errorMessage, { duration: 5000 })
        return { success: false, error: errorMessage }
      }

      console.log('Signup successful:', data)
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast.success('Account created! Please check your email to confirm your account before signing in.', {
          duration: 5000,
          description: 'Check your inbox for the confirmation link and click it to activate your account.'
        })
        return { success: true, data: { user: data.user, requiresConfirmation: true } }
      }
      
      if (data.session) {
        toast.success('Account created successfully!')
        return { success: true, data: { user: data.user, session: data.session } }
      }
      
      return { success: true, data }
    } catch (signupError: any) {
      console.error('Unexpected signup error:', signupError)
      const errorMessage = signupError.message || 'An unexpected error occurred during signup'
      toast.error(errorMessage, { duration: 5000 })
      return { success: false, error: errorMessage }
    }
  } catch (error) {
    console.error('Unexpected signup error:', error)
    toast.error('An unexpected error occurred')
    return { success: false, error: 'Unexpected error' }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const cleanEmail = email.trim().toLowerCase()
    console.log('Attempting sign in with email:', cleanEmail)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    })

    if (error) {
      console.error('Supabase sign in error:', error)
      
      // Handle specific errors
      if (error.code === 'invalid_credentials' || error.message?.includes('Invalid login credentials')) {
        const errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        toast.error(errorMessage, { duration: 5000 })
        return { success: false, error: errorMessage }
      }
      
      if (error.code === 'email_not_confirmed' || error.message?.includes('email not confirmed')) {
        const errorMessage = 'Please confirm your email address before signing in. Check your inbox for the confirmation link.'
        toast.error(errorMessage, { duration: 6000 })
        return { success: false, error: errorMessage }
      }

      const errorMessage = error.message || 'Failed to sign in'
      toast.error(errorMessage, { duration: 5000 })
      return { success: false, error: errorMessage }
    }

    console.log('Sign in successful:', data)
    
    // If we have a session, return success with session data
    if (data.session) {
      toast.success('Signed in successfully')
      return { success: true, data: { user: data.user, session: data.session } }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Unexpected sign in error:', error)
    toast.error('An unexpected error occurred')
    return { success: false, error: 'Unexpected error' }
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`
      }
    })

    if (error) {
      toast.error(error.message || 'Failed to sign in with Google')
      return { success: false, error: error.message }
    }

    // This will redirect to Google OAuth
    return { success: true, data }
  } catch (error) {
    toast.error('An unexpected error occurred')
    return { success: false, error: 'Unexpected error' }
  }
}

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error(error.message || 'Failed to sign out')
      return { success: false, error: error.message }
    }

    toast.success('Signed out successfully')
    return { success: true }
  } catch (error) {
    toast.error('An unexpected error occurred')
    return { success: false, error: 'Unexpected error' }
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      toast.error(error.message || 'Failed to send reset email')
      return { success: false, error: error.message }
    }

    toast.success('Password reset email sent')
    return { success: true }
  } catch (error) {
    toast.error('An unexpected error occurred')
    return { success: false, error: 'Unexpected error' }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      toast.error(error.message || 'Failed to update password')
      return { success: false, error: error.message }
    }

    toast.success('Password updated successfully')
    return { success: true }
  } catch (error) {
    toast.error('An unexpected error occurred')
    return { success: false, error: 'Unexpected error' }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Unexpected error getting current user:', error)
    return null
  }
}
