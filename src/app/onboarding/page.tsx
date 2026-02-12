"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-4">
      <div className="max-w-[480px] w-full bg-paper rounded-sm border border-border/60 p-12 space-y-8">
        <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto flex items-center justify-center mb-4">
                 <Image src="/logo.png" alt="Strata Logo" width={56} height={56} className="object-contain" />
            </div>
            <h2 className="text-2xl font-bold font-sora">Create Workspace</h2>
            <p className="text-muted">
                Let's set up your recruitment environment.
            </p>
        </div>
        
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Company Name</label>
                <Input placeholder="Acme Inc." />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Industry</label>
                <Input placeholder="e.g. Technology, Healthcare" />
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Role</label>
                <Input placeholder="e.g. Hiring Manager" />
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
