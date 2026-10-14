"use client";

import { ArrowUpRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Media } from "@/components/ui/media";
import { useToast } from "@/components/ui/toast";
import {
  getExerciseImage,
  getLessonsByCategory,
  type CategoryId,
} from "@/content/catalog";
import {
  CLASSES,
  formatClassTime,
  getLiveClasses,
  type FitnessClass,
} from "@/content/classes";
import { DIFFICULTY_LABELS, type Exercise } from "@/content/exercises";
import { getOrderedLessons, type Lesson } from "@/content/lessons";
import { track } from "@/lib/analytics";
import { useIsClient, usePulse } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";

/* ─────────────── Data helpers ─────────────── */

export function classCategoryId(cls: FitnessClass): CategoryId {
  if (cls.id === "replay-core-crusher") return "core";
  if (cls.category === "yoga") return "mobility";
  return cls.category;
}

/** A real, playable workout that matches a class's focus. */
export function relatedLessonForClass(cls: FitnessClass): Lesson {
  return getLessonsByCategory(classCategoryId(cls))[0] ?? getOrderedLessons()[0];
}

export function formatRecorded(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const EXERCISE_CATEGORY_LABELS: Record<Exercise["category"], string> = {
  warmup: "Warm-up",
  strength: "Strength",
  cardio: "Cardio",
  core: "Core",
  mobility: "Mobility",
  cooldown: "Cool-down",
};

/* ─────────────── Hooks ─────────────── */

/** Notify-me preference backed by the persisted store, with toast feedback. */
export function useNotify(
  id: string,
  messages: { on: string; off: string } = {
    on: "We'll let you know",
    off: "Notification removed",
  },
) {
  const { state, hydrated, toggleNotify } = usePulse();
  const toast = useToast();
  const on = hydrated && state.notifyRequests.includes(id);
  const toggle = () => {
    const next = toggleNotify(id);
    track("Notify Me Toggled", { item: id, kind: id.split("-")[0], on: next });
    toast(next ? messages.on : messages.off, next ? "success" : "info");
  };
  return { on, toggle, hydrated };
}

/**
 * Live classes sorted by start time. Times are relative to "now", so the
 * server/first paint uses the stable catalog order and re-sorts on mount.
 */
export function useLiveClasses(): FitnessClass[] {
  const client = useIsClient();
  return client ? getLiveClasses() : CLASSES.filter((c) => c.type === "live");
}

/* ─────────────── Small pieces ─────────────── */

/**
 * Live class times are computed relative to "now" and the viewer's timezone,
 * so they're only rendered on the client.
 */
export function ClassTime({ iso, className }: { iso: string; className?: string }) {
  const client = useIsClient();
  return (
    <span
      className={cn("transition-opacity duration-300", !client && "opacity-0", className)}
      suppressHydrationWarning
    >
      {client ? formatClassTime(iso) : "Today"}
    </span>
  );
}

/** Tasteful inline empty state for a section with no items. */
export function SectionEmpty({
  icon: Icon,
  title,
  description,
  href,
  linkLabel,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[var(--radius)] border border-dashed border-line-2 px-4 py-5 sm:px-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-fg-3">
        <Icon size={17} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">{title}</p>
        {description && <p className="t-micro mt-0.5 !text-[12px]">{description}</p>}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="pressable shrink-0 text-[13px] font-semibold text-fg-2 hover:text-fg"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

/** Square photographic tile for technique tutorials. */
export function ExerciseTile({
  exercise,
  vt = true,
  className,
  meta,
}: {
  exercise: Exercise;
  vt?: boolean;
  className?: string;
  meta?: ReactNode;
}) {
  return (
    <Link
      href={`/learn/${exercise.id}`}
      transitionTypes={["nav-forward"]}
      className={cn("group pressable block w-[40vw] max-w-[180px]", className)}
    >
      <Media
        src={getExerciseImage(exercise)}
        alt=""
        zoom
        vtName={vt ? `exercise-${exercise.id}` : undefined}
        sizes="180px"
        className="aspect-square rounded-[var(--radius)]"
      />
      <p className="mt-2.5 truncate text-[14px] font-semibold">{exercise.name}</p>
      <p className="t-micro mt-0.5 truncate">
        {meta ?? `${DIFFICULTY_LABELS[exercise.difficulty]} · ${exercise.muscles.slice(0, 2).join(" · ")}`}
      </p>
    </Link>
  );
}

/** Full-bleed detail hero. Content sits bottom-left over layered scrims. */
export function DetailHero({
  image,
  vtName,
  position,
  children,
  className,
}: {
  image: string;
  vtName?: string;
  position?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate", className)}>
      <div className="relative h-[74svh] max-h-[820px] min-h-[500px] w-full lg:h-[72vh]">
        <Media
          src={image}
          alt=""
          priority
          vtName={vtName}
          position={position}
          sizes="(min-width: 1024px) calc(100vw - 248px), 100vw"
          className="absolute inset-0"
        />
        <div className="scrim-bottom absolute inset-0" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/75 via-ink/15 to-transparent sm:block" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="page-x mx-auto max-w-[1180px] pb-8 lg:pb-12">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Compact "meta" facts row used under detail heroes. */
export function FactRow({
  facts,
  className,
}: {
  facts: Array<{ label: string; value: ReactNode }>;
  className?: string;
}) {
  return (
    <dl
      className={cn("grid border-y border-line py-5", className)}
      style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))` }}
    >
      {facts.map((f, i) => (
        <div key={f.label} className={cn("min-w-0", i > 0 && "border-l border-line pl-4")}>
          <dt className="t-micro uppercase tracking-[0.14em]">{f.label}</dt>
          <dd className="mt-1.5 truncate text-[15px] font-semibold">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Arrow affordance for editorial link blocks. */
export function CornerArrow({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "glass flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
        className,
      )}
      aria-hidden
    >
      <ArrowUpRight size={16} />
    </span>
  );
}
