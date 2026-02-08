import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "fit-strong" | "fit-good" | "fit-borderline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-navy text-white hover:bg-navy/80",
    secondary: "border-transparent bg-cream text-black-soft hover:bg-cream/80 dark:bg-muted/30 dark:text-muted-foreground dark:hover:bg-muted/40",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-600/80",
    outline: "text-black-soft border-border dark:text-gray-300 dark:border-gray-700",
    "fit-strong": "border-transparent bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-600 dark:text-white hover:dark:bg-green-700",
    "fit-good": "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-600 dark:text-white hover:dark:bg-blue-700",
    "fit-borderline": "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-600 dark:text-white hover:dark:bg-yellow-700",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
