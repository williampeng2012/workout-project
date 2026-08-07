"use client";

import Link from "next/link";
import { getOrderedLessons, getUnitTitle } from "@/content/lessons";
import { usePulse } from "@/lib/store/pulse-store";

export function PathMap() {
  const { completedLessonIds, currentLessonId, hydrated } = usePulse();
  const lessons = getOrderedLessons();

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-bg-elevated" />;
  }

  let lastUnit = "";

  return (
    <ol className="relative mx-auto flex max-w-sm flex-col gap-0 py-4">
      <div
        className="absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2 bg-border"
        aria-hidden
      />
      {lessons.map((lesson, index) => {
        const done = completedLessonIds.has(lesson.id);
        const current = currentLessonId === lesson.id;
        const locked = !done && !current;
        const showUnit = lesson.unitId !== lastUnit;
        lastUnit = lesson.unitId;
        const zig = index % 2 === 0 ? "-translate-x-10" : "translate-x-10";

        return (
          <li key={lesson.id} className="relative z-10">
            {showUnit && (
              <p className="mb-3 text-center text-[11px] uppercase tracking-[0.25em] text-fg-dim">
                {getUnitTitle(lesson.unitId)}
              </p>
            )}
            <div className={`mb-8 flex justify-center ${zig}`}>
              {locked ? (
                <div className="flex w-40 flex-col items-center gap-2 opacity-40">
                  <NodeVisual state="locked" />
                  <p className="text-center text-sm text-fg-muted">{lesson.title}</p>
                  <p className="text-xs text-fg-dim">{lesson.minutes} min</p>
                </div>
              ) : (
                <Link
                  href={`/lesson/${lesson.id}`}
                  className="group flex w-40 flex-col items-center gap-2"
                >
                  <NodeVisual state={done ? "done" : "current"} />
                  <p className="text-center text-sm font-medium group-hover:underline">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-fg-muted">{lesson.minutes} min</p>
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function NodeVisual({ state }: { state: "locked" | "current" | "done" }) {
  if (state === "done") {
    return (
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fg text-bg">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12.5l5 5L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="animate-pulse-ring flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-fg bg-bg">
        <span className="h-3 w-3 rounded-full bg-fg" />
      </span>
    );
  }
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-fg-dim bg-track">
      <span className="h-2 w-2 rounded-full bg-fg-dim" />
    </span>
  );
}
