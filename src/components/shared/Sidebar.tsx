"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Briefcase, Users, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard", isHome: true },
    { icon: Briefcase, label: "Jobs", href: "/dashboard", isJobContext: true },
    { icon: Users, label: "Candidates", href: "/candidates" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  return (
    <div className="flex flex-col w-14 h-screen bg-white border-r border-border items-center py-4 gap-4 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="w-8 h-8 bg-navy rounded-sm flex items-center justify-center mb-4">
        <span className="text-white font-sora font-bold text-xs">HR</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 w-full items-center">
        {navItems.map((item) => {
          let isActive = false
          
          if (item.isHome) {
            isActive = pathname === "/dashboard"
          } else if (item.isJobContext) {
             // Active if we are in dashboard but NOT at the root (implies we are in a job ID)
             isActive = pathname.startsWith("/dashboard/") && pathname !== "/dashboard"
          } else {
             isActive = pathname.startsWith(item.href)
          }
          
          return (
            <Link
              key={item.label}
              href={item.isJobContext ? "#" : item.href} // Job context link is contextual, strictly visual here if no global job list
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-md transition-colors",
                isActive
                  ? "bg-transparent text-navy" 
                  : "text-muted hover:text-navy hover:bg-transparent"
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5" strokeWidth={2} />
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <button className="w-10 h-10 flex items-center justify-center text-muted hover:bg-cream rounded-md">
            <User className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
