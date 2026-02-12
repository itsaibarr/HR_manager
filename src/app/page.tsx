"use client";

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Zap, 
  Target, 
  ShieldCheck, 
  Asterisk, 
  Sparkles,
  Brain,
  CheckCircle2,
  ListChecks,
  MessageSquareText,
  BarChart3,
  ChevronRight
} from "lucide-react"
import { motion } from "framer-motion"

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen font-sora text-primary overflow-x-hidden">
      
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-1 z-20">
             <Image src="/logo.png" alt="Strata Logo" width={40} height={40} className="rounded-sm object-contain" />
             <span className="font-extrabold text-xl text-primary font-sora tracking-tighter uppercase">STRATA</span>
          </div>


          {/* Center: Nav Options */}
          <nav className="hidden md:flex gap-[60px] text-sm font-medium text-primary">
              {[
                { label: 'Problems', href: '#features' },
                { label: 'Solution', href: '#demo' },

                { label: 'Contact Us', href: '#contact' }
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    href={item.href} 
                    className="hover:text-brand transition-colors duration-300 relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full" />
                  </Link>
                </motion.div>
              ))}
          </nav>

          {/* Right: Auth */}
          <div className="flex justify-end gap-6 items-center">
              <Link 
                href="https://calendly.com/cametame001/15-min-strata-demo-feedback" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-black text-muted-foreground hover:text-brand transition-colors duration-300 uppercase tracking-widest"
              >
                  Book a call
              </Link>
              <Link href="/auth">
                 <Button variant="outline" className="hidden sm:inline-flex rounded-sm px-7 py-6 border-2 border-primary/20 hover:border-brand hover:text-white hover:bg-brand transition-all uppercase font-black tracking-widest text-xs">
                     Check Demo
                 </Button>
             </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="pt-40 pb-32 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center relative">
            {/* Headline Section */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col items-center gap-2 md:gap-4 mb-12 relative z-10"
            >
                {/* Row 1 */}
                <motion.div variants={itemVariants} className="flex items-center gap-3 md:gap-8 flex-wrap justify-center">
                    <span className="text-5xl md:text-[88px] font-black tracking-tighter text-primary leading-none uppercase">
                        Screening
                    </span>
                    <motion.div
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ArrowRight className="w-10 h-10 md:w-20 md:h-20 text-brand shrink-0" strokeWidth={2.5} />
                    </motion.div>
                    <span className="text-5xl md:text-[88px] font-black tracking-tighter text-primary leading-none uppercase">
                        Candidates
                    </span>
                </motion.div>

                {/* Row 2 */}
                <motion.div variants={itemVariants} className="flex items-center gap-3 md:gap-8 flex-wrap justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                        <Asterisk className="w-10 h-10 md:w-20 md:h-20 text-brand shrink-0" strokeWidth={2.5} />
                    </motion.div>
                    <span className="text-5xl md:text-[88px] font-black tracking-tighter text-primary leading-none uppercase">
                        Without
                    </span>
                    <span className="text-5xl md:text-[88px] font-black tracking-tighter text-primary leading-none uppercase">
                        The Fatigue
                    </span>
                </motion.div>
            </motion.div>

            <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-lg md:text-xl text-primary/60 font-black leading-tight max-w-4xl mb-12 font-sora uppercase tracking-tight"
            >
                Replace manual scanning with context-aware evaluation at 10x depth.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4 relative z-10">
                <Link href="/auth">
                    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                        <Button size="lg" className="h-20 px-12 text-lg font-black rounded-sm bg-primary hover:bg-brand text-white border-none transition-all duration-300 uppercase tracking-widest">
                            Check Demo
                        </Button>
                    </motion.div>
                </Link>
                <Link 
                  href="https://calendly.com/cametame001/15-min-strata-demo-feedback"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                        <Button variant="outline" size="lg" className="h-20 px-12 text-lg font-black rounded-sm border-2 border-primary text-primary hover:bg-primary/5 transition-all duration-300 uppercase tracking-widest">
                            Book a call
                        </Button>
                    </motion.div>
                </Link>
            </div>

            {/* Background elements - Sharp & Technical */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[20%] right-0 w-[30%] h-px bg-brand/30 skew-y-12" />
                <div className="absolute bottom-[20%] left-0 w-[40%] h-px bg-primary/10 -skew-y-6" />
                <div className="absolute top-[40%] left-[10%] w-px h-[20%] bg-brand/20" />
            </div>
        </section>

        {/* Problem Section (The Diagnostic) */}
        <section id="features" className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
                    <div className="max-w-3xl space-y-4">
                        <span className="text-[10px] font-black tracking-[0.3em] text-brand uppercase">Operational Audit // 2026</span>
                        <h3 className="text-[64px] md:text-[90px] font-black tracking-tighter text-primary leading-[0.85] uppercase">
                            The Screening <br/>
                            <span className="text-brand">Debt</span>
                        </h3>
                    </div>
                    <p className="text-primary/40 text-xl font-bold max-w-sm uppercase tracking-tight leading-tight">
                        80% of your screening week is tactical fatigue, not strategic decisioning.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Big Metric: The Time Sink */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="md:col-span-8 group relative overflow-hidden bg-paper border border-border/60 rounded-sm p-12 flex flex-col justify-between min-h-[480px] transition-all duration-500"
                    >
                        <div className="relative z-10">
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-brand/10 border border-brand/20 text-brand text-[10px] font-black tracking-widest uppercase mb-10">
                                <Zap className="w-3 h-3 fill-brand" strokeWidth={2.5} /> Peak Bottleneck
                            </div>
                            <h4 className="text-4xl font-black text-primary mb-4 tracking-tighter uppercase leading-none">Scanning Load</h4>
                            <p className="text-primary/60 text-lg font-bold uppercase tracking-tight leading-tight max-w-sm">Tactical scanning consumes the majority of recruitment throughput.</p>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                            <div className="flex flex-col">
                                <motion.span 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 1 }}
                                    className="text-[140px] font-black tracking-tighter text-brand leading-none"
                                >
                                    23
                                </motion.span>
                                <span className="text-xs font-black text-primary tracking-[0.2em] -mt-6 ml-2 uppercase">HRS / WEEK_LOSS</span>
                            </div>
                            <div className="w-full md:w-80 bg-primary/5 border border-border/40 rounded-sm p-8 flex flex-col justify-end gap-6">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] uppercase font-black text-primary/40 tracking-widest">
                                            <span>Mechanical Scan</span>
                                            <span className="text-brand">60%</span>
                                        </div>
                                        <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "60%" }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                className="h-full bg-brand"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] uppercase font-black text-primary/40 tracking-widest">
                                            <span>Human Strategy</span>
                                            <span className="text-primary/20">15%</span>
                                        </div>
                                        <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "15%" }}
                                                transition={{ duration: 1.5, ease: "circOut", delay: 0.3 }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Small Metric: Financial Drain */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="md:col-span-4 bg-primary text-white rounded-sm p-12 flex flex-col justify-between relative overflow-hidden group transition-all duration-500"
                    >
                        <div className="relative z-10">
                            <div className="w-[80px] h-[80px] rounded-sm bg-brand/10 flex items-center justify-center mb-10 border border-brand/20">
                                <Target className="w-[40px] h-[40px] text-brand" strokeWidth={2.5} />
                            </div>
                            <h4 className="text-4xl font-black mb-4 tracking-tighter uppercase leading-none text-white">Financial Drain</h4>
                            <p className="text-white/40 text-lg font-bold uppercase tracking-tight leading-tight">Capital leakage through mechanical labor.</p>
                        </div>
                        <div className="mt-12 relative z-10">
                            <motion.span 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-7xl font-black text-brand tracking-tighter leading-none"
                            >
                                $1,500
                            </motion.span>
                            <div className="text-[10px] uppercase font-black tracking-[0.2em] text-white/20 mt-4">WASTE / WEEK_UNIT</div>
                        </div>
                    </motion.div>

                    {/* Small Metric: Annual Toll */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-4 bg-paper border border-border/60 rounded-sm p-12 flex flex-col justify-between group overflow-hidden relative transition-all duration-500"
                    >
                        <div className="relative z-10">
                            <div className="w-[60px] h-[60px] bg-white border border-border/60 rounded-sm flex items-center justify-center mb-10 shadow-sm transition-transform">
                                <Asterisk className="w-[40px] h-[40px] text-brand animate-spin-slow" strokeWidth={2.5} />
                            </div>
                            <h4 className="text-4xl font-black text-primary mb-4 tracking-tighter uppercase leading-none">Annual Toll</h4>
                            <p className="text-primary/40 text-lg font-bold uppercase tracking-tight leading-tight">
                                10 WORKWEEKS lost to tactical scanning.
                            </p>
                        </div>
                        <div className="mt-12 relative z-10">
                            <span className="text-7xl font-black text-primary tracking-tighter leading-none">520</span>
                            <div className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/20 mt-3">HRS / YEAR_LOSS</div>
                        </div>
                    </motion.div>

                    {/* Medium Metric: Time per CV */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-8 bg-white border border-border/60 rounded-sm p-12 flex flex-col md:flex-row items-center justify-between group relative overflow-hidden transition-all duration-500"
                    >
                        <div className="relative z-10 max-w-lg">
                            <div className="mb-10 flex gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-brand/20" />
                                ))}
                            </div>
                            <h4 className="text-4xl font-black text-primary mb-4 tracking-tighter uppercase leading-none">Snap Consensus</h4>
                            <p className="text-primary/40 text-lg font-bold uppercase tracking-tight leading-tight max-w-sm">
                                role density forces seconds-long judgment bias.
                            </p>
                        </div>
                        <div className="relative z-10 text-right mt-14 md:mt-0">
                             <div className="relative inline-block">
                                <span className="text-[100px] font-black text-primary tracking-tighter leading-none">30-90</span>
                                <div className="absolute -top-10 -right-6">
                                    <ShieldCheck className="w-12 h-12 text-brand/20" strokeWidth={1.5} />
                                </div>
                             </div>
                             <div className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/20 mt-4">SEC / UNIT_SCAN</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Solution Section (Process Flow) */}
        <section id="demo" className="py-32 bg-paper border-y border-border/40 relative overflow-hidden">
            <div className="container px-6 mx-auto relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center mb-32 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-brand/10 border border-brand/20 text-brand text-[10px] font-black tracking-widest uppercase mb-8">
                        <Sparkles className="w-3 h-3 fill-brand" /> Operational Architecture
                    </div>
                    <h2 className="text-[64px] md:text-[90px] font-black text-primary tracking-tighter leading-[0.85] uppercase max-w-5xl">
                        Deterministic <br /> <span className="text-brand">Screening</span>
                    </h2>
                </motion.div>

                <div className="space-y-[50px] max-w-6xl mx-auto">
                    {/* Stage 1: Context Engine */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <div className="space-y-8">
                                <div className="w-[50px] h-[50px] bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                                    <ListChecks className="w-[24px] h-[24px] text-primary" strokeWidth={2.5} />
                                </div>
                                <div className="space-y-5">
                                    <h3 className="text-4xl md:text-5xl font-black text-primary tracking-tight uppercase leading-[0.9]">Stage 01: <br />Context Engine</h3>
                                    <p className="text-primary/60 text-lg leading-relaxed max-w-md">
                                        We don&apos;t just search for keywords. Strata converts your job description into a high-precision screening matrix.
                                    </p>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Automated requirement extraction",
                                        "Must-have vs Nice-to-have calibration",
                                        "Cultural & Practical signal mapping"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-4 text-[12px] font-black text-primary/80 uppercase tracking-widest">
                                            <div className="w-2 h-2 rounded-full bg-brand" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2 relative"
                        >
                            <div className="bg-white rounded-sm border-2 border-primary/10 p-12 shadow-sm relative z-10 overflow-hidden">
                                <div className="space-y-12">
                                    <div className="flex items-center justify-between pb-8 border-b border-border/40">
                                        <span className="text-[10px] font-black tracking-widest text-primary/30 uppercase leading-none">Job Context Analysis // S_01</span>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="h-4 w-3/4 bg-primary/5 rounded-full" />
                                        <div className="h-4 w-1/2 bg-primary/5 rounded-full" />
                                        <div className="p-10 border-l-4 border-brand bg-paper space-y-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-brand uppercase tracking-widest">Requirements Extracted</span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {["React.js", "5+ Yrs Exp", "Next.js", "System Design"].map((s) => (
                                                    <span key={s} className="text-[10px] bg-white border border-border/60 px-3 py-2 rounded-sm font-black shadow-sm text-primary/60 uppercase tracking-tight">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stage 2: 5D Evaluation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-primary rounded-sm p-12 shadow-2xl relative z-10 overflow-hidden">
                                <div className="space-y-12">
                                    <div className="flex justify-between items-end pb-8 border-b border-white/10">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">Metric Evaluation // S_02</span>
                                            <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Candidate 902</h4>
                                        </div>
                                        <span className="text-6xl font-black text-brand tracking-tighter leading-none">89%</span>
                                    </div>
                                    
                                    <div className="space-y-8">
                                        {[
                                            { label: "Technical depth", val: 92, color: "bg-brand" },
                                            { label: "Experience fit", val: 85, color: "bg-white" },
                                            { label: "Collaboration", val: 78, color: "bg-brand/60" },
                                            { label: "Growth signal", val: 90, color: "bg-white/60" },
                                        ].map((bar) => (
                                            <div key={bar.label} className="space-y-4">
                                                <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                                                    <span>{bar.label}</span>
                                                    <span className="text-white">{bar.val}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${bar.val}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className={`h-full ${bar.color}`} 
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="space-y-8">
                                <div className="w-[50px] h-[50px] bg-primary rounded-2xl flex items-center justify-center shadow-xl">
                                    <BarChart3 className="w-[24px] h-[24px] text-brand" strokeWidth={2.5} />
                                </div>
                                <div className="space-y-5">
                                    <h3 className="text-4xl md:text-5xl font-black text-primary tracking-tight uppercase leading-[0.9]">Stage 02: <br />5D Evaluation</h3>
                                    <p className="text-primary/60 text-lg leading-relaxed max-w-md">
                                        Strata parallel-scores candidates across five distinct dimensions, ensuring a balanced view that goes beyond just code.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {["Technical", "Experience", "Teamwork", "Ambition", "Education"].map((tag) => (
                                        <span key={tag} className="text-[10px] font-black tracking-widest uppercase py-3 px-5 border-2 border-primary/10 rounded-sm text-primary/40 shadow-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stage 3: Match Advice */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <div className="space-y-8">
                                <div className="w-[50px] h-[50px] bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                                    <MessageSquareText className="w-[24px] h-[24px] text-primary" strokeWidth={2.5} />
                                </div>
                                <div className="space-y-5">
                                    <h3 className="text-4xl md:text-5xl font-black text-primary tracking-tight uppercase leading-[0.9]">Stage 03: <br />Match Advice</h3>
                                    <p className="text-primary/60 text-lg leading-relaxed max-w-md">
                                        Get qualitative insights in human language. Strata explains exactly why a candidate fits, acting as your 24/7 technical lead.
                                    </p>
                                </div>
                                <div className="p-8 bg-muted/10 border-l-[6px] border-brand rounded-r-2xl shadow-sm">
                                    <p className="text-base font-medium text-primary italic leading-relaxed">
                                        &quot;Strong focus on distributed systems. While missing direct AWS certifications, depth in Kubernetes and Go suggests rapid adaptation.&quot;
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2 relative"
                        >
                            <div className="bg-white rounded-sm border-2 border-primary/10 p-12 shadow-sm relative z-10">
                                <div className="space-y-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-sm bg-brand/10 flex items-center justify-center border border-brand/20">
                                            <Brain className="w-8 h-8 text-brand" />
                                        </div>
                                        <span className="text-[10px] font-black tracking-widest text-primary/30 uppercase">Qualitative Logic // S_03</span>
                                    </div>
                                    <div className="space-y-6">
                                        {[
                                            { icon: CheckCircle2, text: "High-growth startup trajectory", fit: "high" },
                                            { icon: CheckCircle2, text: "Architecture ownership: 24+ Mo", fit: "medium" },
                                            { icon: Target, text: "Risk: Above target compensation", fit: "risk" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-6 p-6 rounded-sm bg-paper border border-border/40 items-start group">
                                                <item.icon className={`w-6 h-6 shrink-0 ${item.fit === 'risk' ? 'text-reject' : 'text-brand'}`} />
                                                <span className="text-[11px] font-black text-primary/60 uppercase tracking-wide group-hover:text-primary transition-colors">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stage 4: Precision Pipeline */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-white rounded-sm border-2 border-primary/10 p-10 shadow-sm relative z-10 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-primary/5">
                                            <th className="py-6 px-4 text-[10px] font-black text-primary/20 uppercase tracking-widest">Score</th>
                                            <th className="py-6 px-4 text-[10px] font-black text-primary/20 uppercase tracking-widest">Operator</th>
                                            <th className="py-6 px-4 text-[10px] font-black text-primary/20 uppercase tracking-widest text-right">State</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {[
                                            { name: "Sarah Chen", score: 94, status: "READY" },
                                            { name: "Marcus Wright", score: 88, status: "ACTIVE" },
                                            { name: "Alex Rivera", score: 82, status: "NEW" },
                                            { name: "Jessica Lee", score: 79, status: "REV" },
                                        ].map((c, i) => (
                                            <tr key={i} className="group hover:bg-paper transition-colors">
                                                <td className="py-6 px-4">
                                                    <span className={`text-xl font-black ${c.score > 90 ? 'text-brand' : 'text-primary'}`}>{c.score}%</span>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-primary uppercase tracking-tight">{c.name}</span>
                                                        <span className="text-[9px] font-mono font-bold text-primary/30 uppercase tracking-widest">UID_{800+i}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-right">
                                                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-sm bg-primary/5 border border-primary/10 text-primary/40`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="space-y-8">
                                <div className="w-[50px] h-[50px] bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                                    <CheckCircle2 className="w-[24px] h-[24px] text-primary" strokeWidth={2.5} />
                                </div>
                                <div className="space-y-5">
                                    <h3 className="text-4xl md:text-5xl font-black text-primary tracking-tight uppercase leading-[0.9]">Stage 04: <br />Precision Pipeline</h3>
                                    <p className="text-primary/60 text-lg leading-relaxed max-w-md">
                                        The result: zero screening debt. Your pipeline is instantly ranked and ready for high-impact human decisions.
                                    </p>
                                </div>
                                <div className="pt-6">
                                <Link href="/auth">
                                    <Button variant="outline" className="h-20 px-12 rounded-sm border-2 border-primary text-primary hover:bg-primary/5 text-xl font-black transition-all group uppercase tracking-widest">
                                        Check Dashboard
                                        <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand/[0.02] rounded-full blur-[120px] -mr-[400px] -mt-[400px]" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand/[0.03] rounded-full blur-[100px] -ml-[300px] -mb-[300px]" />
        </section>



        {/* Contact Section - Technical Brutalism */}
        <section id="contact" className="py-48 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
                    <div className="lg:col-span-8 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-[64px] md:text-[110px] font-black text-primary tracking-tighter leading-[0.8] uppercase flex flex-col">
                                <span>Deploy</span>
                                <span className="text-brand">Strata</span>
                            </h2>
                            <p className="text-2xl md:text-3xl font-bold text-primary/40 tracking-tight max-w-2xl leading-tight uppercase font-sora">
                                Replace tactical fatigue with deterministic evaluation.
                            </p>
                        </motion.div>
                        
                        <div className="flex flex-col md:flex-row gap-6 pt-4">
                            <Link 
                                href="https://calendly.com/cametame001/15-min-strata-demo-feedback"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                                    <Button className="h-20 px-12 text-lg font-black rounded-sm bg-primary hover:bg-brand text-white border-none transition-all duration-300 uppercase tracking-widest flex items-center gap-4">
                                        Book Strategy Call
                                        <ArrowRight className="w-6 h-6" />
                                    </Button>
                                </motion.div>
                            </Link>
                            <Link href="/auth">
                                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                                    <Button variant="outline" className="h-20 px-12 text-lg font-black rounded-sm border-2 border-primary text-primary hover:bg-primary/5 transition-all duration-300 uppercase tracking-widest">
                                        Start Free Trial
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-4 relative">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="p-10 border-l-4 border-brand bg-paper/50 space-y-8"
                        >
                            <div className="space-y-2">
                                <span className="text-[10px] font-black tracking-widest text-primary/30 uppercase">Operational Target</span>
                                <h4 className="text-xl font-bold text-primary uppercase">Infrastructure Ready</h4>
                            </div>
                            <ul className="space-y-5">
                                {[
                                    "Native ATS Integrations",
                                    "SAML/SSO Authentication",
                                    "Custom Logic Engines",
                                    "SOC2 Compliance Ready"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-xs font-black text-primary/60 uppercase tracking-wider">
                                        <div className="w-5 h-px bg-brand" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-4 flex items-center gap-3 text-xs font-mono font-bold text-brand uppercase">
                                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                                Systems online // 2026_V1
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            
            {/* Background elements - Sharp & Technical */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-paper/30 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-border/40" />
            <div className="absolute top-1/2 left-0 w-[200px] h-px bg-brand/20 -translate-y-1/2" />
        </section>
      </main>

      <footer className="py-12 border-t border-border mt-auto bg-paper text-center text-sm text-muted">
        <p>&copy; 2026 Strata AI. Built for impact.</p>
      </footer>
    </div>
  )
}
