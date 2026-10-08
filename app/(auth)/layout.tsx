import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/app-shell";
import { Media } from "@/components/ui/media";
import { IMAGES } from "@/content/catalog";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="relative h-[30svh] min-h-[200px] overflow-hidden lg:sticky lg:top-0 lg:h-dvh">
        <Media
          src={IMAGES.auth}
          alt=""
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="enter-focus absolute inset-0"
          position="center 30%"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20 lg:bg-gradient-to-t lg:from-ink/90 lg:via-ink/10 lg:to-ink/30" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-[calc(var(--safe-top)+16px)] lg:px-10 lg:pt-10">
          <Link href="/" className="pressable flex items-center gap-2.5" aria-label="Pulsepath — home">
            <Logo />
            <span className="font-display text-[19px] font-extrabold uppercase tracking-tight [font-stretch:80%]">
              Pulsepath
            </span>
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 hidden p-10 lg:block xl:p-14">
          <p className="t-eyebrow enter-soft" style={{ ["--d" as string]: "200ms" }}>
            Six minutes is enough
          </p>
          <p className="t-hero enter mt-4 max-w-[9ch]" style={{ ["--d" as string]: "280ms" }}>
            Train a little. Every day.
          </p>
          <p className="t-body enter-soft mt-5 max-w-sm" style={{ ["--d" as string]: "380ms" }}>
            Short guided workouts, a path you can actually finish, and streaks that reward showing up.
          </p>
        </div>
      </aside>

      <main className="relative -mt-8 flex justify-center px-5 pb-[calc(var(--safe-bottom)+40px)] lg:mt-0 lg:items-center lg:px-12 lg:py-16">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  );
}
