"use client";

import { ArrowUpRight, BellRing, Radio } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Media } from "@/components/ui/media";
import { Enter } from "@/components/ui/reveal";
import { PageHeader, Pill } from "@/components/ui/section";
import { Segmented } from "@/components/ui/segmented";
import { getClassImage } from "@/content/catalog";
import { CATEGORY_LABELS, getReplayClasses, type FitnessClass } from "@/content/classes";
import { DIFFICULTY_LABELS } from "@/content/exercises";
import { usePulse } from "@/lib/store/pulse-store";
import { ClassTime, CornerArrow, formatRecorded, useLiveClasses } from "./shared";

type Tab = "live" | "replay";

export function ClassesView() {
  const [tab, setTab] = useState<Tab>("live");
  const { hydrated, state } = usePulse();
  const live = useLiveClasses();
  const replays = getReplayClasses();
  const list = tab === "live" ? live : replays;
  const [lead, ...rest] = list;
  const reminded = (c: FitnessClass) => hydrated && state.notifyRequests.includes(`class-${c.id}`);

  return (
    <main className="page-bottom min-h-dvh">
      <div className="page-x mx-auto max-w-[1180px] pt-[calc(var(--safe-top)+28px)] lg:pt-12">
        <PageHeader
          eyebrow="With a coach"
          title="Classes"
          description="Scheduled sessions with Pulsepath coaches, plus replays to follow on your own time."
        />

        <Enter variant="enter-soft" delay={200} className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Segmented
            label="Class type"
            value={tab}
            onChange={setTab}
            options={[
              { value: "live", label: "Live & upcoming", count: live.length },
              { value: "replay", label: "Replays", count: replays.length },
            ]}
            className="w-full sm:w-auto"
          />
          <p className="t-micro flex items-center gap-2 !text-[12px]">
            <Radio size={14} className="shrink-0 text-fg-2" aria-hidden />
            Streaming is being prepared — set a reminder on any class.
          </p>
        </Enter>

        <div key={tab} className="mt-8">
          {lead && (
            <Enter delay={60}>
              <Link
                href={`/classes/${lead.id}`}
                transitionTypes={["nav-forward"]}
                className="group pressable relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-surface-1 sm:aspect-[16/9] lg:aspect-[21/9]"
              >
                <Media
                  src={getClassImage(lead)}
                  alt=""
                  zoom
                  priority
                  vtName={`class-${lead.id}`}
                  sizes="(min-width:1024px) 1100px, 100vw"
                  className="absolute inset-0"
                />
                <div className="scrim-bottom absolute inset-0" />
                <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/70 via-transparent to-transparent sm:block" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                  {lead.type === "live" ? (
                    <span className="glass flex h-7 items-center gap-2 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                      <span className="live-dot" aria-hidden /> Up next
                    </span>
                  ) : (
                    <Pill tone="light">Latest replay</Pill>
                  )}
                  {reminded(lead) && (
                    <Pill>
                      <BellRing size={11} aria-hidden /> Reminder set
                    </Pill>
                  )}
                </div>
                <CornerArrow className="absolute right-4 top-4 sm:right-6 sm:top-6" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:max-w-[40rem] sm:p-8">
                  <p className="t-eyebrow !text-fg/75">
                    {lead.type === "live" ? <ClassTime iso={lead.scheduledAt} /> : `Recorded ${formatRecorded(lead.scheduledAt)}`}
                    {" · "}
                    {CATEGORY_LABELS[lead.category]}
                  </p>
                  <h2 className="t-display mt-3 max-w-[13ch] text-balance">{lead.title}</h2>
                  <p className="t-small mt-3">
                    {lead.trainer} · {lead.duration} min · {DIFFICULTY_LABELS[lead.difficulty]}
                  </p>
                </div>
              </Link>
            </Enter>
          )}

          <ul className="mt-6 border-t border-line">
            {rest.map((c, i) => (
              <Enter key={c.id} as="li" variant="enter-soft" delay={140 + i * 60}>
                <Link
                  href={`/classes/${c.id}`}
                  transitionTypes={["nav-forward"]}
                  className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-5 transition-colors duration-300 hover:bg-white/[0.02] md:grid-cols-[200px_1fr_auto] md:gap-8"
                >
                  <p className="hidden md:block">
                    <span className="block font-display text-[1.6rem] font-extrabold uppercase leading-none [font-stretch:78%]">
                      {c.type === "live" ? <ClassTime iso={c.scheduledAt} /> : formatRecorded(c.scheduledAt)}
                    </span>
                    <span className="t-micro mt-1.5 block">{c.type === "live" ? "Live class" : "Replay"}</span>
                  </p>
                  <div className="min-w-0">
                    <p className="t-eyebrow md:hidden">
                      {c.type === "live" ? <ClassTime iso={c.scheduledAt} /> : `Replay · ${formatRecorded(c.scheduledAt)}`}
                    </p>
                    <p className="mt-1.5 truncate font-display text-[1.35rem] font-extrabold uppercase leading-[0.95] [font-stretch:78%] md:mt-0 md:text-[1.7rem]">
                      {c.title}
                    </p>
                    <p className="t-small mt-1.5 flex flex-wrap items-center gap-x-2">
                      <span>
                        {c.trainer} · {c.duration} min · {DIFFICULTY_LABELS[c.difficulty]}
                      </span>
                      {reminded(c) && (
                        <span className="inline-flex items-center gap-1 text-fg">
                          <BellRing size={12} aria-hidden /> Reminder set
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Media
                      src={getClassImage(c)}
                      alt=""
                      zoom
                      vtName={`class-${c.id}`}
                      sizes="140px"
                      className="h-20 w-24 shrink-0 rounded-[var(--radius-sm)] sm:w-32"
                    />
                    <ArrowUpRight
                      size={18}
                      className="hidden shrink-0 text-fg-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg sm:block"
                      aria-hidden
                    />
                  </div>
                </Link>
              </Enter>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
