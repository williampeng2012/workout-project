"use client";

import {
  ArrowRight,
  Bell,
  Check,
  Clock,
  Flame,
  Play,
  Plus,
  Search,
  Utensils,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { PosterCard, RowCard } from "@/components/cards";
import { ButtonLink, IconLink } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { Media } from "@/components/ui/media";
import { Parallax } from "@/components/ui/parallax";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill, SectionHeader } from "@/components/ui/section";
import { PageSkeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import {
  AVAILABLE_PROGRAMS,
  COURSES,
  INTENSITY_LABELS,
  getClassImage,
  getExerciseImage,
  getLessonImage,
  getLessonIntensity,
  getProgramLessons,
} from "@/content/catalog";
import { formatClassTime, getUpcomingLiveClass } from "@/content/classes";
import { EXERCISES } from "@/content/exercises";
import { burnedOn, dailyTarget, eatenOn } from "@/lib/calories";
import { DAILY_GOAL, XP, todayKey, xpIntoLevel } from "@/lib/gamification";
import { featuredSlides, orderedCategories, recommendedWorkouts } from "@/lib/recommendations";
import { greeting, todayLabel, useToday } from "@/lib/use-today";
import { cn } from "@/lib/cn";

export default function HomePage() {
  const router = useRouter();
  const t = useToday();
  const toast = useToast();
  const { hydrated, state, level, completedLessonIds } = t;

  useEffect(() => {
    if (hydrated && !state.onboardingDone) router.replace("/onboarding");
  }, [hydrated, state.onboardingDone, router]);

  const slides = useMemo(
    () => featuredSlides({ goal: state.goal, currentLessonId: t.currentLessonId }),
    [state.goal, t.currentLessonId],
  );
  const categories = useMemo(() => orderedCategories(state.goal), [state.goal]);
  const recommended = useMemo(
    () => recommendedWorkouts(state.goal, completedLessonIds, 6),
    [state.goal, completedLessonIds],
  );

  if (!hydrated || !state.onboardingDone) {
    return (
      <main className="page-bottom min-h-dvh pt-[calc(var(--safe-top)+16px)]">
        <PageSkeleton />
      </main>
    );
  }

  const workout = t.workout;
  const live = getUpcomingLiveClass();
  const name = state.displayName.split(" ")[0];
  const weeklyTarget = state.trainingDays ?? 4;
  const today = todayKey();
  const xpIn = xpIntoLevel(state.xp);
  const calories = {
    eaten: eatenOn(state, today),
    burned: burnedOn(state, today).total,
    target: dailyTarget(state).kcal,
  };
  const heroCta = t.allDone
    ? "Review today"
    : t.completed === 0
      ? "Start today's training"
      : `Continue · ${t.nextTask?.title ?? "plan"}`;

  return (
    <main className="page-bottom min-h-dvh">
      {/* Header */}
      <header
        className="page-x mx-auto flex max-w-[1180px] items-center justify-between gap-4 pb-5 pt-[calc(var(--safe-top)+18px)] lg:pt-10"
      >
        <Enter variant="enter-soft">
          <p className="t-eyebrow">{todayLabel()}</p>
          <h1 className="mt-1.5 font-display text-[26px] font-bold leading-none tracking-tight [font-stretch:88%] sm:text-[30px]">
            {greeting()}
            {name ? `, ${name}` : ""}
          </h1>
        </Enter>
        <Enter variant="enter-soft" delay={80} className="flex items-center gap-2">
          <IconLink href="/search" label="Search" className="lg:hidden">
            <Search size={18} aria-hidden />
          </IconLink>
          <IconLink href="/notifications" label="Notifications">
            <Bell size={18} aria-hidden />
            {live && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-ink" />}
          </IconLink>
        </Enter>
      </header>

      <div className="page-x mx-auto max-w-[1180px]">
        {/* Today hero */}
        <Enter delay={60}>
          <section
            aria-label="Today's training"
            className="relative isolate overflow-hidden rounded-[var(--radius-lg)] bg-surface-1"
          >
            <div className="hero-fit relative w-full">
              <Parallax speed={0.12}>
                <Media
                  src={getLessonImage(workout?.id ?? "f1")}
                  alt=""
                  priority
                  sizes="(min-width: 1024px) 1100px, 100vw"
                  vtName={workout ? `lesson-${workout.id}` : undefined}
                  className="h-full w-full"
                />
              </Parallax>
              <div className="scrim-bottom absolute inset-0" />
              <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/80 via-ink/20 to-transparent sm:block" />

              <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                <Link
                  href="/plan"
                  className="glass pressable flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 hover:bg-white/10"
                  aria-label={`Today's plan ${t.progress}% complete — open plan`}
                >
                  <ProgressRing value={t.progress} size={38} stroke={3.5}>
                    <span className="text-[10px] font-bold tabular-nums">{t.progress}%</span>
                  </ProgressRing>
                  <span className="text-[12px] font-semibold leading-tight">
                    {t.completed}/{t.plan.tasks.length}
                    <span className="block font-medium text-fg-3">tasks</span>
                  </span>
                </Link>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 sm:max-w-[40rem] sm:p-8 lg:p-10">
                <div className="enter-soft flex flex-wrap items-center gap-2" style={{ ["--d" as string]: "240ms" }}>
                  <Pill tone="accent">{t.allDone ? "Plan complete" : "Today's workout"}</Pill>
                  {workout && <Pill>{INTENSITY_LABELS[getLessonIntensity(workout.id)]}</Pill>}
                </div>
                <h2 className="t-hero enter mt-4 max-w-[11ch] text-balance" style={{ ["--d" as string]: "300ms" }}>
                  {workout?.title ?? "Your plan"}
                </h2>
                <div
                  className="enter-soft mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-medium text-fg-2"
                  style={{ ["--d" as string]: "380ms" }}
                >
                  {workout && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} aria-hidden /> {workout.minutes} min
                    </span>
                  )}
                  {workout && <span>{workout.steps.length} moves</span>}
                  <span className="flex items-center gap-1.5">
                    <Zap size={14} aria-hidden /> +{XP.LESSON_COMPLETE} XP
                  </span>
                  <span>{t.plan.totalMinutes} min total plan</span>
                </div>
                <div className="enter-soft mt-6 flex flex-wrap gap-2.5" style={{ ["--d" as string]: "460ms" }}>
                  <ButtonLink
                    href={t.allDone ? "/plan" : t.primaryHref}
                    size="lg"
                    icon={<Play size={16} fill="currentColor" aria-hidden />}
                    className="max-w-full"
                  >
                    <span className="truncate">{heroCta}</span>
                  </ButtonLink>
                  {workout && (
                    <ButtonLink
                      href={`/workouts/${workout.id}`}
                      size="lg"
                      variant="secondary"
                      className="hidden sm:inline-flex"
                    >
                      Workout details
                    </ButtonLink>
                  )}
                </div>
              </div>
            </div>
          </section>
        </Enter>

        {/* Progress block — asymmetric */}
        <section aria-label="Progress" className="mt-3 grid grid-cols-12 gap-3">
          <Enter delay={180} className="col-span-12 md:col-span-7">
            <Link
              href="/progress"
              className="group pressable flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-surface-1 p-5 hover:border-line-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="t-eyebrow">This week</p>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="t-num text-[54px]">{t.weekly.completedCount}</span>
                    <span className="t-num text-2xl text-fg-3">/{weeklyTarget}</span>
                    <span className="ml-1 text-[13px] font-medium text-fg-2">training days</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[13px] font-semibold">
                  <Flame size={15} className={state.streakCount > 0 ? "text-accent" : "text-fg-3"} aria-hidden />
                  {state.streakCount}-day streak
                </div>
              </div>
              <ol className="mt-auto grid grid-cols-7 gap-1.5 pt-6" aria-label="Last 7 days">
                {t.weekly.days.map((d, i) => {
                  const isToday = d.date === today;
                  return (
                    <li key={d.date} className="flex flex-col items-center gap-2">
                      <span
                        className={cn(
                          "flex h-10 w-full items-center justify-center rounded-[10px] transition-colors duration-500",
                          d.completed
                            ? "bg-accent text-accent-ink"
                            : isToday
                              ? "border border-dashed border-white/30"
                              : "bg-white/[0.05]",
                        )}
                        style={{ transitionDelay: `${i * 40}ms` }}
                      >
                        {d.completed && <Check size={15} strokeWidth={3} aria-label="Trained" />}
                      </span>
                      <span className={cn("text-[11px] font-semibold", isToday ? "text-fg" : "text-fg-3")}>
                        {d.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
              {t.nextStreakBonus && (
                <p className="t-micro mt-4 flex items-center gap-1.5">
                  <Zap size={12} className="text-accent" aria-hidden />
                  {t.nextStreakBonus.daysLeft} day{t.nextStreakBonus.daysLeft === 1 ? "" : "s"} to a +
                  {t.nextStreakBonus.rewardXp} XP streak reward
                </p>
              )}
            </Link>
          </Enter>

          <Enter delay={240} className="col-span-12 grid grid-cols-2 gap-3 md:col-span-5 md:grid-cols-1">
            <Link
              href="/progress"
              className="pressable surface-paper flex flex-col justify-between p-5 hover:bg-white"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/50">Level</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <span className="t-num text-[64px] text-ink">{level}</span>
                <ProgressRing value={xpIn} max={XP.LEVEL_EVERY} size={52} stroke={4} tone="ink">
                  <span className="text-[10px] font-bold text-ink">{xpIn}</span>
                </ProgressRing>
              </div>
              <p className="mt-2 text-[12px] font-semibold text-ink/60">
                {XP.LEVEL_EVERY - xpIn} XP to level {level + 1}
              </p>
            </Link>

            <Link
              href="/checkin"
              className="pressable flex flex-col justify-between rounded-[var(--radius-lg)] border border-line bg-surface-1 p-5 hover:border-line-2"
            >
              <p className="t-eyebrow">Daily goal</p>
              <p className="mt-3 t-num text-[40px]">
                {t.dailyGoalMet ? "Done" : `${t.habitsCheckedToday}/${DAILY_GOAL.HABIT_QUOTA}`}
              </p>
              <p className="t-micro mt-2">
                {t.dailyGoalMet ? "Streak secured today" : "1 workout or 2 habits"}
              </p>
            </Link>
          </Enter>
        </section>

        {/* Calories */}
        <Enter delay={300} className="mt-3">
          <Link
            href="/calories"
            transitionTypes={["nav-forward"]}
            className="group pressable flex items-center gap-4 rounded-[var(--radius-lg)] border border-line bg-surface-1 p-4 hover:border-line-2 sm:p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
              <Utensils size={18} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-[14px] font-semibold">Calories today</p>
                <p className="text-[13px] tabular-nums text-fg-2">
                  <span className="font-semibold text-fg">{calories.eaten.toLocaleString()}</span> / {calories.target.toLocaleString()} kcal
                  <span className="mx-1.5 text-fg-4">·</span>
                  <Flame size={12} className="-mt-0.5 inline text-accent" aria-hidden /> {calories.burned} burned
                </p>
              </div>
              <ProgressBar value={Math.min(calories.eaten, calories.target)} max={calories.target} className="mt-2.5" label="Calories eaten vs target" />
            </div>
            <ArrowRight size={16} className="shrink-0 text-fg-3 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </Link>
        </Enter>

        {/* Habits */}
        {state.habits.length > 0 && (
          <Reveal className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="t-eyebrow">Quick habits</p>
              <Link href="/checkin" className="text-[13px] font-semibold text-fg-2 hover:text-fg">
                Manage
              </Link>
            </div>
            <div className="rail !gap-2">
              {state.habits.map((h) => {
                const on = (state.habitLogs[h.id] ?? []).includes(today);
                return (
                  <button
                    key={h.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      const r = t.toggleHabitToday(h.id);
                      if (r.checked) toast(r.xpDelta ? `${h.name} · +${r.xpDelta} XP` : `${h.name} checked`);
                    }}
                    className={cn(
                      "pressable flex h-11 items-center gap-2 rounded-full border pl-2 pr-4 text-[13px] font-semibold",
                      on
                        ? "border-fg bg-fg text-ink"
                        : "border-line-2 bg-surface-1 text-fg-2 hover:border-white/30 hover:text-fg",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                        on ? "bg-ink text-accent" : "bg-white/[0.06]",
                      )}
                    >
                      {on ? <Check size={14} strokeWidth={3} aria-hidden /> : <Plus size={14} aria-hidden />}
                    </span>
                    {h.name}
                  </button>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* Featured carousel */}
        <Reveal className="mt-12">
          <SectionHeader eyebrow="For you" title="Featured" href="/discover" linkLabel="Discover" />
          <Carousel slides={slides} label="Featured for you" />
        </Reveal>

        {/* Recommended workouts */}
        <Reveal className="mt-14">
          <SectionHeader eyebrow="Based on your goal" title="Recommended" href="/programs" linkLabel="All workouts" />
          <div className="rail">
            {recommended.map((l, i) => (
              <PosterCard
                key={l.id}
                href={`/workouts/${l.id}`}
                image={getLessonImage(l.id)}
                eyebrow={INTENSITY_LABELS[getLessonIntensity(l.id)]}
                title={l.title}
                meta={`${l.minutes} min · ${l.steps.length} moves`}
                vtName={l.id === workout?.id ? undefined : `lesson-${l.id}`}
                size={i === 0 ? "md" : "sm"}
                badge={completedLessonIds.has(l.id) ? <Pill tone="light">Done</Pill> : undefined}
              />
            ))}
          </div>
        </Reveal>

        {/* Programs — editorial split */}
        <Reveal className="mt-14">
          <SectionHeader eyebrow="Structured paths" title="Programs" href="/programs" />
          <div className="grid gap-3 md:grid-cols-5">
            {AVAILABLE_PROGRAMS.slice(0, 3).map((p, i) => {
              const lessons = getProgramLessons(p);
              const done = lessons.filter((l) => completedLessonIds.has(l.id)).length;
              return (
                <Link
                  key={p.id}
                  href={`/programs/${p.id}`}
                  transitionTypes={["nav-forward"]}
                  className={cn(
                    "group pressable relative overflow-hidden rounded-[var(--radius-lg)] bg-surface-1",
                    i === 0 ? "aspect-[4/3] md:col-span-3 md:row-span-2 md:aspect-auto" : "aspect-[16/9] md:col-span-2",
                  )}
                >
                  <Media src={p.image} alt="" zoom vtName={`program-${p.id}`} sizes="(min-width:768px) 60vw, 100vw" className="absolute inset-0" />
                  <div className="scrim-bottom absolute inset-0" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="t-eyebrow !text-fg/70">
                      {p.level} · {lessons.length} workouts
                    </p>
                    <p className={cn("mt-2 font-display font-extrabold uppercase leading-[0.9] [font-stretch:75%]", i === 0 ? "text-[2.6rem]" : "text-[1.7rem]")}>
                      {p.title}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <ProgressBar value={done} max={lessons.length} className="flex-1" label={`${p.title} progress`} />
                      <span className="text-[12px] font-semibold tabular-nums text-fg-2">
                        {done}/{lessons.length}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Reveal>

        {/* Categories mosaic */}
        <Reveal className="mt-14">
          <SectionHeader eyebrow="Train by focus" title="Categories" href="/discover" linkLabel="Browse" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                href={`/categories/${c.id}`}
                transitionTypes={["nav-forward"]}
                className={cn(
                  "group pressable relative overflow-hidden rounded-[var(--radius)] bg-surface-1",
                  i === 0 && "col-span-2 row-span-2 aspect-square md:aspect-auto",
                  i > 0 && i < 5 && "aspect-[4/3]",
                  i === 5 && "col-span-2 aspect-[2/1] md:col-span-4 md:aspect-[5/1]",
                )}
              >
                <Media src={c.image} alt="" zoom sizes="(min-width:768px) 50vw, 100vw" className="absolute inset-0" imgClassName="grayscale-[20%]" position={i === 5 ? "center 35%" : undefined} />
                <div className={cn("absolute inset-0", i === 5 ? "scrim-left" : "bg-gradient-to-t from-ink/85 via-ink/20 to-transparent")} />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 md:p-5">
                  <div>
                    <p className={cn("font-display font-extrabold uppercase leading-none [font-stretch:78%]", i === 0 || i === 5 ? "text-[2.2rem]" : "text-lg")}>
                      {c.label}
                    </p>
                    {(i === 0 || i === 5) && <p className="t-small mt-2 max-w-[30ch]">{c.tagline}</p>}
                  </div>
                  <ArrowRight size={16} className="mb-0.5 shrink-0 text-fg-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Live class + course */}
        <Reveal className="mt-14 grid gap-3 md:grid-cols-2">
          {live && (
            <div>
              <SectionHeader eyebrow="With a coach" title="Up next live" href="/classes" linkLabel="Schedule" />
              <RowCard
                href={`/classes/${live.id}`}
                image={getClassImage(live)}
                title={live.title}
                subtitle={`${live.trainer} · ${formatClassTime(live.scheduledAt)} · ${live.duration} min`}
                eyebrow={
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                    <span className="live-dot" aria-hidden /> Live
                  </span>
                }
              />
            </div>
          )}
          <div>
            <SectionHeader eyebrow="Technique" title="Courses" href="/courses" />
            <RowCard
              href={`/courses/${COURSES[0].id}`}
              image={COURSES[0].image}
              title={COURSES[0].title}
              subtitle={`${COURSES[0].lessons} lessons · ${COURSES[0].minutes} min`}
              eyebrow={<Pill tone="outline">Course</Pill>}
            />
          </div>
        </Reveal>

        {/* Technique library */}
        <Reveal className="mt-14">
          <SectionHeader eyebrow="Move better" title="Technique library" href="/learn" />
          <div className="rail">
            {EXERCISES.slice(0, 8).map((e) => (
              <Link
                key={e.id}
                href={`/learn/${e.id}`}
                transitionTypes={["nav-forward"]}
                className="group pressable w-[40vw] max-w-[170px]"
              >
                <Media src={getExerciseImage(e)} alt="" zoom sizes="170px" className="aspect-square rounded-[var(--radius)]" />
                <p className="mt-2.5 truncate text-[14px] font-semibold">{e.name}</p>
                <p className="t-micro mt-0.5 truncate">{e.muscles.slice(0, 2).join(" · ")}</p>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
