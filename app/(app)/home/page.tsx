"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { StreakFlame } from "@/components/streak-flame";
import { XpBar } from "@/components/xp-bar";
import { DAILY_GOAL } from "@/lib/gamification";
import { getLesson } from "@/content/lessons";
import { usePulse } from "@/lib/store/pulse-store";

export default function HomePage() {
  const router = useRouter();
  const {
    hydrated,
    state,
    level,
    currentLessonId,
    dailyGoalMet,
    habitsCheckedToday,
    nextStreakBonus,
    toggleHabitToday,
  } = usePulse();

  useEffect(() => {
    if (hydrated && !state.onboardingDone) {
      router.replace("/onboarding");
    }
  }, [hydrated, state.onboardingDone, router]);

  if (!hydrated) {
    return (
      <main className="px-5 py-10">
        <div className="h-40 animate-pulse rounded-2xl bg-bg-elevated" />
      </main>
    );
  }

  const current = currentLessonId ? getLesson(currentLessonId) : null;
  const todayHabits = state.habits.slice(0, 4);

  return (
    <>
      <main className="px-5 pb-8 pt-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-fg-dim">
              Today
            </p>
            <h1 className="font-display mt-1 text-3xl font-bold">Keep the pulse</h1>
          </div>
          <StreakFlame count={state.streakCount} size="sm" />
        </header>

        <section className="mt-8 space-y-4">
          <XpBar xp={state.xp} level={level} />
          <div className="flex items-center justify-between rounded-2xl border border-border bg-bg-elevated px-4 py-3">
            <div>
              <p className="text-sm font-medium">
                {dailyGoalMet ? "Daily goal done" : "Daily goal"}
              </p>
              <p className="mt-0.5 text-xs text-fg-muted">
                1 lesson or {DAILY_GOAL.HABIT_QUOTA} habits ·{" "}
                {habitsCheckedToday}/{DAILY_GOAL.HABIT_QUOTA} habits
              </p>
            </div>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                dailyGoalMet
                  ? "border-fg bg-fg text-bg"
                  : "border-fg-dim text-transparent"
              }`}
            >
              ✓
            </span>
          </div>
          {nextStreakBonus && (
            <p className="text-xs text-fg-muted">
              {nextStreakBonus.daysLeft} day
              {nextStreakBonus.daysLeft === 1 ? "" : "s"} to +
              {nextStreakBonus.rewardXp} XP streak reward
            </p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold">Continue</h2>
          {current ? (
            <Link
              href={`/lesson/${current.id}`}
              className="mt-3 flex items-center justify-between rounded-2xl border border-fg bg-fg px-5 py-5 text-bg transition-transform hover:scale-[1.01]"
            >
              <div>
                <p className="text-xs uppercase tracking-wider opacity-70">
                  Next lesson
                </p>
                <p className="font-display mt-1 text-xl font-bold">
                  {current.title}
                </p>
                <p className="mt-1 text-sm opacity-70">{current.minutes} min</p>
              </div>
              <span className="text-2xl" aria-hidden>
                →
              </span>
            </Link>
          ) : (
            <p className="mt-3 text-sm text-fg-muted">
              Path complete. Review any lesson from Path.
            </p>
          )}
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Habits</h2>
            <Link href="/checkin" className="text-xs text-fg-muted hover:text-fg">
              All
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {todayHabits.map((habit) => (
              <HabitRow
                key={habit.id}
                name={habit.name}
                habitId={habit.id}
                onToggle={toggleHabitToday}
              />
            ))}
          </ul>
        </section>
      </main>
      <BottomNav active="/home" />
    </>
  );
}

function HabitRow({
  name,
  habitId,
  onToggle,
}: {
  name: string;
  habitId: string;
  onToggle: (id: string) => void;
}) {
  const { state } = usePulse();
  const day = new Date();
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, "0");
  const d = String(day.getDate()).padStart(2, "0");
  const key = `${y}-${m}-${d}`;
  const checked = (state.habitLogs[habitId] ?? []).includes(key);

  return (
    <li>
      <button
        type="button"
        onClick={() => onToggle(habitId)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm transition-colors ${
          checked
            ? "border-fg bg-fg text-bg"
            : "border-border bg-bg-elevated hover:border-fg-muted"
        }`}
      >
        <span>{name}</span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
            checked ? "border-bg bg-bg text-fg" : "border-fg-dim"
          }`}
        >
          {checked ? "✓" : ""}
        </span>
      </button>
    </li>
  );
}
