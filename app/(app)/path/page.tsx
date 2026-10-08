"use client";

import { Play, RotateCcw } from "lucide-react";
import { PathTimeline } from "@/components/programs/path-timeline";
import { ButtonLink } from "@/components/ui/button";
import { CountUp, ProgressBar } from "@/components/ui/progress";
import { Enter } from "@/components/ui/reveal";
import { PageHeader } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/states";
import { TopBar } from "@/components/ui/top-bar";
import { getLesson, getOrderedLessons } from "@/content/lessons";
import { usePulse } from "@/lib/store/pulse-store";

const TOTAL = getOrderedLessons().length;

export default function PathPage() {
  const { hydrated, completedLessonIds, currentLessonId } = usePulse();
  const done = hydrated ? getOrderedLessons().filter((l) => completedLessonIds.has(l.id)).length : 0;
  const current = currentLessonId ? getLesson(currentLessonId) : undefined;
  const first = getOrderedLessons()[0];

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar fallback="/programs" />
      <div className="page-x mx-auto max-w-[1180px] pt-2">
        <PageHeader
          eyebrow="Every session, in order"
          title="Your path"
          description="Three units, one route. Each workout unlocks the next — and any of them can be opened at any time."
        />

        <Enter delay={220}>
          <div className="mt-8 grid grid-cols-1 gap-6 border-y border-line py-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-4">
              <p className="t-eyebrow">Completed</p>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="t-num text-[56px]">{hydrated ? <CountUp value={done} /> : 0}</span>
                <span className="t-num text-2xl text-fg-3">/{TOTAL}</span>
                <span className="ml-1 text-[13px] font-medium text-fg-2">workouts</span>
              </p>
              <ProgressBar value={done} max={TOTAL} className="mt-4 max-w-[260px]" label="Path progress" />
            </div>
            <div className="md:col-span-8 md:justify-self-end">
              {!hydrated ? (
                <Skeleton className="h-[54px] w-64 !rounded-full" />
              ) : current ? (
                <ButtonLink
                  href={`/workouts/${current.id}`}
                  transitionTypes={["nav-forward"]}
                  size="lg"
                  icon={<Play size={16} fill="currentColor" aria-hidden />}
                  className="max-w-full"
                >
                  <span className="truncate">
                    {done === 0 ? "Start" : "Continue"}
                    <span className="font-medium opacity-60"> · {current.title}</span>
                  </span>
                </ButtonLink>
              ) : (
                <ButtonLink
                  href={`/workouts/${first.id}`}
                  transitionTypes={["nav-forward"]}
                  size="lg"
                  icon={<RotateCcw size={16} aria-hidden />}
                >
                  Path complete · Start again
                </ButtonLink>
              )}
            </div>
          </div>
        </Enter>

        <PathTimeline className="mt-12" />
      </div>
    </main>
  );
}
