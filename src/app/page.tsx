import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Target, ShieldCheck } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sora">
      
      {/* Navigation */}
      <header className="px-6 lg:px-8 h-20 flex items-center justify-between bg-transparent sticky top-0 z-50">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 z-20">
           <div className="w-8 h-8 bg-navy rounded-sm flex items-center justify-center">
             <span className="text-white font-bold text-xs">HR</span>
           </div>
           <span className="font-normal text-xl text-black-soft hidden sm:block">HR Screen</span>
        </div>

        {/* Center: Nav Options */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-black-soft absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Link href="#features" className="hover:text-navy">Features</Link>
            <Link href="#" className="hover:text-navy">Pricing</Link>
            <Link href="#" className="hover:text-navy">About</Link>
        </nav>

        {/* Right: Auth */}
        <div className="flex gap-4 items-center z-20">
            <Link href="/auth" className="text-sm font-medium text-navy hover:text-navy/80">Log in</Link>
            <Link href="/auth">
                <Button className="bg-navy text-white rounded-sm px-6 h-10">Get Started</Button>
            </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="pt-12 pb-24 px-6 lg:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative">
            {/* Left Column: Text */}
            <div className="flex flex-col items-start text-left space-y-6 max-w-2xl relative z-10">
                <h1 className="text-5xl md:text-[56px] font-normal tracking-tight text-black-soft leading-[1.1] font-sora">
                    Intelligent Screening for <br/>
                    Modern Teams
                </h1>
                <p className="text-lg text-muted leading-relaxed max-w-lg font-sora">
                    Automate your first-round interviews with AI that understands context, not just keywords. Fair, fast, and thorough.
                </p>
                <div className="flex gap-4 pt-4">
                    <Link href="/auth">
                        <Button size="lg" className="h-14 px-8 text-base rounded-sm bg-reject hover:bg-reject/90 text-white border-none shadow-none">Start Free Trial</Button>
                    </Link>
                    <Link href="#features">
                        <Button variant="ghost" size="lg" className="h-14 px-8 text-base rounded-sm text-black-soft hover:bg-transparent hover:text-navy">View Demo</Button>
                    </Link>
                </div>
            </div>

            {/* Right Column: Visuals (Exact Shapes from Design) */}
            <div className="relative h-[500px] w-full hidden lg:block">
                <div className="relative w-full h-full">
                    {/* Gray Circle (lShape1) */}
                    <div className="absolute top-[50px] right-[50px] w-[400px] h-[400px] bg-[#E5E7EB] rounded-full z-0 opacity-50" />
                    
                    {/* Red Accent Circle (lShape3) */}
                    <div className="absolute top-0 right-[100px] w-[150px] h-[150px] bg-reject rounded-full z-10 opacity-90 shadow-lg" />

                    {/* Navy Rectangle (lShape2) */}
                    <div className="absolute bottom-[50px] left-[50px] w-[300px] h-[200px] bg-navy rounded-sm z-20 shadow-xl" />
                </div>
            </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={Zap}
                    title="Instant Analysis"
                    desc="Get comprehensive candidate profiles extracted and analyzed in seconds."
                />
                 <FeatureCard 
                    icon={Target}
                    title="Unbiased Scoring"
                    desc="Consistent evaluation criteria applied fairly to every single applicant."
                />
                 <FeatureCard 
                    icon={ShieldCheck}
                    title="Data-Driven Hiring"
                    desc="Compare candidates across key dimensions like never before."
                />
            </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border mt-auto bg-white text-center text-sm text-muted">
        <p>&copy; 2024 HR Manager AI. Built with Next.js 16.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-start text-left bg-cream/50 rounded-sm h-full px-6 py-12">
            <h3 className="text-xl font-normal text-black-soft font-sora mb-2">{title}</h3>
            <p className="text-sm max-w-[300px] text-muted leading-relaxed font-sora">{desc}</p>
        </div>
    )
}
