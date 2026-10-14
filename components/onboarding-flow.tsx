"use client";

import { ArrowRight, Check, ChevronLeft, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { IMAGES } from "@/content/catalog";
import { track } from "@/lib/analytics";
import { DAILY_GOAL } from "@/lib/gamification";
import { LEVEL_OPTIONS, lessonOrderFor, personalizeLesson, type FitnessLevel } from "@/lib/training";
import { usePulse, type PulseState } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";

type Goal = NonNullable<PulseState["goal"]>;

const GOALS: Array<{ id: Goal; label: string; blurb: string; image: string }> = [
  { id: "fat_loss", label: "Lose fat", blurb: "Move daily, burn more, stay consistent", image: IMAGES.hiit },
  { id: "muscle", label: "Build muscle", blurb: "Strength through short, dense sets", image: IMAGES.strength },
  { id: "maintain", label: "Stay sharp", blurb: "Mobility, energy and a habit that lasts", image: IMAGES.mobility },
];

const HABIT_OPTIONS = [
  "Drink water",
  "Stretch 5 min",
  "Walk 10 min",
  "Sleep by 11",
  "No late snacks",
  "Stand up hourly",
];

const MAX_HABITS = 4;
const STEPS = ["You", "Goal", "Level", "Schedule", "Habits"] as const;
const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

function spreadDays(n: number): boolean[] {
  const on = Array(7).fill(false) as boolean[];
  for (let i = 0; i < n; i++) on[Math.floor((i * 7) / n)] = true;
  return on;
}

export function OnboardingFlow() {
  const router = useRouter();
  const { hydrated, state, completeOnboarding, updateProfile } = usePulse();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [level, setLevel] = useState<FitnessLevel>("beginner");
  const [days, setDays] = useState(4);
  const [habits, setHabits] = useState<string[]>(["Drink water", "Stretch 5 min"]);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (hydrated && state.onboardingDone && !finishing) router.replace("/home");
  }, [hydrated, state.onboardingDone, finishing, router]);

  function toggleHabit(habit: string) {
    setHabits((prev) =>
      prev.includes(habit)
        ? prev.filter((h) => h !== habit)
        : prev.length >= MAX_HABITS
          ? prev
          : [...prev, habit],
    );
  }

  function finish() {
    if (habits.length === 0) return;
    setFinishing(true);
    completeOnboarding({ goal, fitnessLevel: level, trainingDays: days, habitNames: habits });
    if (name.trim()) updateProfile({ displayName: name.trim() });
    track("Onboarding Completed", {
      goal,
      fitness_level: level,
      training_days: days,
      habits,
      habit_count: habits.length,
      gave_name: !!name.trim(),
    });
    router.push("/home");
  }

  const last = step === STEPS.length - 1;
  const canContinue = !last || habits.length > 0;
  const image = step >= 1 && step <= 3 ? GOALS.find((g) => g.id === goal)!.image : step === 4 ? IMAGES.recovery : IMAGES.home;
  const firstLesson = lessonOrderFor({ goal, level })[0];
  const preview = firstLesson ? { title: firstLesson.title, ...personalizeLesson(firstLesson, { goal, level }) } : null;

  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Visual (desktop) */}
      <aside className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
        {[IMAGES.home, ...GOALS.map((g) => g.image), IMAGES.recovery].map((src) => (
          <Media
            key={src}
            src={src}
            alt=""
            sizes="50vw"
            className={cn(
              "absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              src === image ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-ink/30" />
        <Link href="/" className="absolute left-10 top-10 flex items-center gap-2.5" aria-label="Pulsepath — home">
          <Logo />
          <span className="font-display text-[19px] font-extrabold uppercase tracking-tight [font-stretch:80%]">
            Pulsepath
          </span>
        </Link>
        <p className="t-hero absolute bottom-12 left-10 max-w-[8ch]">Your plan, built in a minute.</p>
      </aside>

      {/* Flow */}
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-10 bg-ink/85 px-5 pb-4 pt-[calc(var(--safe-top)+14px)] backdrop-blur-xl md:px-10 lg:pt-10">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                aria-label="Previous step"
                className="pressable -ml-2 flex h-10 w-10 items-center justify-center rounded-full text-fg-2 hover:bg-white/[0.06] hover:text-fg"
              >
                <ChevronLeft size={22} aria-hidden />
              </button>
            ) : (
              <Link
                href="/"
                aria-label="Exit setup"
                className="pressable -ml-2 flex h-10 w-10 items-center justify-center rounded-full text-fg-2 hover:bg-white/[0.06] hover:text-fg"
              >
                <ChevronLeft size={22} aria-hidden />
              </Link>
            )}
            <ol className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
              {STEPS.map((s, i) => (
                <li key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ transform: `scaleX(${i <= step ? 1 : 0})`, transformOrigin: "left" }}
                  />
                  <span className="sr-only">
                    {s}
                    {i < step ? " — done" : i === step ? " — current" : ""}
                  </span>
                </li>
              ))}
            </ol>
            <span className="w-10 text-right text-[12px] font-semibold tabular-nums text-fg-3">
              {step + 1}/{STEPS.length}
            </span>
          </div>
        </header>

        <main className="flex-1 px-5 pb-8 md:px-10">
          <div key={step} className="mx-auto max-w-xl pt-6 lg:pt-12">
            {step === 0 && (
              <section>
                <p className="t-eyebrow enter-soft">Let&apos;s set you up</p>
                <h1 className="t-display enter mt-3" style={{ ["--d" as string]: "60ms" }}>
                  What should we call you?
                </h1>
                <p className="t-body enter-soft mt-3" style={{ ["--d" as string]: "120ms" }}>
                  Five quick questions and your first plan is ready. You can change everything later.
                </p>
                <div className="enter-soft mt-10" style={{ ["--d" as string]: "180ms" }}>
                  <label htmlFor="ob-name" className="mb-2 block text-[13px] font-semibold text-fg-2">
                    First name <span className="font-normal text-fg-4">· optional</span>
                  </label>
                  <input
                    id="ob-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setStep(1)}
                    maxLength={40}
                    autoComplete="given-name"
                    placeholder="Alex"
                    className="h-16 w-full border-b-2 border-line-2 bg-transparent font-display text-[2rem] font-bold tracking-tight text-fg outline-none placeholder:text-fg-4 focus:border-accent"
                  />
                </div>
              </section>
            )}

            {step === 1 && (
              <section>
                <p className="t-eyebrow enter-soft">Your goal</p>
                <h1 className="t-display enter mt-3" style={{ ["--d" as string]: "60ms" }}>
                  {name.trim() ? `${name.trim()}, what's the aim?` : "What's the aim?"}
                </h1>
                <p className="t-body enter-soft mt-3" style={{ ["--d" as string]: "120ms" }}>
                  We&apos;ll shape your recommendations around it.
                </p>
                <div role="radiogroup" aria-label="Goal" className="mt-8 space-y-3">
                  {GOALS.map((g, i) => {
                    const on = goal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setGoal(g.id)}
                        className={cn(
                          "enter-soft pressable group relative flex h-[112px] w-full items-end overflow-hidden rounded-[var(--radius-lg)] border text-left transition-colors",
                          on ? "border-accent" : "border-line hover:border-line-2",
                        )}
                        style={{ ["--d" as string]: `${160 + i * 60}ms` }}
                      >
                        <Media src={g.image} alt="" sizes="560px" className="absolute inset-0" imgClassName={cn("transition-[filter,transform] duration-500", on ? "scale-105" : "grayscale-[60%] brightness-75")} />
                        <div className="scrim-left absolute inset-0" />
                        <div className="relative flex w-full items-end justify-between gap-4 p-5">
                          <span>
                            <span className="block font-display text-[1.6rem] font-extrabold uppercase leading-none [font-stretch:78%]">
                              {g.label}
                            </span>
                            <span className="mt-1.5 block text-[13px] text-fg-2">{g.blurb}</span>
                          </span>
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                              on ? "border-accent bg-accent text-accent-ink" : "border-white/30",
                            )}
                            aria-hidden
                          >
                            {on && <Check size={15} strokeWidth={3} />}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <p className="t-eyebrow enter-soft">Your level</p>
                <h1 className="t-display enter mt-3" style={{ ["--d" as string]: "60ms" }}>
                  How much do you train?
                </h1>
                <p className="t-body enter-soft mt-3" style={{ ["--d" as string]: "120ms" }}>
                  We size every workout to you — reps, hold times, rest and rounds. Be honest; you can change it later.
                </p>
                <div role="radiogroup" aria-label="Fitness level" className="mt-8 space-y-3">
                  {LEVEL_OPTIONS.map((o, i) => {
                    const on = level === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setLevel(o.id)}
                        className={cn(
                          "enter-soft pressable flex w-full items-center gap-4 rounded-[var(--radius-lg)] border p-5 text-left transition-colors",
                          on ? "border-accent bg-accent/[0.06]" : "border-line hover:border-line-2",
                        )}
                        style={{ ["--d" as string]: `${160 + i * 60}ms` }}
                      >
                        <span className="flex shrink-0 items-end gap-1" aria-hidden>
                          {[0, 1, 2].map((bar) => (
                            <span
                              key={bar}
                              className={cn("w-1.5 rounded-full", bar <= i ? (on ? "bg-accent" : "bg-fg-2") : "bg-white/15")}
                              style={{ height: 10 + bar * 7 }}
                            />
                          ))}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[1.35rem] font-extrabold uppercase leading-none [font-stretch:78%]">
                            {o.label}
                          </span>
                          <span className="mt-1.5 block text-[13px] text-fg-2">{o.blurb}</span>
                        </span>
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                            on ? "border-accent bg-accent text-accent-ink" : "border-white/30",
                          )}
                          aria-hidden
                        >
                          {on && <Check size={15} strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {preview && (
                  <div className="enter-soft mt-6 rounded-[var(--radius)] border border-line bg-surface-1 p-4" style={{ ["--d" as string]: "380ms" }} aria-live="polite">
                    <p className="t-micro uppercase tracking-[0.14em]">Your first workout</p>
                    <p className="mt-1.5 text-[16px] font-semibold">{preview.title}</p>
                    <p className="t-small mt-1">
                      ~{preview.minutes} min · {preview.rounds} round{preview.rounds > 1 ? "s" : ""} · {preview.restSeconds}s rest between moves
                    </p>
                  </div>
                )}
              </section>
            )}

            {step === 3 && (
              <section>
                <p className="t-eyebrow enter-soft">Schedule</p>
                <h1 className="t-display enter mt-3" style={{ ["--d" as string]: "60ms" }}>
                  How many days a week?
                </h1>
                <p className="t-body enter-soft mt-3" style={{ ["--d" as string]: "120ms" }}>
                  Most people stick with 3–4. Habits count on the other days.
                </p>
                <div className="enter-soft mt-12 flex items-center justify-between gap-6" style={{ ["--d" as string]: "180ms" }}>
                  <button
                    type="button"
                    aria-label="Fewer days"
                    disabled={days <= 2}
                    onClick={() => setDays((d) => Math.max(2, d - 1))}
                    className="pressable flex h-14 w-14 items-center justify-center rounded-full border border-line-2 hover:border-white/30 disabled:opacity-30"
                  >
                    <Minus size={20} aria-hidden />
                  </button>
                  <p className="text-center" aria-live="polite">
                    <span key={days} className="t-num animate-pop block text-[7.5rem]">
                      {days}
                    </span>
                    <span className="t-micro">days per week</span>
                  </p>
                  <button
                    type="button"
                    aria-label="More days"
                    disabled={days >= 7}
                    onClick={() => setDays((d) => Math.min(7, d + 1))}
                    className="pressable flex h-14 w-14 items-center justify-center rounded-full border border-line-2 hover:border-white/30 disabled:opacity-30"
                  >
                    <Plus size={20} aria-hidden />
                  </button>
                </div>
                <ol className="enter-soft mt-12 grid grid-cols-7 gap-2" style={{ ["--d" as string]: "240ms" }} aria-hidden>
                  {spreadDays(days).map((on, i) => (
                    <li key={i} className="flex flex-col items-center gap-2">
                      <span
                        className={cn(
                          "h-12 w-full rounded-[10px] transition-colors duration-500",
                          on ? "bg-accent" : "bg-white/[0.05]",
                        )}
                        style={{ transitionDelay: `${i * 30}ms` }}
                      />
                      <span className="text-[11px] font-semibold text-fg-3">{WEEK[i]}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {step === 4 && (
              <section>
                <p className="t-eyebrow enter-soft">Daily habits</p>
                <h1 className="t-display enter mt-3" style={{ ["--d" as string]: "60ms" }}>
                  Small wins count.
                </h1>
                <p className="t-body enter-soft mt-3" style={{ ["--d" as string]: "120ms" }}>
                  Check {DAILY_GOAL.HABIT_QUOTA} habits or finish 1 workout to keep your streak. Pick up to {MAX_HABITS}.
                </p>
                <div className="mt-8 flex flex-wrap gap-2.5" role="group" aria-label="Habits">
                  {HABIT_OPTIONS.map((habit, i) => {
                    const on = habits.includes(habit);
                    const full = !on && habits.length >= MAX_HABITS;
                    return (
                      <button
                        key={habit}
                        type="button"
                        aria-pressed={on}
                        disabled={full}
                        onClick={() => toggleHabit(habit)}
                        className={cn(
                          "enter-soft pressable flex h-12 items-center gap-2.5 rounded-full border pl-2 pr-5 text-[14px] font-semibold disabled:opacity-35",
                          on ? "border-fg bg-fg text-ink" : "border-line-2 text-fg-2 hover:border-white/30 hover:text-fg",
                        )}
                        style={{ ["--d" as string]: `${160 + i * 40}ms` }}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            on ? "bg-ink text-accent" : "bg-white/[0.06]",
                          )}
                        >
                          {on ? <Check size={15} strokeWidth={3} aria-hidden /> : <Plus size={15} aria-hidden />}
                        </span>
                        {habit}
                      </button>
                    );
                  })}
                </div>
                <p className="t-micro mt-5" aria-live="polite">
                  {habits.length === 0
                    ? "Pick at least one habit."
                    : `${habits.length} of ${MAX_HABITS} selected · add your own later in Check-in`}
                </p>
              </section>
            )}
          </div>
        </main>

        <footer className="sticky bottom-0 bg-gradient-to-t from-ink via-ink to-ink/0 px-5 pb-[calc(var(--safe-bottom)+20px)] pt-6 md:px-10 lg:pb-10">
          <div className="mx-auto max-w-xl">
            <Button
              size="lg"
              block
              disabled={!canContinue}
              loading={finishing}
              onClick={() => (last ? finish() : setStep((s) => s + 1))}
              iconRight={!last ? <ArrowRight size={17} aria-hidden /> : undefined}
            >
              {last ? "Build my plan" : step === 0 && !name.trim() ? "Skip for now" : "Continue"}
            </Button>
            {step === 0 && (
              <p className="mt-4 text-center text-[13px] text-fg-3">
                Have an account?{" "}
                <Link href="/sign-in" className="font-semibold text-fg-2 hover:text-fg">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
