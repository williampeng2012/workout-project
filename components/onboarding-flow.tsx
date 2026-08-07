"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAILY_GOAL } from "@/lib/gamification";
import { usePulse, type PulseState } from "@/lib/store/pulse-store";

const GOALS: Array<{ id: PulseState["goal"]; label: string; blurb: string }> = [
  { id: "fat_loss", label: "Fat loss", blurb: "Move daily, stay consistent" },
  { id: "muscle", label: "Build muscle", blurb: "Strength through short sets" },
  { id: "maintain", label: "Stay sharp", blurb: "Keep the habit alive" },
];

const HABIT_OPTIONS = [
  "Drink water",
  "Stretch 5 min",
  "Walk 10 min",
  "Sleep by 11",
  "No late snacks",
  "Stand up hourly",
];

export function OnboardingFlow() {
  const router = useRouter();
  const { completeOnboarding } = usePulse();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<PulseState["goal"]>("maintain");
  const [days, setDays] = useState(4);
  const [habits, setHabits] = useState<string[]>([
    "Drink water",
    "Stretch 5 min",
  ]);

  function toggleHabit(name: string) {
    setHabits((prev) =>
      prev.includes(name)
        ? prev.filter((h) => h !== name)
        : prev.length >= 4
          ? prev
          : [...prev, name],
    );
  }

  function finish() {
    if (!goal || habits.length === 0) return;
    completeOnboarding({
      goal,
      trainingDays: days,
      habitNames: habits,
    });
    router.push("/home");
  }

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-lg flex-col px-5 py-10">
      <p className="text-xs uppercase tracking-[0.25em] text-fg-dim">
        Step {step + 1} of 3
      </p>

      {step === 0 && (
        <div className="animate-fade-up mt-8">
          <h1 className="font-display text-4xl font-bold">What&apos;s the aim?</h1>
          <p className="mt-3 text-fg-muted">Pick one focus. You can change later.</p>
          <ul className="mt-10 space-y-3">
            {GOALS.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`flex w-full flex-col items-start rounded-2xl border px-5 py-4 text-left transition-colors ${
                    goal === g.id
                      ? "border-fg bg-fg text-bg"
                      : "border-border bg-bg-elevated hover:border-fg-muted"
                  }`}
                >
                  <span className="font-display text-lg font-semibold">{g.label}</span>
                  <span
                    className={`mt-1 text-sm ${
                      goal === g.id ? "text-bg/70" : "text-fg-muted"
                    }`}
                  >
                    {g.blurb}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-up mt-8">
          <h1 className="font-display text-4xl font-bold">Training days</h1>
          <p className="mt-3 text-fg-muted">
            How many days a week do you want on the path?
          </p>
          <div className="mt-12 flex items-center justify-center gap-6">
            <button
              type="button"
              aria-label="Fewer days"
              onClick={() => setDays((d) => Math.max(2, d - 1))}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-xl"
            >
              −
            </button>
            <span className="font-display text-6xl font-bold tabular-nums">{days}</span>
            <button
              type="button"
              aria-label="More days"
              onClick={() => setDays((d) => Math.min(7, d + 1))}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-xl"
            >
              +
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-fg-muted">days / week</p>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-up mt-8">
          <h1 className="font-display text-4xl font-bold">Daily habits</h1>
          <p className="mt-3 text-fg-muted">
            Check {DAILY_GOAL.HABIT_QUOTA} habits or finish 1 lesson to keep your
            streak.
          </p>
          <ul className="mt-8 space-y-2">
            {HABIT_OPTIONS.map((name) => {
              const on = habits.includes(name);
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => toggleHabit(name)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm ${
                      on
                        ? "border-fg bg-fg text-bg"
                        : "border-border text-fg-muted"
                    }`}
                  >
                    {name}
                    <span>{on ? "✓" : "+"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-auto flex gap-3 pt-10">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-2xl border border-border px-5 py-4 text-sm"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (step < 2) setStep((s) => s + 1);
            else finish();
          }}
          disabled={step === 2 && habits.length === 0}
          className="flex-1 rounded-2xl bg-fg px-5 py-4 text-sm font-semibold text-bg disabled:opacity-40"
        >
          {step === 2 ? "Start training" : "Continue"}
        </button>
      </div>
    </div>
  );
}
