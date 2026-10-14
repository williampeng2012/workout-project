"use client";

import {
  Check,
  ChevronDown,
  Download,
  FileText,
  Info,
  Mail,
  Minus,
  Plus,
  RotateCcw,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { TextField } from "@/components/auth/fields";
import { Button } from "@/components/ui/button";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Segmented } from "@/components/ui/segmented";
import { ComingSoon, Skeleton } from "@/components/ui/states";
import { TopBar } from "@/components/ui/top-bar";
import { useToast } from "@/components/ui/toast";
import { IMAGES } from "@/content/catalog";
import { track } from "@/lib/analytics";
import { DAILY_GOAL, STREAK_BONUSES, XP, todayKey } from "@/lib/gamification";
import { usePulse, type Preferences } from "@/lib/store/pulse-store";
import { LEVEL_LABELS, LEVEL_OPTIONS } from "@/lib/training";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import {
  GOALS,
  PRO_NOTIFY_ID,
  SETTINGS_SECTIONS,
  SUPPORT_EMAIL,
  TRAINING_DAYS,
  type Goal,
  type SettingsSectionId,
} from "./meta";
import { ResetDemo } from "./reset-demo";
import { MenuGroup, MenuRow, SectionIntro, SwitchRow } from "./ui";

export function SettingsSection({ section, version }: { section: SettingsSectionId; version: string }) {
  switch (section) {
    case "profile":
      return <ProfileSection />;
    case "training":
      return <TrainingSection />;
    case "notifications":
      return <NotificationsSection />;
    case "units":
      return <UnitsSection />;
    case "data":
      return <DataSection />;
    case "subscription":
      return (
        <ComingSoon
          id={PRO_NOTIFY_ID}
          eyebrow="Pulsepath Pro"
          title="Pulsepath Pro"
          description="Full programs, live-class replays and coach feedback in one membership. Everything you use today stays free."
          image={IMAGES.strength}
          fallback="/settings"
          details={[
            { label: "Your plan", value: "Free" },
            { label: "Status", value: "In the works" },
            { label: "Charges", value: "None" },
          ]}
          primary={{ label: "Explore free programs", href: "/programs" }}
        />
      );
    case "help":
      return <HelpSection />;
    case "about":
      return <AboutSection version={version} />;
  }
}

function Shell({
  section,
  eyebrow = "Settings",
  description,
  children,
}: {
  section: SettingsSectionId;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
}) {
  const title = SETTINGS_SECTIONS[section].title;
  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title={title} fallback="/settings" />
      <div className="page-x mx-auto max-w-[1180px]">
        <div className="max-w-2xl">
          <SectionIntro eyebrow={eyebrow} title={title} description={description} />
          {children}
        </div>
      </div>
    </main>
  );
}

function FormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-[52px] w-full" />
      <Skeleton className="mt-8 h-40 w-full" />
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 flex gap-2.5 px-1 text-[12.5px] leading-relaxed text-fg-3">
      <Info size={15} className="mt-px shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/* ─────────────── Profile ─────────────── */

function ProfileSection() {
  const { hydrated } = usePulse();
  return (
    <Shell section="profile" description="How you appear in Pulsepath and what your plan optimises for.">
      {hydrated ? <ProfileForm /> : <FormSkeleton />}
    </Shell>
  );
}

function validateName(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter a name — first name is fine.";
  if (v.length > 40) return "Keep it under 40 characters.";
  if (!/[\p{L}\p{N}]/u.test(v)) return "Use at least one letter or number.";
  return null;
}

function ProfileForm() {
  const { state, updateProfile } = usePulse();
  const toast = useToast();
  const [name, setName] = useState(state.displayName);
  const [goal, setGoal] = useState<Goal | null>(state.goal);
  const [touched, setTouched] = useState(false);
  const groupId = useId();

  const error = touched ? validateName(name) : null;
  const dirty = name.trim() !== state.displayName || goal !== state.goal;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (validateName(name)) return;
    updateProfile({ displayName: name, goal });
    track("Setting Changed", { setting: "profile", goal });
    toast("Profile saved");
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Enter delay={180} variant="enter-soft">
        <TextField
          label="Display name"
          name="displayName"
          autoComplete="given-name"
          value={name}
          maxLength={40}
          placeholder="Athlete"
          error={error}
          hint={`${name.trim().length}/40 · shown on Home and your profile`}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
        />
      </Enter>

      <Enter delay={240} variant="enter-soft">
        <fieldset className="mt-10">
          <legend id={groupId} className="mb-3 text-[13px] font-semibold text-fg-2">
            Training goal
          </legend>
          <div role="radiogroup" aria-labelledby={groupId} className="divide-y divide-line overflow-hidden rounded-[var(--radius)] border border-line">
            {GOALS.map((g, i) => {
              const active = goal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setGoal(g.id)}
                  className={cn(
                    "pressable flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5",
                    active ? "bg-white/[0.05]" : "hover:bg-white/[0.03]",
                  )}
                >
                  <span className="t-num w-8 text-[22px] text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold">{g.label}</span>
                    <span className="t-micro mt-0.5 block !text-[12.5px]">{g.blurb}</span>
                  </span>
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                      active ? "border-fg bg-fg text-ink" : "border-line-2",
                    )}
                    aria-hidden
                  >
                    {active && <Check size={13} strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
          <Note>Changing your goal re-orders recommendations and categories on Home right away.</Note>
        </fieldset>
      </Enter>

      <Enter delay={300} variant="enter-soft">
        <div className="mt-10 flex items-center gap-4">
          <Button type="submit" size="lg" disabled={!dirty}>
            Save changes
          </Button>
          {!dirty && (
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-fg-3" aria-live="polite">
              <Check size={14} aria-hidden /> Up to date
            </span>
          )}
        </div>
      </Enter>
    </form>
  );
}

/* ─────────────── Training ─────────────── */

function TrainingSection() {
  const { hydrated, state, updateProfile, updatePreferences } = usePulse();
  const toast = useToast();
  const days = state.trainingDays ?? 4;

  function setDays(next: number) {
    const v = Math.min(TRAINING_DAYS.MAX, Math.max(TRAINING_DAYS.MIN, next));
    if (v === days) return;
    updateProfile({ trainingDays: v });
    track("Setting Changed", { setting: "training_days", value: v });
  }

  return (
    <Shell section="training" description="Set a weekly target you can actually hit. Your progress tracks against it.">
      {!hydrated ? (
        <FormSkeleton />
      ) : (
        <>
          <Enter delay={140} variant="enter-soft">
            <section aria-labelledby="level-label" className="mb-8">
              <p id="level-label" className="t-eyebrow">
                Fitness level
              </p>
              <p className="t-small mt-2 max-w-[52ch]">
                Sets reps, hold times, rest and rounds in every workout, and the order your path unlocks.
              </p>
              <div role="radiogroup" aria-labelledby="level-label" className="mt-4 grid gap-2 sm:grid-cols-3">
                {LEVEL_OPTIONS.map((o) => {
                  const on = (state.fitnessLevel ?? "intermediate") === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        if (state.fitnessLevel === o.id) return;
                        updateProfile({ fitnessLevel: o.id });
                        track("Setting Changed", { setting: "fitness_level", value: o.id });
                        toast(`Workouts sized for ${LEVEL_LABELS[o.id].toLowerCase()}`, "info");
                      }}
                      className={cn(
                        "pressable rounded-[var(--radius)] border p-4 text-left transition-colors",
                        on ? "border-accent bg-accent/[0.06]" : "border-line hover:border-line-2",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[15px] font-semibold">{LEVEL_LABELS[o.id]}</span>
                        {on && <Check size={15} className="text-accent" strokeWidth={3} aria-hidden />}
                      </span>
                      <span className="t-micro mt-1.5 block !text-[12.5px]">{o.blurb}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </Enter>

          <Enter delay={180} variant="enter-soft">
            <section aria-labelledby="days-label" className="border-y border-line py-8">
              <p id="days-label" className="t-eyebrow">
                Training days per week
              </p>
              <div className="mt-5 flex items-center justify-between gap-6">
                <button
                  type="button"
                  aria-label="Fewer days"
                  onClick={() => setDays(days - 1)}
                  disabled={days <= TRAINING_DAYS.MIN}
                  className="pressable flex h-14 w-14 items-center justify-center rounded-full border border-line-2 hover:border-white/30 disabled:opacity-30"
                >
                  <Minus size={20} aria-hidden />
                </button>
                <p className="flex items-baseline gap-2" aria-live="polite">
                  <span key={days} className="t-num animate-pop text-[120px] leading-[0.8]">
                    {days}
                  </span>
                  <span className="text-[15px] font-semibold text-fg-2">days</span>
                </p>
                <button
                  type="button"
                  aria-label="More days"
                  onClick={() => setDays(days + 1)}
                  disabled={days >= TRAINING_DAYS.MAX}
                  className="pressable flex h-14 w-14 items-center justify-center rounded-full border border-line-2 hover:border-white/30 disabled:opacity-30"
                >
                  <Plus size={20} aria-hidden />
                </button>
              </div>
              <ol className="mt-8 grid grid-cols-7 gap-1.5" aria-hidden>
                {Array.from({ length: 7 }, (_, i) => (
                  <li
                    key={i}
                    className={cn(
                      "h-2 rounded-full transition-colors duration-500",
                      i < days ? "bg-accent" : "bg-white/[0.08]",
                    )}
                    style={{ transitionDelay: `${i * 40}ms` }}
                  />
                ))}
              </ol>
              <p className="t-micro mt-3">
                Saved automatically · {days >= 6 ? "Ambitious — build in a light day." : days <= 2 ? "A solid start. Add a day when it feels easy." : "A sustainable rhythm for most people."}
              </p>
            </section>
          </Enter>

          <Reveal className="mt-10">
            <MenuGroup title="Workout player">
              <SwitchRow
                label="Timer sounds"
                description="Alarm when a timer runs out, plus 3-2-1 beeps. Phones also vibrate."
                checked={state.preferences.restTimerSound}
                onChange={(v) => {
                  updatePreferences({ restTimerSound: v });
                  track("Setting Changed", { setting: "timer_sound", value: v });
                  toast(v ? "Timer sounds on" : "Timer sounds off", "info");
                }}
              />
            </MenuGroup>
          </Reveal>
        </>
      )}
    </Shell>
  );
}

/* ─────────────── Notifications ─────────────── */

const NOTIFICATION_PREFS: Array<{ key: keyof Pick<Preferences, "workoutReminders" | "classReminders" | "weeklyRecap">; label: string; description: string }> = [
  { key: "workoutReminders", label: "Workout reminders", description: "A nudge on training days when today's plan isn't done." },
  { key: "classReminders", label: "Live class reminders", description: "Before classes you've asked to be notified about start." },
  { key: "weeklyRecap", label: "Weekly recap", description: "Your XP, streak and minutes every Monday." },
];

function NotificationsSection() {
  const { hydrated, state, updatePreferences } = usePulse();
  const toast = useToast();

  return (
    <Shell section="notifications" description="Choose what Pulsepath should remind you about.">
      {!hydrated ? (
        <FormSkeleton />
      ) : (
        <Enter delay={180} variant="enter-soft">
          <MenuGroup
            title="Reminders"
            footer={
              <span className="flex gap-2.5">
                <Info size={15} className="mt-px shrink-0" aria-hidden />
                <span>
                  Saved on this device. Push &amp; email delivery is coming soon — until then, your{" "}
                  <Link href="/notifications" className="font-semibold text-fg-2 underline decoration-fg-4 underline-offset-4 hover:text-fg">
                    in-app notifications
                  </Link>{" "}
                  show what&apos;s due.
                </span>
              </span>
            }
          >
            {NOTIFICATION_PREFS.map((p) => (
              <SwitchRow
                key={p.key}
                label={p.label}
                description={p.description}
                checked={state.preferences[p.key]}
                onChange={(v) => {
                  updatePreferences({ [p.key]: v });
                  track("Setting Changed", { setting: p.key, value: v });
                  toast(`${p.label} ${v ? "on" : "off"}`, "info");
                }}
              />
            ))}
          </MenuGroup>
        </Enter>
      )}
    </Shell>
  );
}

/* ─────────────── Units ─────────────── */

function UnitsSection() {
  const { hydrated, state, updatePreferences } = usePulse();
  const units = state.preferences.units;
  const examples =
    units === "metric"
      ? [
          { label: "Body weight", value: "70", unit: "kg" },
          { label: "Distance", value: "5.0", unit: "km" },
          { label: "Height", value: "175", unit: "cm" },
        ]
      : [
          { label: "Body weight", value: "154", unit: "lb" },
          { label: "Distance", value: "3.1", unit: "mi" },
          { label: "Height", value: "5′9″", unit: "" },
        ];

  return (
    <Shell section="units" description="How weights, distances and measurements are shown.">
      {!hydrated ? (
        <FormSkeleton />
      ) : (
        <Enter delay={180} variant="enter-soft">
          <Segmented
            label="Measurement system"
            value={units}
            onChange={(v) => {
              updatePreferences({ units: v });
              track("Setting Changed", { setting: "units", value: v });
            }}
            options={[
              { value: "metric", label: "Metric" },
              { value: "imperial", label: "Imperial" },
            ]}
            className="w-full sm:w-80"
          />
          <dl className="mt-8 grid grid-cols-3 border-y border-line" aria-live="polite">
            {examples.map((e, i) => (
              <div key={e.label} className={cn("py-6", i > 0 && "border-l border-line pl-4 sm:pl-6")}>
                <dt className="t-eyebrow">{e.label}</dt>
                <dd key={`${units}-${e.label}`} className="enter-soft mt-3 flex items-baseline gap-1" style={{ ["--d" as string]: `${i * 60}ms` }}>
                  <span className="t-num text-[44px]">{e.value}</span>
                  {e.unit && <span className="text-[14px] font-semibold text-fg-2">{e.unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <Note>
            Saved on this device. Today&apos;s workouts are bodyweight and time-based; this applies as load and distance
            tracking arrive.
          </Note>
        </Enter>
      )}
    </Shell>
  );
}

/* ─────────────── Data ─────────────── */

function DataSection() {
  const { hydrated, state, completedLessonIds } = usePulse();
  const toast = useToast();

  const size = useMemo(() => {
    if (!hydrated) return 0;
    return new Blob([JSON.stringify(state)]).size;
  }, [hydrated, state]);

  function exportData() {
    try {
      const pretty = JSON.stringify(state, null, 2);
      const url = URL.createObjectURL(new Blob([pretty], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `pulsepath-data-${todayKey()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("Export downloaded");
    } catch {
      toast("Couldn't export — storage unavailable", "info");
    }
  }

  const rows = [
    { label: "XP", value: state.xp },
    { label: "Workouts completed", value: completedLessonIds.size },
    { label: "Habits", value: state.habits.length },
    { label: "Habit check-ins", value: Object.values(state.habitLogs).reduce((s, d) => s + d.length, 0) },
    { label: "Goal days", value: state.trainingDaysCompleted.length },
  ];

  return (
    <Shell
      section="data"
      eyebrow="Privacy & data"
      description="Your training history lives in this browser. Take a copy, or wipe it and start fresh."
    >
      {!hydrated ? (
        <FormSkeleton />
      ) : (
        <>
          <Enter delay={180} variant="enter-soft">
            <dl className="divide-y divide-line border-y border-line">
              {rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between py-3.5">
                  <dt className="text-[14px] text-fg-2">{r.label}</dt>
                  <dd className="text-[14px] font-semibold tabular-nums">{r.value}</dd>
                </div>
              ))}
            </dl>
            <p className="t-micro mt-3 px-1">
              Stored in this browser · {(size / 1024).toFixed(1)} KB
            </p>
          </Enter>

          <Enter delay={240} variant="enter-soft">
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" icon={<Download size={17} aria-hidden />} onClick={exportData}>
                Export my data
              </Button>
              <ResetDemo>
                {(open) => (
                  <Button size="lg" variant="secondary" icon={<RotateCcw size={16} aria-hidden />} onClick={open}>
                    Reset demo data
                  </Button>
                )}
              </ResetDemo>
            </div>
            <Note>Exports are a JSON file of exactly what&apos;s stored on this device. Nothing is uploaded.</Note>
          </Enter>
        </>
      )}
    </Shell>
  );
}

/* ─────────────── Help ─────────────── */

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "How do I earn XP?",
    a: `Finishing a workout earns +${XP.LESSON_COMPLETE} XP. Each habit check-in earns +${XP.HABIT_CHECKIN} XP, up to ${XP.HABIT_DAILY_CAP} XP from habits per day. Streak milestones add bonus XP on top.`,
  },
  {
    q: "How does my streak work?",
    a: `Your streak grows by one each day you hit the daily goal: finish one workout, or check in ${DAILY_GOAL.HABIT_QUOTA} habits. Miss a day and it starts again from 1 the next time you hit the goal.`,
  },
  {
    q: "What are streak rewards?",
    a: `One-time XP bonuses when your streak reaches ${STREAK_BONUSES.map((b) => `${b.days} days (+${b.xp})`).join(", ")}. Track them on the Progress tab.`,
  },
  {
    q: "How are levels calculated?",
    a: `Every ${XP.LEVEL_EVERY} XP is a new level. Your ring on Home and Progress shows how close you are to the next one.`,
  },
  {
    q: "Where is my data stored?",
    a: "In this browser's local storage. Signing in creates an account, but workout history isn't synced to the cloud yet — export a copy anytime from Settings → Your data.",
  },
  {
    q: "Will I get push or email reminders?",
    a: "Your reminder choices are saved now, but push and email delivery are still coming. Until then, the Notifications screen shows what's due today.",
  },
  {
    q: "Can I change my goal or weekly target?",
    a: "Yes. Edit profile changes your goal and re-orders recommendations; Training preferences changes how many days a week you're aiming for.",
  },
  {
    q: "What's Pulsepath Pro?",
    a: "A membership we're preparing with full programs and class replays. Nothing you use today will be paywalled. Tap Notify me on the Subscription screen to hear when it's ready.",
  },
];

function HelpSection() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <Shell section="help" eyebrow="Support" description="Straight answers about XP, streaks, your plan and your data.">
      <Enter delay={180} variant="enter-soft">
        <ul className="border-t border-line">
          {FAQ.map((f, i) => {
            const expanded = open === i;
            const panelId = `${baseId}-panel-${i}`;
            const btnId = `${baseId}-btn-${i}`;
            return (
              <li key={f.q} className="border-b border-line">
                <h2>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : i)}
                    className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="t-heading text-[17px] transition-colors group-hover:text-fg">{f.q}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "shrink-0 text-fg-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        expanded && "rotate-180 text-fg",
                      )}
                      aria-hidden
                    />
                  </button>
                </h2>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  hidden={!expanded}
                  className="pb-6 pr-8"
                >
                  <p className="t-body enter-soft max-w-[58ch]">{f.a}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Enter>

      <Reveal className="mt-12 rounded-[var(--radius-lg)] border border-line bg-surface-1 p-6">
        <p className="t-eyebrow">Still stuck?</p>
        <p className="t-title mt-3">Talk to a human</p>
        <p className="t-small mt-2">We read every message and usually reply within two working days.</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Pulsepath support")}`}
          className="pressable mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <Mail size={16} aria-hidden /> Contact support
        </a>
        <p className="t-micro mt-3">{SUPPORT_EMAIL}</p>
      </Reveal>
    </Shell>
  );
}

/* ─────────────── About ─────────────── */

function AboutSection({ version }: { version: string }) {
  const connected = isSupabaseConfigured();
  return (
    <Shell section="about" eyebrow="Pulsepath">
      <Enter delay={180}>
        <p className="font-display text-[clamp(1.6rem,5vw,2.4rem)] font-bold leading-[1.05] tracking-tight [font-stretch:85%]">
          Short, coached sessions. Honest progress. <span className="text-fg-3">A daily habit you keep because it fits your life.</span>
        </p>
      </Enter>

      <Enter delay={260} variant="enter-soft">
        <dl className="mt-10 grid grid-cols-2 border-y border-line">
          <div className="py-5">
            <dt className="t-eyebrow">Version</dt>
            <dd className="t-num mt-2 text-[36px]">{version}</dd>
          </div>
          <div className="border-l border-line py-5 pl-5">
            <dt className="t-eyebrow">Mode</dt>
            <dd className="mt-3 text-[15px] font-semibold">{connected ? "Accounts enabled" : "Local demo"}</dd>
            <dd className="t-micro mt-1">{connected ? "Progress stored on device" : "No account required"}</dd>
          </div>
        </dl>
      </Enter>

      <Reveal className="mt-10">
        <MenuGroup title="Legal">
          <MenuRow href="/legal/privacy" icon={Shield} label="Privacy policy" />
          <MenuRow href="/legal/terms" icon={FileText} label="Terms of service" />
          <MenuRow href={`mailto:${SUPPORT_EMAIL}`} icon={Mail} label="Contact" description={SUPPORT_EMAIL} external />
        </MenuGroup>
        <p className="t-micro mt-8 px-1">© {new Date().getFullYear()} Pulsepath. Made for people who train at home.</p>
      </Reveal>
    </Shell>
  );
}
