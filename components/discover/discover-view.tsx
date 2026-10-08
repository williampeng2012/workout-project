"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { RowCard } from "@/components/cards";
import { Carousel } from "@/components/ui/carousel";
import { Media } from "@/components/ui/media";
import { Enter, Reveal } from "@/components/ui/reveal";
import { PageHeader, Pill, SectionHeader } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/states";
import {
  COURSES,
  SEARCH_SUGGESTIONS,
  getClassImage,
  getExercisesByCategoryId,
  getLessonsByCategory,
  type Course,
} from "@/content/catalog";
import { getReplayClasses } from "@/content/classes";
import { DIFFICULTY_LABELS, EXERCISES } from "@/content/exercises";
import { featuredSlides, orderedCategories } from "@/lib/recommendations";
import { usePulse } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";
import { ClassTime, CornerArrow, ExerciseTile, useLiveClasses, useNotify } from "./shared";

export function DiscoverView() {
  const { hydrated, state, currentLessonId } = usePulse();

  const slides = useMemo(
    () => featuredSlides({ goal: state.goal, currentLessonId }),
    [state.goal, currentLessonId],
  );
  const categories = useMemo(() => orderedCategories(state.goal), [state.goal]);
  const [nextLive, ...laterLive] = useLiveClasses();
  const latestReplay = getReplayClasses()[0];

  return (
    <main className="page-bottom min-h-dvh">
      <div className="page-x mx-auto max-w-[1180px] pt-[calc(var(--safe-top)+28px)] lg:pt-12">
        <PageHeader
          eyebrow="Explore"
          title="Discover"
          description="Workouts, coached classes and technique — everything Pulsepath has, in one place."
        />

        {/* Search entry */}
        <Enter delay={200} className="mt-7">
          <Link
            href="/search"
            className="group pressable flex h-14 items-center gap-3 rounded-full border border-line-2 bg-surface-1 pl-5 pr-2 hover:border-white/25 hover:bg-surface-2 sm:h-16 sm:pl-6"
          >
            <Search size={19} className="shrink-0 text-fg-2" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-[15px] text-fg-3 sm:text-base">
              Search workouts, classes, techniques…
            </span>
            <span className="hidden items-center gap-1.5 text-[12px] font-medium text-fg-3 md:flex">
              Try
              {SEARCH_SUGGESTIONS.slice(0, 3).map((s) => (
                <span key={s} className="rounded-full border border-line px-2.5 py-1 text-fg-2">
                  {s}
                </span>
              ))}
            </span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fg text-ink transition-transform duration-300 group-hover:translate-x-0.5 sm:h-12 sm:w-12">
              <ArrowRight size={17} aria-hidden />
            </span>
          </Link>
        </Enter>

        {/* Featured */}
        <Enter delay={280} className="mt-12">
          <SectionHeader eyebrow={state.goal ? "Picked for your goal" : "This week"} title="Featured" />
          {hydrated ? (
            <Carousel slides={slides} label="Featured on Pulsepath" />
          ) : (
            <Skeleton className="aspect-[4/5] w-full !rounded-[var(--radius-lg)] sm:aspect-[16/10] lg:aspect-[21/9]" />
          )}
        </Enter>

        {/* Categories — asymmetric index */}
        <Reveal className="mt-16">
          <SectionHeader eyebrow="Train by focus" title="Categories" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:grid-rows-[repeat(2,minmax(0,220px))]">
            {categories.map((c, i) => {
              const workouts = getLessonsByCategory(c.id).length;
              const tutorials = getExercisesByCategoryId(c.id).length;
              const feature = i === 0;
              const wide = i === categories.length - 1;
              return (
                <Link
                  key={c.id}
                  href={`/categories/${c.id}`}
                  transitionTypes={["nav-forward"]}
                  className={cn(
                    "group pressable relative overflow-hidden rounded-[var(--radius)] bg-surface-1 md:aspect-auto",
                    feature && "col-span-2 aspect-[4/3] md:col-span-3 md:row-span-2",
                    wide && "col-span-2 aspect-[2/1] md:col-span-2",
                    !feature && !wide && "aspect-square md:col-span-1",
                  )}
                >
                  <Media
                    src={c.image}
                    alt=""
                    zoom
                    vtName={`category-${c.id}`}
                    sizes={feature ? "(min-width:768px) 600px, 100vw" : "(min-width:768px) 320px, 50vw"}
                    className="absolute inset-0"
                    imgClassName="grayscale-[20%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
                  <span className="t-micro absolute left-4 top-4 font-semibold tabular-nums !text-fg/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "font-display font-extrabold uppercase leading-[0.9] [font-stretch:75%]",
                          feature ? "text-[2.6rem] md:text-[3.4rem]" : wide ? "text-[1.8rem]" : "text-[1.35rem]",
                        )}
                      >
                        {c.label}
                      </p>
                      {feature || wide ? (
                        <p className="t-small mt-2 max-w-[32ch]">{c.tagline}</p>
                      ) : (
                        <p className="t-micro mt-1.5">
                          {workouts} workouts · {tutorials} guides
                        </p>
                      )}
                    </div>
                    <ArrowRight
                      size={16}
                      className="mb-0.5 shrink-0 text-fg-2 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </Reveal>

        {/* Live & upcoming classes */}
        <Reveal className="mt-16">
          <SectionHeader eyebrow="With a coach" title="Live & upcoming" href="/classes" linkLabel="Schedule" />
          <div className="grid gap-3 md:grid-cols-12">
            {nextLive && (
              <Link
                href={`/classes/${nextLive.id}`}
                transitionTypes={["nav-forward"]}
                className="group pressable relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-surface-1 md:col-span-7 md:aspect-auto md:min-h-[360px]"
              >
                <Media
                  src={getClassImage(nextLive)}
                  alt=""
                  zoom
                  vtName={`class-${nextLive.id}`}
                  sizes="(min-width:768px) 700px, 100vw"
                  className="absolute inset-0"
                />
                <div className="scrim-bottom absolute inset-0" />
                <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-5 sm:top-5">
                  <span className="glass flex h-7 items-center gap-2 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                    <span className="live-dot" aria-hidden /> Up next
                  </span>
                </div>
                <CornerArrow className="absolute right-4 top-4 sm:right-5 sm:top-5" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="t-eyebrow !text-fg/70">
                    <ClassTime iso={nextLive.scheduledAt} /> · {nextLive.duration} min
                  </p>
                  <p className="mt-2 max-w-[14ch] font-display text-[2.3rem] font-extrabold uppercase leading-[0.9] [font-stretch:75%] sm:text-[2.8rem]">
                    {nextLive.title}
                  </p>
                  <p className="t-small mt-3">
                    {nextLive.trainer} · {DIFFICULTY_LABELS[nextLive.difficulty]}
                  </p>
                </div>
              </Link>
            )}
            <div className="flex flex-col gap-3 md:col-span-5">
              {laterLive.map((c) => (
                <RowCard
                  key={c.id}
                  href={`/classes/${c.id}`}
                  image={getClassImage(c)}
                  title={c.title}
                  subtitle={`${c.trainer} · ${c.duration} min`}
                  eyebrow={
                    <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-fg-2">
                      <ClassTime iso={c.scheduledAt} />
                    </span>
                  }
                />
              ))}
              {latestReplay && (
                <RowCard
                  href={`/classes/${latestReplay.id}`}
                  image={getClassImage(latestReplay)}
                  title={latestReplay.title}
                  subtitle={`${latestReplay.trainer} · ${latestReplay.duration} min`}
                  eyebrow={<Pill tone="outline">Replay</Pill>}
                />
              )}
              <Link
                href="/classes"
                className="pressable group mt-auto flex items-center justify-between rounded-[var(--radius)] border border-line px-5 py-4 text-[14px] font-semibold text-fg-2 hover:border-line-2 hover:text-fg"
              >
                See the full schedule
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Courses */}
        <Reveal className="mt-16">
          <SectionHeader eyebrow="Technique, step by step" title="Courses" href="/courses" linkLabel="All courses" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-12">
            {coursesByStatus.map((c) => (
              <CourseTile key={c.id} course={c} />
            ))}
          </div>
        </Reveal>

        {/* Technique library */}
        <Reveal className="mt-16">
          <SectionHeader eyebrow="Move better" title="Technique library" href="/learn" linkLabel="Open library" />
          <div className="rail">
            {EXERCISES.map((e) => (
              <ExerciseTile key={e.id} exercise={e} />
            ))}
          </div>
        </Reveal>
      </div>
    </main>
  );
}

const coursesByStatus = [...COURSES].sort(
  (a, b) => Number(a.status !== "available") - Number(b.status !== "available"),
);

function CourseTile({ course }: { course: Course }) {
  const soon = course.status === "coming-soon";
  const { on } = useNotify(`course-${course.id}`);
  return (
    <Link
      href={`/courses/${course.id}`}
      transitionTypes={["nav-forward"]}
      className={cn(
        "group pressable relative block aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-surface-1 md:aspect-auto md:h-[340px]",
        soon ? "md:col-span-2" : "md:col-span-4",
      )}
    >
      <Media
        src={course.image}
        alt=""
        zoom
        vtName={soon ? undefined : `course-${course.id}`}
        sizes={soon ? "(min-width:768px) 200px, 50vw" : "(min-width:768px) 400px, 50vw"}
        className="absolute inset-0"
        imgClassName={soon ? "grayscale-[45%]" : undefined}
      />
      <div className="scrim-bottom absolute inset-0" />
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        {soon ? <Pill tone="light">Soon</Pill> : <Pill>Course</Pill>}
        {soon && on && <Pill>Notifying</Pill>}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="t-eyebrow !text-fg/70">
          {course.lessons} lessons · {course.minutes} min
        </p>
        <p
          className={cn(
            "mt-1.5 text-balance font-display font-extrabold uppercase leading-[0.92] [font-stretch:78%]",
            soon ? "text-[1.25rem]" : "text-[1.4rem] md:text-[2.2rem]",
          )}
        >
          {course.title}
        </p>
        {!soon && <p className="t-small mt-2 hidden max-w-[36ch] md:block">{course.tagline}</p>}
      </div>
    </Link>
  );
}
