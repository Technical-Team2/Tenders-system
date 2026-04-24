import { AuthForm } from '@/components/auth/auth-form'
import Link from 'next/link'
import { ChevronLeft, Building } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="container relative h-[calc(100vh-3.5rem)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-lg font-medium hover:opacity-75"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Building className="mr-2 h-6 w-6" />
          Tender System
        </div>
        <p className="relative z-20 mt-6">
          Join thousands of professionals managing their tender opportunities efficiently. Track, analyze, and win more contracts.
        </p>
        <div className="relative z-20 mt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-green-500" />
            <span className="text-sm">AI-powered tender scoring</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-blue-500" />
            <span className="text-sm">Automated deadline reminders</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-purple-500" />
            <span className="text-sm">Smart application assistance</span>
          </div>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Start managing your tender opportunities today
            </p>
          </div>
          <AuthForm type="signup" />
        </div>
      </div>
    </div>
  )
}
