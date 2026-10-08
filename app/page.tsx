import { ArrowRight, ArrowUpRight, Flame, Play, Route, Sparkles } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Parallax } from "@/components/ui/parallax";
import { Enter, Reveal } from "@/components/ui/reveal";
import { Pill } from "@/components/ui/section";
import { COURSES, IMAGES, PROGRAMS, getProgramLessons } from "@/content/catalog";
import { EXERCISES } from "@/content/exercises";
import { LESSONS } from "@/content/lessons";
import { isSupabaseEnvReady } from "@/lib/auth";
import { cn } from "@/lib/cn";

const FEATURES = [
  {
    icon: Route,
    eyebrow: "The path",
    title: "A plan you can actually finish",
    body: "Short guided workouts in a clear order. Always know what's next — no scrolling through a thousand videos.",
    image: IMAGES.home,
  },
  {
    icon: Flame,
    eyebrow: "Streaks",
    title: "Reward showing up",
    body: "One workout or two small habits keeps the streak alive. XP, levels and streak bonuses make consistency visible.",
    image: IMAGES.hiit,
  },
  {
    icon: Sparkles,
    eyebrow: "Technique",
    title: "Move with confidence",
    body: "Step-by-step cues, common mistakes and safety notes for every movement in your plan.",
    image: IMAGES.core,
  },
];

export default function LandingPage() {
  const authOn = isSupabaseEnvReady();
  const startHref = authOn ? "/sign-up" : "/onboarding";
  const avgMinutes = Math.round(LESSONS.reduce((s, l) => s + l.minutes, 0) / LESSONS.length);
  const programs = PROGRAMS.slice(0, 4);

  return (
    <div className="min-h-dvh bg-ink">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 pt-[calc(var(--safe-top)+16px)] md:px-10 md:pt-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Pulsepath — home">
            <Logo />
            <span className="font-display text-[19px] font-extrabold uppercase tracking-tight [font-stretch:80%]">
              Pulsepath
            </span>
          </Link>
          <nav aria-label="Account" className="flex items-center gap-1.5">
            <ButtonLink href="/sign-in" variant="ghost" size="sm">
              Sign in
            </ButtonLink>
            <ButtonLink href={startHref} variant="light" size="sm" className="hidden sm:inline-flex">
              Start free
            </ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Parallax speed={0.22}>
            <Media
              src={IMAGES.strength}
              alt=""
              priority
              sizes="100vw"
              className="enter-focus h-full w-full"
              position="center 30%"
            />
          </Parallax>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/70 to-transparent md:block" />
        </div>

        <div className="mx-auto w-full max-w-[1280px] px-5 pb-[calc(var(--safe-bottom)+40px)] pt-40 md:px-10 md:pb-20">
          <Enter delay={120} variant="enter-soft">
            <Pill tone="accent">Six-minute workouts · Daily streaks</Pill>
          </Enter>
          <Enter delay={200} as="h1" className="t-hero mt-6 max-w-[10ch] text-[clamp(3.6rem,13vw,10.5rem)]">
            Train a little. Every day.
          </Enter>
          <Enter delay={320} variant="enter-soft" as="p" className="t-body mt-6 max-w-[34rem] text-[17px] md:text-lg">
            Pulsepath turns fitness into a short daily ritual — guided workouts on a path you can finish,
            technique you can trust, and streaks that reward showing up.
          </Enter>
          <Enter delay={420} variant="enter-soft" className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href={startHref} size="lg" icon={<Play size={16} fill="currentColor" aria-hidden />}>
              Start free
            </ButtonLink>
            <ButtonLink href="/sign-in" size="lg" variant="secondary">
              I have an account
            </ButtonLink>
          </Enter>
        </div>
      </section>

      {/* Stats strip */}
      <section aria-label="At a glance" className="border-y border-line">
        <dl className="mx-auto grid max-w-[1280px] grid-cols-2 md:grid-cols-4">
          {[
            { k: `${avgMinutes} min`, v: "Average workout" },
            { k: String(LESSONS.length), v: "Guided workouts" },
            { k: String(EXERCISES.length), v: "Technique guides" },
            { k: "2", v: "Habits keep a streak" },
          ].map((s, i) => (
            <Reveal
              key={s.v}
              delay={i * 70}
              className={cn(
                "flex flex-col-reverse px-5 py-8 md:px-10 md:py-12",
                i % 2 === 1 && "border-l border-line",
                i >= 2 && "border-t border-line md:border-t-0",
                i === 2 && "md:border-l",
              )}
            >
              <dt className="t-micro">{s.v}</dt>
              <dd className="t-num mt-2 text-[clamp(2.4rem,6vw,4rem)]">{s.k}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Features — asymmetric */}
      <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 md:py-32">
        <Reveal className="max-w-3xl">
          <p className="t-eyebrow">How it works</p>
          <h2 className="t-display mt-4">Less deciding. More doing.</h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-12">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal
                key={f.title}
                delay={i * 90}
                className={cn(
                  "group relative overflow-hidden rounded-[var(--radius-lg)] bg-surface-1",
                  i === 0 ? "md:col-span-7 md:row-span-2" : "md:col-span-5",
                )}
              >
                <div className={cn("relative", i === 0 ? "aspect-[4/5] md:aspect-auto md:h-full md:min-h-[620px]" : "aspect-[16/11]")}>
                  <Media src={f.image} alt="" zoom sizes="(min-width:768px) 50vw, 100vw" className="absolute inset-0" />
                  <div className="scrim-bottom absolute inset-0" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink">
                      <Icon size={18} aria-hidden />
                    </span>
                    <p className="t-eyebrow mt-5 !text-fg/60">{f.eyebrow}</p>
                    <h3 className={cn("mt-2 font-display font-extrabold uppercase leading-[0.92] [font-stretch:75%]", i === 0 ? "text-[clamp(2.2rem,5vw,3.6rem)]" : "text-[1.9rem]")}>
                      {f.title}
                    </h3>
                    <p className="t-body mt-3 max-w-md">{f.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Programs showcase */}
      <section className="border-t border-line bg-surface-1/40 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="t-eyebrow">Programs</p>
              <h2 className="t-display mt-4">Pick a path. We&apos;ll handle the plan.</h2>
            </div>
            <ButtonLink href={startHref} variant="secondary" iconRight={<ArrowRight size={16} aria-hidden />}>
              Build my plan
            </ButtonLink>
          </Reveal>

          <div className="rail mt-12 md:!mx-0 md:grid md:grid-cols-4 md:!px-0">
            {programs.map((p, i) => {
              const count = getProgramLessons(p).length;
              return (
                <Reveal key={p.id} delay={i * 80} className="w-[72vw] max-w-[300px] shrink-0 md:w-auto md:max-w-none">
                  <Link href={`/programs/${p.id}`} className="group pressable block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)]">
                      <Media src={p.image} alt="" zoom sizes="300px" className="absolute inset-0" />
                      <div className="scrim-bottom absolute inset-0" />
                      <div className="absolute left-4 top-4">
                        {p.status === "coming-soon" ? <Pill tone="light">Soon</Pill> : <Pill>{p.level}</Pill>}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="font-display text-[1.8rem] font-extrabold uppercase leading-[0.9] [font-stretch:75%]">
                          {p.title}
                        </p>
                        <p className="t-micro mt-2">
                          {count ? `${count} workouts · ` : ""}
                          {p.weeks} week{p.weeks === 1 ? "" : "s"} · {p.coach}
                        </p>
                      </div>
                    </div>
                    <p className="t-small mt-3 line-clamp-2">{p.tagline}</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses teaser */}
      <section className="mx-auto grid max-w-[1280px] gap-10 px-5 py-24 md:grid-cols-2 md:items-center md:px-10 md:py-32">
        <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] md:order-2">
          <Media src={COURSES[0].image} alt="" zoom sizes="(min-width:768px) 50vw, 100vw" className="absolute inset-0" />
        </Reveal>
        <Reveal delay={100}>
          <p className="t-eyebrow">Technique courses</p>
          <h2 className="t-display mt-4">Form first. Then everything else.</h2>
          <p className="t-body mt-5 max-w-md">
            {COURSES[0].description}
          </p>
          <Link
            href={`/courses/${COURSES[0].id}`}
            className="group mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-fg hover:text-accent"
          >
            Explore {COURSES[0].title}
            <ArrowUpRight size={17} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="relative isolate overflow-hidden">
        <Media src={IMAGES.power} alt="" sizes="100vw" className="absolute inset-0 -z-10" position="center 40%" />
        <div className="absolute inset-0 -z-10 bg-ink/75" />
        <Reveal className="mx-auto max-w-[1280px] px-5 py-28 text-center md:px-10 md:py-40">
          <h2 className="t-hero mx-auto max-w-[12ch] text-[clamp(3rem,9vw,7rem)]">Your first six minutes start now.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href={startHref} size="lg" icon={<Play size={16} fill="currentColor" aria-hidden />}>
              Start free
            </ButtonLink>
            <ButtonLink href="/sign-in" size="lg" variant="secondary">
              Sign in
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-10 pb-[calc(var(--safe-bottom)+40px)] md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <span className="text-[13px] text-fg-3">© {new Date().getFullYear()} Pulsepath</span>
          </div>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-semibold text-fg-2">
            <Link href="/legal/privacy" className="hover:text-fg">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-fg">
              Terms
            </Link>
            <Link href="/sign-in" className="hover:text-fg">
              Sign in
            </Link>
            <Link href={startHref} className="hover:text-fg">
              Get started
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
