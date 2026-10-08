"use client";

import { ViewTransition, type ReactNode } from "react";
import { useTrackNavigation } from "@/lib/nav-history";

/** Cross-page transition: old screen fades/blurs out, new one fades in
 *  while its sections run their own staggered entrance. */
export function PageTransition({ children }: { children: ReactNode }) {
  useTrackNavigation();
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
