"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  isCollapsed: boolean
  toggleSidebar: () => void
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved === "true"
    }
    return false
  })
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
  }

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
    localStorage.setItem("sidebar-collapsed", String(collapsed))
  }

  // Prevent hydration mismatch by rendering nothing or a loading state until initialized
  // However, for layout stability, we might want to default to expanded (false) and correct it.
  // But to avoid flicker, we can just use the state. SSR will match initial state (false).
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
