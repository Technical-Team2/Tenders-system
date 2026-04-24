"use client"

import { useState } from "react"
import { 
  Sparkles, 
  Send, 
  FileSearch, 
  TrendingUp, 
  AlertCircle,
  Lightbulb,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScoreBadge } from "@/components/score-badge"
import type { Tender } from "@/lib/types"

interface AssistantContentProps {
  recentTenders: Tender[]
}

const suggestedPrompts = [
  {
    icon: FileSearch,
    title: "Analyze Tender Fit",
    prompt: "Analyze how well our company profile matches the requirements of the top-scoring tenders",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    prompt: "What trends are you seeing in the current tender pipeline?",
  },
  {
    icon: AlertCircle,
    title: "Risk Assessment",
    prompt: "Identify potential risks in our current application drafts",
  },
  {
    icon: Lightbulb,
    title: "Bid Strategy",
    prompt: "Suggest a competitive pricing strategy for our top 3 opportunities",
  },
]

export function AssistantContent({ recentTenders }: AssistantContentProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)

  const handleSubmit = async (promptText: string) => {
    setIsLoading(true)
    setResponse(null)
    
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setResponse(`Based on your query "${promptText}", here's my analysis:

**Key Findings:**
1. Your current tender pipeline shows strong opportunities in IT Services and Cybersecurity sectors
2. The top 3 high-scoring tenders have a combined potential value of $27.7M
3. Average win probability across high-score matches is 68%

**Recommendations:**
- Prioritize the "AI-Powered Document Processing System" tender (Score: 95) - deadline approaching
- Consider consortium approach for the Smart City IoT project to strengthen Singapore presence
- The Cloud Infrastructure Modernization opportunity aligns well with your core competencies

**Next Steps:**
1. Schedule internal review for top 3 opportunities
2. Begin technical approach document for the HMRC tender
3. Identify potential local partners for the GeBIZ Singapore opportunity`)
    
    setIsLoading(false)
  }

  const handleSendQuery = () => {
    if (query.trim()) {
      handleSubmit(query)
      setQuery("")
    }
  }

  const highScoreTenders = recentTenders.filter(t => t.tender_scores && t.tender_scores[0] && t.tender_scores[0].score >= 80)

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Get intelligent insights and recommendations for your tender pipeline
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Suggested Prompts */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(prompt.prompt)}
                    className="flex items-start gap-3 rounded-lg border border-border p-4 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="rounded-lg bg-primary/10 p-2">
                      <prompt.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{prompt.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {prompt.prompt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Response Area */}
          {(isLoading || response) && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-3 py-8">
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-muted-foreground">Analyzing your tender data...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-muted-foreground">
                      {response}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Query Input */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Ask me anything about your tenders, applications, or strategy..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-24 bg-secondary border-border resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendQuery()
                    }
                  }}
                />
                <Button 
                  onClick={handleSendQuery} 
                  disabled={!query.trim() || isLoading}
                  size="icon"
                  className="h-24 w-12"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* High Score Opportunities */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Top Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {highScoreTenders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No high-score opportunities found
                </p>
              ) : (
                highScoreTenders.slice(0, 5).map((tender) => (
                  <div 
                    key={tender.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-card-foreground line-clamp-2">
                        {tender.title}
                      </h4>
                      {tender.tender_scores?.[0] && (
                        <ScoreBadge score={tender.tender_scores[0].score} size="sm" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tender.organization}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-500/10 p-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Tender Scoring</p>
                  <p className="text-xs text-muted-foreground">
                    AI-powered relevance and fit scoring
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-500/10 p-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Requirement Extraction</p>
                  <p className="text-xs text-muted-foreground">
                    Auto-extract key requirements from documents
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-500/10 p-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Bid Strategy</p>
                  <p className="text-xs text-muted-foreground">
                    Competitive analysis and pricing recommendations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-500/10 p-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">Proposal Drafting</p>
                  <p className="text-xs text-muted-foreground">
                    Coming soon - AI-assisted proposal writing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
