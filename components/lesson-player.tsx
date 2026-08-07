"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/content/lessons";
import { usePulse } from "@/lib/store/pulse-store";

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const { completeLesson, completedLessonIds } = usePulse();
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<"work" | "rest" | "done">("work");
  const [secondsLeft, setSecondsLeft] = useState(
    lesson.steps[0]?.type === "timer" ? lesson.steps[0].value : 0,
  );
  const [result, setResult] = useState<{
    xpEarned: number;
    bonusXp: number;
    claimedMilestone: number | null;
  } | null>(null);

  const step = lesson.steps[stepIndex];
  const alreadyDone = completedLessonIds.has(lesson.id);

  useEffect(() => {
    if (phase !== "work" || step?.type !== "timer") return;
    if (secondsLeft <= 0) return;

    const id = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, step, secondsLeft]);

  useEffect(() => {
    if (phase === "work" && step?.type === "timer" && secondsLeft === 0) {
      // auto-advance hint — user still taps next
    }
  }, [phase, step, secondsLeft]);

  function startRestOrNext() {
    if (!step) return;
    if (step.restSeconds > 0 && phase === "work") {
      setPhase("rest");
      setSecondsLeft(step.restSeconds);
      return;
    }
    advance();
  }

  function advance() {
    const next = stepIndex + 1;
    if (next >= lesson.steps.length) {
      finish();
      return;
    }
    setStepIndex(next);
    setPhase("work");
    const nextStep = lesson.steps[next];
    setSecondsLeft(nextStep.type === "timer" ? nextStep.value : 0);
  }

  function finish() {
    const res = completeLesson(lesson.id);
    setResult({
      xpEarned: res.alreadyDone ? 0 : res.xpEarned,
      bonusXp: res.bonusXp,
      claimedMilestone: res.claimedMilestone,
    });
    setPhase("done");
  }

  if (phase === "done" && result) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
        <div className="animate-celebrate">
          <p className="text-xs uppercase tracking-[0.3em] text-fg-muted">
            Lesson complete
          </p>
          <h1 className="font-display mt-3 text-5xl font-bold">{lesson.title}</h1>
          <p className="mt-6 text-3xl font-display font-semibold">
            +{result.xpEarned} XP
          </p>
          {result.bonusXp > 0 && (
            <p className="mt-2 text-lg text-fg-muted">
              Streak bonus +{result.bonusXp} XP
              {result.claimedMilestone
                ? ` · ${result.claimedMilestone}-day milestone`
                : ""}
            </p>
          )}
          {alreadyDone && result.xpEarned === 0 && (
            <p className="mt-2 text-sm text-fg-muted">Already completed — nice review.</p>
          )}
        </div>
        <div className="mt-12 flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/path"
            className="rounded-2xl bg-fg px-6 py-4 text-center text-sm font-semibold text-bg"
          >
            Back to path
          </Link>
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="rounded-2xl border border-border px-6 py-4 text-sm text-fg-muted"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  if (!step) return null;

  const isRest = phase === "rest";

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-lg flex-col px-5 pb-10 pt-6">
      <div className="mb-8 flex items-center justify-between text-xs text-fg-muted">
        <Link href="/path" className="hover:text-fg">
          Exit
        </Link>
        <span>
          {stepIndex + 1} / {lesson.steps.length}
        </span>
      </div>

      <div className="mb-4 h-1 overflow-hidden rounded-full bg-track">
        <div
          className="h-full bg-fg transition-[width] duration-300"
          style={{
            width: `${((stepIndex + (isRest ? 0.5 : 0)) / lesson.steps.length) * 100}%`,
          }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up" key={`${stepIndex}-${phase}`}>
        <p className="text-xs uppercase tracking-[0.25em] text-fg-dim">
          {isRest ? "Rest" : step.type === "timer" ? "Hold the clock" : "Reps"}
        </p>
        <h1 className="font-display mt-4 text-4xl font-bold sm:text-5xl">
          {isRest ? "Breathe" : step.name}
        </h1>

        {(isRest || step.type === "timer") && (
          <p className="font-display mt-10 text-7xl font-bold tabular-nums">
            {secondsLeft}
          </p>
        )}

        {!isRest && step.type === "rep" && (
          <p className="font-display mt-10 text-7xl font-bold tabular-nums">
            {step.value}
          </p>
        )}

        {!isRest && step.type === "rep" && (
          <p className="mt-2 text-sm text-fg-muted">reps</p>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={isRest ? advance : startRestOrNext}
          className="rounded-2xl bg-fg px-6 py-4 text-sm font-semibold text-bg"
        >
          {isRest
            ? "Next move"
            : stepIndex === lesson.steps.length - 1 &&
                !(step.restSeconds > 0 && phase === "work")
              ? "Finish lesson"
              : step.type === "timer" && secondsLeft > 0
                ? "Done early"
                : "Next"}
        </button>
      </div>
    </div>
  );
}
