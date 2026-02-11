import React from 'react';
import { cn } from '@/lib/utils';
import { Network, ShieldCheck, Zap, Clock, Code2 } from 'lucide-react';

interface BentoGridProps {
  className?: string;
}

export function BentoGrid({ className }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]", className)}>
      {/* Card 1 (Large - 2x2): Intelligent Scorecard */}
      <div className="md:col-span-2 md:row-span-2 bg-card rounded-[32px] border border-border/50 p-8 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-500">
        <div className="flex justify-between items-start mb-6 z-10">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">The Intelligent Scorecard</h3>
            <p className="text-muted-foreground mt-2">Semantic analysis beyond keywords.</p>
          </div>
          <div className="h-10 w-10 bg-brand/10 rounded-full flex items-center justify-center text-brand">
            <Zap className="h-5 w-5" />
          </div>
        </div>

        {/* Mock Report */}
        <div className="flex-1 bg-paper rounded-2xl border border-border/40 p-6 relative z-10 backdrop-blur-sm bg-opacity-50">
           <div className="space-y-4">
               {/* Candidate Header */}
               <div className="flex items-center gap-4 border-b border-border/30 pb-4">
                    <div className="h-12 w-12 rounded-full bg-neutral-200" />
                    <div>
                        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-2" />
                        <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse" />
                    </div>
                    <div className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">RECOMMENDED</div>
               </div>

               {/* Skills */}
               <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Engineering Depth</span>
                        <div className="flex items-center gap-2">
                             <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-brand w-[94%]" />
                             </div>
                             <span className="text-sm font-bold">94%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Founder Mindset</span>
                        <div className="flex items-center gap-2">
                             <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-neutral-800 w-[88%]" />
                             </div>
                             <span className="text-sm font-bold">88%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Communication</span>
                        <div className="flex items-center gap-2">
                             <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-neutral-400 w-[92%]" />
                             </div>
                             <span className="text-sm font-bold">92%</span>
                        </div>
                    </div>
               </div>
           </div>
        </div>

        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] z-0 opacity-20 pointer-events-none" />
      </div>

      {/* Card 2 (Small - 1x1): Time Saved */}
      <div className="bg-card rounded-[32px] border border-border/50 p-8 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-all duration-300">
         <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
             <Clock className="h-7 w-7" />
         </div>
         <h3 className="text-4xl font-bold tracking-tighter mb-2">15h+</h3>
         <p className="text-sm text-muted-foreground font-medium">saved / week</p>
      </div>

      {/* Card 3 (Small - 1x1): Data Points */}
      <div className="bg-card rounded-[32px] border border-border/50 p-8 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-all duration-300">
         <div className="h-14 w-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
             <Network className="h-7 w-7" />
         </div>
         <h3 className="text-4xl font-bold tracking-tighter mb-2">40+</h3>
         <p className="text-sm text-muted-foreground font-medium">data points / candidate</p>
      </div>

      {/* Card 4 (Medium - 2x1): Modern Stack */}
      <div className="md:col-span-3 lg:col-span-1 bg-card rounded-[32px] border border-border/50 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
         <div>
            <h3 className="text-lg font-bold mb-1">Built for Modern Teams</h3>
            <p className="text-sm text-muted-foreground">Integrates with your existing stack.</p>
         </div>
         
         <div className="flex items-center gap-6 mt-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Replace with actual SVGs or icons, using Lucio icons for now as placeholders for logos */}
              <div className="flex items-center gap-2 font-bold"><Code2 className="h-5 w-5" /> GitHub</div>
              <div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5" /> LinkedIn</div>
         </div>
      </div>
    </div>
  );
}
