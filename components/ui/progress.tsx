"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

function useMountedValue(value: number) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return shown;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = "accent",
  label,
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "accent" | "light" | "ink";
  label?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  const shown = useMountedValue(pct);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
      className={cn(
        "h-1.5 overflow-hidden rounded-full",
        tone === "ink" ? "bg-ink/10" : "bg-white/[0.08]",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          tone === "accent" && "bg-accent",
          tone === "light" && "bg-fg",
          tone === "ink" && "bg-ink",
        )}
        style={{ width: `${shown}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  stroke = 5,
  className,
  children,
  tone = "accent",
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
  tone?: "accent" | "light" | "ink";
  label?: string;
}) {
  const pct = Math.min(1, Math.max(0, value / (max || 1)));
  const shown = useMountedValue(pct);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(pct * 100)}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={tone === "ink" ? "stroke-ink/12" : "stroke-white/10"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
          className={cn(
            "transition-[stroke-dashoffset] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            tone === "accent" && "stroke-accent",
            tone === "light" && "stroke-fg",
            tone === "ink" && "stroke-ink",
          )}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}

/** Animated count-up for headline numbers. */
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = instant ? 1 : Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{n}</>;
}
