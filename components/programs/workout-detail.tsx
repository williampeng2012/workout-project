"use client";

import { ArrowRight, ArrowUpRight, Check, Lock, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { PosterCard } from "@/components/cards";
import { DetailHero } from "@/components/programs/detail-hero";
import {
  focusLabels,
  getLessonState,
  lessonEquipment,
  lessonMeta,
  stepAmount,
} from "@/components/programs/path-state";
import { ButtonLink } from "@/components/ui/button";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill, SectionHeader } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/states";
import { TopBar } from "@/components/ui/top-bar";
import {
  INTENSITY_LABELS,
  getLessonImage,
  getLessonIntensity,
  getProgramForLesson,
  getProgramLessons,
} from "@/content/catalog";
import { getExerciseByName } from "@/content/exercises";
import { getLesson } from "@/content/lessons";
import { XP } from "@/lib/gamification";
import { goalLabel } from "@/components/account/meta";
import { usePulse } from "@/lib/store/pulse-store";
import { LEVEL_LABELS, personalizeLesson } from "@/lib/training";
import { cn } from "@/lib/cn";

export function WorkoutDetail({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId)!;
  const { hydrated, state: pulse, completedLessonIds, currentLessonId, lessonOrder } = usePulse();
  const workout = personalizeLesson(lesson, { goal: pulse.goal, level: pulse.fitnessLevel });
  const roundSteps = workout.steps.filter((s) => s.round === 1);

  const program = getProgramForLesson(lesson.id);
  const siblings = program ? getProgramLessons(program) : [];
  const position = siblings.findIndex((l) => l.id === lesson.id) + 1;
  const intensity = getLessonIntensity(lesson.id);
  const focus = focusLabels(lesson.id);
  const equipment = lessonEquipment(lesson);
  const restSeconds = roundSteps.reduce((s, st) => s + st.restSeconds, 0);

  const state = hydrated ? getLessonState(lesson.id, completedLessonIds, currentLessonId, lessonOrder) : null;
  const current = currentLessonId ? getLesson(currentLessonId) : undefined;
  const locked = state === "locked" && current;
  const done = state === "done";

  const level = INTENSITY_LABELS[intensity].toLowerCase();
  const about = `${/^[aeiou]/.test(level) ? "An" : "A"} ${level} ${workout.minutes}-minute session — ${lesson.steps.length} moves${
    workout.rounds > 1 ? `, ${workout.rounds} rounds` : ""
  } with ${restSeconds > 0 ? `${workout.restSeconds}s rests between them` : "no rest breaks"}. Built around ${focus.join(" and ")}. Every move is explained before you start it.`;
  const tunedFor = [pulse.fitnessLevel ? LEVEL_LABELS[pulse.fitnessLevel] : null, goalLabel(pulse.goal)].filter(Boolean).join(" · ");

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar overlay title={lesson.title} fallback={program ? `/programs/${program.id}` : "/workouts"} />

      <DetailHero image={getLessonImage(lesson.id)} vtName={`lesson-${lesson.id}`} muted={Boolean(locked)}>
        {program && (
          <div className="enter-soft" style={{ ["--d" as string]: "180ms" }}>
            <Link
              href={`/programs/${program.id}`}
              transitionTypes={["nav-forward"]}
              className="group t-eyebrow inline-flex items-center gap-1.5 !text-fg/75 hover:!text-fg"
            >
              {program.title} · Workout {position} of {siblings.length}
              <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        )}
        <h1 className="t-hero enter mt-4 max-w-[11ch] text-balance" style={{ ["--d" as string]: "240ms" }}>
          {lesson.title}
        </h1>
        <div className="enter-soft mt-4 flex flex-wrap items-center gap-2" style={{ ["--d" as string]: "320ms" }}>
          <Pill>{INTENSITY_LABELS[intensity]}</Pill>
          <Pill>{hydrated ? `${workout.minutes} min · ${lesson.steps.length} moves` : lessonMeta(lesson)}</Pill>
          {done && (
            <Pill tone="light">
              <Check size={12} strokeWidth={3} aria-hidden /> Done
            </Pill>
          )}
          {state === "current" && <Pill tone="accent">Up next</Pill>}
          {locked && (
            <Pill tone="outline" className="bg-ink/40 backdrop-blur-md">
              <Lock size={11} aria-hidden /> Locked
            </Pill>
          )}
        </div>
        <div className="enter-soft mt-6 flex flex-wrap gap-2.5" style={{ ["--d" as string]: "400ms" }}>
          {!hydrated ? (
            <Skeleton className="h-[54px] w-52 !rounded-full" />
          ) : locked ? (
            <>
              <ButtonLink
                href={`/workouts/${current.id}`}
                transitionTypes={["nav-forward"]}
                size="lg"
                iconRight={<ArrowRight size={16} aria-hidden />}
              >
                Go to current workout
              </ButtonLink>
              <ButtonLink href={`/lesson/${lesson.id}`} size="lg" variant="secondary">
                Start anyway
              </ButtonLink>
            </>
          ) : (
            <ButtonLink
              href={`/lesson/${lesson.id}`}
              size="lg"
              icon={done ? <RotateCcw size={16} aria-hidden /> : <Play size={16} fill="currentColor" aria-hidden />}
            >
              {done ? "Train again" : "Start workout"}
            </ButtonLink>
          )}
        </div>
      </DetailHero>

      <div className="page-x mx-auto max-w-[1180px]">
        {locked && (
          <Enter delay={120}>
            <div className="mt-8 flex items-start gap-4 rounded-[var(--radius)] border border-line bg-surface-1 p-4 sm:p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-2 text-fg-2">
                <Lock size={16} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold">Unlocks after {current.title}</p>
                <p className="t-small mt-1 max-w-[60ch]">
                  Your path opens one workout at a time so each session builds on the last. You can still start this one
                  now — completing it earns XP and counts toward today.
                </p>
              </div>
            </div>
          </Enter>
        )}

        <Enter delay={180}>
          <dl className="mt-8 grid grid-cols-2 gap-y-6 border-y border-line py-6 sm:grid-cols-4">
            {[
              { label: "Minutes", value: String(workout.minutes) },
              { label: workout.rounds > 1 ? "Rounds" : "Moves", value: String(workout.rounds > 1 ? workout.rounds : lesson.steps.length) },
              { label: "Intensity", value: INTENSITY_LABELS[intensity] },
              { label: done ? "XP earned" : "XP", value: `+${XP.LESSON_COMPLETE}` },
            ].map((s, i) => (
              <div key={s.label} className={cn(i % 2 === 1 && "border-l border-line pl-4", i >= 2 && "sm:border-l sm:border-line sm:pl-4")}>
                <dt className="t-micro uppercase tracking-[0.14em]">{s.label}</dt>
                <dd className={cn("t-num mt-2", s.label === "Intensity" ? "text-[30px]" : "text-[40px]", s.label.startsWith("XP") && "text-accent")}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </Enter>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-7">
            <SectionHeader eyebrow="Session" title="The moves" />
            {hydrated && tunedFor && (
              <p className="t-small -mt-2 mb-4">
                Sized for you: <span className="font-semibold text-fg">{tunedFor}</span>
                {workout.rounds > 1 ? ` · repeat the list ${workout.rounds}×` : ""}.{" "}
                <Link href="/settings/training" className="font-semibold text-fg-2 underline-offset-4 hover:text-fg hover:underline">
                  Change
                </Link>
              </p>
            )}
            <ol>
              {roundSteps.map((step, i) => {
                const ex = getExerciseByName(step.name);
                const inner = (
                  <>
                    <span className="t-num w-9 shrink-0 text-[24px] text-fg-4" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-semibold">{step.name}</p>
                      <p className="t-micro mt-1 !text-[12px]">
                        {stepAmount(step)}
                        {step.restSeconds > 0 ? ` · ${step.restSeconds}s rest` : ""}
                      </p>
                    </div>
                  </>
                );
                return (
                  <li key={step.id} className="border-b border-line last:border-b-0">
                    {ex ? (
                      <Link
                        href={`/learn/${ex.id}`}
                        transitionTypes={["nav-forward"]}
                        className="group pressable -mx-3 flex items-center gap-4 rounded-[var(--radius-sm)] px-3 py-4 hover:bg-white/[0.03]"
                        aria-label={`${step.name}, ${stepAmount(step)} — view technique`}
                      >
                        {inner}
                        <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-fg-2 group-hover:text-fg">
                          Technique
                          <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-4 py-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Reveal>

          <Reveal className="order-first lg:order-none lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <p className="t-eyebrow">About</p>
              <p className="t-body mt-3 text-[16px]">{about}</p>
              {program && <p className="t-small mt-3">{program.tagline}</p>}

              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6">
                <div>
                  <p className="t-eyebrow">Focus</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {focus.map((f) => (
                      <li key={f}>
                        <Pill tone="outline">{f}</Pill>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="t-eyebrow">Equipment</p>
                  <p className="mt-3 text-[14px] font-semibold">
                    {equipment.length ? equipment.join(", ") : "None"}
                  </p>
                  <p className="t-micro mt-0.5">{equipment.length ? "Plus bodyweight" : "Bodyweight only"}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {program && siblings.length > 1 && (
          <Reveal className="mt-16">
            <SectionHeader
              eyebrow={`From ${program.title}`}
              title="More in this program"
              href={`/programs/${program.id}`}
              linkLabel="Program"
            />
            <div className="rail">
              {siblings
                .filter((l) => l.id !== lesson.id)
                .map((l) => (
                  <PosterCard
                    key={l.id}
                    href={`/workouts/${l.id}`}
                    image={getLessonImage(l.id)}
                    eyebrow={INTENSITY_LABELS[getLessonIntensity(l.id)]}
                    title={l.title}
                    meta={lessonMeta(l)}
                    vtName={`lesson-${l.id}`}
                    size="sm"
                    badge={hydrated && completedLessonIds.has(l.id) ? <Pill tone="light">Done</Pill> : undefined}
                  />
                ))}
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}
