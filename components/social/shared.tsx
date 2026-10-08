"use client";

import { initialsOf } from "@/components/account/ui";
import { cn } from "@/lib/cn";
import { yesterdayKey } from "@/lib/gamification";
import type { PublicProfile } from "@/lib/social/api";

export const inputClass =
  "h-12 w-full min-w-0 rounded-full border border-line-2 bg-white/[0.03] px-5 text-[15px] text-fg placeholder:text-fg-4 outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:bg-white/[0.05] focus:border-white/40 focus:shadow-[0_0_0_4px_rgb(255_255_255/0.06)]";

export function nameOf(p: Pick<PublicProfile, "display_name" | "username"> | null | undefined): string {
  return p?.display_name?.trim() || (p?.username ? `@${p.username}` : "Athlete");
}

/** A streak only counts if it was extended today or yesterday. */
export function liveStreak(count: number, updatedOn: string | null): number {
  return updatedOn && updatedOn >= yesterdayKey() ? count : 0;
}

export function timeAgo(iso: string, now: number): string {
  const s = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function Avatar({ name, self, size = 40 }: { name: string; self?: boolean; size?: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[-0.01em]",
        self ? "bg-accent text-accent-ink" : "bg-white/[0.08] text-fg",
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initialsOf(name.replace(/^@/, ""))}
    </span>
  );
}
