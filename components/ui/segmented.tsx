"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** Segmented control with a sliding indicator. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; count?: number }>;
  className?: string;
  label: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = refs.current[value];
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, options.length]);

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("relative inline-flex rounded-full border border-line bg-surface-1 p-1", className)}
    >
      <span
        aria-hidden
        className="absolute bottom-1 top-1 rounded-full bg-fg transition-all duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ left: ind.left, width: ind.width }}
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[o.value] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative z-10 flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors duration-300",
              active ? "text-ink" : "text-fg-2 hover:text-fg",
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cn("text-[11px] tabular-nums", active ? "text-ink/55" : "text-fg-3")}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Horizontal filter chips. */
export function ChipGroup<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("rail !gap-2", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "pressable h-9 rounded-full border px-4 text-[13px] font-semibold",
              active
                ? "border-fg bg-fg text-ink"
                : "border-line-2 text-fg-2 hover:border-white/30 hover:text-fg",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
