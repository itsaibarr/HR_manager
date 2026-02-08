"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Key, Users, Palette, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/toast"
import type { UserPreferences } from "@/types/database"

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

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [config, setConfig] = useState<AIConfig>({
    provider: 'gemini',
    keys: {}
  })
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    defaultView: 'dashboard',
    density: 'comfortable'
  })
  
  const { toasts, showToast, dismissToast } = useToast()

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return

        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, ai_config, preferences')
          .eq('id', authUser.id)
          .single()
        
        if (error) {
          console.error('Error loading profile:', error)
          return
        }

        if (data) {
          setUser({
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role
          })
          
          if (data.ai_config) {
            setConfig(data.ai_config as AIConfig)
          }
          
          if (data.preferences) {
            setPreferences({ ...preferences, ...(data.preferences as UserPreferences) })
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    loadSettings()
  }, [])

  const validateAPIKey = (provider: string, key: string): boolean => {
    if (!key || key.trim() === '') return false
    
    switch (provider) {
      case 'gemini':
        return key.startsWith('AIza')
      case 'openai':
        return key.startsWith('sk-')
      case 'claude':
        return key.startsWith('sk-ant-')
      default:
        return false
    }
  }

  const testConnection = async () => {
    const currentKey = config.keys[config.provider as keyof typeof config.keys]
    
    if (!currentKey) {
      showToast('Please enter an API key first', 'error')
      return
    }

    if (!validateAPIKey(config.provider, currentKey)) {
      showToast('Invalid API key format', 'error')
      return
    }

    setTestingConnection(true)
    
    try {
      const response = await fetch('/api/test-ai-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: config.provider, apiKey: currentKey })
      })

      if (response.ok) {
        showToast('Connection successful!', 'success')
      } else {
        showToast('Connection failed. Please check your API key.', 'error')
      }
    } catch (err) {
      showToast('Failed to test connection', 'error')
    } finally {
      setTestingConnection(false)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        showToast('Not authenticated', 'error')
        return
      }

      // Validate API key if provided
      const currentKey = config.keys[config.provider as keyof typeof config.keys]
      if (currentKey && !validateAPIKey(config.provider, currentKey)) {
        showToast('Invalid API key format', 'error')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: authUser.id,
          email: authUser.email!,
          ai_config: config,
          preferences: preferences
        })
      
      if (error) {
        console.error('Save error:', error)
        showToast('Failed to save settings', 'error')
      } else {
        showToast('Settings saved successfully!', 'success')
      }
    } catch (err) {
      console.error('Save exception:', err)
      showToast('An error occurred while saving', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Keyboard shortcut: Cmd/Ctrl + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveSettings()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [config, preferences])

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      <PageHeader 
        title="Settings" 
        subtitle="Manage your workspace and integrations." 
      />

      {/* AI Provider Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-navy" />
            <CardTitle className="text-lg">AI Provider Configuration</CardTitle>
          </div>
          <CardDescription>Select your AI provider and enter the corresponding API key.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black-soft">Active Provider</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value })}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="claude">Anthropic Claude</option>
            </select>
            <p className="text-xs text-muted">Choose which model generates your evaluations.</p>
          </div>

          {/* API Keys */}
          <div className="space-y-4 pt-2 border-t border-border">
            {config.provider === 'gemini' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-black-soft">Gemini API Key</label>
                <Input 
                  type="password" 
                  value={config.keys.gemini || ''}
                  onChange={(e) => setConfig({ ...config, keys: { ...config.keys, gemini: e.target.value } })}
                  placeholder="AIza..." 
                  className="font-mono" 
                />
                <p className="text-xs text-muted">Get your API key from Google AI Studio</p>
              </div>
            )}

            {config.provider === 'openai' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-black-soft">OpenAI API Key</label>
                <Input 
                  type="password" 
                  value={config.keys.openai || ''}
                  onChange={(e) => setConfig({ ...config, keys: { ...config.keys, openai: e.target.value } })}
                  placeholder="sk-..." 
                  className="font-mono" 
                />
                <p className="text-xs text-muted">Get your API key from OpenAI Platform</p>
              </div>
            )}

            {config.provider === 'claude' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-black-soft">Anthropic API Key</label>
                <Input 
                  type="password" 
                  value={config.keys.claude || ''}
                  onChange={(e) => setConfig({ ...config, keys: { ...config.keys, claude: e.target.value } })}
                  placeholder="sk-ant-..." 
                  className="font-mono" 
                />
                <p className="text-xs text-muted">Get your API key from Anthropic Console</p>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={testConnection}
              disabled={testingConnection || !config.keys[config.provider as keyof typeof config.keys]}
            >
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end border-t border-border pt-4">
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardFooter>
      </Card>

      {/* Dashboard Personalization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-navy" />
            <CardTitle className="text-lg">Dashboard Personalization</CardTitle>
          </div>
          <CardDescription>Customize your dashboard appearance and behavior.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black-soft">Theme</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={preferences.theme}
              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as UserPreferences['theme'] })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
            <p className="text-xs text-muted">Choose your preferred color scheme</p>
          </div>

          {/* Default View */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black-soft">Default View</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={preferences.defaultView}
              onChange={(e) => setPreferences({ ...preferences, defaultView: e.target.value as UserPreferences['defaultView'] })}
            >
              <option value="dashboard">Dashboard</option>
              <option value="jobs">Jobs</option>
              <option value="candidates">Candidates</option>
            </select>
            <p className="text-xs text-muted">Page to show when you log in</p>
          </div>

          {/* Data Density */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black-soft">Data Density</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={preferences.density}
              onChange={(e) => setPreferences({ ...preferences, density: e.target.value as UserPreferences['density'] })}
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
            <p className="text-xs text-muted">Control spacing and information density</p>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end border-t border-border pt-4">
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardFooter>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-navy" />
            <CardTitle className="text-lg">Team Members</CardTitle>
          </div>
          <CardDescription>Manage access to your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-black-soft">
                    {user.full_name || 'You'}
                  </p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
              </div>
              <Badge variant="outline">{user.role === 'admin' ? 'Owner' : user.role}</Badge>
            </div>
          )}
          
          {/* Invite placeholder */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              disabled
              title="Team invitations coming soon"
            >
              <Users className="w-4 h-4 mr-2" />
              Invite Team Member (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save hint */}
      <p className="text-xs text-muted text-center">
        Tip: Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Cmd/Ctrl + S</kbd> to save quickly
      </p>

    </div>
  )
}
