'use client'

import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'

function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

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
  if (blockedDomains.some((blocked) => domain?.includes(blocked))) {
    issues.push('Disposable/temporary email domains not allowed')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

function normalizeAuthError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.'
    }

    if (error.message.toLowerCase().includes('email not confirmed')) {
      return 'Please confirm your email address before signing in. Check your inbox for the confirmation link.'
    }

    if (error.message.toLowerCase().includes('rate limit')) {
      return 'Too many attempts. Please wait a few minutes before trying again.'
    }

    if (error.message.toLowerCase().includes('already registered')) {
      return 'An account with this email already exists. Please sign in instead.'
    }

    return error.message
  }

  return fallback
}

export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const emailValidation = validateEmailAdvanced(email)
  if (!emailValidation.isValid) {
    const error = emailValidation.issues.join(', ')
    toast.error(error)
    return { success: false, error }
  }

  try {
    const cleanEmail = email.trim().toLowerCase()
    const data: any = await apiClient.signUp(cleanEmail, password, metadata || {})

    if (data.user && !data.session) {
      return { success: true, data: { user: data.user, requiresConfirmation: true } }
    }

    return { success: true, data }
  } catch (error) {
    const message = normalizeAuthError(error, 'Failed to create account')
    return { success: false, error: message }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const data = await apiClient.signIn(cleanEmail, password)

    return { success: true, data }
  } catch (error) {
    const message = normalizeAuthError(error, 'Failed to sign in')
    return { success: false, error: message }
  }
}

export async function signInWithGoogle() {
  const error = 'Google sign-in is not available through the backend API yet.'
  return { success: false, error }
}

export async function signOutUser() {
  try {
    await apiClient.signOut()
    return { success: true }
  } catch (error) {
    const message = normalizeAuthError(error, 'Failed to sign out')
    return { success: false, error: message }
  }
}

export async function resetPassword(_email?: string) {
  const error = 'Password reset is not available through the backend API yet.'
  return { success: false, error }
}

export async function updatePassword() {
  const error = 'Password updates are not available through the backend API yet.'
  return { success: false, error }
}

export async function getCurrentUser() {
  try {
    const data: any = await apiClient.getCurrentUser()
    return data.user || null
  } catch {
    return null
  }
}
