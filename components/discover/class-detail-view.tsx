"use client";

import { ArrowRight, Bell, BellRing, Clock, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RowCard } from "@/components/cards";
import { Button, ButtonLink } from "@/components/ui/button";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill, SectionHeader } from "@/components/ui/section";
import { Sheet } from "@/components/ui/sheet";
import { TopBar } from "@/components/ui/top-bar";
import { getCategory, getClassImage, getLessonImage } from "@/content/catalog";
import { CATEGORY_LABELS, getClass, getReplayClasses } from "@/content/classes";
import { DIFFICULTY_LABELS } from "@/content/exercises";
import {
  ClassTime,
  DetailHero,
  FactRow,
  classCategoryId,
  formatRecorded,
  relatedLessonForClass,
  useLiveClasses,
  useNotify,
} from "./shared";

export function ClassDetailView({ id }: { id: string }) {
  const cls = getClass(id)!;
  const isLive = cls.type === "live";
  const [sheetOpen, setSheetOpen] = useState(false);
  const notify = useNotify(
    `class-${cls.id}`,
    isLive
      ? { on: "Reminder set — we'll notify you", off: "Reminder removed" }
      : { on: "We'll tell you when the replay is ready", off: "Notification removed" },
  );
  const lesson = relatedLessonForClass(cls);
  const category = getCategory(classCategoryId(cls));
  const live = useLiveClasses();
  const more = [...live, ...getReplayClasses()].filter((c) => c.id !== cls.id).slice(0, 4);
  const when = isLive ? <ClassTime iso={cls.scheduledAt} /> : formatRecorded(cls.scheduledAt);

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title={cls.title} fallback="/classes" overlay />

      <DetailHero image={getClassImage(cls)} vtName={`class-${cls.id}`}>
        <Enter variant="enter-soft" delay={120} className="flex flex-wrap items-center gap-2">
          {isLive ? (
            <span className="glass flex h-6 items-center gap-2 rounded-full px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
              <span className="live-dot" aria-hidden /> Live class
            </span>
          ) : (
            <Pill tone="light">Replay</Pill>
          )}
          <Pill>{CATEGORY_LABELS[cls.category]}</Pill>
        </Enter>
        <Enter delay={180}>
          <h1 className="t-hero mt-4 max-w-[12ch] text-balance">{cls.title}</h1>
        </Enter>
        <Enter
          variant="enter-soft"
          delay={260}
          className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] font-medium text-fg-2"
        >
          <span className="flex items-center gap-1.5 text-fg">
            <Clock size={14} aria-hidden />
            {isLive ? when : <>Recorded {when}</>}
          </span>
          <span>{cls.duration} min</span>
          <span>{DIFFICULTY_LABELS[cls.difficulty]}</span>
          <span>with {cls.trainer}</span>
        </Enter>
        <Enter variant="enter-soft" delay={340} className="mt-6">
          {isLive ? (
            <Button
              size="lg"
              variant={notify.on ? "secondary" : "primary"}
              icon={notify.on ? <BellRing size={17} aria-hidden /> : <Bell size={17} aria-hidden />}
              aria-pressed={notify.on}
              onClick={notify.toggle}
            >
              {notify.on ? "Reminder set" : "Remind me"}
            </Button>
          ) : (
            <Button
              size="lg"
              icon={<Play size={16} fill="currentColor" aria-hidden />}
              onClick={() => setSheetOpen(true)}
            >
              Watch replay
            </Button>
          )}
        </Enter>
      </DetailHero>

      <div className="page-x mx-auto max-w-[1180px]">
        <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-12">
          <Reveal className="md:col-span-7">
            <h2 className="t-eyebrow">About this class</h2>
            <p className="mt-4 max-w-[48ch] text-[19px] leading-[1.5] text-fg">{cls.description}</p>

            <FactRow
              className="mt-8"
              facts={[
                { label: isLive ? "Starts" : "Recorded", value: when },
                { label: "Duration", value: `${cls.duration} min` },
                { label: "Level", value: DIFFICULTY_LABELS[cls.difficulty] },
              ]}
            />

            <div className="mt-8 flex items-start gap-4 rounded-[var(--radius)] border border-line bg-surface-1 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <span className="spinner !h-4 !w-4 !border-[1.5px] opacity-80" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold">
                  {isLive ? "Live streaming is being prepared" : "Replays are being prepared"}
                </p>
                <p className="t-small mt-1">
                  {isLive
                    ? "We'll notify you when classes go live. Set a reminder and you'll be first to know."
                    : "We're editing this session for on-demand viewing. Turn on notifications to hear when it's ready."}
                </p>
                {!isLive && (
                  <button
                    type="button"
                    onClick={notify.toggle}
                    aria-pressed={notify.on}
                    className="pressable mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg hover:text-accent"
                  >
                    {notify.on ? <BellRing size={14} aria-hidden /> : <Bell size={14} aria-hidden />}
                    {notify.on ? "You'll be notified" : "Notify me"}
                  </button>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="space-y-6 md:col-span-5">
            <section>
              <h2 className="t-eyebrow mb-3">Your coach</h2>
              <div className="flex items-center gap-4 border-y border-line py-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-paper font-display text-2xl font-extrabold text-ink [font-stretch:80%]">
                  {cls.trainer.replace("Coach ", "").charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold">{cls.trainer}</p>
                  <p className="t-small mt-0.5">{cls.trainerBio}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="t-eyebrow mb-3">Can&apos;t wait? Train now</h2>
              <RowCard
                href={`/workouts/${lesson.id}`}
                image={getLessonImage(lesson.id)}
                title={lesson.title}
                subtitle={`${lesson.minutes} min · ${lesson.steps.length} moves · on demand`}
                eyebrow={<Pill tone="outline">Matching workout</Pill>}
              />
            </section>

            {category && (
              <Link
                href={`/categories/${category.id}`}
                transitionTypes={["nav-forward"]}
                className="group pressable flex items-center justify-between rounded-[var(--radius)] border border-line px-5 py-4 hover:border-line-2"
              >
                <span>
                  <span className="t-micro block uppercase tracking-[0.14em]">More in</span>
                  <span className="mt-1 block text-[15px] font-semibold">{category.label}</span>
                </span>
                <ArrowRight size={16} className="text-fg-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </Link>
            )}
          </Reveal>
        </div>

        {more.length > 0 && (
          <Reveal className="mt-16">
            <SectionHeader eyebrow="Keep going" title="More classes" href="/classes" linkLabel="Schedule" />
            <div className="grid gap-2.5 md:grid-cols-2">
              {more.map((c) => (
                <RowCard
                  key={c.id}
                  href={`/classes/${c.id}`}
                  image={getClassImage(c)}
                  title={c.title}
                  subtitle={`${c.trainer} · ${c.duration} min`}
                  eyebrow={
                    c.type === "live" ? (
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-fg-2">
                        <ClassTime iso={c.scheduledAt} />
                      </span>
                    ) : (
                      <Pill tone="outline">Replay</Pill>
                    )
                  }
                />
              ))}
            </div>
          </Reveal>
        )}
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Replays are being prepared"
        description={`We're editing “${cls.title}” with ${cls.trainer} for on-demand viewing. Turn on notifications and we'll tell you the moment it's ready.`}
      >
        <div className="flex flex-col gap-2.5">
          <Button
            size="lg"
            block
            variant={notify.on ? "secondary" : "primary"}
            icon={notify.on ? <BellRing size={17} aria-hidden /> : <Bell size={17} aria-hidden />}
            aria-pressed={notify.on}
            onClick={notify.toggle}
          >
            {notify.on ? "You'll be notified" : "Notify me"}
          </Button>
          <ButtonLink
            href={`/workouts/${lesson.id}`}
            transitionTypes={["nav-forward"]}
            size="lg"
            block
            variant="secondary"
            onClick={() => setSheetOpen(false)}
          >
            <span className="truncate">Train now · {lesson.title}</span>
          </ButtonLink>
        </div>
      </Sheet>
    </main>
  );
}
