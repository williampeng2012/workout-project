"use client";

import { ArrowRight, BellRing } from "lucide-react";
import Link from "next/link";
import { Media } from "@/components/ui/media";
import { Enter, Reveal } from "@/components/ui/reveal";
import { PageHeader, Pill, SectionHeader } from "@/components/ui/section";
import { COURSES, type Course } from "@/content/catalog";
import { getExercise } from "@/content/exercises";
import { cn } from "@/lib/cn";
import { useNotify } from "./shared";

const available = COURSES.filter((c) => c.status === "available");
const soon = COURSES.filter((c) => c.status === "coming-soon");

export function CoursesView() {
  return (
    <main className="page-bottom min-h-dvh">
      <div className="page-x mx-auto max-w-[1180px] pt-[calc(var(--safe-top)+28px)] lg:pt-12">
        <PageHeader
          eyebrow="Technique, step by step"
          title="Courses"
          description="Short guided sequences that teach one movement at a time — cues, common mistakes and safety notes included."
        />

        <div className="mt-10 space-y-12 md:mt-14 md:space-y-16">
          {available.map((c, i) => (
            <AvailableCourse key={c.id} course={c} index={i} />
          ))}
        </div>

        {soon.length > 0 && (
          <Reveal className="mt-20">
            <SectionHeader eyebrow="In production" title="Coming soon" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {soon.map((c) => (
                <SoonCourse key={c.id} course={c} />
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}

function AvailableCourse({ course, index }: { course: Course; index: number }) {
  const flip = index % 2 === 1;
  const Wrap = index === 0 ? Enter : Reveal;
  const moves = course.exerciseIds.map((id) => getExercise(id)?.name).filter(Boolean);

  return (
    <Wrap delay={index === 0 ? 200 : 0}>
      <Link
        href={`/courses/${course.id}`}
        transitionTypes={["nav-forward"]}
        className="group grid items-center gap-6 md:grid-cols-12 md:gap-10"
      >
        <Media
          src={course.image}
          alt=""
          zoom
          priority={index === 0}
          vtName={`course-${course.id}`}
          sizes="(min-width:768px) 680px, 100vw"
          className={cn(
            "aspect-[16/11] rounded-[var(--radius-lg)] md:col-span-7",
            flip && "md:order-2",
          )}
        />
        <div className={cn("md:col-span-5", flip && "md:order-1")}>
          <p className="t-eyebrow flex items-center gap-3">
            <span className="tabular-nums text-fg-2">{String(index + 1).padStart(2, "0")}</span>
            <span className="h-px w-8 bg-line-2" aria-hidden />
            {course.exerciseIds.length} lessons · {course.minutes} min
          </p>
          <h2 className="t-display mt-4 text-balance">{course.title}</h2>
          <p className="t-body mt-4 max-w-[40ch]">{course.tagline}</p>
          <p className="t-small mt-5 max-w-[44ch] text-fg-3">{moves.join(" · ")}</p>
          <span className="mt-7 inline-flex h-11 items-center gap-2 rounded-full border border-line-2 px-5 text-[14px] font-semibold transition-colors duration-300 group-hover:border-white/30 group-hover:bg-white/[0.05]">
            Open course
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </Link>
    </Wrap>
  );
}

function SoonCourse({ course }: { course: Course }) {
  const { on } = useNotify(`course-${course.id}`);
  return (
    <Link
      href={`/courses/${course.id}`}
      transitionTypes={["nav-forward"]}
      className="group pressable relative block aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-surface-1"
    >
      <Media
        src={course.image}
        alt=""
        zoom
        sizes="(min-width:768px) 280px, 50vw"
        className="absolute inset-0"
        imgClassName="grayscale-[45%]"
      />
      <div className="scrim-bottom absolute inset-0" />
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <Pill tone="light">Soon</Pill>
        {on && (
          <Pill>
            <BellRing size={11} aria-hidden /> Notifying
          </Pill>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="t-eyebrow !text-fg/65">
          {course.lessons} lessons · {course.minutes} min
        </p>
        <p className="mt-1.5 text-balance font-display text-[1.35rem] font-extrabold uppercase leading-[0.92] [font-stretch:78%]">
          {course.title}
        </p>
        <p className="t-micro mt-2 line-clamp-2">{course.tagline}</p>
      </div>
    </Link>
  );
}
