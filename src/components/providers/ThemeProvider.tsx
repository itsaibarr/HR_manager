"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
  density: "compact" | "comfortable" | "spacious"
  setDensity: (density: "compact" | "comfortable" | "spacious") => void
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
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system'
    }
    return 'system'
  })
  
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme || 'system'
      if (savedTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return savedTheme as "light" | "dark"
    }
    return 'light'
  })

  const [density, setDensityState] = React.useState<"compact" | "comfortable" | "spacious">(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('density') as any) || 'comfortable'
    }
    return 'comfortable'
  })
  
  const supabase = createClient()

  // Sync with Supabase in the background (non-blocking)
  React.useEffect(() => {
    const syncPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .single()
      
      const prefs = profile?.preferences as Record<string, any> | null
      if (prefs?.theme && prefs.theme !== theme) {
        setThemeState(prefs.theme as Theme)
        localStorage.setItem('theme', prefs.theme)
      }
      if (prefs?.density && prefs.density !== density) {
        setDensityState(prefs.density as any)
        localStorage.setItem('density', prefs.density)
      }
    }
    syncPreferences()
  }, [supabase])

  // Handle system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const updateResolvedTheme = () => {
      if (theme === "system") {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light")
      } else {
        setResolvedTheme(theme as "light" | "dark")
      }
    }

    updateResolvedTheme()
    mediaQuery.addEventListener("change", updateResolvedTheme)
    return () => mediaQuery.removeEventListener("change", updateResolvedTheme)
  }, [theme])

  // Apply theme and density to document
  React.useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
    root.setAttribute("data-density", density)
  }, [resolvedTheme, density])

  const setTheme = React.useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .single()
      
      const currentPrefs = (profile?.preferences as Record<string, any>) || {}
      await supabase
        .from("profiles")
        .update({ 
          preferences: { ...currentPrefs, theme: newTheme },
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)
    }
  }, [supabase])

  const setDensity = React.useCallback(async (newDensity: "compact" | "comfortable" | "spacious") => {
    setDensityState(newDensity)
    localStorage.setItem('density', newDensity)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .single()
      
      const currentPrefs = (profile?.preferences as Record<string, any>) || {}
      await supabase
        .from("profiles")
        .update({ 
          preferences: { ...currentPrefs, density: newDensity },
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)
    }
  }, [supabase])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, density, setDensity }}>
      {children}
    </ThemeContext.Provider>
  )
}
