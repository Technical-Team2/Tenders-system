'use client'

import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const supabase = createClient()

// Email validation function
function validateEmail(email: string): boolean {
  // More strict email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

// Additional email validation for common issues
function validateEmailAdvanced(email: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = []
  
  // Basic format check
  if (!validateEmail(email)) {
    issues.push('Invalid email format')
  }
  
  // Length checks
  if (email.length > 254) {
    issues.push('Email too long (max 254 characters)')
  }
  
  // Local part checks
  const [localPart] = email.split('@')
  if (localPart.length > 64) {
    issues.push('Email username too long (max 64 characters)')
  }
  
  // Common domain issues
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
    // Advanced email validation
    const emailValidation = validateEmailAdvanced(email)
    if (!emailValidation.isValid) {
      const error = emailValidation.issues.join(', ')
      toast.error(error)
      return { success: false, error }
    }

    // Trim whitespace from email
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
        if (error.code === 'over_email_send_rate_limit') {
          const errorMessage = 'Too many signup attempts. Please wait a few minutes before trying again, or check your email for a confirmation link.'
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
        
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (supabaseError) {
      console.error('Supabase AuthApiError:', supabaseError)
      
      // Handle AuthApiError specifically (rate limit, invalid email, etc.)
      const errorText = supabaseError instanceof Error ? supabaseError.message : String(supabaseError)
      
      // Handle email validation errors specifically
      if (errorText?.includes('is invalid') || errorText?.includes('invalid')) {
        const errorMessage = 'This email address is not accepted. Please try a different email address.'
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      if (errorText?.includes('email rate limit exceeded')) {
        const errorMessage = 'Too many signup attempts. Please wait a few minutes before trying again, or check your email for a confirmation link.'
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      // Handle other Supabase errors
      const errorMessage = errorText || 'Signup service temporarily unavailable'
      toast.error(errorMessage)
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
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
      toast.error(error.message)
      return { success: false, error: error.message }
    }

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
      toast.error(error.message)
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
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }

    toast.success('Password reset email sent')
    return { success: true, data }
  } catch (error) {
    toast.error('An unexpected error occurred')
    return { success: false, error: 'Unexpected error' }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }

    toast.success('Password updated successfully')
    return { success: true, data }
  } catch (error) {
    toast.error('An unexpected error occurred')
    return { success: false, error: 'Unexpected error' }
  }
}

export async function getCurrentUserLocal() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}
