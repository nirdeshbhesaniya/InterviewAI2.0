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
        "file:text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] selection:bg-[rgb(var(--accent))] selection:text-white bg-[rgb(var(--bg-card))] border-[rgb(var(--border))] flex h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base text-[rgb(var(--text-secondary))] shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[rgb(var(--accent))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]/50",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props} />
  );
}

export { Input }
