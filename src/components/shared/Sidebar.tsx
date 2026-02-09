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
  const [userProfile, setUserProfile] = React.useState<{ full_name: string | null; email: string } | null>(null)

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single()
        
        setUserProfile(profile || { full_name: null, email: user.email! })
      }
    }
    getUser()
  }, [supabase])

  const navItems = [
    { icon: Briefcase, label: "Jobs", href: "/dashboard" },
    { icon: Users, label: "Candidates", href: "/candidates" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const initials = userProfile?.full_name 
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)
    : userProfile?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="flex flex-col w-14 h-screen bg-paper border-r border-border/60 items-center py-6 gap-6 fixed left-0 top-0 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center mb-2 transition-all hover:scale-105 active:scale-95 group">
        <span className="text-paper font-sora font-extrabold text-[11px] tracking-tighter group-hover:tracking-normal transition-all">HR</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-3 w-full items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === "/dashboard" && pathname === "/dashboard") ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-sm transition-all relative group",
                isActive
                  ? "text-primary bg-accent/60" 
                  : "text-muted/60 hover:text-primary hover:bg-accent/40"
              )}
              title={item.label}
            >
              <item.icon className="w-[14px] h-[14px]" strokeWidth={2.4} />
              {isActive && (
                <div className="absolute left-0 w-[2.5px] h-4 bg-primary rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-4">
        <DropdownMenu
          trigger={
            <button className="w-10 h-10 flex items-center justify-center rounded-sm transition-all border border-transparent hover:border-border/60 hover:bg-accent/50 group overflow-hidden">
               <div className="w-7 h-7 bg-primary text-paper rounded-sm flex items-center justify-center text-[10px] font-mono font-bold uppercase">
                  {initials}
               </div>
            </button>
          }
          align="left"
        >
          <div className="px-3 py-2 border-b border-border/40 mb-1">
             <p className="text-[10px] font-bold text-primary truncate leading-tight">{userProfile?.full_name || 'User Account'}</p>
             <p className="text-[9px] text-muted truncate">{userProfile?.email}</p>
          </div>
          <DropdownItem onClick={() => router.push("/dashboard/profile")}>
            <span className="flex items-center gap-2">
              <User className="w-[14px] h-[14px]" strokeWidth={2.4} />
              Profile Settings
            </span>
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem onClick={handleSignOut} variant="destructive">
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4" strokeWidth={2.4} />
              Sign Out
            </span>
          </DropdownItem>
        </DropdownMenu>
      </div>
    </div>
  )
}
