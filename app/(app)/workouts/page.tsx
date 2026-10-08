"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PosterCard } from "@/components/cards";
import { lessonMeta } from "@/components/programs/path-state";
import { Reveal } from "@/components/ui/reveal";
import { PageHeader, Pill } from "@/components/ui/section";
import { ChipGroup } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/states";
import { TopBar } from "@/components/ui/top-bar";
import {
  AVAILABLE_PROGRAMS,
  INTENSITY_LABELS,
  getLessonImage,
  getLessonIntensity,
  getProgramLessons,
} from "@/content/catalog";
import { getOrderedLessons } from "@/content/lessons";
import { usePulse } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";

type Filter = "all" | "1" | "2" | "3";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "1", label: INTENSITY_LABELS[1] },
  { value: "2", label: INTENSITY_LABELS[2] },
  { value: "3", label: INTENSITY_LABELS[3] },
];

const TOTAL = getOrderedLessons().length;

export default function WorkoutsPage() {
  const { hydrated, completedLessonIds, currentLessonId } = usePulse();
  const [filter, setFilter] = useState<Filter>("all");

  const groups = AVAILABLE_PROGRAMS.map((p, i) => ({
    program: p,
    index: i + 1,
    lessons: getProgramLessons(p).filter(
      (l) => filter === "all" || String(getLessonIntensity(l.id)) === filter,
    ),
  })).filter((g) => g.lessons.length > 0);

  const shown = groups.reduce((s, g) => s + g.lessons.length, 0);

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar fallback="/programs" />
      <div className="page-x mx-auto max-w-[1180px] pt-2">
        <PageHeader
          eyebrow="Library"
          title="All workouts"
          description={`${TOTAL} coached sessions across ${AVAILABLE_PROGRAMS.length} programs. Short, focused and bodyweight-first.`}
        />

        <div className="enter-soft mt-8" style={{ ["--d" as string]: "220ms" }}>
          <ChipGroup value={filter} onChange={setFilter} options={FILTERS} label="Filter by intensity" />
          <p className="t-micro mt-3" aria-live="polite">
            {filter === "all" ? `${shown} workouts` : `${shown} ${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} workouts`}
          </p>
        </div>

        {groups.length === 0 && (
          <EmptyState className="mt-10" title="No workouts match" description="Try a different intensity." />
        )}

        {groups.map(({ program, index, lessons }) => (
          <Reveal key={`${program.id}-${filter}`} className="mt-14">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-end gap-4">
                <span className="t-num text-[52px] text-fg-4" aria-hidden>
                  {String(index).padStart(2, "0")}
                </span>
                <div className="pb-1">
                  <p className="t-eyebrow">
                    {program.level} · {program.weeks} wk
                  </p>
                  <h2 className="t-title mt-1.5">{program.title}</h2>
                </div>
              </div>
              <Link
                href={`/programs/${program.id}`}
                transitionTypes={["nav-forward"]}
                className="pressable group mb-1 inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-fg-2 hover:text-fg"
              >
                Program
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {lessons.map((l, i) => {
                const done = hydrated && completedLessonIds.has(l.id);
                const current = hydrated && l.id === currentLessonId;
                return (
                  <li key={l.id} className={cn(i === 0 && lessons.length % 2 === 1 && "col-span-2 md:col-span-1")}>
                    <PosterCard
                      href={`/workouts/${l.id}`}
                      image={getLessonImage(l.id)}
                      eyebrow={INTENSITY_LABELS[getLessonIntensity(l.id)]}
                      title={l.title}
                      meta={lessonMeta(l)}
                      vtName={`lesson-${l.id}`}
                      size="lg"
                      className={cn(i === 0 && lessons.length % 2 === 1 && "aspect-[16/10] md:aspect-[4/5]")}
                      badge={
                        done ? (
                          <Pill tone="light">Done</Pill>
                        ) : current ? (
                          <Pill tone="accent">Up next</Pill>
                        ) : undefined
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
