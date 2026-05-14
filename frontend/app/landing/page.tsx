"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Cpu, ChevronRight, CheckCircle, BarChart3, Bell, FileText } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cpu className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-slate-900">TenderSystem</span>
          </div>


          <div className="flex items-center gap-4">
            <Link href="/signin" className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-4">Log In</Link>
            <Link
              href="/signup"
              className="bg-[#0066FF] hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-200"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Abstract Background Blur */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/50 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 -z-10" />

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Hero Content */}
            <div className="flex-1 max-w-2xl text-center lg:text-left">
              <h1 className="text-5xl lg:text-[64px] leading-[1.1] font-bold text-[#0F172A] mb-8">
                Win More Government <br className="hidden lg:block" />
                <span className="text-[#0F172A]">& Corporate Tenders</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                AI-powered platform to discover, analyze, and <br className="hidden sm:block" />
                win more contracts in Kenya
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto bg-[#0066FF] hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
                >
                  Sign up
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 relative">
              <div className="relative z-10 animate-float">
                <Image
                  src="/images/hero-section.png"
                  alt="TenderSystem Dashboard Illustration"
                  width={800}
                  height={600}
                  className="w-full h-auto drop-shadow-2xl"
                  priority
                />
              </div>
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/10 blur-[100px] -z-10 rounded-full" />
            </div>
          </div>
        </div>
      </section>

    {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to win</h2>
            <p className="text-slate-600 text-lg">Powerful AI tools designed for Kenyan businesses</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FileText className="h-8 w-8 text-blue-600" />,
                title: "Smart Tender Discovery",
                desc: "Find relevant tenders from PPIP, counties & corporations automatically"
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
                title: "AI Bid Scoring",
                desc: "Get instant win probability scores and gap analysis"
              },
              {
                icon: <Bell className="h-8 w-8 text-blue-600" />,
                title: "Deadline Reminders",
                desc: "Never miss a submission with smart notifications"
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-blue-600" />,
                title: "Document Intelligence",
                desc: "Auto-extract requirements and generate compliant documents"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-8 hover:border-blue-200 hover:shadow-lg transition-all">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
