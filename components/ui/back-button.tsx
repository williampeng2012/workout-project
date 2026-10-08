"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { canGoBackInApp } from "@/lib/nav-history";
import { cn } from "@/lib/cn";

export function BackButton({
  fallback = "/home",
  label = "Back",
  variant = "glass",
  className,
}: {
  fallback?: string;
  label?: string;
  variant?: "glass" | "plain";
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        if (canGoBackInApp()) router.back();
        else router.push(fallback);
      }}
      className={cn(
        "pressable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        variant === "glass"
          ? "glass text-fg hover:bg-white/10"
          : "text-fg-2 hover:bg-white/[0.06] hover:text-fg",
        className,
      )}
    >
      <ArrowLeft size={18} strokeWidth={2} aria-hidden />
    </button>
  );
}
