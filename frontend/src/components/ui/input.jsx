import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-text-primary placeholder:text-text-muted selection:bg-primary selection:text-white bg-bg-card border-border-subtle flex h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base text-text-secondary shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50",
        "aria-invalid:ring-danger/20 aria-invalid:border-danger",
        className
      )}
      {...props} />
  );
}

export { Input }
