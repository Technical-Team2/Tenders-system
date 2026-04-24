import Link from 'next/link'
import { Building, Search, Calendar, TrendingUp, Users, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  // Static landing page - no authentication check
  // Sample tenders data for display
  const sampleTenders = [
    {
      id: '1',
      title: 'ICT Infrastructure Development',
      organization: 'Ministry of ICT',
      budget: 5000000,
      currency: 'KES',
      deadline: '2024-06-15',
      description: 'Development of comprehensive ICT infrastructure including networking, servers, and software solutions.'
    },
    {
      id: '2', 
      title: 'Healthcare Equipment Supply',
      organization: 'County Hospital',
      budget: 2500000,
      currency: 'KES',
      deadline: '2024-06-20',
      description: 'Supply of medical equipment and consumables for hospital expansion.'
    },
    {
      id: '3',
      title: 'School Construction Project',
      organization: 'Education Ministry',
      budget: 8000000,
      currency: 'KES',
      deadline: '2024-07-10',
      description: 'Construction of new secondary school facilities including classrooms and laboratories.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Tender System</span>
            </div>
            <Link 
              href="/signin" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Your Comprehensive Tender Management Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track opportunities, manage applications, and win more contracts with AI-powered insights and automation.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Tender System?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Discovery</h3>
              <p className="text-gray-600">
                AI-powered tender discovery and matching based on your preferences
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Intelligent Scoring</h3>
              <p className="text-gray-600">
                Automated scoring engine evaluates tenders and ranks them by fit
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deadline Management</h3>
              <p className="text-gray-600">
                Never miss a deadline with automated reminders and notifications
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Tenders Preview */}
      {sampleTenders && sampleTenders.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Latest Tender Opportunities
              </h2>
              <p className="text-gray-600 text-lg">
                Discover active tenders currently available in system
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleTenders.map((tender) => (
                <div key={tender.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {tender.title}
                    </h3>
                    {tender.budget && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {tender.currency || 'KES'} {tender.budget.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {tender.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{tender.organization}</span>
                    {tender.deadline && (
                      <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link 
                      href="/signup" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors text-center block"
                    >
                      Sign Up to View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link 
                href="/signup" 
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg"
              >
                View All Tenders
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Tender Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already winning more contracts with our intelligent platform.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-medium transition-colors text-lg"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building className="h-6 w-6" />
            <span className="text-lg font-semibold">Tender System</span>
          </div>
          <p className="text-gray-400">
            © 2024 Tender System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
