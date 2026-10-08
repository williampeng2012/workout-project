import type { ReactNode } from "react";
import { Media } from "@/components/ui/media";
import { Parallax } from "@/components/ui/parallax";

/** Full-bleed hero for detail screens. Pair with <TopBar overlay />. */
export function DetailHero({
  image,
  vtName,
  children,
  muted,
}: {
  image: string;
  vtName?: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section className="relative isolate h-[min(calc(100svh-var(--nav-h)-var(--safe-bottom)-24px),760px)] min-h-[420px] lg:h-[min(78svh,720px)] w-full overflow-hidden bg-surface-1">
      <Parallax speed={0.1}>
        <Media
          src={image}
          alt=""
          priority
          vtName={vtName}
          sizes="(min-width: 1024px) calc(100vw - 248px), 100vw"
          className="h-full w-full"
          imgClassName={muted ? "grayscale-[40%]" : undefined}
        />
      </Parallax>
      <div className="scrim-bottom absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/60 to-transparent" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/70 via-ink/10 to-transparent md:block" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="page-x mx-auto max-w-[1180px] pb-8 sm:pb-10">{children}</div>
      </div>
    </section>
  );
}
