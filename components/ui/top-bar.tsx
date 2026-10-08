"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BackButton } from "./back-button";
import { cn } from "@/lib/cn";

/**
 * Sticky header for detail screens. Transparent over hero imagery,
 * turns into a blurred glass bar (and reveals its title) after scrolling.
 */
export function TopBar({
  title,
  fallback = "/home",
  actions,
  overlay = false,
  threshold = 120,
}: {
  title?: string;
  fallback?: string;
  actions?: ReactNode;
  /** Sits on top of a hero image (fixed, full-bleed) */
  overlay?: boolean;
  threshold?: number;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > (overlay ? threshold : 8));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay, threshold]);

  return (
    <header
      className={cn(
        "z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        overlay ? "fixed inset-x-0 top-0 lg:left-[248px]" : "sticky top-0",
        scrolled
          ? "border-b border-line bg-ink/75 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent",
      )}
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <div className="page-x mx-auto flex h-14 max-w-[1180px] items-center gap-3">
        <BackButton fallback={fallback} variant={scrolled || !overlay ? "plain" : "glass"} />
        <p
          className={cn(
            "min-w-0 flex-1 truncate text-center text-[15px] font-semibold transition-all duration-300",
            scrolled || !overlay ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          )}
          aria-hidden={!scrolled && overlay}
        >
          {title}
        </p>
        <div className="flex min-w-10 items-center justify-end gap-2">{actions}</div>
      </div>
    </header>
  );
}
