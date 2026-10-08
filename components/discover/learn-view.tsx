"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Enter, Reveal } from "@/components/ui/reveal";
import { PageHeader, Pill } from "@/components/ui/section";
import { ChipGroup } from "@/components/ui/segmented";
import { COURSES, IMAGES, getExerciseImage } from "@/content/catalog";
import { DIFFICULTY_LABELS, EXERCISES, type Exercise } from "@/content/exercises";
import { cn } from "@/lib/cn";
import { EXERCISE_CATEGORY_LABELS } from "./shared";

type Filter = "all" | Exercise["category"];

const CATEGORY_ORDER: Exercise["category"][] = ["strength", "core", "cardio", "mobility", "warmup", "cooldown"];

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  ...CATEGORY_ORDER.filter((c) => EXERCISES.some((e) => e.category === c)).map((c) => ({
    value: c as Filter,
    label: EXERCISE_CATEGORY_LABELS[c],
  })),
];

export function LearnView() {
  const [filter, setFilter] = useState<Filter>("all");
  const list = filter === "all" ? EXERCISES : EXERCISES.filter((e) => e.category === filter);
  // Only feature the first tile when the rest still pair up evenly on mobile.
  const feature = list.length > 2 && (list.length - 1) % 2 === 0;
  const availableCourses = COURSES.filter((c) => c.status === "available").length;

  return (
    <main className="page-bottom min-h-dvh">
      <div className="page-x mx-auto max-w-[1180px] pt-[calc(var(--safe-top)+28px)] lg:pt-12">
        <PageHeader
          eyebrow="Technique library"
          title="Learn the moves"
          description="Step-by-step form guides with the cues, mistakes and safety notes our coaches use."
          action={
            <ButtonLink href="/courses" variant="secondary" size="sm" className="hidden sm:inline-flex">
              Courses
            </ButtonLink>
          }
        />

        <Enter variant="enter-soft" delay={200} className="mt-8">
          <ChipGroup label="Filter by focus" value={filter} onChange={setFilter} options={FILTERS} />
        </Enter>

        <p className="t-micro mt-4" aria-live="polite">
          {list.length} guide{list.length === 1 ? "" : "s"}
        </p>

        <ul key={filter} className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {list.map((e, i) => {
            const big = feature && i === 0;
            return (
              <Enter
                key={e.id}
                as="li"
                variant="enter-soft"
                delay={Math.min(i, 8) * 50}
                className={cn(big && "col-span-2 md:row-span-2")}
              >
                <Link
                  href={`/learn/${e.id}`}
                  transitionTypes={["nav-forward"]}
                  className={cn(
                    "group pressable relative block overflow-hidden rounded-[var(--radius)] bg-surface-1",
                    big ? "aspect-[16/11] md:aspect-auto md:h-full" : "aspect-[4/5]",
                  )}
                >
                  <Media
                    src={getExerciseImage(e)}
                    alt=""
                    zoom
                    vtName={`exercise-${e.id}`}
                    sizes={big ? "(min-width:768px) 560px, 100vw" : "(min-width:768px) 280px, 50vw"}
                    className="absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
                  <span className="t-micro absolute left-3.5 top-3.5 font-semibold tabular-nums !text-fg/70">
                    {String(EXERCISES.indexOf(e) + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute right-3 top-3">
                    <Pill>{DIFFICULTY_LABELS[e.difficulty]}</Pill>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="t-eyebrow !text-fg/65">{EXERCISE_CATEGORY_LABELS[e.category]}</p>
                    <p
                      className={cn(
                        "mt-1.5 text-balance font-display font-extrabold uppercase leading-[0.92] [font-stretch:78%]",
                        big ? "text-[2.2rem] md:text-[3rem]" : "text-[1.25rem] sm:text-[1.4rem]",
                      )}
                    >
                      {e.name}
                    </p>
                    <p className="t-micro mt-1.5 truncate">{e.muscles.slice(0, big ? 4 : 2).join(" · ")}</p>
                  </div>
                </Link>
              </Enter>
            );
          })}
        </ul>

        {/* Go deeper */}
        <Reveal className="mt-16">
          <Link
            href="/courses"
            className="group pressable grid overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface-1 hover:border-line-2 md:grid-cols-12"
          >
            <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-6 lg:p-10">
              <p className="t-eyebrow">Go deeper</p>
              <p className="t-title mt-3 max-w-[16ch]">Structured technique courses</p>
              <p className="t-small mt-3 max-w-[40ch]">
                {availableCourses} courses ready now — guided sequences that build one movement on the next.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold">
                Browse courses
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
            <Media
              src={IMAGES.lower}
              alt=""
              zoom
              sizes="(min-width:768px) 560px, 100vw"
              className="aspect-[16/9] md:col-span-6 md:aspect-auto md:min-h-[280px]"
            />
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
