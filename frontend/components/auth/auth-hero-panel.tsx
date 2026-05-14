import { Briefcase, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface AuthHeroPanelProps {
  type: 'signin' | 'signup'
}

export function AuthHeroPanel({ type }: AuthHeroPanelProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-[#2563EB] p-12 text-white lg:min-h-screen">
      {/* Decorative patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-blue-700/30 blur-3xl" />
        <svg
          className="absolute right-0 top-0 h-full w-full opacity-[0.05]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2563EB]">
            <Briefcase className="h-6 w-6" />
          </div>
          <span>Tender System</span>
        </Link>

        <div className="mt-20 max-w-lg space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Win more contracts with AI
          </h1>
          <p className="text-xl text-blue-100/90 leading-relaxed">
            Join thousands of professionals modernizing their procurement and winning more tenders.
          </p>
          
          <div className="space-y-4 pt-8">
            {[
              "AI-powered tender scoring & ranking",
              "Automated deadline reminders",
              "Smart application assistance",
              "Proactive procurement insights"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-lg font-medium text-blue-50">
                <CheckCircle2 className="h-6 w-6 text-blue-300" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}


