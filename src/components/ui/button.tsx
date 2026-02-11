import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive" | "outline" | "brand"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-transparent",
      secondary: "bg-paper text-primary border border-border hover:bg-border/50",
      outline: "border border-border bg-transparent hover:bg-paper text-primary",
      ghost: "hover:bg-paper text-muted hover:text-primary",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      brand: "bg-brand text-white hover:bg-brand/90 border border-brand/50 shadow-sm",
    }

    const sizes = {
      default: "h-11 px-6 py-2 rounded-full",
      sm: "h-9 rounded-full px-4 text-xs",
      lg: "h-14 rounded-full px-8 text-base",
      icon: "h-11 w-11 rounded-full",
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
