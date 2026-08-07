"use client";

import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { StreakFlame } from "@/components/streak-flame";
import { XpBar } from "@/components/xp-bar";
import { STREAK_BONUSES } from "@/lib/gamification";
import { usePulse } from "@/lib/store/pulse-store";

export default function ProfilePage() {
  const { hydrated, state, level, completedLessonIds, resetDemo } = usePulse();

  const goalLabel =
    state.goal === "fat_loss"
      ? "Fat loss"
      : state.goal === "muscle"
        ? "Build muscle"
        : state.goal === "maintain"
          ? "Stay sharp"
          : "—";

  return (
    <>
      <main className="px-5 pb-8 pt-10">
        <p className="text-xs uppercase tracking-[0.25em] text-fg-dim">You</p>
        <h1 className="font-display mt-1 text-3xl font-bold">Profile</h1>

        {!hydrated ? (
          <div className="mt-8 h-40 animate-pulse rounded-2xl bg-bg-elevated" />
        ) : (
          <div className="mt-8 space-y-8">
            <StreakFlame count={state.streakCount} size="lg" />
            <XpBar xp={state.xp} level={level} />

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-border bg-bg-elevated px-4 py-3">
                <dt className="text-xs text-fg-muted">Total XP</dt>
                <dd className="font-display mt-1 text-2xl font-bold">{state.xp}</dd>
              </div>
              <div className="rounded-2xl border border-border bg-bg-elevated px-4 py-3">
                <dt className="text-xs text-fg-muted">Lessons done</dt>
                <dd className="font-display mt-1 text-2xl font-bold">
                  {completedLessonIds.size}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-bg-elevated px-4 py-3">
                <dt className="text-xs text-fg-muted">Goal</dt>
                <dd className="mt-1 font-medium">{goalLabel}</dd>
              </div>
              <div className="rounded-2xl border border-border bg-bg-elevated px-4 py-3">
                <dt className="text-xs text-fg-muted">Training days</dt>
                <dd className="mt-1 font-medium">
                  {state.trainingDays ?? "—"} / week
                </dd>
              </div>
            </dl>

            <section>
              <h2 className="font-display text-lg font-semibold">
                Streak rewards
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {STREAK_BONUSES.map((b) => {
                  const claimed = state.streakRewardsClaimed.includes(b.days);
                  return (
                    <li
                      key={b.days}
                      className={`flex justify-between rounded-xl border px-4 py-3 ${
                        claimed
                          ? "border-fg bg-fg text-bg"
                          : "border-border text-fg-muted"
                      }`}
                    >
                      <span>{b.days}-day streak</span>
                      <span>+{b.xp} XP {claimed ? "✓" : ""}</span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <div className="space-y-3 border-t border-border pt-6">
              {!state.onboardingDone && (
                <Link
                  href="/onboarding"
                  className="block rounded-2xl bg-fg py-3.5 text-center text-sm font-semibold text-bg"
                >
                  Complete onboarding
                </Link>
              )}
              <Link
                href="/sign-in"
                className="block rounded-2xl border border-border py-3.5 text-center text-sm text-fg-muted hover:text-fg"
              >
                Sign in / sync (Supabase)
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      "Reset all local demo progress on this device?",
                    )
                  ) {
                    resetDemo();
                  }
                }}
                className="w-full rounded-2xl border border-border py-3.5 text-sm text-fg-dim hover:text-fg"
              >
                Reset local demo
              </button>
            </div>
          </div>
        )}
      </main>
      <BottomNav active="/profile" />
    </>
  );
}
