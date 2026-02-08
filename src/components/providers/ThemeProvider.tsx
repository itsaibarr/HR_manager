"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light")
  const supabase = createClient()

  // Load theme from user preferences on mount
  React.useEffect(() => {
    const loadTheme = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .single()
      
      if (profile?.preferences?.theme) {
        setThemeState(profile.preferences.theme as Theme)
      }
    }
    loadTheme()
  }, [supabase])

  // Handle system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const updateResolvedTheme = () => {
      if (theme === "system") {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light")
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()
    mediaQuery.addEventListener("change", updateResolvedTheme)
    return () => mediaQuery.removeEventListener("change", updateResolvedTheme)
  }, [theme])

  // Apply theme class to document
  React.useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = React.useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme)
    
    // Persist to database
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .single()
      
      const currentPrefs = profile?.preferences || {}
      await supabase
        .from("profiles")
        .update({ 
          preferences: { ...currentPrefs, theme: newTheme },
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)
    }
  }, [supabase])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
