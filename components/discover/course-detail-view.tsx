"use client";

import { ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import { RowCard } from "@/components/cards";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill, SectionHeader } from "@/components/ui/section";
import { ComingSoon } from "@/components/ui/states";
import { TopBar } from "@/components/ui/top-bar";
import { COURSES, getCourse, getExerciseImage } from "@/content/catalog";
import { DIFFICULTY_LABELS, getExercise, type Exercise } from "@/content/exercises";
import { DetailHero, FactRow } from "./shared";

export function CourseDetailView({ id }: { id: string }) {
  const course = getCourse(id)!;
  const others = COURSES.filter((c) => c.id !== course.id);

  if (course.status === "coming-soon") {
    return (
      <ComingSoon
        id={`course-${course.id}`}
        eyebrow="Course · Coming soon"
        title={course.title}
        description={course.description}
        image={course.image}
        fallback="/courses"
        details={[
          { label: "Lessons", value: String(course.lessons) },
          { label: "Length", value: `${course.minutes} min` },
          { label: "Status", value: "In production" },
        ]}
        primary={{ label: "Open technique library", href: "/learn" }}
      >
        <p className="t-eyebrow mb-3">Available now</p>
        <div className="space-y-2.5">
          {others
            .filter((c) => c.status === "available")
            .map((c) => (
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
      </ComingSoon>
    );
  }

  const lessons = course.exerciseIds
    .map((eid) => getExercise(eid))
    .filter((e): e is Exercise => Boolean(e));
  const first = lessons[0];

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title={course.title} fallback="/courses" overlay />

      <DetailHero image={course.image} vtName={`course-${course.id}`}>
        <Enter variant="enter-soft" delay={120} className="flex flex-wrap items-center gap-2">
          <Pill tone="light">Course</Pill>
          <Pill>
            {lessons.length} lessons · {course.minutes} min
          </Pill>
        </Enter>
        <Enter delay={180}>
          <h1 className="t-hero mt-4 max-w-[10ch] text-balance">{course.title}</h1>
        </Enter>
        <Enter variant="enter-soft" delay={260}>
          <p className="t-body mt-4 max-w-[38ch] text-[17px] text-fg">{course.tagline}</p>
        </Enter>
        {first && (
          <Enter variant="enter-soft" delay={340} className="mt-6">
            <ButtonLink
              href={`/learn/${first.id}`}
              transitionTypes={["nav-forward"]}
              size="lg"
              icon={<Play size={16} fill="currentColor" aria-hidden />}
              className="max-w-full"
            >
              <span className="truncate">Start · {first.name}</span>
            </ButtonLink>
          </Enter>
        )}
      </DetailHero>

      <div className="page-x mx-auto max-w-[1180px]">
        <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-12">
          <Reveal className="md:col-span-4">
            <div className="md:sticky md:top-24">
              <h2 className="t-eyebrow">About the course</h2>
              <p className="mt-4 text-[17px] leading-[1.55] text-fg">{course.description}</p>
              <FactRow
                className="mt-8"
                facts={[
                  { label: "Lessons", value: lessons.length },
                  { label: "Length", value: `${course.minutes} min` },
                ]}
              />
            </div>
          </Reveal>

          <section className="md:col-span-8" aria-labelledby="course-lessons">
            <h2 id="course-lessons" className="t-title">
              Lessons
            </h2>
            <ol className="mt-5 border-t border-line">
              {lessons.map((e, i) => (
                <Reveal key={e.id} as="li" delay={i * 60}>
                  <Link
                    href={`/learn/${e.id}`}
                    transitionTypes={["nav-forward"]}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-4 transition-colors duration-300 hover:bg-white/[0.02] sm:gap-6 sm:py-5"
                  >
                    <span className="t-num w-10 text-[34px] text-fg-4 transition-colors duration-300 group-hover:text-fg sm:w-14 sm:text-[44px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex min-w-0 items-center gap-4">
                      <Media
                        src={getExerciseImage(e)}
                        alt=""
                        zoom
                        vtName={`exercise-${e.id}`}
                        sizes="96px"
                        className="h-16 w-16 shrink-0 rounded-[var(--radius-sm)] sm:h-20 sm:w-20"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-semibold sm:text-[17px]">{e.name}</p>
                        <p className="t-micro mt-1 truncate !text-[12px]">
                          {DIFFICULTY_LABELS[e.difficulty]} · {e.reps} · {e.muscles.slice(0, 2).join(", ")}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="shrink-0 text-fg-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                      aria-hidden
                    />
                  </Link>
                </Reveal>
              ))}
            </ol>
          </section>
        </div>

        <Reveal className="mt-16">
          <SectionHeader eyebrow="Keep learning" title="More courses" href="/courses" linkLabel="All courses" />
          <div className="grid gap-2.5 md:grid-cols-3">
            {others.map((c) => (
              <RowCard
                key={c.id}
                href={`/courses/${c.id}`}
                image={c.image}
                title={c.title}
                subtitle={`${c.lessons} lessons · ${c.minutes} min`}
                eyebrow={c.status === "available" ? <Pill tone="outline">Course</Pill> : <Pill tone="light">Soon</Pill>}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
