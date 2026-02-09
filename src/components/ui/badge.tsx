import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "fit-strong" | "fit-good" | "fit-borderline" | "shortlisted" | "interviewing" | "offered"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary text-paper",
    secondary: "border border-border/60 bg-accent text-primary dark:bg-accent/40 dark:text-accent-foreground",
    destructive: "border-transparent bg-reject/10 text-reject border border-reject/20",
    outline: "text-muted border-border font-bold",
    "fit-strong": "border-strong-fit/20 bg-strong-fit/5 text-strong-fit border",
    "fit-good": "border-good-fit/20 bg-good-fit/5 text-good-fit border",
    "fit-borderline": "border-borderline/20 bg-borderline/5 text-borderline border",
    "shortlisted": "border-primary/20 bg-primary/5 text-primary border",
    "interviewing": "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400 border",
    "offered": "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
