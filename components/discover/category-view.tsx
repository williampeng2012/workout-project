"use client";

import { ArrowRight, BookOpen, Dumbbell, Play, Video } from "lucide-react";
import Link from "next/link";
import { PosterCard, RowCard } from "@/components/cards";
import { ButtonLink } from "@/components/ui/button";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill, SectionHeader } from "@/components/ui/section";
import { TopBar } from "@/components/ui/top-bar";
import {
  CATEGORIES,
  INTENSITY_LABELS,
  getCategory,
  getClassImage,
  getClassesByCategoryId,
  getExercisesByCategoryId,
  getLessonImage,
  getLessonIntensity,
  getLessonsByCategory,
  type CategoryId,
} from "@/content/catalog";
import { usePulse } from "@/lib/store/pulse-store";
import { ClassTime, DetailHero, ExerciseTile, SectionEmpty } from "./shared";

export function CategoryView({ id }: { id: CategoryId }) {
  const category = getCategory(id)!;
  const { hydrated, completedLessonIds } = usePulse();
  const workouts = getLessonsByCategory(id);
  const tutorials = getExercisesByCategoryId(id);
  const classes = getClassesByCategoryId(id);
  const first = workouts.find((l) => !completedLessonIds.has(l.id)) ?? workouts[0];
  const others = CATEGORIES.filter((c) => c.id !== id);

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title={category.label} fallback="/discover" overlay />

      <DetailHero image={category.image} vtName={`category-${id}`}>
        <Enter variant="enter-soft" delay={120} className="flex flex-wrap items-center gap-2">
          <Pill>Category</Pill>
          <Pill tone="outline">
            {workouts.length} workouts · {tutorials.length} guides · {classes.length} classes
          </Pill>
        </Enter>
        <Enter delay={180}>
          <h1 className="t-hero mt-4">{category.label}</h1>
        </Enter>
        <Enter variant="enter-soft" delay={260}>
          <p className="t-body mt-4 max-w-[38ch] text-[17px] text-fg">{category.tagline}</p>
        </Enter>
        <Enter variant="enter-soft" delay={340} className="mt-6">
          {first ? (
            <ButtonLink
              href={`/workouts/${first.id}`}
              transitionTypes={["nav-forward"]}
              size="lg"
              icon={<Play size={16} fill="currentColor" aria-hidden />}
              className="max-w-full"
            >
              <span className="truncate">Start · {first.title}</span>
            </ButtonLink>
          ) : (
            <ButtonLink href="/learn" size="lg" icon={<BookOpen size={16} aria-hidden />}>
              Explore technique
            </ButtonLink>
          )}
        </Enter>
      </DetailHero>

      <div className="page-x mx-auto max-w-[1180px]">
        {/* Workouts */}
        <Reveal className="mt-12">
          <SectionHeader
            eyebrow={`${workouts.length} session${workouts.length === 1 ? "" : "s"}`}
            title="Workouts"
            href="/programs"
            linkLabel="All programs"
          />
          {workouts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {workouts.map((l, i) => (
                <Reveal key={l.id} delay={i * 60}>
                  <PosterCard
                    href={`/workouts/${l.id}`}
                    image={getLessonImage(l.id)}
                    eyebrow={INTENSITY_LABELS[getLessonIntensity(l.id)]}
                    title={l.title}
                    meta={`${l.minutes} min · ${l.steps.length} moves`}
                    vtName={`lesson-${l.id}`}
                    size="lg"
                    badge={hydrated && completedLessonIds.has(l.id) ? <Pill tone="light">Done</Pill> : undefined}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <SectionEmpty
              icon={Dumbbell}
              title={`No ${category.label.toLowerCase()} workouts yet`}
              description="New sessions are added regularly."
              href="/programs"
              linkLabel="Browse programs"
            />
          )}
        </Reveal>

        {/* Technique */}
        <Reveal className="mt-14">
          <SectionHeader eyebrow="Form first" title="Technique" href="/learn" linkLabel="Library" />
          {tutorials.length > 0 ? (
            <div className="rail">
              {tutorials.map((e) => (
                <ExerciseTile key={e.id} exercise={e} />
              ))}
            </div>
          ) : (
            <SectionEmpty
              icon={BookOpen}
              title="Technique guides are coming"
              description={`We're writing ${category.label.toLowerCase()} form guides now.`}
              href="/learn"
              linkLabel="Open library"
            />
          )}
        </Reveal>

        {/* Classes */}
        <Reveal className="mt-14">
          <SectionHeader eyebrow="With a coach" title="Classes" href="/classes" linkLabel="Schedule" />
          {classes.length > 0 ? (
            <div className="grid gap-2.5 md:grid-cols-2">
              {classes.map((c) => (
                <RowCard
                  key={c.id}
                  href={`/classes/${c.id}`}
                  image={getClassImage(c)}
                  title={c.title}
                  subtitle={`${c.trainer} · ${c.duration} min`}
                  eyebrow={
                    c.type === "live" ? (
                      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-fg-2">
                        <span className="live-dot" aria-hidden />
                        <ClassTime iso={c.scheduledAt} />
                      </span>
                    ) : (
                      <Pill tone="outline">Replay</Pill>
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <SectionEmpty
              icon={Video}
              title={`No ${category.label.toLowerCase()} classes scheduled`}
              description="Check the full schedule for other sessions."
              href="/classes"
              linkLabel="Schedule"
            />
          )}
        </Reveal>

        {/* Keep exploring */}
        <Reveal className="mt-16 border-t border-line pt-8">
          <p className="t-eyebrow mb-4">Keep exploring</p>
          <ul className="flex flex-wrap gap-2">
            {others.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categories/${c.id}`}
                  transitionTypes={["nav-forward"]}
                  className="group pressable inline-flex h-11 items-center gap-2 rounded-full border border-line-2 pl-5 pr-4 text-[14px] font-semibold text-fg-2 hover:border-white/30 hover:text-fg"
                >
                  {c.label}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </main>
  );
}
