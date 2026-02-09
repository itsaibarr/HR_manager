import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between pb-8 mb-8 border-b border-border/60", className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold font-sora text-primary tracking-tighter leading-none">{title}</h1>
        {subtitle && (
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  )
}
