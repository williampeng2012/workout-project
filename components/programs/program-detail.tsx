"use client";

import { ArrowRight, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { StepRow } from "@/components/cards";
import { DetailHero } from "@/components/programs/detail-hero";
import { getLessonState, lessonMeta, nextIncomplete } from "@/components/programs/path-state";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { ProgressBar } from "@/components/ui/progress";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/states";
import { TopBar } from "@/components/ui/top-bar";
import { AVAILABLE_PROGRAMS, getLessonImage, getProgram, getProgramLessons } from "@/content/catalog";
import { usePulse } from "@/lib/store/pulse-store";

export function ProgramDetail({ programId }: { programId: string }) {
  const program = getProgram(programId)!;
  const { hydrated, completedLessonIds, currentLessonId, lessonOrder } = usePulse();
  const lessons = getProgramLessons(program);
  const totalMinutes = lessons.reduce((s, l) => s + l.minutes, 0);
  const done = hydrated ? lessons.filter((l) => completedLessonIds.has(l.id)).length : 0;
  const next = hydrated ? nextIncomplete(lessons, completedLessonIds) : null;
  const finished = hydrated && !next;
  const target = next ?? lessons[0];
  const cta = finished ? "Train again" : done === 0 ? "Start program" : "Continue";
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;

  const order = AVAILABLE_PROGRAMS.findIndex((p) => p.id === program.id);
  const following = AVAILABLE_PROGRAMS[order + 1];

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar overlay title={program.title} fallback="/programs" />

      <DetailHero image={program.image} vtName={`program-${program.id}`}>
        <div className="enter-soft flex flex-wrap items-center gap-2" style={{ ["--d" as string]: "200ms" }}>
          <Pill tone={finished ? "light" : "accent"}>{finished ? "Completed" : `Program ${String(order + 1).padStart(2, "0")}`}</Pill>
          <Pill>{program.level}</Pill>
        </div>
        <h1 className="t-hero enter mt-4 max-w-[11ch] text-balance" style={{ ["--d" as string]: "260ms" }}>
          {program.title}
        </h1>
        <p className="t-body enter-soft mt-4 max-w-[44ch] text-[16px] !text-fg" style={{ ["--d" as string]: "340ms" }}>
          {program.tagline}
        </p>
      </DetailHero>

      <div className="page-x mx-auto max-w-[1180px]">
        <div className="grid grid-cols-1 gap-12 pt-8 lg:grid-cols-12 lg:gap-10">
          {/* Summary column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <Enter delay={380}>
                <dl className="grid grid-cols-3 border-y border-line py-5">
                  {[
                    { label: "Weeks", value: String(program.weeks) },
                    { label: "Workouts", value: String(lessons.length) },
                    { label: "Minutes", value: String(totalMinutes) },
                  ].map((s, i) => (
                    <div key={s.label} className={i > 0 ? "border-l border-line pl-4" : undefined}>
                      <dt className="t-micro uppercase tracking-[0.14em]">{s.label}</dt>
                      <dd className="t-num mt-2 text-[34px]">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </Enter>

              <Enter delay={440}>
                <p className="t-body mt-6">{program.description}</p>
                <p className="t-small mt-3">
                  Coached by <span className="font-semibold text-fg">{program.coach}</span>
                </p>
              </Enter>

              <Enter delay={500}>
                <div className="mt-8">
                  {hydrated ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <p className="t-eyebrow">Your progress</p>
                        <p className="text-[13px] font-semibold tabular-nums">
                          {done}/{lessons.length} · {pct}%
                        </p>
                      </div>
                      <ProgressBar value={done} max={lessons.length} className="mt-3" label={`${program.title} progress`} />
                      <ButtonLink
                        href={`/workouts/${target.id}`}
                        transitionTypes={["nav-forward"]}
                        size="lg"
                        block
                        className="mt-6 sm:w-auto"
                        icon={
                          finished ? (
                            <RotateCcw size={16} aria-hidden />
                          ) : (
                            <Play size={16} fill="currentColor" aria-hidden />
                          )
                        }
                      >
                        <span className="truncate">
                          {cta}
                          <span className="font-medium opacity-60"> · {target.title}</span>
                        </span>
                      </ButtonLink>
                    </>
                  ) : (
                    <>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="mt-6 h-[54px] w-56 !rounded-full" />
                    </>
                  )}
                </div>
              </Enter>
            </div>
          </div>

          {/* Timeline */}
          <Reveal className="lg:col-span-7">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="t-eyebrow mb-2">The sessions</p>
                <h2 className="t-title">Workouts</h2>
              </div>
              <p className="t-micro pb-1">{totalMinutes} min total</p>
            </div>
            <ol className="relative space-y-2">
              <span className="absolute bottom-6 left-[32px] top-6 w-px bg-line" aria-hidden />
              {lessons.map((l, i) => (
                <li key={l.id} className="relative">
                  {hydrated ? (
                    <StepRow
                      href={`/workouts/${l.id}`}
                      index={i + 1}
                      title={l.title}
                      meta={lessonMeta(l)}
                      state={getLessonState(l.id, completedLessonIds, currentLessonId, lessonOrder)}
                      image={getLessonImage(l.id)}
                    />
                  ) : (
                    <Skeleton className="h-[66px] w-full !rounded-[var(--radius)]" />
                  )}
                </li>
              ))}
            </ol>
            <p className="t-micro mt-4">
              Your path unlocks one workout at a time — locked sessions can still be previewed.
            </p>
          </Reveal>
        </div>

        {following && (
          <Reveal className="mt-20">
            <Link
              href={`/programs/${following.id}`}
              transitionTypes={["nav-forward"]}
              className="group pressable relative block overflow-hidden rounded-[var(--radius-lg)] bg-surface-1"
            >
              <Media
                src={following.image}
                alt=""
                zoom
                vtName={`program-${following.id}`}
                sizes="(min-width: 1024px) 1100px, 100vw"
                className="aspect-[16/10] w-full sm:aspect-[21/8]"
              />
              <div className="scrim-left absolute inset-0" />
              <div className="absolute inset-y-0 left-0 flex max-w-[36rem] flex-col justify-end p-5 sm:justify-center sm:p-10">
                <p className="t-eyebrow !text-fg/70">Next in your path</p>
                <p className="t-display mt-3">{following.title}</p>
                <p className="t-small mt-3 hidden max-w-[40ch] sm:block">{following.tagline}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold">
                  View program
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </span>
              </div>
            </Link>
          </Reveal>
        )}
      </div>
    </main>
  );
}
