import { HTMLAttributes, forwardRef } from "react"
import { clsx } from "clsx"

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "bg-white rounded-lg shadow-sm border border-slate-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("p-6 pb-4", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = "CardHeader"

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={clsx("text-lg font-semibold text-slate-900", className)}
        {...props}
      >
        {children}
      </h3>
    )
  }
)

CardTitle.displayName = "CardTitle"

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={clsx("text-sm text-slate-600 mt-1", className)}
        {...props}
      >
        {children}
      </p>
    )
  }
)

CardDescription.displayName = "CardDescription"

export const CardContent = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("p-6 pt-0", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardContent.displayName = "CardContent"

export const CardFooter = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("p-6 pt-4 border-t border-slate-100", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = "CardFooter"
