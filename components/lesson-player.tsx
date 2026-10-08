"use client";

import {
  BookOpen,
  Check,
  Coffee,
  Flame,
  Pause,
  Play,
  Plus,
  SkipForward,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MoveGuideDetails, resolveGuide } from "@/components/workout/move-guide";
import { Button, ButtonLink, IconButton } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { CountUp } from "@/components/ui/progress";
import { Pill } from "@/components/ui/section";
import { Sheet } from "@/components/ui/sheet";
import { getExerciseImage, getLessonImage } from "@/content/catalog";
import { getExerciseByName } from "@/content/exercises";
import { getLesson, type Lesson } from "@/content/lessons";
import { levelFromXp, todayKey } from "@/lib/gamification";
import { canGoBackInApp } from "@/lib/nav-history";
import { playAlarm, playGo, playTick, unlockAudio } from "@/lib/sound";
import { usePulse } from "@/lib/store/pulse-store";
import { personalizeLesson, type PersonalStep } from "@/lib/training";
import { useTimer } from "@/lib/use-timer";
import { useWakeLock } from "@/lib/use-wake-lock";
import { cn } from "@/lib/cn";

type Result = {
  xpEarned: number;
  bonusXp: number;
  claimedMilestone: number | null;
  alreadyDone: boolean;
  levelBefore: number;
  levelAfter: number;
};

/** intro: explain the move · ready: 3-2-1 · work: do it · rest: recover before the next move */
type Phase = "intro" | "ready" | "work" | "rest" | "done";

const GET_READY_SECONDS = 3;
const BREAK_SECONDS = 60;

function stepImage(lesson: Lesson, name: string | undefined): string {
  const ex = name ? getExerciseByName(name) : undefined;
  return ex ? getExerciseImage(ex) : getLessonImage(lesson.id);
}

function amount(step: PersonalStep): string {
  return step.type === "timer" ? `${step.value} sec` : `${step.value} reps`;
}

/** Reads `?taskId` on the client so the route itself can be prerendered. */
export function LessonPlayerRoute({ lesson }: { lesson: Lesson }) {
  const taskId = useSearchParams().get("taskId") ?? undefined;
  return <LessonPlayer key={taskId ?? "free"} lesson={lesson} taskId={taskId} />;
}

export function LessonPlayer({
  lesson,
  taskId,
}: {
  lesson: Lesson;
  taskId?: string;
}) {
  const router = useRouter();
  const { state, completeLesson, completeDailyTask, currentLessonId, updatePreferences } = usePulse();
  const level = state.fitnessLevel;
  const workout = useMemo(
    () => personalizeLesson(lesson, { goal: state.goal, level: state.fitnessLevel }),
    [lesson, state.goal, state.fitnessLevel],
  );
  const steps = workout.steps;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [exitOpen, setExitOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [breakOver, setBreakOver] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const soundOn = state.preferences.restTimerSound;
  const sound = useRef(soundOn);
  useEffect(() => {
    sound.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index, phase]);

  const onTimerDone = useRef<() => void>(() => {});
  const timer = useTimer({
    onTick: (s) => {
      if (s <= 3 && sound.current) playTick();
    },
    onDone: () => onTimerDone.current(),
  });
  const breakTimer = useTimer({
    onTick: (s) => {
      if (s <= 3 && sound.current) playTick();
    },
    onDone: () => {
      if (sound.current) playAlarm();
      setBreakOver(true);
    },
  });
  const resumeAfter = useRef({ main: false, brk: false });

  const step = steps[index];
  const nextStep = steps[index + 1];
  const isLast = index === steps.length - 1;
  const timedPhase = phase === "ready" || phase === "rest" || (phase === "work" && step?.type === "timer");
  const paused = timedPhase && !timer.running && timer.secondsLeft > 0;

  useWakeLock(phase !== "done");

  function goTo(i: number) {
    setIndex(i);
    setPhase("intro");
    setGuideOpen(false);
    timer.set(0);
  }

  function finish() {
    timer.set(0);
    const xpBefore = state.xp;
    const res = completeLesson(lesson.id);
    completeDailyTask(taskId ?? `${todayKey()}-workout`, workout.minutes);
    const xpEarned = res.alreadyDone ? 0 : res.xpEarned;
    setResult({
      xpEarned,
      bonusXp: res.bonusXp,
      claimedMilestone: res.claimedMilestone,
      alreadyDone: res.alreadyDone,
      levelBefore: levelFromXp(xpBefore),
      levelAfter: levelFromXp(xpBefore + xpEarned + res.bonusXp),
    });
    setPhase("done");
  }

  function startMove() {
    unlockAudio();
    if (sound.current) playTick();
    setPhase("ready");
    timer.start(GET_READY_SECONDS);
  }

  function beginWork() {
    if (sound.current) playGo();
    setPhase("work");
    if (step.type === "timer") timer.start(step.value);
    else timer.set(0);
  }

  function afterWork() {
    if (isLast) return finish();
    if (step.restSeconds > 0) {
      setPhase("rest");
      timer.start(step.restSeconds);
      return;
    }
    goTo(index + 1);
  }

  useEffect(() => {
    onTimerDone.current = () => {
      if (phase === "ready") return beginWork();
      if (sound.current) playAlarm();
      if (phase === "work") return afterWork();
      if (phase === "rest") goTo(index + 1);
    };
  });

  function togglePause() {
    if (timer.running) timer.pause();
    else timer.resume();
  }

  function takeBreak() {
    unlockAudio();
    resumeAfter.current.main = timer.running;
    timer.pause();
    setBreakOver(false);
    setOnBreak(true);
    breakTimer.start(BREAK_SECONDS);
  }

  function endBreak() {
    breakTimer.set(0);
    setOnBreak(false);
    setBreakOver(false);
    if (resumeAfter.current.main) timer.resume();
  }

  function extendBreak() {
    if (breakOver || !breakTimer.running) {
      setBreakOver(false);
      breakTimer.start(30);
    } else {
      breakTimer.add(30);
    }
  }

  function openExit() {
    resumeAfter.current = { main: timer.running || resumeAfter.current.main, brk: breakTimer.running };
    timer.pause();
    breakTimer.pause();
    setExitOpen(true);
  }

  function closeExit() {
    setExitOpen(false);
    if (resumeAfter.current.brk) breakTimer.resume();
    else if (!onBreak && resumeAfter.current.main) timer.resume();
  }

  const leave = useCallback(() => {
    setExitOpen(false);
    if (canGoBackInApp()) router.back();
    else router.push(taskId ? "/home" : `/workouts/${lesson.id}`);
  }, [router, taskId, lesson.id]);

  useEffect(() => {
    if (phase === "done" || exitOpen || onBreak || !timedPhase) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, select")) return;
      e.preventDefault();
      if (timer.running) timer.pause();
      else timer.resume();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, exitOpen, onBreak, timedPhase, timer]);

  if (phase === "done" && result) {
    return (
      <Completion
        lesson={lesson}
        result={result}
        streak={state.streakCount}
        minutes={workout.minutes}
        nextLessonId={currentLessonId}
      />
    );
  }

  if (!step) return null;

  const total = steps.length;
  const isRest = phase === "rest";
  const shown = isRest && nextStep ? nextStep : step;
  const { guide, side } = resolveGuide(shown.name);
  const image = stepImage(lesson, shown.name);
  const roundLabel = workout.rounds > 1 ? `Round ${step.round} of ${step.roundCount}` : null;
  const timeUp = phase === "work" && step.type === "timer" && timer.secondsLeft === 0;

  const segmentFill = (i: number) => {
    if (i < index) return 1;
    if (i > index) return 0;
    if (isRest) return 1;
    if (phase === "work" && step.type === "timer") return step.value ? (step.value - timer.secondsLeft) / step.value : 1;
    return phase === "work" ? 0.5 : 0.06;
  };

  return (
    <main className="relative isolate flex min-h-dvh flex-col bg-ink">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10" aria-hidden>
        <div key={image} className="enter-fade absolute inset-0">
          <Media
            src={image}
            alt=""
            priority
            vtName={`lesson-${lesson.id}`}
            sizes="100vw"
            className="h-full w-full"
            imgClassName={cn("transition-[filter] duration-700", (isRest || onBreak) && "grayscale")}
          />
        </div>
        <div
          className={cn(
            "absolute inset-0 transition-colors duration-700",
            phase === "intro" ? "bg-ink/75" : isRest ? "bg-ink/80" : "bg-ink/50",
          )}
        />
        <div className="scrim-bottom absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink/70 to-transparent" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-gradient-to-b from-ink via-ink/90 to-ink/0 pb-5">
        <div className="page-x mx-auto w-full max-w-[1180px] pt-[calc(var(--safe-top)+12px)]">
          <div className="flex h-12 items-center gap-3">
            <IconButton label="End workout" onClick={openExit}>
              <X size={18} aria-hidden />
            </IconButton>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-[14px] font-semibold">{lesson.title}</p>
              <p className="t-micro tabular-nums">
                Move {index + 1} of {total}
                {roundLabel && ` · ${roundLabel}`}
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
          <ol className="mt-4 flex gap-1" aria-label="Workout progress">
            {steps.map((s, i) => (
              <li key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                <span className="sr-only">
                  {s.name}: {i < index || (i === index && isRest) ? "done" : i === index ? "in progress" : "upcoming"}
                </span>
                <span
                  className={cn(
                    "block h-full rounded-full bg-accent",
                    i === index && phase === "work" && step.type === "timer"
                      ? "transition-[width] duration-200 ease-linear"
                      : "transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  )}
                  style={{ width: `${Math.min(1, Math.max(0, segmentFill(i))) * 100}%` }}
                />
              </li>
            ))}
          </ol>
        </div>
      </header>

      {/* Stage */}
      {phase === "intro" ? (
        <section key={`intro-${index}`} className="page-x mx-auto w-full max-w-[1180px] flex-1 pb-6 pt-10 lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="t-eyebrow enter-soft flex flex-wrap items-center gap-2 !text-fg-2">
              <span className="text-accent">Up next</span>
              <span aria-hidden>·</span>
              <span className="tabular-nums">
                Move {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
              </span>
            </p>
            <h1 className="t-display enter mt-3 max-w-[14ch] text-balance" style={{ ["--d" as string]: "60ms" }}>
              {step.name}
            </h1>
            <div className="enter-soft mt-4 flex flex-wrap gap-2" style={{ ["--d" as string]: "120ms" }}>
              <Pill tone="light">{amount(step)}</Pill>
              {side && <Pill>{side === "left" ? "Left side" : "Right side"}</Pill>}
              {step.restSeconds > 0 && <Pill>Then {step.restSeconds}s rest</Pill>}
            </div>
          </div>
          <MoveGuideDetails
            name={step.name}
            level={level}
            className="enter-soft mt-8 lg:col-span-7 lg:mt-0"
          />
        </section>
      ) : (
        <section
          key={`${index}-${phase}`}
          className="page-x mx-auto flex w-full max-w-[1180px] flex-1 flex-col justify-end pb-6 pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-10"
        >
          <div className="min-w-0">
            <p className="t-eyebrow enter-soft flex items-center gap-2 !text-fg-2">
              {isRest ? (
                <span className="text-accent">Rest</span>
              ) : phase === "ready" ? (
                <span className="text-accent">Get ready</span>
              ) : (
                <span>{step.type === "timer" ? "Hold the clock" : "Reps"}</span>
              )}
              <span aria-hidden>·</span>
              <span className="tabular-nums">
                {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
              </span>
            </p>
            <h1 className="t-display enter mt-3 max-w-[14ch] text-balance lg:text-[5.25rem]" style={{ ["--d" as string]: "60ms" }}>
              {isRest ? "Breathe" : step.name}
            </h1>
            <p className="t-body enter-soft mt-3 max-w-[46ch]" style={{ ["--d" as string]: "140ms" }}>
              {isRest
                ? nextStep
                  ? `Up next · ${nextStep.name} — ${amount(nextStep)}. ${resolveGuide(nextStep.name).guide.what}`
                  : "Last breath before you finish."
                : phase === "ready"
                  ? guide.how[0]
                  : guide.how[guide.how.length - 1]}
            </p>
            {phase === "work" && (
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="enter-soft pressable mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-fg-2 hover:text-fg"
                style={{ ["--d" as string]: "200ms" }}
              >
                <BookOpen size={14} aria-hidden /> How to do it
              </button>
            )}
          </div>

          <div className="enter-focus mt-6 lg:mt-0 lg:text-right" style={{ ["--d" as string]: "120ms" }}>
            <p
              className={cn(
                "t-num text-[clamp(6.5rem,32vw,13rem)] transition-[color,opacity] duration-300",
                paused && "opacity-40",
                (phase === "ready" || (timedPhase && timer.secondsLeft > 0 && timer.secondsLeft <= 3)) && !paused && "text-accent",
              )}
              aria-hidden
            >
              {phase === "work" && step.type === "rep" ? step.value : timer.secondsLeft}
            </p>
            <p className="t-eyebrow mt-1 !text-fg-2" aria-live="polite">
              {paused
                ? "Paused"
                : phase === "ready"
                  ? "Starting…"
                  : timeUp
                    ? "Time — nice work"
                    : phase === "work" && step.type === "rep"
                      ? "reps"
                      : "seconds"}
            </p>
            <span className="sr-only" aria-live="polite">
              {phase === "work" && step.type === "rep" ? `${step.value} reps of ${step.name}` : ""}
            </span>
          </div>
        </section>
      )}

      {/* Controls */}
      <footer className="sticky bottom-0 bg-gradient-to-t from-ink via-ink/90 to-ink/0 pt-6">
        <div className="page-x mx-auto w-full max-w-[1180px] pb-[calc(var(--safe-bottom)+20px)]">
          <div className="flex items-center gap-2.5">
            {timedPhase && phase !== "ready" && (
              <button
                type="button"
                onClick={togglePause}
                aria-pressed={paused}
                aria-label={paused ? "Resume timer" : "Pause timer"}
                title={paused ? "Resume (Space)" : "Pause (Space)"}
                className="glass pressable flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full hover:bg-white/10"
              >
                {paused ? <Play size={18} fill="currentColor" aria-hidden /> : <Pause size={18} fill="currentColor" aria-hidden />}
              </button>
            )}

            {phase === "intro" && (
              <Button size="lg" className="flex-1" onClick={startMove} icon={<Play size={16} fill="currentColor" aria-hidden />}>
                Start · {amount(step)}
              </Button>
            )}
            {phase === "ready" && (
              <Button size="lg" variant="secondary" className="flex-1" onClick={beginWork}>
                Go now
              </Button>
            )}
            {phase === "work" && (
              <Button
                size="lg"
                className={cn("flex-1", timeUp && "animate-pop")}
                onClick={() => {
                  timer.set(0);
                  afterWork();
                }}
              >
                {isLast ? "Finish workout" : step.type === "timer" ? "Done early" : `Done · ${step.value} reps`}
              </Button>
            )}
            {isRest && (
              <>
                <Button size="lg" className="flex-1" onClick={() => goTo(index + 1)}>
                  Skip rest
                </Button>
                <Button size="lg" variant="secondary" onClick={() => timer.add(15)} icon={<Plus size={16} aria-hidden />} aria-label="Add 15 seconds of rest">
                  15s
                </Button>
              </>
            )}

            {(phase === "intro" || phase === "work") && (
              <>
                <button
                  type="button"
                  onClick={takeBreak}
                  aria-label="Take a break"
                  title="Take a break"
                  className="glass pressable flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full hover:bg-white/10"
                >
                  <Coffee size={18} aria-hidden />
                </button>
                {!isLast && (
                  <button
                    type="button"
                    onClick={() => goTo(index + 1)}
                    aria-label="Skip this move"
                    title="Skip this move"
                    className="glass pressable flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full hover:bg-white/10"
                  >
                    <SkipForward size={18} aria-hidden />
                  </button>
                )}
              </>
            )}
          </div>
          <p className="t-micro mt-3 hidden text-center sm:block">
            {phase === "intro"
              ? `Read through the move, then start when you're set · ~${workout.minutes} min total`
              : timer.running
                ? "Space to pause · the alarm rings when time is up"
                : isRest
                  ? "Rest is paused"
                  : `${total} moves · ${workout.rounds > 1 ? `${workout.rounds} rounds · ` : ""}~${workout.minutes} min`}
          </p>
        </div>
      </footer>

      {onBreak && (
        <BreakOverlay
          secondsLeft={breakTimer.secondsLeft}
          over={breakOver}
          moveName={phase === "rest" && nextStep ? nextStep.name : step.name}
          onResume={endBreak}
          onExtend={extendBreak}
        />
      )}

      <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} title={step.name} description={amount(step)}>
        <div className="-mx-1 max-h-[60dvh] overflow-y-auto px-1">
          <MoveGuideDetails name={step.name} level={level} showMistakes />
        </div>
      </Sheet>

      <Sheet
        open={exitOpen}
        onClose={closeExit}
        title="End workout?"
        description={`You're on move ${index + 1} of ${total}. Progress in this session won't be saved.`}
      >
        <div className="flex flex-col gap-2.5">
          <Button size="lg" block onClick={closeExit}>
            Keep going
          </Button>
          <Button size="lg" block variant="secondary" onClick={leave}>
            End workout
          </Button>
        </div>
      </Sheet>
    </main>
  );
}

function BreakOverlay({
  secondsLeft,
  over,
  moveName,
  onResume,
  onExtend,
}: {
  secondsLeft: number;
  over: boolean;
  moveName: string;
  onResume: () => void;
  onExtend: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="break-title"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink/95 backdrop-blur-xl"
      style={{ animation: "fade-in 260ms ease both" }}
    >
      <div className="page-x mx-auto flex w-full max-w-[1180px] flex-1 flex-col justify-center pt-[var(--safe-top)]">
        <p className="t-eyebrow flex items-center gap-2 !text-accent">
          <Coffee size={14} aria-hidden /> Break
        </p>
        <h2 id="break-title" className="t-display mt-3 max-w-[14ch] text-balance">
          {over ? "Break's over" : "Take a breather"}
        </h2>
        <p className="t-body mt-3 max-w-[44ch]">
          {over
            ? `Ready when you are — you'll pick up at ${moveName}.`
            : `Your workout is paused at ${moveName}. Sip some water, walk around, shake out your arms and legs.`}
        </p>
        <p
          className={cn("t-num mt-8 text-[clamp(6rem,30vw,12rem)]", (over || secondsLeft <= 3) && "text-accent")}
          aria-live="off"
        >
          {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
        </p>
        <span className="sr-only" aria-live="polite">
          {over ? "Break is over" : ""}
        </span>
      </div>
      <div className="page-x mx-auto w-full max-w-[1180px] pb-[calc(var(--safe-bottom)+20px)]">
        <div className="flex gap-2.5">
          <Button size="lg" className={cn("flex-1", over && "animate-pop")} onClick={onResume} icon={<Play size={16} fill="currentColor" aria-hidden />}>
            Resume workout
          </Button>
          <Button size="lg" variant="secondary" onClick={onExtend} icon={<Plus size={16} aria-hidden />} aria-label="Add 30 seconds to the break">
            30s
          </Button>
        </div>
      </div>
    </div>
  );
}

function Completion({
  lesson,
  result,
  streak,
  minutes,
  nextLessonId,
}: {
  lesson: Lesson;
  result: Result;
  streak: number;
  minutes: number;
  nextLessonId: string | null;
}) {
  const totalXp = result.xpEarned + result.bonusXp;
  const leveledUp = result.levelAfter > result.levelBefore;
  const next = nextLessonId && nextLessonId !== lesson.id ? getLesson(nextLessonId) : undefined;

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-ink">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <Media src={getLessonImage(lesson.id)} alt="" vtName={`lesson-${lesson.id}`} sizes="100vw" className="h-full w-full" />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="scrim-bottom absolute inset-0" />
      </div>

      <div className="page-x mx-auto flex w-full max-w-[1180px] flex-1 flex-col justify-end pb-[calc(var(--safe-bottom)+24px)] pt-[calc(var(--safe-top)+48px)] lg:justify-center">
        <div role="status" aria-live="polite">
          <span
            className="animate-pop flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_0_0_10px_rgb(212_255_63/0.12)]"
            aria-hidden
          >
            <Check size={30} strokeWidth={3} />
          </span>
          <p className="t-eyebrow enter-soft mt-8 !text-accent" style={{ ["--d" as string]: "160ms" }}>
            Workout complete
          </p>
          <h1 className="t-hero enter mt-3 max-w-[11ch] text-balance" style={{ ["--d" as string]: "220ms" }}>
            {lesson.title}
          </h1>
        </div>

        <dl className="enter-soft mt-8 grid max-w-2xl grid-cols-3 border-y border-line py-5" style={{ ["--d" as string]: "340ms" }}>
          <div>
            <dt className="t-micro flex items-center gap-1.5 uppercase tracking-[0.14em]">
              <Zap size={12} className="text-accent" aria-hidden /> XP
            </dt>
            <dd className="t-num mt-2 text-[44px] text-accent">
              +<CountUp value={totalXp} />
            </dd>
          </div>
          <div className="border-l border-line pl-4">
            <dt className="t-micro flex items-center gap-1.5 uppercase tracking-[0.14em]">
              <Flame size={12} aria-hidden /> Streak
            </dt>
            <dd className="t-num mt-2 text-[44px]">
              <CountUp value={streak} />
              <span className="ml-1 text-[18px] text-fg-3">d</span>
            </dd>
          </div>
          <div className="border-l border-line pl-4">
            <dt className="t-micro uppercase tracking-[0.14em]">Minutes</dt>
            <dd className="t-num mt-2 text-[44px]">
              <CountUp value={minutes} />
            </dd>
          </div>
        </dl>

        <div className="enter-soft mt-4 max-w-2xl space-y-1.5" style={{ ["--d" as string]: "420ms" }}>
          {result.bonusXp > 0 && (
            <p className="t-small">
              Includes a +{result.bonusXp} XP streak bonus
              {result.claimedMilestone ? ` · ${result.claimedMilestone}-day milestone` : ""}.
            </p>
          )}
          {result.alreadyDone && (
            <p className="t-small">Already completed — nice review. It still counts toward today.</p>
          )}
        </div>

        {leveledUp && (
          <div
            className="surface-paper animate-pop mt-6 flex max-w-2xl items-center gap-4 p-4"
            style={{ ["--d" as string]: "560ms" }}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-accent">
              <Trophy size={18} aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/50">Level up</p>
              <p className="mt-0.5 font-display text-[22px] font-extrabold uppercase leading-none [font-stretch:80%] text-ink">
                You reached level {result.levelAfter}
              </p>
            </div>
          </div>
        )}

        <div className="enter-soft mt-8 flex max-w-2xl flex-col gap-2.5 sm:flex-row" style={{ ["--d" as string]: "500ms" }}>
          <ButtonLink href="/home" size="lg" className="sm:flex-1">
            Back to today
          </ButtonLink>
          <ButtonLink href="/progress" size="lg" variant="secondary" className="sm:flex-1">
            View progress
          </ButtonLink>
        </div>
        {next && (
          <Link
            href={`/workouts/${next.id}`}
            className="enter-soft t-small mt-5 inline-flex self-start font-semibold hover:text-fg"
            style={{ ["--d" as string]: "580ms" }}
          >
            Up next on your path · {next.title} →
          </Link>
        )}
      </div>
    </main>
  );
}
