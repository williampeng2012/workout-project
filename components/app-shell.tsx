"use client";

import {
  BarChart3,
  Compass,
  House,
  Layers,
  Play,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar } from "@/components/account/avatar";
import { usePulse } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: string[];
};

export const TABS: Tab[] = [
  { href: "/home", label: "Home", icon: House, match: ["/home", "/plan", "/checkin", "/notifications", "/calories"] },
  {
    href: "/discover",
    label: "Discover",
    icon: Compass,
    match: ["/discover", "/search", "/classes", "/learn", "/courses", "/categories"],
  },
  { href: "/programs", label: "Programs", icon: Layers, match: ["/programs", "/workouts", "/path"] },
  { href: "/progress", label: "Progress", icon: BarChart3, match: ["/progress"] },
  { href: "/profile", label: "Profile", icon: UserRound, match: ["/profile", "/settings", "/friends", "/invite"] },
];

const IMMERSIVE = ["/onboarding", "/lesson/", "/workout/"];

export function isImmersive(pathname: string) {
  return IMMERSIVE.some((p) => pathname === p || pathname.startsWith(p));
}

function activeTab(pathname: string) {
  return TABS.find((t) => t.match.some((m) => pathname === m || pathname.startsWith(`${m}/`)));
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersive(pathname);
  const active = activeTab(pathname);

  if (immersive) return <>{children}</>;

  return (
    <div className="min-h-dvh lg:pl-[248px]">
      <Sidebar activeHref={active?.href} />
      <div className="relative">{children}</div>
      <BottomNav activeHref={active?.href} />
    </div>
  );
}

function BottomNav({ activeHref }: { activeHref?: string }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
      style={{ viewTransitionName: "app-nav" }}
    >
      <div
        className="border-t border-line bg-ink/85 backdrop-blur-lg"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <ul className="mx-auto flex h-[var(--nav-h)] max-w-lg items-stretch px-2">
          {TABS.map((tab) => {
            const isActive = activeHref === tab.href;
            const Icon = tab.icon;
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "pressable relative flex h-full flex-col items-center justify-center gap-1 text-[10.5px] font-semibold tracking-[0.01em]",
                    isActive ? "text-fg" : "text-fg-3 hover:text-fg-2",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0 h-[2px] rounded-full bg-accent transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      isActive ? "w-6 opacity-100" : "w-0 opacity-0",
                    )}
                    aria-hidden
                  />
                  <Icon size={21} strokeWidth={isActive ? 2.3 : 1.8} aria-hidden />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function Sidebar({ activeHref }: { activeHref?: string }) {
  const { state, level, hydrated } = usePulse();

  return (
    <aside
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-50 hidden w-[248px] flex-col border-r border-line bg-ink px-4 py-6 lg:flex"
      style={{ viewTransitionName: "app-sidebar" }}
    >
      <Link href="/home" className="flex items-center gap-2.5 px-3">
        <Logo />
        <span className="font-display text-[19px] font-extrabold uppercase tracking-tight [font-stretch:80%]">
          Pulsepath
        </span>
      </Link>

      <Link
        href="/search"
        className="pressable mt-8 flex h-10 items-center gap-2.5 rounded-full border border-line bg-surface-1 px-4 text-[13px] text-fg-3 hover:border-line-2 hover:text-fg-2"
      >
        <Search size={15} aria-hidden />
        Search workouts, classes…
      </Link>

      <ul className="mt-6 space-y-1">
        {TABS.map((tab) => {
          const isActive = activeHref === tab.href;
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "pressable relative flex h-11 items-center gap-3 rounded-full px-4 text-[14px] font-semibold",
                  isActive ? "bg-white/[0.07] text-fg" : "text-fg-2 hover:bg-white/[0.04] hover:text-fg",
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} aria-hidden />
                {tab.label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/plan"
        className="pressable mt-8 flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-[14px] font-semibold text-accent-ink"
      >
        <Play size={15} fill="currentColor" aria-hidden />
        Today&apos;s training
      </Link>

      <Link
        href="/profile"
        className="pressable mt-auto flex items-center gap-3 rounded-[var(--radius)] border border-line p-3 hover:border-line-2 hover:bg-surface-1"
      >
        {hydrated ? (
          <Avatar name={state.displayName || "A"} src={state.avatar} className="h-9 w-9 text-sm" />
        ) : (
          <span className="h-9 w-9 shrink-0 rounded-full bg-paper" aria-hidden />
        )}
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold">
            {hydrated ? state.displayName || "Athlete" : " "}
          </span>
          <span className="block text-[11px] text-fg-3">
            Level {hydrated ? level : 1} · {hydrated ? state.xp : 0} XP
          </span>
        </span>
      </Link>
    </aside>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={cn("h-7 w-7", className)}
      aria-hidden
    >
      <rect width="28" height="28" rx="8" fill="var(--accent)" />
      <path
        d="M5 15.5h4.2l2.3-6 4 11 2.6-7.2 1.4 2.2H23"
        fill="none"
        stroke="var(--accent-ink)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
