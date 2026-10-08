"use client";

import {
  ArrowUpRight,
  BellOff,
  BellRing,
  CalendarClock,
  Flame,
  ListChecks,
  Settings2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { SectionIntro } from "@/components/account/ui";
import { resolveNotifyItem } from "@/components/account/stats";
import { IconLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { ProgressRing } from "@/components/ui/progress";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill } from "@/components/ui/section";
import { EmptyState, PageSkeleton } from "@/components/ui/states";
import { TopBar } from "@/components/ui/top-bar";
import { getClassImage } from "@/content/catalog";
import { formatClassTime, getUpcomingLiveClass } from "@/content/classes";
import { DAILY_GOAL, todayKey } from "@/lib/gamification";
import { todayLabel, useToday } from "@/lib/use-today";
import { cn } from "@/lib/cn";

type Item = {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  urgent?: boolean;
  trailing?: ReactNode;
};

export default function NotificationsPage() {
  const t = useToday();
  const { hydrated, state } = t;
  const live = getUpcomingLiveClass();
  const watching = useMemo(() => state.notifyRequests.map(resolveNotifyItem), [state.notifyRequests]);

  if (!hydrated) {
    return (
      <main className="page-bottom min-h-dvh">
        <TopBar title="Notifications" fallback="/home" />
        <PageSkeleton />
      </main>
    );
  }

  const day = todayKey();
  const habitsLeft = state.habits.filter((h) => !(state.habitLogs[h.id] ?? []).includes(day));
  const today: Item[] = [];

  if (state.streakCount > 0 && !t.dailyGoalMet) {
    today.push({
      id: "streak-risk",
      icon: Flame,
      eyebrow: "Streak",
      title: `Your ${state.streakCount}-day streak is on the line`,
      body: `Finish one workout or check in ${DAILY_GOAL.HABIT_QUOTA} habits before midnight to keep it.`,
      href: t.primaryHref,
      urgent: true,
    });
  } else if (t.dailyGoalMet) {
    today.push({
      id: "streak-safe",
      icon: Flame,
      eyebrow: "Streak",
      title: `Streak secured · ${state.streakCount} day${state.streakCount === 1 ? "" : "s"}`,
      body: t.nextStreakBonus
        ? `${t.nextStreakBonus.daysLeft} more day${t.nextStreakBonus.daysLeft === 1 ? "" : "s"} to a +${t.nextStreakBonus.rewardXp} XP streak reward.`
        : "Every streak reward is claimed. Keep the run going.",
      href: "/progress",
    });
  } else {
    today.push({
      id: "streak-start",
      icon: Flame,
      eyebrow: "Streak",
      title: "Start a streak today",
      body: `One workout or ${DAILY_GOAL.HABIT_QUOTA} habit check-ins counts as day one.`,
      href: t.primaryHref,
    });
  }

  today.push({
    id: "plan",
    icon: ListChecks,
    eyebrow: "Today's plan",
    title: t.allDone
      ? "Plan complete — nice work"
      : t.completed === 0
        ? `${t.plan.tasks.length} tasks · ${t.plan.totalMinutes} min ready for you`
        : `${t.completed} of ${t.plan.tasks.length} tasks done`,
    body: t.allDone ? "Review what you did or rest up for tomorrow." : `Up next: ${t.nextTask?.title ?? "your plan"}.`,
    href: "/plan",
    trailing: (
      <ProgressRing value={t.progress} size={40} stroke={3.5} label={`Plan ${t.progress}% complete`}>
        <span className="text-[10px] font-bold tabular-nums">{t.progress}%</span>
      </ProgressRing>
    ),
  });

  if (habitsLeft.length > 0) {
    today.push({
      id: "habits",
      icon: BellRing,
      eyebrow: "Habits",
      title: `${habitsLeft.length} habit${habitsLeft.length === 1 ? "" : "s"} left today`,
      body: habitsLeft
        .slice(0, 3)
        .map((h) => h.name)
        .join(" · ") + (habitsLeft.length > 3 ? ` +${habitsLeft.length - 3}` : ""),
      href: "/checkin",
    });
  }

  const nothing = today.length === 0 && !live && watching.length === 0;

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar
        title="Notifications"
        fallback="/home"
        actions={
          <IconLink href="/settings/notifications" label="Notification settings" variant="plain">
            <Settings2 size={18} aria-hidden />
          </IconLink>
        }
      />
      <div className="page-x mx-auto max-w-[1180px]">
        <SectionIntro eyebrow={todayLabel()} title="Notifications" />

        {nothing ? (
          <EmptyState
            icon={<BellOff size={20} aria-hidden />}
            title="You're all caught up"
            description="Nothing needs your attention right now."
            action={{ label: "Notification settings", href: "/settings/notifications" }}
          />
        ) : (
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <h2 className="t-eyebrow enter-soft mb-3" style={{ ["--d" as string]: "160ms" }}>
                Today
              </h2>
              <ul className="border-t border-line">
                {today.map((item, i) => (
                  <Enter as="li" key={item.id} delay={200 + i * 70} variant="enter-soft" className="border-b border-line">
                    <ItemRow item={item} />
                  </Enter>
                ))}
              </ul>
            </div>

            <div className="space-y-12 lg:col-span-5">
              {live && (
                <Reveal>
                  <h2 className="t-eyebrow mb-3">Coming up live</h2>
                  <Link
                    href={`/classes/${live.id}`}
                    transitionTypes={["nav-forward"]}
                    className="group pressable relative block overflow-hidden rounded-[var(--radius-lg)] bg-surface-1"
                  >
                    <Media src={getClassImage(live)} alt="" zoom sizes="(min-width:1024px) 440px, 100vw" className="aspect-[16/10]" />
                    <div className="scrim-bottom absolute inset-0" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                        <span className="live-dot" aria-hidden /> {formatClassTime(live.scheduledAt)}
                      </p>
                      <p className="mt-2 font-display text-[1.7rem] font-extrabold uppercase leading-[0.92] [font-stretch:78%]">
                        {live.title}
                      </p>
                      <p className="t-small mt-1.5">
                        {live.trainer} · {live.duration} min
                        {state.notifyRequests.includes(live.id) ? " · Reminder requested" : ""}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              )}

              <Reveal delay={60}>
                <h2 className="t-eyebrow mb-3">You asked us to tell you</h2>
                {watching.length === 0 ? (
                  <p className="t-small border-y border-line py-5">
                    Tap <span className="font-semibold text-fg">Notify me</span> on any coming-soon program, course or
                    class and it shows up here.
                  </p>
                ) : (
                  <ul className="divide-y divide-line border-y border-line">
                    {watching.map((w) => (
                      <li key={w.id}>
                        <Link href={w.href} className="group flex items-center gap-3 py-4">
                          <Sparkles size={16} className="shrink-0 text-accent" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-semibold">{w.title}</span>
                            <span className="t-micro">{w.kind} · we&apos;ll let you know when it&apos;s live</span>
                          </span>
                          <ArrowUpRight size={16} className="shrink-0 text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>

              <Reveal delay={100}>
                <Link
                  href="/settings/notifications"
                  className="group flex items-center gap-3 rounded-[var(--radius)] border border-line p-4 hover:border-line-2"
                >
                  <CalendarClock size={18} className="shrink-0 text-fg-2" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold">Reminder preferences</span>
                    <span className="t-micro">Saved on this device · push &amp; email coming soon</span>
                  </span>
                  <Pill tone="outline">
                    {[state.preferences.workoutReminders, state.preferences.classReminders, state.preferences.weeklyRecap].filter(Boolean).length} on
                  </Pill>
                </Link>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ItemRow({ item }: { item: Item }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="group flex items-start gap-4 py-5 transition-colors">
      <span
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          item.urgent ? "bg-accent text-accent-ink" : "bg-white/[0.06] text-fg-2",
        )}
      >
        <Icon size={17} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="t-eyebrow block">{item.eyebrow}</span>
        <span className="mt-1.5 block text-[16px] font-semibold leading-snug group-hover:underline group-hover:decoration-fg-4 group-hover:underline-offset-4">
          {item.title}
        </span>
        <span className="t-small mt-1 block">{item.body}</span>
      </span>
      {item.trailing ?? (
        <ArrowUpRight
          size={16}
          className="mt-1 shrink-0 text-fg-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
          aria-hidden
        />
      )}
    </Link>
  );
}
