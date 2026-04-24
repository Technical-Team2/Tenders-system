import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 lg:ml-0 overflow-y-auto">
        <div className="lg:pl-0 pl-16 pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
