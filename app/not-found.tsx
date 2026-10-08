import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { IMAGES } from "@/content/catalog";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh items-end overflow-hidden">
      <Image
        src={IMAGES.recovery}
        alt=""
        fill
        priority
        sizes="100vw"
        className="enter-focus object-cover opacity-60 grayscale"
      />
      <div className="scrim-bottom absolute inset-0" />
      <div className="page-x relative mx-auto w-full max-w-[1180px] pb-[calc(56px+var(--safe-bottom))]">
        <p className="t-eyebrow enter-soft !text-accent">Error 404</p>
        <h1 className="t-hero enter mt-4 max-w-[10ch]" style={{ ["--d" as string]: "80ms" }}>
          Off the path.
        </h1>
        <p className="t-body enter-soft mt-5 max-w-[40ch] text-[16px]" style={{ ["--d" as string]: "180ms" }}>
          This page doesn&apos;t exist or has moved. Let&apos;s get you back to training.
        </p>
        <div className="enter-soft mt-8 flex flex-wrap gap-3" style={{ ["--d" as string]: "260ms" }}>
          <ButtonLink href="/home" size="lg">
            Back to home
          </ButtonLink>
          <ButtonLink href="/discover" size="lg" variant="secondary">
            Discover workouts
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
