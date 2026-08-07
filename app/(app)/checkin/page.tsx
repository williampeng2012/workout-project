"use client";

import { BottomNav } from "@/components/bottom-nav";
import { DAILY_GOAL, XP } from "@/lib/gamification";
import { usePulse } from "@/lib/store/pulse-store";

export default function CheckinPage() {
  const { hydrated, state, habitsCheckedToday, toggleHabitToday } = usePulse();

  const day = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  return (
    <>
      <main className="px-5 pb-8 pt-10">
        <p className="text-xs uppercase tracking-[0.25em] text-fg-dim">
          Check-in
        </p>
        <h1 className="font-display mt-1 text-3xl font-bold">Daily habits</h1>
        <p className="mt-2 text-sm text-fg-muted">
          +{XP.HABIT_CHECKIN} XP each · cap {XP.HABIT_DAILY_CAP} XP/day · need{" "}
          {DAILY_GOAL.HABIT_QUOTA} for streak without a lesson
        </p>
        <p className="mt-4 text-sm">
          Today:{" "}
          <span className="font-semibold">
            {habitsCheckedToday}/{state.habits.length}
          </span>
        </p>

        {!hydrated ? (
          <div className="mt-8 h-40 animate-pulse rounded-2xl bg-bg-elevated" />
        ) : (
          <ul className="mt-8 space-y-2">
            {state.habits.map((habit) => {
              const checked = (state.habitLogs[habit.id] ?? []).includes(day);
              return (
                <li key={habit.id}>
                  <button
                    type="button"
                    onClick={() => toggleHabitToday(habit.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors ${
                      checked
                        ? "border-fg bg-fg text-bg"
                        : "border-border bg-bg-elevated hover:border-fg-muted"
                    }`}
                  >
                    <span className="font-medium">{habit.name}</span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm ${
                        checked ? "border-bg bg-bg text-fg" : "border-fg-dim"
                      }`}
                    >
                      {checked ? "✓" : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <BottomNav active="/checkin" />
    </>
  );
}
