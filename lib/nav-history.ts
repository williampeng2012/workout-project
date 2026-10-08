"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const KEY = "__pulsepath_nav_depth__";

type NavWindow = Window & { [KEY]?: number };

/** Counts in-app navigations so Back can fall back to a sensible route
 *  when the user landed directly on a deep link. */
export function useTrackNavigation() {
  const pathname = usePathname();
  useEffect(() => {
    const w = window as NavWindow;
    w[KEY] = (w[KEY] ?? 0) + 1;
  }, [pathname]);
}

export function canGoBackInApp(): boolean {
  if (typeof window === "undefined") return false;
  return ((window as NavWindow)[KEY] ?? 0) > 1;
}
