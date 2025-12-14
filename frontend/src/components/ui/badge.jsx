import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-[rgb(var(--accent))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]/50 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[rgb(var(--accent))] text-white [a&]:hover:bg-[rgb(var(--accent-hover))]",
        secondary:
          "border-transparent bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] [a&]:hover:bg-[rgb(var(--bg-body-alt))]",
        destructive:
          "border-transparent bg-red-500 text-white [a&]:hover:bg-red-600",
        outline:
          "text-[rgb(var(--text-secondary))] border-[rgb(var(--border))] [a&]:hover:bg-[rgb(var(--bg-card-alt))] [a&]:hover:text-[rgb(var(--text-primary))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
