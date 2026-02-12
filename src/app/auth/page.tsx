"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Asterisk, ShieldCheck, Zap } from "lucide-react"
import { AuthForm } from "./AuthForm"
import { motion } from "framer-motion"

export default function AuthPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sora selection:bg-brand/30">
      
      {/* Left: Brand Showcase */}
      <div className="hidden lg:flex flex-col bg-primary items-center justify-center relative overflow-hidden p-20">
         {/* Simple Technical Background */}
         <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-[10%] left-0 w-full h-px bg-brand" />
            <div className="absolute bottom-[20%] right-0 w-[60%] h-px bg-white" />
            <div className="absolute top-0 right-[20%] w-px h-full bg-brand" />
         </div>

         {/* Animating Core */}
         <div className="relative z-10 flex flex-col items-center gap-10 text-center">
            <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="w-[60px] h-[60px] border-2 border-brand/20 rounded-sm flex items-center justify-center relative"
            >
                <div className="absolute inset-1 border border-white/5 rounded-sm" />
                <Asterisk className="w-[30px] h-[30px] text-brand" strokeWidth={2.5} />
            </motion.div>

            <div className="space-y-4">
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                    Deep<br />
                    <span className="text-brand">Screening</span>
                </h2>
                <span className="inline-block text-[10px] font-black tracking-[0.4em] text-white/30 uppercase">Strata Platform // V1</span>
            </div>
         </div>
         
         {/* Lower Branding */}
         <div className="absolute bottom-12 left-12 flex items-center gap-3">
             <img src="/logo.png" alt="Strata Logo" className="w-[32px] h-[32px] rounded-sm object-contain" />
             <span className="font-black text-lg text-white tracking-tighter uppercase">STRATA</span>
         </div>
      </div>

      {/* Right: Form Container */}
      <div className="flex items-center justify-center p-8 md:p-12 lg:p-8 bg-paper relative overflow-hidden">
         <div className="w-full max-w-md space-y-8 relative z-10">
            <Link 
                href="/" 
                className="inline-flex items-center gap-3 group"
            >
                <div className="w-10 h-10 rounded-sm border-2 border-primary/10 flex items-center justify-center group-hover:border-brand transition-colors">
                    <ArrowLeft className="w-[16px] h-[16px] text-primary group-hover:text-brand transition-colors" />
                </div>
                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest group-hover:text-primary transition-colors">
                    Back to Home
                </span>
            </Link>
            
            <AuthForm />

            <div className="pt-6 border-t border-primary/5 flex justify-between items-center text-[10px] font-black text-primary/10 uppercase tracking-widest">
                <span>© 2026 Strata</span>
            </div>
         </div>
      </div>

    </div>
  )
}
