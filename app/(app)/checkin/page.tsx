"use client";

import { Check, Flame, Plus, Trash2, Zap } from "lucide-react";
import { useCallback, useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { Enter, Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section";
import { Sheet } from "@/components/ui/sheet";
import { EmptyState, PageSkeleton } from "@/components/ui/states";
import { TopBar } from "@/components/ui/top-bar";
import { useToast } from "@/components/ui/toast";
import { DAILY_GOAL, XP, todayKey } from "@/lib/gamification";
import { usePulse, type LocalHabit } from "@/lib/store/pulse-store";
import { todayLabel } from "@/lib/use-today";
import { cn } from "@/lib/cn";

const SUGGESTIONS = [
  "Drink water",
  "Stretch 5 min",
  "Walk 10 min",
  "Sleep by 11",
  "No late snacks",
  "Stand up hourly",
];

const MAX_NAME = 32;

function currentRun(dates: string[], today: string): number {
  const set = new Set(dates);
  const d = new Date();
  if (!set.has(today)) d.setDate(d.getDate() - 1);
  let run = 0;
  while (set.has(todayKey(d))) {
    run += 1;
    d.setDate(d.getDate() - 1);
  }
  return run;
}

export default function CheckinPage() {
  const {
    hydrated,
    state,
    habitsCheckedToday,
    lessonsCompletedToday,
    dailyGoalMet,
    toggleHabitToday,
    addHabit,
    removeHabit,
  } = usePulse();
  const toast = useToast();
  const [pendingRemove, setPendingRemove] = useState<LocalHabit | null>(null);
  const closeRemove = useCallback(() => setPendingRemove(null), []);

  if (!hydrated) {
    return (
      <main className="page-bottom min-h-dvh">
        <TopBar title="Check-in" fallback="/home" />
        <PageSkeleton />
      </main>
    );
  }

  const today = todayKey();
  const quota = DAILY_GOAL.HABIT_QUOTA;
  const habitXp = Math.min(habitsCheckedToday * XP.HABIT_CHECKIN, XP.HABIT_DAILY_CAP);
  const ringValue = dailyGoalMet ? quota : Math.min(habitsCheckedToday, quota);

  function toggle(h: LocalHabit) {
    const r = toggleHabitToday(h.id);
    if (!r.checked) {
      toast(`${h.name} unchecked`, "info");
      return;
    }
    if (!dailyGoalMet && habitsCheckedToday + 1 >= quota) {
      toast(`Daily goal done — streak secured${r.xpDelta ? ` · +${r.xpDelta} XP` : ""}`);
    } else {
      toast(r.xpDelta ? `${h.name} · +${r.xpDelta} XP` : `${h.name} checked · habit XP maxed today`);
    }
  }

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title="Check-in" fallback="/home" />

      <div className="page-x mx-auto max-w-[1180px]">
        {/* Daily goal */}
        <section className="grid items-end gap-8 pb-10 pt-4 md:grid-cols-12 lg:pt-8">
          <div className="md:col-span-7">
            <Enter variant="enter-soft">
              <p className="t-eyebrow">{todayLabel()}</p>
            </Enter>
            <Enter delay={60}>
              <h1 className="t-display mt-3 max-w-[10ch]">Daily check-in</h1>
            </Enter>
            <Enter delay={140} variant="enter-soft">
              <p className="t-body mt-4 max-w-[44ch]">
                Check in {quota} habits — or finish one workout — to secure today&apos;s streak. Each check-in is +
                {XP.HABIT_CHECKIN} XP, up to {XP.HABIT_DAILY_CAP} XP a day.
              </p>
            </Enter>
          </div>

          <Enter delay={200} variant="enter-focus" className="md:col-span-5 md:justify-self-end">
            <div className="flex items-center gap-6">
              <ProgressRing
                value={ringValue}
                max={quota}
                size={168}
                stroke={10}
                label={dailyGoalMet ? "Daily goal complete" : `${habitsCheckedToday} of ${quota} habits checked`}
              >
                {dailyGoalMet ? (
                  <span key="done" className="animate-pop flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink">
                    <Check size={30} strokeWidth={3} aria-hidden />
                  </span>
                ) : (
                  <span className="flex items-baseline">
                    <span key={habitsCheckedToday} className="t-num animate-pop text-[64px]">
                      {habitsCheckedToday}
                    </span>
                    <span className="t-num text-2xl text-fg-3">/{quota}</span>
                  </span>
                )}
              </ProgressRing>
              <div className="min-w-0">
                <p className="t-eyebrow">Daily goal</p>
                <p className="mt-2 text-[17px] font-semibold leading-snug">
                  {dailyGoalMet
                    ? lessonsCompletedToday > 0 && habitsCheckedToday < quota
                      ? "Done via workout"
                      : "Streak secured"
                    : `${quota - habitsCheckedToday} to go`}
                </p>
                <p className="t-micro mt-1 flex items-center gap-1.5">
                  <Flame size={12} className={state.streakCount > 0 ? "text-accent" : ""} aria-hidden />
                  {state.streakCount}-day streak
                </p>
              </div>
            </div>
          </Enter>
        </section>

        <Enter delay={260} variant="enter-soft">
          <div className="flex items-center gap-4 border-y border-line py-4">
            <Zap size={16} className="shrink-0 text-accent" aria-hidden />
            <span className="shrink-0 text-[13px] font-semibold">Habit XP today</span>
            <ProgressBar value={habitXp} max={XP.HABIT_DAILY_CAP} className="flex-1" label="Habit XP earned today" />
            <span className="shrink-0 text-[13px] font-semibold tabular-nums text-fg-2">
              {habitXp}/{XP.HABIT_DAILY_CAP}
            </span>
          </div>
        </Enter>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Habit list */}
          <section className="lg:col-span-7" aria-labelledby="habits-title">
            <div className="mb-4 flex items-end justify-between">
              <h2 id="habits-title" className="t-title">
                Your habits
              </h2>
              <span className="text-[13px] font-semibold tabular-nums text-fg-3">
                {habitsCheckedToday}/{state.habits.length} today
              </span>
            </div>

            {state.habits.length === 0 ? (
              <EmptyState
                icon={<Plus size={20} aria-hidden />}
                title="No habits yet"
                description="Add one below — small, daily and easy to say yes to works best."
              />
            ) : (
              <ul className="space-y-2">
                {state.habits.map((h, i) => {
                  const dates = state.habitLogs[h.id] ?? [];
                  const on = dates.includes(today);
                  const run = currentRun(dates, today);
                  return (
                    <Enter as="li" key={h.id} delay={300 + i * 60} variant="enter-soft">
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-[var(--radius)] border p-2 transition-colors duration-300",
                          on ? "border-fg bg-fg text-ink" : "border-line bg-surface-1 hover:border-line-2",
                        )}
                      >
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(h)}
                          className="pressable flex min-w-0 flex-1 items-center gap-4 rounded-[10px] p-2 text-left"
                        >
                          <span
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                              on ? "border-ink bg-ink text-accent" : "border-line-2 text-fg-3",
                            )}
                          >
                            {on ? (
                              <Check key="on" size={18} strokeWidth={3} className="animate-pop" aria-hidden />
                            ) : (
                              <Plus size={18} aria-hidden />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[16px] font-semibold">{h.name}</span>
                            <span className={cn("mt-0.5 block text-[12px] font-medium", on ? "text-ink/55" : "text-fg-3")}>
                              {run > 0 ? `${run}-day run` : "Not started"} · {dates.length} total
                            </span>
                          </span>
                          <span className={cn("hidden shrink-0 text-[12px] font-semibold sm:block", on ? "text-ink/60" : "text-fg-3")}>
                            {on ? "Done" : `+${XP.HABIT_CHECKIN} XP`}
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${h.name}`}
                          title={`Remove ${h.name}`}
                          onClick={() => setPendingRemove(h)}
                          className={cn(
                            "pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            on ? "text-ink/45 hover:bg-ink/10 hover:text-ink" : "text-fg-3 hover:bg-white/[0.06] hover:text-fg",
                          )}
                        >
                          <Trash2 size={16} aria-hidden />
                        </button>
                      </div>
                    </Enter>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Add habit */}
          <Reveal className="lg:col-span-5">
            <SectionHeader eyebrow="Build a routine" title="Add a habit" />
            <AddHabitForm
              existing={state.habits.map((h) => h.name)}
              onAdd={(name) => {
                addHabit(name);
                toast(`${name.trim()} added`);
              }}
            />
          </Reveal>
        </div>
      </div>

      <Sheet
        open={pendingRemove !== null}
        onClose={closeRemove}
        title={pendingRemove ? `Remove “${pendingRemove.name}”?` : "Remove habit?"}
        description="Its check-in history is deleted. XP you've already earned stays."
      >
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeRemove}>
            Keep habit
          </Button>
          <Button
            variant="light"
            icon={<Trash2 size={16} aria-hidden />}
            onClick={() => {
              if (!pendingRemove) return;
              removeHabit(pendingRemove.id);
              toast(`${pendingRemove.name} removed`, "info");
              setPendingRemove(null);
            }}
          >
            Remove
          </Button>
        </div>
      </Sheet>
    </main>
  );
}

function AddHabitForm({ existing, onAdd }: { existing: string[]; onAdd: (name: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const taken = new Set(existing.map((n) => n.toLowerCase()));
  const suggestions = SUGGESTIONS.filter((s) => !taken.has(s.toLowerCase()));

  function validate(v: string): string | null {
    const clean = v.trim();
    if (!clean) return "Give your habit a name.";
    if (clean.length > MAX_NAME) return `Keep it under ${MAX_NAME} characters.`;
    if (taken.has(clean.toLowerCase())) return "You already track that one.";
    return null;
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const err = validate(value);
    setError(err);
    if (err) return;
    onAdd(value);
    setValue("");
  }

  return (
    <div>
      <form onSubmit={submit} noValidate className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="sr-only">
            Habit name
          </label>
          <input
            id={inputId}
            value={value}
            maxLength={MAX_NAME + 8}
            placeholder="e.g. 10 push-ups"
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : `${inputId}-hint`}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            className={cn(
              "h-12 w-full rounded-full border bg-white/[0.03] px-5 text-[15px] text-fg outline-none transition-[border-color,background-color] duration-200 placeholder:text-fg-4 focus:border-white/40 focus:bg-white/[0.05]",
              error ? "border-[#ff8a7a]/70" : "border-line-2",
            )}
          />
        </div>
        <Button type="submit" size="md" variant="light" icon={<Plus size={16} aria-hidden />} className="h-12">
          Add
        </Button>
      </form>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="enter-soft mt-2 px-2 text-[13px] text-[#ffb4a8]">
          {error}
        </p>
      ) : (
        <p id={`${inputId}-hint`} className="t-micro mt-2 px-2">
          {value.trim().length}/{MAX_NAME} characters
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="mt-6">
          <p className="t-eyebrow mb-3">Quick add</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onAdd(s)}
                className="pressable flex h-9 items-center gap-1.5 rounded-full border border-line-2 pl-3 pr-4 text-[13px] font-semibold text-fg-2 hover:border-white/30 hover:text-fg"
              >
                <Plus size={13} aria-hidden /> {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
