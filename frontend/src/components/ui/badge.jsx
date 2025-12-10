import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50 aria-invalid:ring-danger/20 aria-invalid:border-danger transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white [a&]:hover:bg-indigo-500",
        secondary:
          "border-transparent bg-secondary text-white [a&]:hover:bg-cyan-400",
        destructive:
          "border-transparent bg-danger text-white [a&]:hover:bg-red-600 focus-visible:ring-danger/20",
        outline:
          "text-text-secondary border-border-subtle [a&]:hover:bg-bg-card-alt [a&]:hover:text-text-primary",
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
