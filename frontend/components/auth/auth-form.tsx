'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { signIn, signUp, signInWithGoogle } from '@/lib/auth/client'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

interface AuthFormProps {
  type: 'signin' | 'signup'
  className?: string
}

export function AuthForm({ type, className }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if rate limited
    if (rateLimited) {
      toast.error(`Please wait ${cooldownTime} seconds before trying again`)
      return
    }
    
    // Password confirmation validation for signup
    if (type === 'signup' && password !== confirmPassword) {
      toast.error('Passwords do not match')
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
            console.log('Authentication successful, redirecting to dashboard...')
            // Use Next.js router for proper client-side navigation
            router.push('/dashboard')
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
          const session = result.data?.session
          const requiresConfirmation = result.data?.requiresConfirmation
          
          // If session exists (auto-login after signup), redirect to dashboard
          if (session) {
            toast.success('Account created successfully! You are now signed in.')
            console.log('Signup successful with session, redirecting to dashboard...')
            router.push('/dashboard')
          } 
          // If email confirmation is required
          else if (requiresConfirmation || (user && !session)) {
            toast.success('Account created! Please check your email to confirm your account before signing in.', {
              duration: 5000,
              description: 'Check your inbox for the confirmation link and click it to activate your account.'
            })
            router.push('/signin')
          } 
          // Fallback
          else {
            toast.success('Account created successfully')
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                suppressHydrationWarning
                required
                disabled={loading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {type === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword || ''}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  suppressHydrationWarning
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
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
