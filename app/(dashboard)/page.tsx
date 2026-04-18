import { DashboardContent } from "./dashboard-content"

export default async function DashboardPage() {
  // Temporary simplified dashboard to test routing
  const stats = {
    totalTenders: 0,
    newTenders: 0,
    highScoreTenders: 0,
    applicationsInProgress: 0,
    submittedApplications: 0,
    upcomingDeadlines: 0,
    sourcesActive: 0,
  }

  return (
    <DashboardContent 
      stats={stats}
      recentTenders={[]}
      recentApplications={[]}
      scrapeLogs={[]}
    />
  )
}
