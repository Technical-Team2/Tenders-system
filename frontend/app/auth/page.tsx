import { AuthForm } from '@/components/auth/auth-form'
import { AuthHeroPanel } from '@/components/auth/auth-hero-panel'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <AuthHeroPanel />

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1fr]">
            <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.18)] backdrop-blur">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Secure access</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Sign in to your account
                </h2>
                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  Access your Tender System workspace and manage bids, deadlines, and submissions from one secure portal.
                </p>
              </div>
              <div className="mt-8">
                <AuthForm type="signin" className="rounded-[1.75rem] border-none bg-transparent shadow-none" />
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.18)] backdrop-blur">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">New account</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Create your account
                </h2>
                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  Start winning more tenders with proactive scoring, reminders, and intelligent application guidance.
                </p>
              </div>
              <div className="mt-8">
                <AuthForm type="signup" className="rounded-[1.75rem] border-none bg-transparent shadow-none" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
