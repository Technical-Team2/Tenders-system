import { AuthForm } from '@/components/auth/auth-form'
import Link from 'next/link'
import { ChevronLeft, Building } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-lg font-medium hover:opacity-75 z-10"
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
        <p className="relative z-20 mt-6 text-sm lg:text-base">
          Your comprehensive tender management platform. Track opportunities, manage applications, and win more contracts.
        </p>
      </div>
      <div className="flex h-full items-center justify-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to access your dashboard
            </p>
          </div>
          <AuthForm type="signin" />
        </div>
      </div>
    </div>
  )
}
