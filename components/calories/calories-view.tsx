"use client";

import { ChevronLeft, ChevronRight, Flame, Pencil, Plus, Utensils, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { CountUp, ProgressRing } from "@/components/ui/progress";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill, SectionHeader } from "@/components/ui/section";
import { PageSkeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { TopBar } from "@/components/ui/top-bar";
import {
  MEALS,
  REFERENCE_WEIGHT_KG,
  burnedOn,
  dailyTarget,
  dayLabel,
  eatenOn,
  foodsOn,
  mealForNow,
  shiftDay,
} from "@/lib/calories";
import { todayKey } from "@/lib/gamification";
import type { MealType } from "@/lib/store/pulse-store";
import { useToday } from "@/lib/use-today";
import { cn } from "@/lib/cn";
import { FoodSheet } from "./food-sheet";
import { TargetSheet } from "./target-sheet";

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function CaloriesView() {
  const t = useToday();
  const { hydrated, state, removeFood, restoreFood } = t;
  const toast = useToast();
  const today = todayKey();
  const [day, setDay] = useState(today);
  const [foodOpen, setFoodOpen] = useState(false);
  const [foodMeal, setFoodMeal] = useState<MealType>("breakfast");
  const [targetOpen, setTargetOpen] = useState(false);

  const target = dailyTarget(state);
  const foods = foodsOn(state, day);
  const eaten = eatenOn(state, day);
  const burn = useMemo(() => burnedOn(state, day), [state, day]);
  const net = eaten - burn.total;
  const remaining = target.kcal - net;

  const week = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = shiftDay(today, i - 6);
        return { day: d, eaten: eatenOn(state, d), burned: burnedOn(state, d).total };
      }),
    [state, today],
  );
  const weekMax = Math.max(target.kcal, ...week.map((w) => w.eaten)) * 1.1;
  const loggedDays = week.filter((w) => w.eaten > 0);
  const avgEaten = loggedDays.length ? Math.round(loggedDays.reduce((s, w) => s + w.eaten, 0) / loggedDays.length) : 0;

  function openFood(meal: MealType = day === today ? mealForNow() : "snack") {
    setFoodMeal(meal);
    setFoodOpen(true);
  }

  if (!hydrated) {
    return (
      <main className="page-bottom min-h-dvh">
        <TopBar title="Calories" fallback="/home" />
        <PageSkeleton />
      </main>
    );
  }

  const over = remaining < 0;

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title="Calories" fallback="/home" />

      <div className="page-x mx-auto max-w-[1180px]">
        <header className="flex flex-wrap items-end justify-between gap-4 pb-6 pt-2">
          <div>
            <Enter variant="enter-soft">
              <p className="t-eyebrow">Nutrition</p>
            </Enter>
            <Enter delay={60} as="h1" className="t-display mt-2">
              Calories
            </Enter>
          </div>
          <Enter delay={120} variant="enter-soft" className="flex items-center gap-1.5">
            <IconButton label="Previous day" variant="plain" onClick={() => setDay((d) => shiftDay(d, -1))}>
              <ChevronLeft size={20} aria-hidden />
            </IconButton>
            <p className="min-w-[8.5rem] text-center text-[14px] font-semibold" aria-live="polite">
              {dayLabel(day, today)}
            </p>
            <IconButton
              label="Next day"
              variant="plain"
              onClick={() => setDay((d) => shiftDay(d, 1))}
              disabled={day >= today}
              className="disabled:opacity-30"
            >
              <ChevronRight size={20} aria-hidden />
            </IconButton>
          </Enter>
        </header>

        {/* Hero */}
        <section aria-label="Daily summary" className="grid grid-cols-12 gap-3">
          <Enter delay={160} className="col-span-12 md:col-span-7">
            <div className="flex h-full flex-col gap-6 rounded-[var(--radius-lg)] border border-line bg-surface-1 p-5 sm:flex-row sm:items-center sm:p-7">
              <ProgressRing
                value={Math.min(net > 0 ? net : 0, target.kcal)}
                max={target.kcal}
                size={188}
                stroke={12}
                label={`${Math.max(net, 0)} of ${target.kcal} kcal`}
              >
                <div className="text-center">
                  <p className="t-num text-[44px]">
                    <CountUp value={Math.abs(remaining)} />
                  </p>
                  <p className={cn("text-[12px] font-semibold", over ? "text-accent" : "text-fg-3")}>
                    {over ? "kcal over" : "kcal left"}
                  </p>
                </div>
              </ProgressRing>
              <div className="min-w-0 flex-1">
                <p className="t-eyebrow">Target</p>
                <p className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="t-num text-[34px]">{target.kcal.toLocaleString()}</span>
                  <span className="text-[13px] font-medium text-fg-3">kcal / day</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Pill tone={target.source === "default" ? "outline" : "default"}>
                    {target.source === "custom" ? "Custom" : target.source === "calculated" ? "Personalised" : "Starting estimate"}
                  </Pill>
                  <button
                    type="button"
                    onClick={() => setTargetOpen(true)}
                    className="pressable inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-semibold text-fg-2 hover:bg-white/[0.06] hover:text-fg"
                  >
                    <Pencil size={13} aria-hidden /> Edit
                  </button>
                </div>
                {target.source === "default" && (
                  <p className="t-small mt-3">
                    Based on your goal only.{" "}
                    <button type="button" onClick={() => setTargetOpen(true)} className="font-semibold text-fg underline underline-offset-2">
                      Add body data
                    </button>{" "}
                    for a personalised target.
                  </p>
                )}
                <Button size="lg" className="mt-5 w-full sm:w-auto" icon={<Plus size={17} aria-hidden />} onClick={() => openFood()}>
                  Log food
                </Button>
              </div>
            </div>
          </Enter>

          <Enter delay={220} className="col-span-12 grid grid-cols-3 gap-3 md:col-span-5 md:grid-cols-1">
            <div className="rounded-[var(--radius-lg)] border border-line bg-surface-1 p-4 md:p-5">
              <p className="t-eyebrow flex items-center gap-1.5">
                <Utensils size={12} aria-hidden /> Eaten
              </p>
              <p className="t-num mt-2 text-[28px] md:text-[40px]">{eaten.toLocaleString()}</p>
              <p className="t-micro mt-1">{foods.length} item{foods.length === 1 ? "" : "s"}</p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-line bg-surface-1 p-4 md:p-5">
              <p className="t-eyebrow flex items-center gap-1.5">
                <Flame size={12} aria-hidden /> Burned
              </p>
              <p className="t-num mt-2 text-[28px] md:text-[40px]">{burn.total.toLocaleString()}</p>
              <p className="t-micro mt-1">estimated</p>
            </div>
            <div className="surface-paper p-4 md:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/50">Net</p>
              <p className="t-num mt-2 text-[28px] text-ink md:text-[40px]">{net.toLocaleString()}</p>
              <p className="mt-1 text-[12px] font-semibold text-ink/55">eaten − burned</p>
            </div>
          </Enter>
        </section>

        {/* Meals */}
        <Reveal className="mt-12">
          <SectionHeader eyebrow={dayLabel(day, today)} title="Meals" />
          <div className="grid gap-3 md:grid-cols-2">
            {MEALS.map((m) => {
              const items = foods.filter((f) => f.meal === m.id);
              const subtotal = items.reduce((s, f) => s + f.kcal, 0);
              return (
                <section key={m.id} aria-label={m.label} className="rounded-[var(--radius-lg)] border border-line bg-surface-1 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="t-heading">{m.label}</h3>
                      <p className="t-micro mt-0.5 tabular-nums">{subtotal ? `${subtotal.toLocaleString()} kcal` : "Nothing logged"}</p>
                    </div>
                    <IconButton label={`Add to ${m.label.toLowerCase()}`} variant="plain" onClick={() => openFood(m.id)} className="border border-line-2">
                      <Plus size={18} aria-hidden />
                    </IconButton>
                  </div>
                  {items.length > 0 && (
                    <ul className="mt-3 divide-y divide-line border-t border-line">
                      {items.map((f) => (
                        <li key={f.id} className="enter-soft flex items-center gap-3 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-semibold">{f.name}</p>
                            <p className="t-micro">{timeOf(f.loggedAt)}</p>
                          </div>
                          <span className="text-[14px] font-semibold tabular-nums">{f.kcal}</span>
                          <IconButton
                            label={`Remove ${f.name}`}
                            variant="plain"
                            className="!h-8 !w-8"
                            onClick={() => {
                              removeFood(day, f.id);
                              toast(`Removed ${f.name}`, "info", { label: "Undo", onClick: () => restoreFood(day, f) });
                            }}
                          >
                            <X size={15} aria-hidden />
                          </IconButton>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </Reveal>

        {/* Burned */}
        <Reveal className="mt-12">
          <SectionHeader eyebrow="From your training" title="Burned" />
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface-1 p-4 sm:p-5">
            {burn.items.length ? (
              <ul className="divide-y divide-line">
                {burn.items.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Flame size={16} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">{b.label}</p>
                      <p className="t-micro">
                        {b.detail} · {b.minutes} min
                      </p>
                    </div>
                    <span className="text-[14px] font-semibold tabular-nums">{b.kcal} kcal</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="t-small">No training logged {day === today ? "yet today" : "on this day"}.</p>
                {day === today && !t.allDone && (
                  <Link href={t.primaryHref} className="text-[14px] font-semibold text-fg hover:text-accent">
                    Start today&apos;s workout →
                  </Link>
                )}
              </div>
            )}
            <p className="t-micro mt-4 border-t border-line pt-3">
              {burn.weightKnown
                ? `Estimated from activity type, duration and your weight (${state.body?.weightKg} kg).`
                : `Estimated for a ${REFERENCE_WEIGHT_KG} kg adult. `}
              {!burn.weightKnown && (
                <button type="button" onClick={() => setTargetOpen(true)} className="font-semibold text-fg-2 underline underline-offset-2 hover:text-fg">
                  Add your weight
                </button>
              )}
            </p>
          </div>
        </Reveal>

        {/* Week */}
        <Reveal className="mt-12">
          <SectionHeader
            eyebrow="Last 7 days"
            title="This week"
            action={
              avgEaten ? (
                <p className="text-[13px] font-semibold text-fg-2">
                  Avg <span className="tabular-nums text-fg">{avgEaten.toLocaleString()}</span> kcal
                </p>
              ) : undefined
            }
          />
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface-1 p-4 sm:p-6">
            <div className="relative h-44">
              <div
                className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/25"
                style={{ bottom: `${(target.kcal / weekMax) * 100}%` }}
                aria-hidden
              >
                <span className="absolute -top-5 right-0 text-[10.5px] font-semibold text-fg-3">
                  Target {target.kcal.toLocaleString()}
                </span>
              </div>
              <ol className="absolute inset-0 grid grid-cols-7 items-end gap-2">
                {week.map((w, i) => {
                  const selected = w.day === day;
                  return (
                    <li key={w.day} className="flex h-full items-end">
                      <button
                        type="button"
                        onClick={() => setDay(w.day)}
                        aria-pressed={selected}
                        aria-label={`${dayLabel(w.day, today)}: ${w.eaten} kcal eaten, ${w.burned} burned`}
                        className="pressable group flex h-full w-full items-end"
                      >
                        <span
                          className={cn(
                            "block w-full origin-bottom rounded-t-[8px] transition-[background-color] duration-300",
                            w.eaten === 0
                              ? "h-1 bg-white/10"
                              : w.eaten > target.kcal
                                ? "bg-fg"
                                : selected
                                  ? "bg-accent"
                                  : "bg-white/25 group-hover:bg-white/40",
                            selected && "ring-2 ring-accent ring-offset-2 ring-offset-surface-1",
                          )}
                          style={{
                            height: w.eaten ? `${Math.max(4, (w.eaten / weekMax) * 100)}%` : undefined,
                            animation: `fill-y 700ms var(--ease-out) ${i * 50}ms both`,
                          }}
                        />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
            <ol className="mt-3 grid grid-cols-7 gap-2 text-center" aria-hidden>
              {week.map((w) => (
                <li key={w.day} className={cn("text-[11px] font-semibold", w.day === day ? "text-fg" : "text-fg-3")}>
                  {new Date(`${w.day}T12:00:00`).toLocaleDateString(undefined, { weekday: "narrow" })}
                  <span className="mt-0.5 block text-[10px] font-medium tabular-nums text-fg-4">{w.eaten || "–"}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="t-micro mt-4">
            All numbers are estimates and saved on this device. Not medical or dietary advice.
          </p>
        </Reveal>
      </div>

      <FoodSheet open={foodOpen} onClose={() => setFoodOpen(false)} day={day} initialMeal={foodMeal} />
      <TargetSheet open={targetOpen} onClose={() => setTargetOpen(false)} />
    </main>
  );
}
