import { ButtonHTMLAttributes, forwardRef } from "react"
import { clsx } from "clsx"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500": variant === "primary",
            "bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500": variant === "secondary",
            "border-2 border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500": variant === "outline",
            "text-slate-700 hover:bg-slate-100 focus:ring-slate-500": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500": variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
