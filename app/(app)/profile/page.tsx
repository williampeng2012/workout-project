"use client";

import {
  ArrowRight,
  Bell,
  CreditCard,
  Database,
  Dumbbell,
  FileText,
  Info,
  LifeBuoy,
  Ruler,
  Settings,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { IdentityBar } from "@/components/account/identity-bar";
import { goalLabel } from "@/components/account/meta";
import { ResetDemo } from "@/components/account/reset-demo";
import { MenuGroup, MenuRow } from "@/components/account/ui";
import type { ReactNode } from "react";
import { IconLink } from "@/components/ui/button";
import { CountUp, ProgressRing } from "@/components/ui/progress";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill } from "@/components/ui/section";
import { PageSkeleton } from "@/components/ui/states";
import { XP, xpIntoLevel } from "@/lib/gamification";
import { usePulse } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";

export default function ProfilePage() {
  const { hydrated, state, level, completedLessonIds } = usePulse();

  if (!hydrated) {
    return (
      <main className="page-bottom min-h-dvh pt-[calc(var(--safe-top)+16px)]">
        <PageSkeleton />
      </main>
    );
  }

  const name = state.displayName || "Athlete";
  const goal = goalLabel(state.goal);
  const xpIn = xpIntoLevel(state.xp);
  const enabledReminders = [
    state.preferences.workoutReminders,
    state.preferences.classReminders,
    state.preferences.weeklyRecap,
  ].filter(Boolean).length;

  return (
    <main className="page-bottom min-h-dvh">
      <header className="page-x mx-auto flex max-w-[1180px] items-center justify-between gap-4 pb-2 pt-[calc(var(--safe-top)+18px)] lg:pt-10">
        <Enter variant="enter-soft">
          <p className="t-eyebrow">Profile</p>
        </Enter>
        <Enter variant="enter-soft" delay={80}>
          <IconLink href="/settings" label="Settings">
            <Settings size={18} aria-hidden />
          </IconLink>
        </Enter>
      </header>

      <div className="page-x mx-auto max-w-[1180px]">
        {/* Identity + account */}
        <section className="pt-4">
          <h1 className="sr-only">{name}</h1>
          <Enter delay={40} variant="enter-focus">
            <IdentityBar name={name} />
          </Enter>
          <Enter delay={140} variant="enter-soft">
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Pill tone="light">Level {level}</Pill>
              {goal ? <Pill>{goal}</Pill> : null}
              {state.trainingDays ? <Pill tone="outline">{state.trainingDays} days / week</Pill> : null}
              {!goal && (
                <Link
                  href="/settings/profile"
                  className="text-[13px] font-semibold text-fg-2 underline decoration-fg-4 underline-offset-4 hover:text-fg"
                >
                  Set a goal
                </Link>
              )}
            </div>
          </Enter>
        </section>

        {!state.onboardingDone && (
          <Enter delay={280}>
            <Link
              href="/onboarding"
              className="group pressable mt-6 flex items-center justify-between gap-4 rounded-[var(--radius)] border border-accent/40 bg-accent-soft p-4 sm:p-5"
            >
              <span>
                <span className="block text-[15px] font-semibold">Finish setting up</span>
                <span className="t-micro mt-0.5 block !text-[12.5px]">
                  Pick a goal and habits so your daily plan fits you.
                </span>
              </span>
              <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </Enter>
        )}

        {/* Stats strip */}
        <Enter delay={320}>
          <Link
            href="/progress"
            className="group mt-10 grid grid-cols-2 border-y border-line transition-colors hover:border-line-2 sm:grid-cols-4"
            aria-label="View full progress"
          >
            <div className="flex items-center gap-4 py-5 pr-3">
              <ProgressRing value={xpIn} max={XP.LEVEL_EVERY} size={48} stroke={4} label={`${xpIn} of ${XP.LEVEL_EVERY} XP to next level`}>
                <span className="t-num text-[17px]">{level}</span>
              </ProgressRing>
              <div>
                <p className="t-eyebrow">Level</p>
                <p className="t-micro mt-1">{XP.LEVEL_EVERY - xpIn} XP to go</p>
              </div>
            </div>
            <StripStat label="Total XP" value={state.xp} className="border-l border-line pl-5" />
            <StripStat
              label="Day streak"
              value={state.streakCount}
              className="border-t border-line sm:border-l sm:border-t-0 sm:pl-5"
            />
            <StripStat
              label="Workouts"
              value={completedLessonIds.size}
              className="border-l border-t border-line pl-5 sm:border-t-0"
              trailing={
                <ArrowRight
                  size={16}
                  className="ml-auto self-center text-fg-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-fg"
                  aria-hidden
                />
              }
            />
          </Link>
        </Enter>

        {/* Menu */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="space-y-10 lg:col-span-7">
            <MenuGroup title="Account">
              <MenuRow href="/settings/profile" icon={UserRound} label="Edit profile" value={state.displayName ? undefined : "Add name"} />
              <MenuRow href="/friends" icon={Users} label="Friends" description="Weekly leaderboard, invites & activity" />
              <MenuRow
                href="/settings/training"
                icon={Dumbbell}
                label="Training preferences"
                value={state.trainingDays ? `${state.trainingDays}× / wk` : undefined}
              />
              <MenuRow
                href="/settings/notifications"
                icon={Bell}
                label="Notifications"
                value={`${enabledReminders} on`}
              />
              <MenuRow
                href="/settings/units"
                icon={Ruler}
                label="Units"
                value={state.preferences.units === "metric" ? "Metric" : "Imperial"}
              />
              <MenuRow href="/settings/subscription" icon={CreditCard} label="Subscription" value="Free" />
            </MenuGroup>
          </Reveal>

          <Reveal className="space-y-10 lg:col-span-5" delay={80}>
            <MenuGroup title="Support">
              <MenuRow href="/settings/help" icon={LifeBuoy} label="Help & FAQ" />
              <MenuRow href="/settings/about" icon={Info} label="About" />
            </MenuGroup>
            <MenuGroup title="Legal & data">
              <MenuRow href="/legal/privacy" icon={Shield} label="Privacy" />
              <MenuRow href="/legal/terms" icon={FileText} label="Terms" />
              <MenuRow href="/settings/data" icon={Database} label="Your data" description="Export or reset" />
            </MenuGroup>
          </Reveal>
        </div>

        <Reveal className="mt-12 flex flex-col items-start gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-micro max-w-[44ch] !text-[12.5px]">
            Resetting clears XP, streaks, habits and workout history stored on this device.
          </p>
          <ResetDemo>
            {(open) => (
              <button
                type="button"
                onClick={open}
                className="pressable h-11 rounded-full px-5 text-sm font-semibold text-fg-2 hover:bg-white/[0.05] hover:text-fg"
              >
                Reset demo data
              </button>
            )}
          </ResetDemo>
        </Reveal>
      </div>
    </main>
  );
}

function StripStat({
  label,
  value,
  className,
  trailing,
}: {
  label: string;
  value: number;
  className?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className={cn("flex py-5 pr-3", className)}>
      <div>
        <p className="t-eyebrow">{label}</p>
        <p className="t-num mt-2 text-[36px]">
          <CountUp value={value} />
        </p>
      </div>
      {trailing}
    </div>
  );
}
