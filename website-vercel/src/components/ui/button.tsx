import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        // Emerald primary CTA — bottom-only 8px radius, no shadow
        emerald:
          "bg-[#10b981] text-white hover:bg-[#059669] rounded-t-none rounded-b-[8px] font-semibold",
        // Slate Dark filled button — bottom-only 8px radius
        default:
          "bg-[#141413] text-[#faf9f5] hover:bg-[#2a2a29] rounded-t-none rounded-b-[8px] font-medium",
        // Neutral outline button — bottom-only 8px radius
        outline:
          "border border-[#cccbc8] bg-transparent text-[#141413] hover:bg-[#faf9f5] hover:border-[#141413] rounded-t-none rounded-b-[8px]",
        // Flat tone-shift secondary button
        secondary:
          "bg-[#e3dacc] text-[#141413] hover:bg-[#d8cebe] rounded-t-none rounded-b-[8px]",
        // Ghost button for clean navigation
        ghost:
          "text-[#141413] hover:bg-[#e3dacc]/60 rounded-sm",
        // Underlined editorial text link
        link:
          "text-[#141413] underline underline-offset-4 decoration-current/40 hover:decoration-current p-0 h-auto",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
