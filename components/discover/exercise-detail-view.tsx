"use client";

import { Bell, BellRing, Check, Play, Video, X } from "lucide-react";
import { useMemo } from "react";
import { RowCard } from "@/components/cards";
import { Button, ButtonLink } from "@/components/ui/button";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill, SectionHeader } from "@/components/ui/section";
import { TopBar } from "@/components/ui/top-bar";
import { COURSES, getExerciseImage } from "@/content/catalog";
import { DIFFICULTY_LABELS, EXERCISES, getExercise } from "@/content/exercises";
import { generateDailyPlan } from "@/lib/daily-plan";
import { usePulse } from "@/lib/store/pulse-store";
import { DetailHero, EXERCISE_CATEGORY_LABELS, ExerciseTile, FactRow, useNotify } from "./shared";

export function ExerciseDetailView({ id }: { id: string }) {
  const exercise = getExercise(id)!;
  const { currentLessonId, state } = usePulse();
  const video = useNotify(`video-${exercise.id}`, {
    on: "We'll tell you when the video is ready",
    off: "Notification removed",
  });

  const plan = useMemo(
    () => generateDailyPlan({ currentLessonId, habits: state.habits, goal: state.goal, fitnessLevel: state.fitnessLevel }),
    [currentLessonId, state.habits, state.goal, state.fitnessLevel],
  );
  const task = plan.tasks.find((t) => t.exerciseId === exercise.id);
  const practiceHref = task ? `/workout/${exercise.id}?taskId=${task.id}` : `/workout/${exercise.id}`;

  const courses = COURSES.filter((c) => c.exerciseIds.includes(exercise.id));
  const related = [
    ...EXERCISES.filter((e) => e.id !== exercise.id && e.category === exercise.category),
    ...EXERCISES.filter((e) => e.id !== exercise.id && e.category !== exercise.category),
  ].slice(0, 8);

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title={exercise.name} fallback="/learn" overlay />

      <DetailHero image={getExerciseImage(exercise)} vtName={`exercise-${exercise.id}`}>
        <Enter variant="enter-soft" delay={120} className="flex flex-wrap items-center gap-2">
          <Pill tone="light">{DIFFICULTY_LABELS[exercise.difficulty]}</Pill>
          <Pill>{EXERCISE_CATEGORY_LABELS[exercise.category]}</Pill>
          {task && <Pill tone="outline">In today&apos;s plan</Pill>}
        </Enter>
        <Enter delay={180}>
          <h1 className="t-hero mt-4 max-w-[11ch] text-balance">{exercise.name}</h1>
        </Enter>
        <Enter variant="enter-soft" delay={260}>
          <p className="mt-4 text-[15px] font-medium text-fg-2">{exercise.muscles.join(" · ")}</p>
        </Enter>
        <Enter variant="enter-soft" delay={340} className="mt-6">
          <ButtonLink href={practiceHref} size="lg" icon={<Play size={16} fill="currentColor" aria-hidden />}>
            Practice now
          </ButtonLink>
        </Enter>
      </DetailHero>

      <div className="page-x mx-auto max-w-[1180px]">
        <Reveal className="mt-8 grid gap-6 md:grid-cols-12 md:items-center">
          <FactRow
            className="md:col-span-7"
            facts={[
              { label: "Reps", value: exercise.reps },
              { label: "Time", value: exercise.duration },
              { label: "Level", value: DIFFICULTY_LABELS[exercise.difficulty] },
            ]}
          />
          <div className="flex items-center gap-4 rounded-[var(--radius)] border border-line bg-surface-1 p-4 md:col-span-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-fg-2">
              <Video size={18} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">Video demonstration coming soon</p>
              <p className="t-micro mt-0.5 !text-[12px]">Coaches are filming it — follow the cues below for now.</p>
            </div>
            <Button
              size="sm"
              variant={video.on ? "secondary" : "light"}
              aria-pressed={video.on}
              onClick={video.toggle}
              icon={video.on ? <BellRing size={14} aria-hidden /> : <Bell size={14} aria-hidden />}
              className="shrink-0"
            >
              {video.on ? "On" : "Notify"}
            </Button>
          </div>
        </Reveal>

        {/* Steps */}
        <section className="mt-14 grid gap-8 md:grid-cols-12 md:gap-12">
          <Reveal className="md:col-span-4">
            <div className="md:sticky md:top-24">
              <p className="t-eyebrow">Step by step</p>
              <h2 className="t-title mt-3">How to do it</h2>
              <p className="t-small mt-3 max-w-[32ch]">
                Move slowly the first few reps. Quality first — speed and load come later.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Muscles worked">
                {exercise.muscles.map((m) => (
                  <li key={m} className="rounded-full border border-line-2 px-3 py-1.5 text-[12px] font-semibold text-fg-2">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <ol className="md:col-span-8">
            {exercise.instructions.map((step, i) => (
              <Reveal
                key={step}
                as="li"
                delay={i * 70}
                className="grid grid-cols-[64px_1fr] items-baseline gap-4 border-t border-line py-6 last:border-b sm:grid-cols-[88px_1fr]"
              >
                <span className="t-num text-[44px] text-fg-4 sm:text-[56px]" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[17px] leading-[1.5] text-fg sm:text-[19px]">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step}
                </p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Mistakes & safety */}
        <section className="mt-14 grid gap-3 md:grid-cols-2">
          <Reveal className="rounded-[var(--radius-lg)] border border-line bg-surface-1 p-6 sm:p-7">
            <h2 className="t-eyebrow">Common mistakes</h2>
            <ul className="mt-5 space-y-4">
              {exercise.commonMistakes.map((m) => (
                <li key={m} className="flex gap-3 text-[15px] leading-snug text-fg">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-fg-2">
                    <X size={12} strokeWidth={2.5} aria-hidden />
                  </span>
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="surface-paper !rounded-[var(--radius-lg)] p-6 sm:p-7">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/50">Coach&apos;s safety notes</h2>
            <ul className="mt-5 space-y-4">
              {exercise.safetyTips.map((t) => (
                <li key={t} className="flex gap-3 text-[15px] font-medium leading-snug text-ink">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
                    <Check size={12} strokeWidth={3} aria-hidden />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {courses.length > 0 && (
          <Reveal className="mt-14">
            <SectionHeader eyebrow="Part of" title={courses.length === 1 ? "Course" : "Courses"} href="/courses" linkLabel="All courses" />
            <div className="grid gap-2.5 md:grid-cols-2">
              {courses.map((c) => (
                <RowCard
                  key={c.id}
                  href={`/courses/${c.id}`}
                  image={c.image}
                  title={c.title}
                  subtitle={`${c.exerciseIds.length} lessons · ${c.minutes} min`}
                  eyebrow={<Pill tone="outline">Course</Pill>}
                />
              ))}
            </div>
          </Reveal>
        )}

        <Reveal className="mt-14">
          <SectionHeader eyebrow="Keep learning" title="Related technique" href="/learn" linkLabel="Library" />
          <div className="rail">
            {related.map((e) => (
              <ExerciseTile key={e.id} exercise={e} />
            ))}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
