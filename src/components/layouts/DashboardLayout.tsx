"use client"

import { Sidebar } from "@/components/shared/Sidebar"
import { SidebarProvider, useSidebar } from "@/components/providers/SidebarProvider"
import { cn } from "@/lib/utils"

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="min-h-screen bg-paper flex overflow-x-hidden">
      <Sidebar />
      <main 
        className={cn(
            "flex-1 min-h-screen transition-all duration-300 ease-in-out",
            isCollapsed ? "ml-[56px]" : "ml-[240px]"
        )}
      >
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  )
}
