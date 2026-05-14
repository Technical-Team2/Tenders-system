"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileSearch,
  Send,
  Database,
  Settings,
  Sparkles,
  ChevronRight,
  User,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from '@/components/ui/spinner'
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/context"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tenders", href: "/dashboard/tenders", icon: FileSearch },
  { name: "Applications", href: "/dashboard/applications", icon: Send },
  { name: "AI Assistant", href: "/dashboard/assistant", icon: Sparkles },
  { name: "Sources", href: "/dashboard/sources", icon: Database },
  { name: "Company Info", href: "/dashboard/company", icon: Building2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, loading, logout } = useAuth()

  const handleSignOut = async () => {
    await logout()
  }

  useEffect(() => {
    setUserEmail(user?.email || null)
  }, [user])

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border/10 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <FileSearch className="h-4 w-4 text-[#2563EB]" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">TenderScope</span>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-sidebar-border p-4 mt-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
                <User className="h-4 w-4 text-sidebar-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground truncate">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="h-4 w-4 text-sidebar-foreground animate-spin" />
                        Loading
                      </span>
                    ) : (
                      userEmail || 'Signed in'
                    )}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">Account</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Sign Out</span>
              </button>

            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
