import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-sans font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#e3dacc] text-[#141413] border border-[#cccbc8]",
        manilla:
          "bg-[#f5e3c7] text-[#141413] border border-[#d8cebe]",
        outline:
          "border border-[#cccbc8] text-[#57564f] bg-transparent",
        dark:
          "bg-[#141413] text-[#faf9f5]",
        emerald:
          "bg-[#10b981]/15 text-[#065f46] border border-[#10b981]/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
