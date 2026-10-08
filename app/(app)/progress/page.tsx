"use client";

import { Check, Flame, Lock, Play, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  bestStreak,
  buildAchievements,
  calendarWeeks,
  lastNDays,
  totalHabitChecks,
  type DayActivity,
} from "@/components/account/stats";
import { ButtonLink } from "@/components/ui/button";
import { CountUp, ProgressBar, ProgressRing } from "@/components/ui/progress";
import { Enter, Reveal } from "@/components/ui/reveal";
import { PageHeader, Pill, SectionHeader } from "@/components/ui/section";
import { PageSkeleton } from "@/components/ui/states";
import { getOrderedLessons } from "@/content/lessons";
import { DAILY_GOAL, STREAK_BONUSES, XP, todayKey, xpIntoLevel } from "@/lib/gamification";
import { useToday } from "@/lib/use-today";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function ProgressPage() {
  const t = useToday();
  const { hydrated, state, level, completedLessonIds } = t;

  const week = useMemo(() => lastNDays(state, 7), [state]);
  const weeks = useMemo(() => calendarWeeks(state, 5), [state]);
  const achievements = useMemo(() => buildAchievements(state), [state]);
  const best = useMemo(() => bestStreak(state), [state]);
  const habitChecks = useMemo(() => totalHabitChecks(state), [state]);

  if (!hydrated) {
    return (
      <main className="page-bottom min-h-dvh pt-[calc(var(--safe-top)+16px)]">
        <PageSkeleton />
      </main>
    );
  }

  const xpIn = xpIntoLevel(state.xp);
  const totalLessons = getOrderedLessons().length;
  const earned = achievements.filter((a) => a.earned).length;
  const weekMinutes = week.reduce((s, d) => s + d.minutes, 0);
  const weekActive = week.filter((d) => d.total > 0).length;
  const heatmapEmpty = weeks.flat().every((d) => d.total === 0 && !d.goalMet);
  const nextRung = STREAK_BONUSES.find(
    (b) => !state.streakRewardsClaimed.includes(b.days) && state.streakCount < b.days,
  );
  const cta = t.allDone
    ? { label: "Review today's plan", href: "/plan" }
    : { label: "Train today", href: t.primaryHref };

  return (
    <main className="page-bottom min-h-dvh">
      <div className="page-x mx-auto max-w-[1180px] pt-[calc(var(--safe-top)+18px)] lg:pt-10">
        <PageHeader
          eyebrow="Your numbers"
          title="Progress"
          description="Every workout, habit and streak you've logged — nothing estimated."
          action={
            <ButtonLink
              href={cta.href}
              size="md"
              icon={<Play size={15} fill="currentColor" aria-hidden />}
              className="hidden sm:inline-flex"
            >
              {cta.label}
            </ButtonLink>
          }
        />

        {/* Headline numbers — asymmetric */}
        <section aria-label="Totals" className="mt-8 grid grid-cols-12 gap-3">
          <Enter delay={120} className="col-span-12 md:col-span-7">
            <div className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-surface-1 p-5 sm:p-7">
              <p className="t-eyebrow">Total XP</p>
              <p className="t-num mt-3 text-[clamp(5rem,20vw,9.5rem)] leading-[0.82]">
                <CountUp value={state.xp} duration={1100} />
              </p>
              <div className="mt-auto flex items-center gap-4 pt-8">
                <ProgressRing
                  value={xpIn}
                  max={XP.LEVEL_EVERY}
                  size={64}
                  stroke={5}
                  label={`${xpIn} of ${XP.LEVEL_EVERY} XP into level ${level}`}
                >
                  <span className="t-num text-[22px]">{level}</span>
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">Level {level}</p>
                  <p className="t-micro mt-0.5 !text-[12.5px]">
                    {XP.LEVEL_EVERY - xpIn} XP to level {level + 1}
                  </p>
                  <ProgressBar
                    value={xpIn}
                    max={XP.LEVEL_EVERY}
                    className="mt-3"
                    label={`Level ${level} progress`}
                  />
                </div>
              </div>
            </div>
          </Enter>

          <Enter delay={200} className="col-span-12 md:col-span-5">
            <div className="surface-paper flex h-full flex-col p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/50">Streak</p>
                <Flame size={20} className={state.streakCount > 0 ? "text-ink" : "text-ink/30"} aria-hidden />
              </div>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="t-num text-[clamp(4.5rem,16vw,7.5rem)] leading-[0.82] text-ink">
                  <CountUp value={state.streakCount} />
                </span>
                <span className="text-[15px] font-semibold text-ink/60">
                  day{state.streakCount === 1 ? "" : "s"}
                </span>
              </p>
              <p className="mt-auto pt-8 text-[13px] font-semibold text-ink/60">
                {t.dailyGoalMet
                  ? "Today's goal is done — streak secured."
                  : state.streakCount > 0
                    ? "Hit today's goal to keep it going."
                    : "Hit today's goal to start a streak."}
                <span className="mt-1 block font-medium text-ink/45">Best: {best} days</span>
              </p>
            </div>
          </Enter>
        </section>

        {/* Stat strip */}
        <Enter delay={280}>
          <dl className="mt-3 grid grid-cols-2 border-y border-line md:grid-cols-4">
            <Stat label="Workouts" value={completedLessonIds.size} suffix={`/${totalLessons}`} className="pl-0" />
            <Stat label="Minutes trained" value={state.totalWorkoutMinutes} className="border-l border-line pl-5" />
            <Stat
              label="Habit check-ins"
              value={habitChecks}
              className="border-t border-line pl-0 md:border-l md:border-t-0 md:pl-5"
            />
            <Stat
              label="Goal days"
              value={state.trainingDaysCompleted.length}
              className="border-l border-t border-line pl-5 md:border-t-0"
            />
          </dl>
        </Enter>

        {/* Week + calendar */}
        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionHeader eyebrow="Last 7 days" title="This week" />
            <WeekBars days={week} />
            <p className="t-small mt-5">
              <span className="font-semibold text-fg">{weekActive}</span> active day{weekActive === 1 ? "" : "s"} ·{" "}
              <span className="font-semibold text-fg">{weekMinutes}</span> workout min ·{" "}
              <span className="font-semibold text-fg">{t.weekly.completedCount}</span>/{state.trainingDays ?? 4} goal days
            </p>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={80}>
            <SectionHeader eyebrow="5 weeks" title="Consistency" />
            <div className="relative">
              <Heatmap weeks={weeks} dim={heatmapEmpty} />
              {heatmapEmpty && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[var(--radius)] bg-ink/60 px-6 text-center backdrop-blur-[2px]">
                  <p className="t-heading">Nothing logged yet</p>
                  <p className="t-small mt-1.5 max-w-[30ch]">
                    Finish a workout or check in {DAILY_GOAL.HABIT_QUOTA} habits and today lights up.
                  </p>
                  <Link
                    href="/checkin"
                    className="pressable mt-4 text-[13px] font-semibold text-fg underline decoration-fg-4 underline-offset-4 hover:decoration-fg"
                  >
                    Open check-in
                  </Link>
                </div>
              )}
            </div>
            <div className="t-micro mt-4 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-accent" aria-hidden /> Goal met
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-white/25" aria-hidden /> Some activity
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-white/[0.06]" aria-hidden /> Rest
              </span>
            </div>
          </Reveal>
        </div>

        {/* Achievements */}
        <Reveal className="mt-16">
          <SectionHeader
            eyebrow="Milestones"
            title="Achievements"
            action={
              <span className="t-num pb-0.5 text-[28px]">
                {earned}
                <span className="text-fg-3">/{achievements.length}</span>
              </span>
            }
          />
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => {
              const left = a.target - a.value;
              return (
                <li key={a.id} className="flex gap-4 bg-ink p-5">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      a.earned ? "bg-accent text-accent-ink" : "border border-line-2 text-fg-3",
                    )}
                  >
                    {a.earned ? <Check size={17} strokeWidth={3} aria-hidden /> : <Lock size={15} aria-hidden />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-[15px] font-semibold", !a.earned && "text-fg-2")}>
                      {a.title}
                      <span className="sr-only">{a.earned ? " — earned" : " — locked"}</span>
                    </p>
                    <p className="t-micro mt-0.5 !text-[12.5px]">{a.requirement}</p>
                    {!a.earned && (
                      <div className="mt-3 flex items-center gap-3">
                        <ProgressBar
                          value={a.value}
                          max={a.target}
                          tone="light"
                          className="flex-1"
                          label={`${a.title} progress`}
                        />
                        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-fg-3">
                          {a.unit === "level" ? `Lv ${a.value}/${a.target}` : `${left} to go`}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* Streak ladder */}
        <Reveal className="mt-16">
          <SectionHeader eyebrow="Bonus XP" title="Streak rewards" />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STREAK_BONUSES.map((b, i) => {
              const claimed = state.streakRewardsClaimed.includes(b.days);
              const isNext = b.days === nextRung?.days;
              return (
                <li
                  key={b.days}
                  className={cn(
                    "relative flex flex-col rounded-[var(--radius)] border p-5",
                    claimed
                      ? "border-transparent bg-fg text-ink"
                      : isNext
                        ? "border-accent/40 bg-accent-soft"
                        : "border-line",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("t-eyebrow", claimed && "!text-ink/50")}>Rung {i + 1}</span>
                    {claimed ? (
                      <Trophy size={16} aria-label="Claimed" />
                    ) : isNext ? (
                      <Pill tone="accent">Next</Pill>
                    ) : (
                      <Lock size={14} className="text-fg-3" aria-label="Locked" />
                    )}
                  </div>
                  <p className="mt-5 flex items-baseline gap-1.5">
                    <span className="t-num text-[56px]">{b.days}</span>
                    <span className={cn("text-[13px] font-semibold", claimed ? "text-ink/60" : "text-fg-2")}>
                      day streak
                    </span>
                  </p>
                  <p className={cn("mt-3 flex items-center gap-1.5 text-[13px] font-semibold", claimed ? "text-ink" : "text-fg")}>
                    <Zap size={14} className={claimed ? "" : "text-accent"} aria-hidden />+{b.xp} XP
                  </p>
                  {!claimed && (
                    <div className="mt-4">
                      <ProgressBar
                        value={Math.min(state.streakCount, b.days)}
                        max={b.days}
                        tone={isNext ? "accent" : "light"}
                        label={`${b.days}-day streak progress`}
                      />
                      <p className="t-micro mt-2">
                        {Math.max(0, b.days - state.streakCount)} day{b.days - state.streakCount === 1 ? "" : "s"} to go
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </Reveal>

        {/* Mobile primary action */}
        <div className="mt-12 sm:hidden">
          <ButtonLink href={cta.href} size="lg" block icon={<Play size={16} fill="currentColor" aria-hidden />}>
            {cta.label}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  suffix,
  className,
}: {
  label: string;
  value: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={cn("py-5 pr-3", className)}>
      <dt className="t-eyebrow">{label}</dt>
      <dd className="mt-2 flex items-baseline gap-1">
        <span className="t-num text-[40px]">
          <CountUp value={value} />
        </span>
        {suffix && <span className="t-num text-lg text-fg-3">{suffix}</span>}
      </dd>
    </div>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

function WeekBars({ days }: { days: DayActivity[] }) {
  const mounted = useMounted();
  const today = todayKey();
  const max = Math.max(4, ...days.map((d) => d.total));

  return (
    <ol className="flex h-56 items-end gap-2 sm:gap-3" aria-label="Activity over the last 7 days">
      {days.map((d, i) => {
        const pct = d.total === 0 ? 0 : Math.max(10, (d.total / max) * 100);
        const isToday = d.date === today;
        const summary = `${d.label}: ${d.total} activit${d.total === 1 ? "y" : "ies"}${d.goalMet ? ", daily goal met" : ""}`;
        return (
          <li key={d.date} className="flex h-full flex-1 flex-col items-center gap-2" aria-label={summary}>
            <span className={cn("text-[12px] font-semibold tabular-nums", d.total ? "text-fg" : "text-fg-4")}>
              {d.total || "·"}
            </span>
            <div className="relative w-full flex-1 overflow-hidden rounded-[10px] bg-white/[0.04]">
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 rounded-[10px] transition-[height] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  d.goalMet ? "bg-accent" : "bg-white/25",
                )}
                style={{ height: mounted ? `${pct}%` : "0%", transitionDelay: `${i * 70}ms` }}
              />
              {isToday && d.total === 0 && (
                <div className="absolute inset-0 rounded-[10px] border border-dashed border-white/25" />
              )}
            </div>
            <span className={cn("text-[11px] font-semibold", isToday ? "text-fg" : "text-fg-3")}>
              {isToday ? "Today" : d.label.slice(0, 2)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Heatmap({ weeks, dim }: { weeks: DayActivity[][]; dim: boolean }) {
  const mounted = useMounted();
  const today = todayKey();

  return (
    <div className={cn("transition-opacity", dim && "opacity-60")}>
      <div className="grid grid-cols-7 gap-1.5" aria-hidden>
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="t-micro text-center font-semibold">
            {d}
          </span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5" role="list" aria-label="Daily activity, last 5 weeks">
        {weeks.flat().map((d, i) => (
          <span
            key={d.date}
            role="listitem"
            aria-label={
              d.future
                ? `${d.date}: upcoming`
                : `${d.date}: ${d.goalMet ? "goal met" : d.total ? `${d.total} activities` : "no activity"}`
            }
            className={cn(
              "aspect-square rounded-[6px] transition-[opacity,transform] duration-500",
              d.future
                ? "border border-line"
                : d.goalMet
                  ? "bg-accent"
                  : d.total > 0
                    ? "bg-white/25"
                    : "bg-white/[0.06]",
              d.date === today && "ring-2 ring-fg ring-offset-2 ring-offset-ink",
              mounted ? "scale-100 opacity-100" : "scale-75 opacity-0",
            )}
            style={{ transitionDelay: `${i * 12}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
