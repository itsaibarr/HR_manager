"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Briefcase, Users, Settings, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown"
import { motion, AnimatePresence } from "framer-motion"
import { useSidebar } from "@/components/providers/SidebarProvider"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isCollapsed, toggleSidebar } = useSidebar()
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
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const initials = userProfile?.full_name 
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)
    : userProfile?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div 
        className={cn(
            "flex flex-col h-screen bg-paper border-r border-border/60 py-6 fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-[56px] items-center px-0" : "w-[240px] px-4"
        )}
    >
      {/* Logo & Toggle Header */}
      <div className={cn("flex items-center mb-8 h-8 transition-all relative", isCollapsed ? "justify-center w-full" : "px-3 justify-between w-full")}>
        <div className={cn("flex items-center gap-3 w-full transition-all", isCollapsed ? "justify-center" : "")}>
            <Link href="/dashboard" className="flex items-center gap-2 group overflow-hidden shrink-0">
                <img src="/logo.png" alt="Strata Logo" className="w-10 h-10 rounded-sm object-contain bg-white" />

                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="font-sora font-bold text-lg text-primary tracking-tight whitespace-nowrap"
                        >
                            Strata

                        </motion.span>
                    )}
                </AnimatePresence>
            </Link>
        </div>

 
         <button
            onClick={toggleSidebar}
            className={cn(
                "flex items-center justify-center text-muted hover:text-primary transition-all hover:bg-accent/40 rounded-sm z-50",
                isCollapsed 
                    ? "absolute right-[-10px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] bg-paper border border-border shadow-md rounded-full" 
                    : "w-[16px] h-[16px]"
            )}
         >
            {isCollapsed ? <ChevronRight className="w-[14px] h-[14px]" /> : <ChevronLeft className="w-[14px] h-[14px]" />}
         </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 w-full mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === "/dashboard" && pathname === "/dashboard") ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center rounded-sm transition-all relative group overflow-hidden",
                isCollapsed 
                    ? "w-10 h-10 justify-center mx-auto" 
                    : "h-10 px-3 gap-3 w-full",
                isActive
                  ? "text-primary bg-accent/60" 
                  : "text-muted/60 hover:text-primary hover:bg-accent/40"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={cn("shrink-0", isCollapsed ? "w-[16px] h-[16px]" : "w-[16px] h-[16px]")} strokeWidth={2.4} />
              
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                    <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-[13px] font-medium tracking-tight whitespace-nowrap"
                    >
                        {item.label}
                    </motion.span>
                )}
              </AnimatePresence>

              {isActive && (
                <div className={cn(
                    "absolute bg-primary rounded-full",
                    isCollapsed ? "left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-md" : "left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-md opacity-0" 
                )} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer / User */}
      <div className="mt-auto flex flex-col gap-4 w-full">
        {isCollapsed ? (
             <div className="flex flex-col items-center gap-4 mb-4">
                <DropdownMenu
                    trigger={
                        <button className="w-9 h-9 flex items-center justify-center rounded-sm transition-all border border-transparent hover:border-border/60 hover:bg-accent/50 group overflow-hidden">
                            <div className="w-7 h-7 bg-primary text-paper rounded-sm flex items-center justify-center text-[10px] font-mono font-bold uppercase">
                                {initials}
                            </div>
                        </button>
                    }
                    align="left"
                >
                    <div className="px-3 py-2 border-b border-border/40 mb-1">
                        <p className="text-xs font-bold text-primary leading-tight">{userProfile?.full_name || 'User'}</p>
                    </div>
                    <DropdownItem onClick={() => router.push("/dashboard/profile")}>Profile</DropdownItem>
                    <DropdownItem onClick={handleSignOut} variant="destructive">Sign Out</DropdownItem>
                </DropdownMenu>
             </div>
        ) : (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-4 border-t border-border/40 bg-accent/10 rounded-sm mx-2 space-y-3"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 text-primary border border-primary/20 rounded-sm flex items-center justify-center text-xs font-mono font-bold uppercase shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-primary">{userProfile?.full_name || 'User Account'}</p>
                        <p className="text-[10px] text-muted truncate">{userProfile?.email}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                     <button 
                        onClick={() => router.push("/dashboard/profile")}
                        className="h-7 flex items-center justify-center gap-1.5 rounded-sm bg-paper border border-border/60 hover:border-primary/40 hover:text-primary text-[10px] font-bold uppercase tracking-wider text-muted transition-all"
                     >
                        <Settings className="w-3 h-3" />
                        Config
                     </button>
                     <button 
                        onClick={handleSignOut}
                        className="h-7 flex items-center justify-center gap-1.5 rounded-sm bg-paper border border-border/60 hover:border-destructive/40 hover:text-destructive text-[10px] font-bold uppercase tracking-wider text-muted transition-all"
                     >
                        <LogOut className="w-3 h-3" />
                        Exit
                     </button>
                </div>
            </motion.div>
        )}
      </div>
    </div>
  )
}
