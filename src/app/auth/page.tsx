"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { AuthForm } from "./AuthForm"

export default function AuthPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      
      {/* Left: Visual */}
      <div className="hidden lg:flex flex-col bg-primary items-center justify-center relative overflow-hidden">
         {/* Pattern Circle */}
         <div className="absolute w-[400px] h-[400px] bg-white opacity-10 rounded-sm blur-none" />
         
         <div className="relative z-10 text-center space-y-6">
            <h1 className="text-4xl font-normal font-sora text-white">HR Screen</h1>
         </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-8 bg-paper">
         <div className="w-full max-w-md space-y-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted hover:text-primary mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
            
            <AuthForm />
         </div>
      </div>

    </div>
  )
}
