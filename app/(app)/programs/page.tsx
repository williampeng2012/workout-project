"use client";

import { ArrowRight, ArrowUpRight, Clock, Play } from "lucide-react";
import Link from "next/link";
import { nextIncomplete } from "@/components/programs/path-state";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { ProgressBar } from "@/components/ui/progress";
import { Enter, Reveal } from "@/components/ui/reveal";
import { PageHeader, Pill, SectionHeader } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/states";
import {
  AVAILABLE_PROGRAMS,
  PROGRAMS,
  getProgramForLesson,
  getProgramLessons,
  type Program,
} from "@/content/catalog";
import { getOrderedLessons } from "@/content/lessons";
import { usePulse } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";

const SOON = PROGRAMS.filter((p) => p.status === "coming-soon");
const WORKOUT_COUNT = getOrderedLessons().length;

export default function ProgramsPage() {
  const { hydrated, completedLessonIds, currentLessonId } = usePulse();

  const featured =
    (currentLessonId ? getProgramForLesson(currentLessonId) : undefined) ??
    AVAILABLE_PROGRAMS[AVAILABLE_PROGRAMS.length - 1];
  const others = AVAILABLE_PROGRAMS.filter((p) => p.id !== featured.id);

  return (
    <main className="page-bottom min-h-dvh">
      <div className="page-x mx-auto max-w-[1180px] pt-[calc(var(--safe-top)+28px)] lg:pt-12">
        <PageHeader
          eyebrow="Structured paths"
          title="Programs"
          action={
            <ButtonLink
              href="/workouts"
              transitionTypes={["nav-forward"]}
              variant="secondary"
              size="sm"
              iconRight={<ArrowRight size={14} aria-hidden />}
            >
              All workouts
            </ButtonLink>
          }
        />
        <p className="t-body enter-soft mt-3 hidden max-w-[46ch] sm:block" style={{ ["--d" as string]: "160ms" }}>
          Coached blocks that build on each other. Follow them in order, or jump into any workout.
        </p>

        <div className="mt-6 sm:mt-8">
          {hydrated ? (
            <FeaturedProgram program={featured} completed={completedLessonIds} />
          ) : (
            <Skeleton className="hero-fit w-full !rounded-[var(--radius-lg)]" />
          )}
        </div>

        {/* Other available programs — asymmetric editorial list */}
        <Reveal className="mt-16">
          <SectionHeader eyebrow="Keep building" title="More programs" />
          <ol className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {others.map((p, i) => {
              const lessons = getProgramLessons(p);
              const done = hydrated ? lessons.filter((l) => completedLessonIds.has(l.id)).length : 0;
              const index = AVAILABLE_PROGRAMS.indexOf(p) + 1;
              return (
                <li key={p.id} className={cn(i % 2 === 0 ? "md:col-span-7" : "md:col-span-5")}>
                  <Link
                    href={`/programs/${p.id}`}
                    transitionTypes={["nav-forward"]}
                    className="group pressable flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface-1 hover:border-line-2"
                  >
                    <Media
                      src={p.image}
                      alt=""
                      zoom
                      vtName={`program-${p.id}`}
                      sizes="(min-width: 768px) 55vw, 100vw"
                      className={cn("w-full", i % 2 === 0 ? "aspect-[16/9]" : "aspect-[16/9] md:aspect-[4/3]")}
                    />
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <span className="t-num text-[44px] text-fg-4" aria-hidden>
                          {String(index).padStart(2, "0")}
                        </span>
                        <ArrowUpRight
                          size={18}
                          className="mt-1 text-fg-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                          aria-hidden
                        />
                      </div>
                      <p className="t-eyebrow mt-3">
                        {p.level} · {p.weeks} wk · {lessons.length} workouts
                      </p>
                      <h3 className="mt-2 font-display text-[2rem] font-extrabold uppercase leading-[0.9] [font-stretch:75%]">
                        {p.title}
                      </h3>
                      <p className="t-small mt-2 max-w-[42ch]">{p.tagline}</p>
                      <div className="mt-auto flex items-center gap-3 pt-6">
                        <ProgressBar value={done} max={lessons.length} className="flex-1" label={`${p.title} progress`} />
                        <span className="text-[12px] font-semibold tabular-nums text-fg-2">
                          {done}/{lessons.length}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Reveal>

        {/* Coming soon */}
        <Reveal className="mt-16">
          <SectionHeader eyebrow="In production" title="Coming soon" />
          <ul className="grid gap-3 sm:grid-cols-3">
            {SOON.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/programs/${p.id}`}
                  transitionTypes={["nav-forward"]}
                  className="group pressable relative block aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-surface-1 sm:aspect-[3/4]"
                >
                  <Media
                    src={p.image}
                    alt=""
                    zoom
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="absolute inset-0"
                    imgClassName="grayscale-[45%]"
                  />
                  <div className="scrim-bottom absolute inset-0" />
                  <div className="absolute left-3 top-3">
                    <Pill tone="outline" className="bg-ink/40 backdrop-blur-md">
                      Soon
                    </Pill>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="t-eyebrow !text-fg/60">
                      {p.level} · {p.weeks} wk · {p.coach}
                    </p>
                    <p className="mt-2 font-display text-[1.7rem] font-extrabold uppercase leading-[0.9] [font-stretch:75%]">
                      {p.title}
                    </p>
                    <p className="t-small mt-2 line-clamp-2">{p.tagline}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* All workouts */}
        <Reveal className="mt-16">
          <Link
            href="/workouts"
            transitionTypes={["nav-forward"]}
            className="group pressable flex items-center justify-between gap-6 border-y border-line py-7 hover:border-line-2"
          >
            <div>
              <p className="t-eyebrow">Library</p>
              <p className="t-display mt-2">All workouts</p>
              <p className="t-small mt-2">
                {WORKOUT_COUNT} sessions across {AVAILABLE_PROGRAMS.length} programs
              </p>
            </div>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line-2 transition-colors duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-ink">
              <ArrowRight size={20} aria-hidden />
            </span>
          </Link>
        </Reveal>
      </div>
    </main>
  );
}

function FeaturedProgram({ program, completed }: { program: Program; completed: Set<string> }) {
  const lessons = getProgramLessons(program);
  const done = lessons.filter((l) => completed.has(l.id)).length;
  const next = nextIncomplete(lessons, completed);
  const finished = !next;
  const cta = finished ? "Review program" : done === 0 ? "Start program" : "Continue";
  const ctaHref = next ? `/workouts/${next.id}` : `/programs/${program.id}`;

  return (
    <Enter delay={120}>
      <section
        aria-label={`Your program: ${program.title}`}
        className="relative isolate overflow-hidden rounded-[var(--radius-lg)] bg-surface-1"
      >
        <div className="hero-fit relative w-full">
          <Media
            src={program.image}
            alt=""
            priority
            vtName={`program-${program.id}`}
            sizes="(min-width: 1024px) 1100px, 100vw"
            className="absolute inset-0"
          />
          <div className="scrim-bottom absolute inset-0" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/85 via-ink/25 to-transparent sm:block" />

          <div className="absolute inset-x-0 bottom-0 grid grid-cols-1 gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:p-10">
            <div className="max-w-[40rem]">
              <div className="enter-soft flex flex-wrap items-center gap-2" style={{ ["--d" as string]: "240ms" }}>
                <Pill tone="accent">{finished ? "Completed" : "Your program"}</Pill>
                <Pill>{program.level}</Pill>
              </div>
              <h2 className="t-hero enter mt-4 max-w-[10ch] text-balance" style={{ ["--d" as string]: "300ms" }}>
                {program.title}
              </h2>
              <p className="t-body enter-soft mt-3 hidden max-w-[40ch] sm:block" style={{ ["--d" as string]: "380ms" }}>
                {program.tagline}
              </p>
              <div className="enter-soft mt-6 flex flex-wrap gap-2.5" style={{ ["--d" as string]: "460ms" }}>
                <ButtonLink
                  href={ctaHref}
                  transitionTypes={["nav-forward"]}
                  size="lg"
                  icon={finished ? undefined : <Play size={16} fill="currentColor" aria-hidden />}
                >
                  {cta}
                </ButtonLink>
                {next && (
                  <span className="hidden sm:contents">
                    <ButtonLink
                      href={`/programs/${program.id}`}
                      transitionTypes={["nav-forward"]}
                      size="lg"
                      variant="secondary"
                    >
                      Program details
                    </ButtonLink>
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/programs/${program.id}`}
              transitionTypes={["nav-forward"]}
              aria-label={`${program.title}: ${done} of ${lessons.length} workouts complete — open program`}
              className="group glass enter-soft pressable block rounded-[var(--radius)] p-4 hover:bg-white/10"
              style={{ ["--d" as string]: "540ms" }}
            >
              <div className="flex items-baseline justify-between">
                <p className="t-eyebrow !text-fg-2">Progress</p>
                <p className="flex items-center gap-1.5 text-[12px] font-semibold tabular-nums text-fg-2">
                  {done}/{lessons.length} workouts
                  <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </p>
              </div>
              <ProgressBar value={done} max={lessons.length} className="mt-3" label={`${program.title} progress`} />
              {next && (
                <p className="mt-4 flex items-center gap-2 text-[13px] font-medium">
                  <Clock size={13} className="shrink-0 text-fg-3" aria-hidden />
                  <span className="truncate">
                    <span className="text-fg-3">Up next · </span>
                    {next.title}
                  </span>
                  <span className="ml-auto shrink-0 text-fg-3">{next.minutes} min</span>
                </p>
              )}
            </Link>
          </div>
        </div>
      </section>
    </Enter>
  );
}
