import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Full-bleed hero plane */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.85) 55%, #0a0a0a 100%),
            repeating-linear-gradient(
              -12deg,
              transparent,
              transparent 28px,
              rgba(255,255,255,0.03) 28px,
              rgba(255,255,255,0.03) 29px
            ),
            radial-gradient(ellipse 90% 70% at 70% 20%, #2a2a2a 0%, transparent 55%)
          `,
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <span className="font-display text-lg font-bold tracking-tight">
          Pulsepath
        </span>
        <Link
          href="/sign-in"
          className="text-sm text-fg-muted transition-colors hover:text-fg"
        >
          Sign in
        </Link>
      </header>

      <section className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-16 pt-24 sm:px-8 sm:pb-20">
        <p className="animate-fade-up font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
          Pulsepath
        </p>
        <h1 className="animate-fade-up mt-6 max-w-xl text-xl font-medium text-fg sm:text-2xl [animation-delay:80ms]">
          A little training every day — on a path you can finish.
        </h1>
        <p className="animate-fade-up mt-4 max-w-md text-base text-fg-muted [animation-delay:140ms]">
          Short lessons, habit check-ins, and streaks that reward showing up.
        </p>
        <div className="animate-fade-up mt-10 flex flex-wrap gap-3 [animation-delay:200ms]">
          <Link
            href="/onboarding"
            className="rounded-2xl bg-fg px-7 py-3.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02]"
          >
            Start free
          </Link>
          <Link
            href="/sign-up"
            className="rounded-2xl border border-border px-7 py-3.5 text-sm text-fg-muted hover:border-fg hover:text-fg"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
