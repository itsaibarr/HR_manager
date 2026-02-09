import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    
    const variants = {
      default: "bg-primary text-paper hover:bg-primary/90 transition-all active:scale-[0.98]",
      secondary: "bg-accent text-primary hover:bg-accent/80 dark:bg-accent/10 dark:text-accent-foreground",
      outline: "border border-border bg-transparent hover:bg-accent/50 text-primary",
      ghost: "hover:bg-accent/50 text-muted hover:text-primary",
      destructive: "bg-reject text-white hover:bg-reject/90",
    }

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-sm px-3 text-xs",
      lg: "h-10 rounded-sm px-8",
      icon: "h-9 w-9",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
