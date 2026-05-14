import { AuthForm } from '@/components/auth/auth-form'
import { AuthHeroPanel } from '@/components/auth/auth-hero-panel'

export default function AuthMockupPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-[1600px] space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Auth Pages Mockup</h1>
          <p className="text-slate-500 text-lg">Preview of Sign In and Sign Up pages side-by-side</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Sign In Mockup */}
          <div className="flex flex-col border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white scale-[0.95] origin-top">
            <div className="bg-slate-900 px-6 py-3 text-white text-xs font-mono">Sign In Page Mockup</div>
            <div className="flex flex-col lg:flex-row h-[800px]">
              <div className="lg:w-[45%]">
                <AuthHeroPanel type="signin" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
                <div className="w-full max-w-[440px]">
                  <AuthForm type="signin" />
                </div>
              </div>
            </div>
          </div>

          {/* Sign Up Mockup */}
          <div className="flex flex-col border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white scale-[0.95] origin-top">
            <div className="bg-slate-900 px-6 py-3 text-white text-xs font-mono">Sign Up Page Mockup</div>
            <div className="flex flex-col lg:flex-row h-[800px]">
              <div className="lg:w-[45%]">
                <AuthHeroPanel type="signup" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
                <div className="w-full max-w-[440px]">
                  <AuthForm type="signup" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
