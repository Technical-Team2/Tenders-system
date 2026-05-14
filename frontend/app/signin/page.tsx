import { AuthForm } from '@/components/auth/auth-form'
import { AuthHeroPanel } from '@/components/auth/auth-hero-panel'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex-1 lg:w-1/2">
        <AuthHeroPanel type="signin" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2 lg:px-12 relative">
        <Link 
          href="/" 
          className="absolute left-8 top-8 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-[#2563EB]"
        >
          <ArrowLeft size={16} />
          Back to website
        </Link>
        <div className="w-full max-w-[440px]">
          <AuthForm type="signin" />
        </div>
      </div>
    </div>
  )
}


