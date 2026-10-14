"use client";

import { ArrowRight, BookOpen, Check, Pause, Play, Plus, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MoveGuideDetails } from "@/components/workout/move-guide";
import { BackButton } from "@/components/ui/back-button";
import { Button, ButtonLink, IconButton, IconLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { CountUp } from "@/components/ui/progress";
import { Pill } from "@/components/ui/section";
import { Sheet } from "@/components/ui/sheet";
import { getExerciseImage } from "@/content/catalog";
import { DIFFICULTY_LABELS, type Exercise } from "@/content/exercises";
import { track } from "@/lib/analytics";
import { getTaskHref } from "@/lib/daily-plan";
import { todayKey } from "@/lib/gamification";
import { canGoBackInApp } from "@/lib/nav-history";
import { playAlarm, playGo, playTick, unlockAudio } from "@/lib/sound";
import { pickDuration } from "@/lib/training";
import { useTimer } from "@/lib/use-timer";
import { useToday } from "@/lib/use-today";
import { useWakeLock } from "@/lib/use-wake-lock";
import { cn } from "@/lib/cn";

const GET_READY_SECONDS = 3;

/** Reads `?taskId` on the client so the route itself can be prerendered. */
export function ExercisePlayerRoute({ exercise }: { exercise: Exercise }) {
  const taskId = useSearchParams().get("taskId") ?? undefined;
  return <ExercisePlayer key={taskId ?? "practice"} exercise={exercise} taskId={taskId} />;
}

export function ExercisePlayer({
  exercise,
  taskId,
}: {
  exercise: Exercise;
  taskId?: string;
}) {
  const router = useRouter();
  const { state, completeDailyTask, nextTask, allDone, updatePreferences } = useToday();
  const [phase, setPhase] = useState<"ready" | "countdown" | "active" | "done">("ready");
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [repsDone, setRepsDone] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const isTimed = exercise.reps === "Hold" || exercise.duration.includes("sec");
  const targetReps = exercise.reps.match(/(\d+)/)
    ? parseInt(exercise.reps.match(/(\d+)/)![1], 10)
    : 10;
  const totalSeconds = pickDuration(exercise.duration, state.fitnessLevel);
  const fallback = taskId ? "/plan" : `/learn/${exercise.id}`;
  const image = getExerciseImage(exercise);
  const soundOn = state.preferences.restTimerSound;
  const sound = useRef(soundOn);
  useEffect(() => {
    sound.current = soundOn;
  }, [soundOn]);

  const onTimerDone = useRef<() => void>(() => {});
  const timer = useTimer({
    onTick: (s) => {
      if (s <= 3 && sound.current) playTick();
    },
    onDone: () => onTimerDone.current(),
  });
  useEffect(() => {
    onTimerDone.current = () => {
      if (phase === "countdown") {
        if (sound.current) playGo();
        setPhase("active");
        if (isTimed) timer.start(totalSeconds);
        return;
      }
      if (sound.current) playAlarm();
    };
  });

  const secondsLeft = phase === "countdown" || (isTimed && phase === "active") ? timer.secondsLeft : totalSeconds;
  const running = phase === "active" && isTimed && timer.running;
  const paused = phase === "active" && isTimed && !timer.running && timer.secondsLeft > 0;
  const resumeOnClose = useRef(false);

  useWakeLock(phase === "countdown" || phase === "active");

  useEffect(() => {
    if (phase !== "active" || exitOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, select")) return;
      e.preventDefault();
      if (isTimed) {
        if (running) timer.pause();
        else if (paused) timer.resume();
      } else {
        setRepsDone((r) => r + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, exitOpen, isTimed, running, paused, timer]);

  const trackProps = { exercise_id: exercise.id, exercise: exercise.name, timed: isTimed, from_plan: !!taskId };

  function start() {
    track("Exercise Started", trackProps);
    unlockAudio();
    if (sound.current) playTick();
    setPhase("countdown");
    setInstructionIndex(0);
    setRepsDone(0);
    timer.start(GET_READY_SECONDS);
  }

  function openExit() {
    resumeOnClose.current = timer.running;
    timer.pause();
    setExitOpen(true);
  }

  function closeExit() {
    setExitOpen(false);
    if (resumeOnClose.current) timer.resume();
  }

  function finish() {
    track("Exercise Completed", {
      ...trackProps,
      seconds: isTimed ? totalSeconds - timer.secondsLeft : null,
      reps: isTimed ? null : repsDone,
    });
    setElapsed(isTimed ? totalSeconds - timer.secondsLeft : 0);
    timer.set(0);
    if (taskId) {
      completeDailyTask(taskId, totalSeconds / 60 || 1);
    }
    setPhase("done");
  }

  const leave = useCallback(() => {
    setExitOpen(false);
    if (canGoBackInApp()) router.back();
    else router.push(fallback);
  }, [router, fallback]);

  const backdrop = (
    <div className="fixed inset-0 -z-10" aria-hidden>
      <Media src={image} alt="" priority sizes="100vw" className="h-full w-full" />
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-700",
          phase === "ready" ? "bg-ink/70" : phase === "done" ? "bg-ink/75" : "bg-ink/60",
        )}
      />
      <div className="scrim-bottom absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-ink/70 to-transparent" />
    </div>
  );

  if (phase === "done") {
    const next = allDone ? null : nextTask;
    return (
      <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-ink">
        {backdrop}
        <div className="page-x mx-auto flex w-full max-w-[1180px] flex-1 flex-col justify-end pb-[calc(var(--safe-bottom)+24px)] pt-[calc(var(--safe-top)+48px)] lg:justify-center">
          <div role="status" aria-live="polite">
            <span
              className="animate-pop flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_0_0_10px_rgb(212_255_63/0.12)]"
              aria-hidden
            >
              <Check size={30} strokeWidth={3} />
            </span>
            <p className="t-eyebrow enter-soft mt-8 !text-accent" style={{ ["--d" as string]: "160ms" }}>
              Session complete
            </p>
            <h1 className="t-hero enter mt-3 max-w-[12ch] text-balance" style={{ ["--d" as string]: "220ms" }}>
              {exercise.name}
            </h1>
          </div>

          <dl className="enter-soft mt-8 grid max-w-xl grid-cols-2 border-y border-line py-5" style={{ ["--d" as string]: "320ms" }}>
            <div>
              <dt className="t-micro uppercase tracking-[0.14em]">{isTimed ? "Seconds" : "Reps"}</dt>
              <dd className="t-num mt-2 text-[44px]">
                <CountUp value={isTimed ? elapsed : repsDone} />
              </dd>
            </div>
            <div className="border-l border-line pl-4">
              <dt className="t-micro uppercase tracking-[0.14em]">Cues</dt>
              <dd className="t-num mt-2 text-[44px]">
                <CountUp value={exercise.instructions.length} />
              </dd>
            </div>
          </dl>
          <p className="t-small enter-soft mt-4" style={{ ["--d" as string]: "400ms" }}>
            {taskId ? "Logged to today's plan. " : ""}
            {allDone ? "Everything on today's plan is done." : "Great form — keep the momentum."}
          </p>

          <div className="enter-soft mt-8 flex max-w-xl flex-col gap-2.5 sm:flex-row" style={{ ["--d" as string]: "480ms" }}>
            {next ? (
              <ButtonLink href={getTaskHref(next)} size="lg" className="sm:flex-1" iconRight={<ArrowRight size={16} aria-hidden />}>
                <span className="truncate">Next: {next.title}</span>
              </ButtonLink>
            ) : (
              <ButtonLink href="/home" size="lg" className="sm:flex-1">
                Back to today
              </ButtonLink>
            )}
            <ButtonLink href="/plan" size="lg" variant="secondary" className="sm:flex-1">
              View plan
            </ButtonLink>
          </div>
          <button
            type="button"
            onClick={() => setPhase("ready")}
            className="enter-soft t-small pressable mt-5 inline-flex items-center gap-2 self-start font-semibold hover:text-fg"
            style={{ ["--d" as string]: "560ms" }}
          >
            <RotateCcw size={14} aria-hidden /> Practice again
          </button>
        </div>
      </main>
    );
  }

  if (phase === "ready") {
    return (
      <main className="relative isolate flex min-h-dvh flex-col bg-ink">
        {backdrop}
        <header className="page-x mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between pt-[var(--safe-top)] box-content">
          <BackButton fallback={fallback} />
          <IconLink href={`/learn/${exercise.id}`} label="View technique guide" transitionTypes={["nav-forward"]}>
            <BookOpen size={17} aria-hidden />
          </IconLink>
        </header>

        <div className="page-x mx-auto flex w-full max-w-[1180px] flex-1 flex-col justify-end pt-10">
          <p className="t-eyebrow enter-soft !text-fg-2" style={{ ["--d" as string]: "80ms" }}>
            {taskId ? "Today's plan · Practice" : "Practice session"}
          </p>
          <h1 className="t-hero enter mt-3 max-w-[12ch] text-balance" style={{ ["--d" as string]: "140ms" }}>
            {exercise.name}
          </h1>
          <div className="enter-soft mt-5 flex flex-wrap items-center gap-2" style={{ ["--d" as string]: "220ms" }}>
            <Pill tone="light">{DIFFICULTY_LABELS[exercise.difficulty]}</Pill>
            <Pill>{exercise.reps}</Pill>
            <Pill>{exercise.duration}</Pill>
          </div>
          <p className="t-small enter-soft mt-4" style={{ ["--d" as string]: "280ms" }}>
            {exercise.muscles.join(" · ")} · {exercise.instructions.length} coaching cues
          </p>
          <MoveGuideDetails name={exercise.name} level={state.fitnessLevel} className="enter-soft mt-8 max-w-2xl" />
          <div
            className="enter-soft sticky bottom-0 -mx-1 mt-8 flex flex-col gap-2.5 bg-gradient-to-t from-ink via-ink/90 to-transparent px-1 pb-[calc(var(--safe-bottom)+16px)] pt-4 sm:max-w-md"
            style={{ ["--d" as string]: "360ms" }}
          >
            <Button size="lg" onClick={start} icon={<Play size={16} fill="currentColor" aria-hidden />}>
              {isTimed ? `Start · ${totalSeconds} sec` : "Start exercise"}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const currentInstruction = exercise.instructions[instructionIndex];
  const isLastCue = instructionIndex >= exercise.instructions.length - 1;
  const counting = phase === "countdown";
  const timeUp = isTimed && !counting && secondsLeft === 0;

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-ink">
      {backdrop}
      <header className="page-x mx-auto w-full max-w-[1180px] pt-[calc(var(--safe-top)+12px)]">
        <div className="flex h-12 items-center gap-3">
          <IconButton label="End session" onClick={openExit}>
            <X size={18} aria-hidden />
          </IconButton>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[14px] font-semibold">{exercise.name}</p>
            <p className="t-micro tabular-nums">
              Cue {instructionIndex + 1} of {exercise.instructions.length}
            </p>
          </div>
          <IconButton
            label={soundOn ? "Mute timer sounds" : "Turn on timer sounds"}
            aria-pressed={soundOn}
            onClick={() => {
              unlockAudio();
              updatePreferences({ restTimerSound: !soundOn });
            }}
          >
            {soundOn ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
          </IconButton>
        </div>
        <ol className="mt-4 flex gap-1.5" aria-label="Coaching cues">
          {exercise.instructions.map((_, i) => (
            <li key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
              <span
                className="block h-full rounded-full bg-accent transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: i <= instructionIndex ? "100%" : "0%" }}
              />
            </li>
          ))}
        </ol>
      </header>

      <section className="page-x mx-auto flex w-full max-w-[1180px] flex-1 flex-col justify-end pb-6 pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-10">
        <div key={instructionIndex} className="min-w-0">
          <p className="t-eyebrow enter-soft !text-fg-2 tabular-nums">
            {counting ? <span className="text-accent">Get ready</span> : `Cue ${String(instructionIndex + 1).padStart(2, "0")}`}
          </p>
          <p className="enter mt-3 max-w-[26ch] font-display text-[clamp(1.6rem,6vw,2.6rem)] font-bold leading-[1.05] tracking-tight [font-stretch:88%]" aria-live="polite">
            {currentInstruction}
          </p>
        </div>

        <div className="mt-6 lg:mt-0 lg:text-right">
          <p
            className={cn(
              "t-num text-[clamp(6.5rem,32vw,13rem)] transition-[color,opacity] duration-300",
              paused && "opacity-40",
              (counting || (isTimed && secondsLeft > 0 && secondsLeft <= 3)) && !paused && "text-accent",
              !isTimed && !counting && repsDone >= targetReps && "text-accent",
            )}
            aria-hidden
          >
            {counting || isTimed ? secondsLeft : repsDone}
          </p>
          <p className="t-eyebrow mt-1 !text-fg-2" aria-live="polite">
            {counting
              ? "Starting…"
              : isTimed
              ? paused
                ? "Paused"
                : timeUp
                  ? "Time — nice hold"
                  : "seconds remaining"
              : `${repsDone} / ${targetReps} reps`}
          </p>
        </div>
      </section>

      <footer className="page-x mx-auto w-full max-w-[1180px] pb-[calc(var(--safe-bottom)+20px)]">
        <div className="flex items-center gap-2.5">
          {(running || paused) && (
            <button
              type="button"
              onClick={() => (running ? timer.pause() : timer.resume())}
              aria-pressed={paused}
              aria-label={paused ? "Resume timer" : "Pause timer"}
              title={paused ? "Resume (Space)" : "Pause (Space)"}
              className="glass pressable flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full hover:bg-white/10"
            >
              {paused ? <Play size={18} fill="currentColor" aria-hidden /> : <Pause size={18} fill="currentColor" aria-hidden />}
            </button>
          )}
          {!isTimed && !counting && (
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setRepsDone((r) => r + 1)}
              icon={<Plus size={16} aria-hidden />}
              aria-label={`Add one rep, ${repsDone} done`}
            >
              1 rep
            </Button>
          )}
          {counting ? (
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                timer.set(0);
                onTimerDone.current();
              }}
            >
              Go now
            </Button>
          ) : isLastCue ? (
            <Button size="lg" className={cn("flex-1", timeUp && "animate-pop")} onClick={finish}>
              Complete exercise
            </Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={() => setInstructionIndex((i) => i + 1)}>
              Next cue
            </Button>
          )}
        </div>
        <p className="t-micro mt-3 hidden text-center sm:block">
          {counting
            ? "Get into position"
            : isTimed
              ? running
                ? "Space to pause · the alarm rings when time is up"
                : paused
                  ? "Paused"
                  : "Hold complete"
              : "Space adds a rep"}
        </p>
      </footer>

      <Sheet
        open={exitOpen}
        onClose={closeExit}
        title="End session?"
        description="This practice won't be logged unless you complete it."
      >
        <div className="flex flex-col gap-2.5">
          <Button size="lg" block onClick={closeExit}>
            Keep going
          </Button>
          <Button
            size="lg"
            block
            variant="secondary"
            icon={<RotateCcw size={16} aria-hidden />}
            onClick={() => {
              setExitOpen(false);
              timer.set(0);
              setPhase("ready");
            }}
          >
            Start over
          </Button>
          <Button
            size="lg"
            block
            variant="ghost"
            onClick={() => {
              track("Exercise Quit", { ...trackProps, phase });
              leave();
            }}
          >
            End session
          </Button>
        </div>
      </Sheet>
    </main>
  );
}

export function getExerciseTaskId(exerciseId: string): string {
  return `${todayKey()}-${exerciseId}`;
}
