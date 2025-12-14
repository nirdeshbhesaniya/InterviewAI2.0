import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]/50 focus-visible:ring-offset-2 aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
  {
    variants: {
      variant: {
        default:
          "bg-[rgb(var(--accent))] text-white shadow-md hover:bg-[rgb(var(--accent-hover))] hover:shadow-lg hover:scale-[1.02]",
        destructive:
          "bg-red-500 text-white shadow-xs hover:bg-red-600",
        outline:
          "border border-[rgb(var(--border))] bg-transparent shadow-xs hover:bg-[rgb(var(--bg-elevated-alt))] hover:text-[rgb(var(--text-primary))] text-[rgb(var(--text-secondary))]",
        secondary:
          "bg-[rgb(var(--bg-elevated-alt))] text-[rgb(var(--text-primary))] shadow-xs hover:bg-[rgb(var(--bg-body-alt))] border border-[rgb(var(--border))]",
        ghost:
          "hover:bg-[rgb(var(--bg-elevated-alt))] hover:text-[rgb(var(--text-primary))] text-[rgb(var(--text-secondary))]",
        link: "text-[rgb(var(--accent))] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-xl px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
