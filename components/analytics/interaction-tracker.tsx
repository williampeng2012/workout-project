"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

const CLICKABLE = "button, a[href], [role='button'], [role='tab'], [role='switch']";
const MAX_LABEL = 80;

function labelOf(el: Element): string {
  const text =
    el.getAttribute("aria-label") ||
    el.getAttribute("title") ||
    (el as HTMLElement).innerText ||
    el.textContent ||
    "";
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_LABEL);
}

/** Records "Page Viewed" on every route change and "Button Clicked" for buttons and links. */
export function InteractionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track("Page Viewed", { path: pathname });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.(CLICKABLE);
      if (!el || (el as HTMLButtonElement).disabled) return;
      const href = el.getAttribute("href");
      track("Button Clicked", {
        label: labelOf(el) || null,
        element: el.tagName === "A" ? "link" : "button",
        href: href && !href.startsWith("javascript:") ? href : null,
        path: window.location.pathname,
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
