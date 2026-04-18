'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { signIn, signUp, signInWithGoogle } from '@/lib/supabase/client-auth'
import { toast } from 'sonner'

interface AuthFormProps {
  type: 'signin' | 'signup'
  className?: string
}

export function AuthForm({ type, className }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if rate limited
    if (rateLimited) {
      toast.error(`Please wait ${cooldownTime} seconds before trying again`)
      return
    }
    
    setLoading(true)

    try {
      if (type === 'signin') {
        const result = await signIn(email, password)
        console.log('Sign in result:', result)
        console.log('Result success:', result.success)
        console.log('Result data:', result.data)
        console.log('User data:', result.data?.user)
        console.log('Session data:', result.data?.session)
        console.log('User role:', result.data?.user?.role)
        if (result.success) {
          // Check if authentication actually completed successfully
          const user = result.data?.user
          const session = result.data?.session
          
          if (user && session) {
            toast.success('Signed in successfully')
            console.log('Authentication successful, attempting to redirect to dashboard...')
            // Use window.location.replace for immediate redirect after successful auth
            window.location.replace('/dashboard')
          } else {
            toast.error('Authentication incomplete. Please try again.')
            console.error('Authentication incomplete:', { user, session })
          }
        } else {
          toast.error(result.error || 'Failed to sign in')
        }
      } else {
        const result = await signUp(email, password, {
          full_name: name || email.split('@')[0],
          username: username || email.split('@')[0]
        })
        console.log('Signup result:', result)
        console.log('User data:', result.data?.user)
        console.log('User role:', result.data?.user?.role)
        
        if (result.success) {
          const user = result.data?.user
          
          // Check if email confirmation is required
          if (user && user.role === 'authenticated') {
            toast.success('Account created successfully')
            router.push('/signin')
          } else {
            toast.success('Account created! Please check your email to confirm your account before signing in.')
            router.push('/signin')
          }
        } else {
          // Handle rate limit error specifically
          if (result.error?.includes('Too many signup attempts')) {
            setRateLimited(true)
            setCooldownTime(120) // 2 minutes cooldown
            toast.error('Too many signup attempts. Please wait 2 minutes before trying again.')
            
            // Start countdown
            const countdown = setInterval(() => {
              setCooldownTime(prev => {
                if (prev <= 1) {
                  clearInterval(countdown)
                  setRateLimited(false)
                  return 0
                }
                return prev - 1
              })
            }, 1000)
          } else {
            toast.error(result.error || 'Failed to create account')
          }
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result.success) {
        toast.success('Redirecting to Google...')
      } else {
        toast.error(result.error || 'Failed to sign in with Google')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`${className} w-full max-w-md mx-auto`}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          {type === 'signin' ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-center">
          {type === 'signin' 
            ? 'Enter your credentials to access your account'
            : 'Create a new account to get started'
          }
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {type === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                  required={type === 'signup'}
                  disabled={loading}
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username || ''}
                  onChange={(e) => setUsername(e.target.value)}
                  required={type === 'signup'}
                  disabled={loading}
                  suppressHydrationWarning
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email || ''}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              suppressHydrationWarning
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password || ''}
              onChange={(e) => setPassword(e.target.value)}
              suppressHydrationWarning
              required
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
            style={{ backgroundColor: '#0D3B66' }}
          >
            {loading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {type === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Google
          </Button>
          
          {type === 'signin' && (
            <p className="text-center text-sm text-muted-foreground">
              <a href="/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </a>
            </p>
          )}
          
          {type === 'signup' && (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/signin" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          )}

          {type === 'signin' && (
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a href="/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
