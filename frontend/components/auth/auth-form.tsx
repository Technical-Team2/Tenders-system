'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Icons } from '@/components/ui/icons'


import Link from 'next/link'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (type === 'signup' && password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    setLoading(true)

    try {
      if (type === 'signin') {
        const result = await signIn(email, password)
        if (result.success) {
          toast.success('Signed in successfully')
          router.push('/dashboard')
        } else {
          toast.error(result.error || 'Failed to sign in')
        }
      } else {
        const result = await signUp(email, password, {
          full_name: name,
          username: username
        })
        
        if (result.success) {
          if (result.data?.session) {
            toast.success('Account created successfully!')
            router.push('/dashboard')
          } else {
            toast.success('Account created! Please check your email to confirm.')
            router.push('/signin')
          }
        } else {
          toast.error(result.error || 'Failed to create account')
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${className} w-full space-y-8`}>
      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] sm:p-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {type === 'signin' ? 'Sign in to account' : 'Create your account'}
          </h1>
          <p className="text-slate-500">
            {type === 'signin' 
              ? 'Welcome back! Please enter your details.' 
              : 'Enter your information to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {type === 'signup' && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-slate-700">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
              {type === 'signin' && (
                <a href="/forgot-password" disabled={loading} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-4 pr-12 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {type === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-4 pr-12 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#2563EB] text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                {type === 'signin' ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              type === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </Button>

        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-lg font-medium text-slate-900">
            {type === 'signup' 
              ? "Already have an account?" 
              : "Don't have an account yet?"}
          </p>
          <Link 
            href={type === 'signup' ? "/signin" : "/signup"}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-50 px-8 py-3 text-base font-bold text-[#2563EB] transition-all hover:bg-blue-100 active:scale-95"
          >
            {type === 'signup' ? "Sign in" : "Create an account"}
          </Link>
        </div>
      </div>
    </div>
  )
}



