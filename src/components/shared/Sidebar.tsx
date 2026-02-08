"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Briefcase, Users, Settings, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Briefcase, label: "Jobs", href: "/dashboard" },
    { icon: Users, label: "Candidates", href: "/candidates" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    <div className="flex flex-col w-14 h-screen bg-card border-r border-border items-center py-4 gap-4 fixed left-0 top-0 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="w-8 h-8 bg-navy rounded-sm flex items-center justify-center mb-4">
        <span className="text-white font-sora font-bold text-xs">HR</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-2 w-full items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === "/dashboard" && pathname.startsWith("/dashboard"))
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-md transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted hover:text-foreground hover:bg-accent/50"
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5" strokeWidth={2} />
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <DropdownMenu
          trigger={
            <button className="w-10 h-10 flex items-center justify-center text-muted hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
              <User className="w-5 h-5" />
            </button>
          }
          align="left"
        >
          <DropdownItem onClick={() => router.push("/settings")}>
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </span>
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem onClick={handleSignOut} variant="destructive">
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </span>
          </DropdownItem>
        </DropdownMenu>
      </div>
    </div>
  )
}
