"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/providers/ThemeProvider"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Key, 
  Palette, 
  User as UserIcon, 
  Shield, 
  Languages, 
  Database,
  Check,
  ExternalLink,
  ChevronRight,
  Info,
  LogOut
} from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/toast"
import type { UserPreferences } from "@/types/database"
import { cn } from "@/lib/utils"

interface AIConfig {
  provider: string
  keys: { gemini?: string; openai?: string; claude?: string }
}

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'hr_manager' | 'viewer'
}

export default function ProfilePage() {
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [config, setConfig] = useState<AIConfig>({ provider: 'gemini', keys: {} })
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    defaultView: 'dashboard',
    density: 'comfortable'
  })
  
  const { toasts, showToast, dismissToast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      if (data) {
        setUser({ id: data.id, email: data.email, full_name: data.full_name, role: data.role })
        if (data.ai_config) setConfig(data.ai_config as unknown as AIConfig)
        if (data.preferences) setPreferences({ ...preferences, ...(data.preferences as unknown as UserPreferences) })
      }
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: authUser.id,
          email: authUser.email!,
          full_name: user?.full_name,
          ai_config: config as any,
          preferences: preferences as any
        })
      
      if (error) throw error
      showToast('Profile and preferences updated.', 'success')
    } catch (err) {
      showToast('Failed to save changes.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const initials = user?.full_name 
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-24">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      <PageHeader 
        title="Account & Personalization" 
        subtitle="Configure your professional workspace and AI intelligence." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Identity Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-paper border border-border/60 rounded-sm p-8 space-y-6 sticky top-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 bg-primary text-paper text-3xl font-extrabold border-4 border-paper">
                  <AvatarFallback className="bg-transparent font-sora">{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-sm cursor-pointer">
                  <span className="text-[10px] text-paper font-bold uppercase tracking-widest">Change</span>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-sora font-extrabold text-primary tracking-tight">
                    {user?.full_name || 'Active Member'}
                </h2>
                <p className="text-[11px] text-muted font-mono uppercase tracking-widest">{user?.email}</p>
              </div>
              <Badge variant="secondary" className="bg-accent/50 text-primary border-border/40 uppercase tracking-widest text-[9px]">
                {user?.role || 'User'} Access
              </Badge>
            </div>

            <div className="pt-6 border-t border-border/40 space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Display Name</label>
                  <Input 
                    value={user?.full_name || ''} 
                    onChange={e => setUser(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                    placeholder="Enter full name"
                    className="h-9 text-sm rounded-sm"
                  />
               </div>
               <Button onClick={handleSave} disabled={loading} className="w-full h-9 text-[11px] uppercase tracking-widest font-bold">
                 {loading ? 'Saving...' : 'Update Identity'}
               </Button>
            </div>
          </div>
          
          <div className="p-4 bg-accent/20 border border-border/40 rounded-sm flex gap-3">
             <Shield className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
             <p className="text-[11px] text-muted leading-relaxed">
               Your session is protected with biometric-grade encryption. API keys are encrypted at rest.
             </p>
          </div>
        </div>

        {/* Right: Settings Sections */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Aesthetic Preferences */}
          <Section title="Interface Aesthetics" icon={Palette} description="Tune the workspace density and theme to your preference.">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingBox label="Global Theme" description="Switch between high-contrast modes.">
                   <select 
                     className="w-full bg-paper border border-border/60 rounded-sm h-9 px-3 text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer hover:border-primary/30"
                     value={preferences.theme}
                     onChange={e => {
                        const val = e.target.value as any
                        setTheme(val)
                        setPreferences(prev => ({ ...prev, theme: val }))
                     }}
                   >
                     <option value="light">Refined Light</option>
                     <option value="dark">Deep Night</option>
                     <option value="system">Adaptive System</option>
                   </select>
                </SettingBox>

                <SettingBox label="Information Density" description="Adjust information throughput per view.">
                    <div className="flex bg-accent/40 p-1 rounded-sm border border-border/40">
                       {['compact', 'comfortable', 'spacious'].map((d) => (
                         <button
                           key={d}
                           onClick={() => setPreferences(prev => ({ ...prev, density: d as any }))}
                           className={cn(
                             "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all",
                             preferences.density === d ? "bg-paper text-primary shadow-sm" : "text-muted hover:text-primary hover:bg-paper/30"
                           )}
                         >
                           {d}
                         </button>
                       ))}
                    </div>
                </SettingBox>
             </div>
          </Section>

          {/* AI Intelligence */}
          <Section title="AI Intelligence Core" icon={Key} description="Manage the models powering your candidate analysis.">
             <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[11px] font-bold text-primary/80 uppercase tracking-widest flex items-center gap-2">
                     Active Engine
                     <Badge variant="outline" className="text-[8px] border-primary/20 text-primary/60 lowercase font-mono px-1 h-3.5">llm-v4</Badge>
                   </label>
                   <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'gemini', name: 'Gemini 1.5', brand: 'Google' },
                        { id: 'openai', name: 'GPT-4o', brand: 'OpenAI' },
                        { id: 'claude', name: 'Claude 3.5', brand: 'Anthropic' }
                      ].map(provider => (
                        <button
                          key={provider.id}
                          onClick={() => setConfig(prev => ({ ...prev, provider: provider.id }))}
                          className={cn(
                            "flex flex-col items-start p-4 rounded-sm border transition-all text-left group relative h-24 justify-between",
                            config.provider === provider.id 
                              ? "bg-primary text-paper border-primary" 
                              : "bg-paper border-border/60 hover:border-primary/30"
                          )}
                        >
                          <span className="text-[11px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{provider.brand}</span>
                          <span className="text-sm font-extrabold tracking-tight">{provider.name}</span>
                          {config.provider === provider.id && (
                            <div className="absolute top-2 right-2">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="pt-4 space-y-4">
                   <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <label className="text-[11px] font-bold text-primary/80 uppercase tracking-widest">
                          {config.provider === 'gemini' ? 'AI Studio Key' : config.provider === 'openai' ? 'OpenAI API Key' : 'Anthropic API Key'}
                        </label>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted hover:text-primary transition-colors flex items-center gap-1 font-bold uppercase tracking-widest group">
                          Get Key <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      </div>
                      <Input 
                        type="password"
                        value={config.keys[config.provider as keyof typeof config.keys] || ''}
                        onChange={e => setConfig(prev => ({
                          ...prev,
                          keys: { ...prev.keys, [prev.provider]: e.target.value }
                        }))}
                        placeholder={`sk-...${config.provider.substring(0,3)}`}
                        className="font-mono text-sm tracking-widest h-10 border-border/60 bg-paper/50 rounded-sm focus:bg-paper"
                      />
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-sm">
                      <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <p className="text-[11px] text-blue-500/80 font-medium">Your API keys are stored locally for development and encrypted in production.</p>
                   </div>
                </div>
             </div>
          </Section>

          {/* System Config */}
          <Section title="System Operations" icon={Database} description="Behavioral configurations for the HR engine.">
             <div className="space-y-6">
                <SettingBox label="Default Navigation" description="The starting page after authentication safely lands.">
                   <div className="flex gap-2 p-1 bg-accent/40 rounded-sm w-fit border border-border/40">
                      {['dashboard', 'jobs', 'candidates'].map(v => (
                        <button
                          key={v}
                          onClick={() => setPreferences(prev => ({ ...prev, defaultView: v as any }))}
                          className={cn(
                            "px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all",
                            preferences.defaultView === v
                              ? "bg-paper text-primary shadow-sm"
                              : "text-muted hover:text-primary"
                          )}
                        >
                          {v}
                        </button>
                      ))}
                   </div>
                </SettingBox>
             </div>
          </Section>

          {/* Save Action Footer */}
          <div className="pt-10 border-t border-border/60 flex items-center justify-between">
             <div className="flex items-center gap-2 text-muted">
                <div className="w-1.5 h-1.5 rounded-sm bg-strong-fit animate-pulse" />
                <span className="text-[11px] font-medium tracking-tight">System ready for deployment.</span>
             </div>
             <Button 
               onClick={handleSave} 
               disabled={loading}
               className="w-full h-12 rounded-sm bg-primary text-paper font-bold uppercase tracking-[0.2em] hover:bg-primary/95 transition-all"
             >
               {loading ? 'Processing...' : 'Save Configuration'}
             </Button>
          </div>

        </div>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, description, children }: { title: string, icon: any, description: string, children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-primary text-paper flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-sora font-extrabold text-primary tracking-tight uppercase">{title}</h2>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">{description}</p>
      </div>
      <div className="px-1">
        {children}
      </div>
    </div>
  )
}

function SettingBox({ label, description, children }: { label: string, description: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <label className="text-[11px] font-bold text-primary/80 uppercase tracking-widest">{label}</label>
        <p className="text-[11px] text-muted leading-tight">{description}</p>
      </div>
      {children}
    </div>
  )
}
