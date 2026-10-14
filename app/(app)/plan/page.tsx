"use client";

import { ArrowRight, ArrowUpRight, Check, Clock, Play } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { CountUp, ProgressRing } from "@/components/ui/progress";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill } from "@/components/ui/section";
import { PageSkeleton } from "@/components/ui/states";
import { TopBar } from "@/components/ui/top-bar";
import { useToast } from "@/components/ui/toast";
import {
  getTaskActionLabel,
  getTaskHref,
  getTaskTypeLabel,
  type DailyTask,
} from "@/lib/daily-plan";
import { track } from "@/lib/analytics";
import { todayKey } from "@/lib/gamification";
import { todayLabel, useToday } from "@/lib/use-today";
import { cn } from "@/lib/cn";

export default function PlanPage() {
  const t = useToday();
  const toast = useToast();
  const { hydrated, state, plan, completed, nextTask, progress, allDone } = t;

  if (!hydrated) {
    return (
      <main className="page-bottom min-h-dvh pt-[calc(var(--safe-top)+16px)]">
        <PageSkeleton />
      </main>
    );
  }

  const remaining = plan.tasks
    .filter((task) => !t.isDailyTaskDone(task.id))
    .reduce((s, task) => s + task.durationMinutes, 0);

  function markDone(task: DailyTask) {
    let xp = 0;
    if (task.type === "habit" && task.habitId) {
      const checked = (state.habitLogs[task.habitId] ?? []).includes(todayKey());
      if (!checked) xp = t.toggleHabitToday(task.habitId).xpDelta;
    }
    t.completeDailyTask(task.id, task.durationMinutes);
    track("Daily Task Completed", { task_type: task.type, task: task.title, minutes: task.durationMinutes, source: "plan" });
    toast(xp ? `${task.title} · +${xp} XP` : `${task.title} marked done`);
  }

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar fallback="/home" />
      <div className="page-x mx-auto max-w-[1180px] pt-2">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="flex flex-col lg:sticky lg:top-24">
              <header className="flex items-end justify-between gap-6">
                <div className="min-w-0">
                  <Enter variant="enter-soft">
                    <p className="t-eyebrow">{todayLabel()}</p>
                  </Enter>
                  <Enter delay={60}>
                    <h1 className="t-display mt-3">
                      Today&apos;s
                      <br />
                      plan
                    </h1>
                  </Enter>
                </div>
                <Enter variant="enter-focus" delay={140} className="shrink-0">
                  <ProgressRing
                    value={progress}
                    size={112}
                    stroke={6}
                    label={`${completed} of ${plan.tasks.length} tasks complete`}
                  >
                    <span className="text-center">
                      <span className="t-num block text-[34px]">
                        <CountUp value={progress} />
                        <span className="text-[16px] text-fg-3">%</span>
                      </span>
                      <span className="t-micro block">
                        {completed}/{plan.tasks.length}
                      </span>
                    </span>
                  </ProgressRing>
                </Enter>
              </header>

              <Enter delay={260} className="order-last">
                <dl className="mt-8 grid grid-cols-3 border-y border-line py-5">
                  <div>
                    <dt className="t-micro uppercase tracking-[0.14em]">Total</dt>
                    <dd className="t-num mt-2 text-[32px]">
                      {plan.totalMinutes}
                      <span className="ml-1 text-[14px] text-fg-3">min</span>
                    </dd>
                  </div>
                  <div className="border-l border-line pl-4">
                    <dt className="t-micro uppercase tracking-[0.14em]">Left</dt>
                    <dd className="t-num mt-2 text-[32px]">
                      {remaining}
                      <span className="ml-1 text-[14px] text-fg-3">min</span>
                    </dd>
                  </div>
                  <div className="border-l border-line pl-4">
                    <dt className="t-micro uppercase tracking-[0.14em]">Tasks</dt>
                    <dd className="t-num mt-2 text-[32px]">{plan.tasks.length}</dd>
                  </div>
                </dl>
              </Enter>

              <Enter delay={200}>
                {nextTask ? (
                  <div className="mt-7">
                    <p className="t-eyebrow">Up next</p>
                    <p className="t-title mt-2">{nextTask.title}</p>
                    <p className="t-small mt-1.5">
                      {getTaskTypeLabel(nextTask.type)} · {nextTask.durationMinutes} min
                    </p>
                    <ButtonLink
                      href={getTaskHref(nextTask)}
                      size="lg"
                      block
                      className="mt-5"
                      icon={<Play size={16} fill="currentColor" aria-hidden />}
                    >
                      {getTaskActionLabel(nextTask)}
                    </ButtonLink>
                  </div>
                ) : (
                  <div className="surface-paper animate-pop mt-8 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/50">Plan complete</p>
                    <p className="mt-2 font-display text-[28px] font-extrabold uppercase leading-[0.95] [font-stretch:80%] text-ink">
                      Everything done today
                    </p>
                    <p className="mt-2 text-[13px] font-medium text-ink/60">
                      Rest up — tomorrow&apos;s plan builds on this one.
                    </p>
                    <Link
                      href="/progress"
                      className="pressable mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-fg"
                    >
                      See your progress <ArrowRight size={15} aria-hidden />
                    </Link>
                  </div>
                )}
              </Enter>
            </div>
          </div>

          {/* Tasks */}
          <Reveal className="lg:col-span-7">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="t-title">In order</h2>
              <p className="t-micro pb-0.5">{allDone ? "All complete" : `${plan.tasks.length - completed} to go`}</p>
            </div>
            <ol className="space-y-2">
              {plan.tasks.map((task, i) => {
                const done = t.isDailyTaskDone(task.id);
                const current = task.id === nextTask?.id;
                return (
                  <li key={task.id} className="flex items-stretch gap-2">
                    <Link
                      href={getTaskHref(task)}
                      transitionTypes={["nav-forward"]}
                      className={cn(
                        "group pressable flex min-w-0 flex-1 items-center gap-4 rounded-[var(--radius)] border p-4",
                        current
                          ? "border-accent/40 bg-accent-soft"
                          : "border-line bg-surface-1 hover:border-line-2 hover:bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums transition-colors duration-500",
                          done && "bg-fg text-ink",
                          current && "bg-accent text-accent-ink",
                          !done && !current && "border border-line-2 text-fg-3",
                        )}
                      >
                        {done ? (
                          <Check size={16} strokeWidth={3} aria-label="Done" />
                        ) : current ? (
                          <Play size={14} fill="currentColor" aria-hidden />
                        ) : (
                          String(i + 1).padStart(2, "0")
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="t-micro flex items-center gap-1.5 uppercase tracking-[0.12em]">
                          {getTaskTypeLabel(task.type)}
                          <span aria-hidden>·</span>
                          <Clock size={11} aria-hidden />
                          {task.durationMinutes} min
                        </p>
                        <p className={cn("mt-1 truncate text-[15px] font-semibold", done && "text-fg-2")}>{task.title}</p>
                        <p className="t-micro mt-0.5 truncate !text-[12px]">{task.description}</p>
                      </div>
                      <span className="hidden shrink-0 items-center gap-1.5 text-[12px] font-semibold text-fg-2 group-hover:text-fg sm:flex">
                        {done ? "Open again" : getTaskActionLabel(task)}
                        <ArrowUpRight
                          size={14}
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                      {current && <Pill tone="accent" className="sm:hidden">Next</Pill>}
                    </Link>
                    {!done && (
                      <button
                        type="button"
                        onClick={() => markDone(task)}
                        aria-label={`Mark ${task.title} as done`}
                        title="Mark done"
                        className="pressable flex w-12 shrink-0 items-center justify-center rounded-[var(--radius)] border border-line text-fg-3 hover:border-line-2 hover:bg-surface-2 hover:text-fg"
                      >
                        <Check size={18} aria-hidden />
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="t-micro mt-4">
              Tap a task to start it, or use the check to mark it done if you trained on your own.
            </p>

            <Link
              href="/checkin"
              className="group pressable mt-10 flex items-center justify-between border-y border-line py-5 hover:border-line-2"
            >
              <span>
                <span className="t-eyebrow block">Habits</span>
                <span className="mt-1.5 block text-[15px] font-semibold">Manage daily habits</span>
              </span>
              <ArrowRight size={18} className="text-fg-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-fg" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
