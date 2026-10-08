"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { StepRow } from "@/components/cards";
import { getLessonState, lessonMeta } from "@/components/programs/path-state";
import { ProgressBar } from "@/components/ui/progress";
import { Reveal } from "@/components/ui/reveal";
import { Skeleton } from "@/components/ui/states";
import { PROGRAMS, getLessonImage } from "@/content/catalog";
import { UNITS } from "@/content/lessons";
import { usePulse } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";


/** The full lesson path, unit by unit, as an editorial vertical timeline. */
export function PathTimeline({ className }: { className?: string }) {
  const { hydrated, completedLessonIds, currentLessonId, lessonOrder } = usePulse();
  const unitRank = (id: string) => lessonOrder.findIndex((l) => l.unitId === id);
  const units = [...UNITS].sort((a, b) => unitRank(a.id) - unitRank(b.id));

  return (
    <div className={cn("space-y-14", className)}>
      {units.map((unit, ui) => {
        const lessons = lessonOrder.filter((l) => l.unitId === unit.id);
        const done = hydrated ? lessons.filter((l) => completedLessonIds.has(l.id)).length : 0;
        const program = PROGRAMS.find((p) => p.unitId === unit.id);
        const hasCurrent = hydrated && lessons.some((l) => l.id === currentLessonId);

        return (
          <Reveal key={unit.id}>
            <section aria-label={unit.title} className="grid grid-cols-1 gap-5 border-t border-line pt-6 md:grid-cols-12 md:gap-8">
              <header className="md:col-span-4">
                <div className="md:sticky md:top-24">
                  <span
                    className={cn("t-num block text-[72px] transition-colors duration-500", hasCurrent ? "text-accent" : "text-fg-4")}
                    aria-hidden
                  >
                    {String(ui + 1).padStart(2, "0")}
                  </span>
                  <p className="t-eyebrow mt-3">Unit {ui + 1}</p>
                  <h2 className="t-title mt-1.5">{unit.title}</h2>
                  <div className="mt-4 flex max-w-[260px] items-center gap-3">
                    <ProgressBar value={done} max={lessons.length} className="flex-1" label={`${unit.title} progress`} />
                    <span className="text-[12px] font-semibold tabular-nums text-fg-2">
                      {done}/{lessons.length}
                    </span>
                  </div>
                  {program && (
                    <Link
                      href={`/programs/${program.id}`}
                      transitionTypes={["nav-forward"]}
                      className="pressable group mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg-2 hover:text-fg"
                    >
                      View program
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  )}
                </div>
              </header>

              <ol className="relative space-y-2 md:col-span-8">
                <span className="absolute bottom-6 left-[32px] top-6 w-px bg-line" aria-hidden />
                {lessons.map((l) => (
                  <li key={l.id} className="relative">
                    {hydrated ? (
                      <StepRow
                        href={`/workouts/${l.id}`}
                        index={lessonOrder.indexOf(l) + 1}
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
            </section>
          </Reveal>
        );
      })}
    </div>
  );
}
