"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";

export type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/**
 * Styled native &lt;select&gt; — soft fill, no hard border, inset shadow, focus ring.
 */
export function NativeSelect({ className, children, disabled, ...props }: NativeSelectProps) {
  return (
    <div className="relative min-w-0">
      <select
        disabled={disabled}
        className={twMerge(
          "h-9 w-full min-w-0 cursor-pointer appearance-none rounded-xl border-0 bg-muted/60 px-3 py-2 pr-9 text-xs font-semibold text-foreground",
          "shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition-[box-shadow,background-color]",
          "hover:bg-muted/80 focus:bg-muted/70 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),0_0_0_2px_rgba(181,101,29,0.18)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/45"
        aria-hidden
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}
