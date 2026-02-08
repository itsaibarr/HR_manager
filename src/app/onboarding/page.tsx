"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-4">
      <div className="max-w-[480px] w-full bg-white rounded-sm shadow-lg border border-border/50 p-12 space-y-8">
        <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-navy rounded-sm mx-auto flex items-center justify-center mb-4">
                 <span className="text-white font-bold text-sm">HR</span>
            </div>
            <h2 className="text-2xl font-bold font-sora">Create Workspace</h2>
            <p className="text-muted">
                Let's set up your recruitment environment.
            </p>
        </div>
        
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-black-soft">Company Name</label>
                <Input placeholder="Acme Inc." />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-black-soft">Industry</label>
                <Input placeholder="e.g. Technology, Healthcare" />
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-black-soft">Role</label>
                <Input placeholder="e.g. HR Manager" />
            </div>
        </div>

        <div>
            <Link href="/dashboard" className="w-full">
                <Button className="w-full" size="lg">Create Workspace</Button>
            </Link>
        </div>
      </div>
    </div>
  )
}
