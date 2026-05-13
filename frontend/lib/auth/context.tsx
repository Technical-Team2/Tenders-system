'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { signIn as signInRequest, signOutUser, signUp as signUpRequest } from './client'

type AuthUser = {
  id: string
  email?: string
  user_metadata?: Record<string, any>
  role?: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  authenticated: boolean
  restoreSession: () => Promise<AuthUser | null>
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ success: boolean; data?: any; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const restoreSession = useCallback(async () => {
    setLoading(true)
    try {
      const data: any = await apiClient.getCurrentUser()
      const restoredUser = data.user || null
      setUser(restoredUser)
      return restoredUser
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      setUser(null)
    })

    void restoreSession()

    return () => apiClient.setUnauthorizedHandler(undefined)
  }, [restoreSession])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInRequest(email, password)
    if (result.success) {
      const data = result.data as { user?: AuthUser } | undefined
      const authUser = data?.user || null
      setUser(authUser)
    }
    return result
  }, [])

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    const result = await signUpRequest(email, password, metadata)
    const data = result.data as { user?: AuthUser; session?: unknown } | undefined
    if (result.success && data?.session) {
      setUser(data.user || null)
    }
    return result
  }, [])

  const logout = useCallback(async () => {
    const result = await signOutUser()
    if (result.success) {
      setUser(null)
      router.push('/signin')
    }
    return result
  }, [router])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    authenticated: !!user,
    restoreSession,
    signIn,
    signUp,
    logout,
  }), [loading, logout, restoreSession, signIn, signUp, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
