"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-x page-bottom mx-auto flex min-h-[80dvh] max-w-xl flex-col justify-center">
      <p className="t-eyebrow enter-soft">Something went wrong</p>
      <h1 className="t-display enter mt-4" style={{ ["--d" as string]: "60ms" }}>
        We dropped the bar.
      </h1>
      <p className="t-body enter-soft mt-4" style={{ ["--d" as string]: "140ms" }}>
        This screen hit an unexpected error. Your progress is saved on this device — try again, or head back home.
      </p>
      <div className="enter-soft mt-8 flex flex-wrap gap-3" style={{ ["--d" as string]: "200ms" }}>
        <Button size="lg" onClick={reset} icon={<RotateCcw size={16} aria-hidden />}>
          Try again
        </Button>
        <ButtonLink href="/home" size="lg" variant="secondary">
          Go home
        </ButtonLink>
      </div>
    </main>
  );
}
