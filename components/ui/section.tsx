import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "See all",
  className,
  action,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="t-eyebrow mb-2">{eyebrow}</p>}
        <h2 className="t-title">{title}</h2>
      </div>
      {action}
      {href && !action && (
        <Link
          href={href}
          className="pressable group inline-flex shrink-0 items-center gap-1.5 pb-0.5 text-[13px] font-semibold text-fg-2 hover:text-fg"
        >
          {linkLabel}
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}

/** Large editorial header for top-level tab screens. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="t-eyebrow enter-soft mb-3" style={{ ["--d" as string]: "0ms" }}>
            {eyebrow}
          </p>
        )}
        <h1 className="t-display enter" style={{ ["--d" as string]: "60ms" }}>
          {title}
        </h1>
        {description && (
          <p
            className="t-body enter-soft mt-3 max-w-[46ch]"
            style={{ ["--d" as string]: "160ms" }}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="enter-soft shrink-0" style={{ ["--d" as string]: "120ms" }}>
          {action}
        </div>
      )}
    </header>
  );
}

export function Pill({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "light" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
        tone === "default" && "bg-white/[0.08] text-fg-2 backdrop-blur-md",
        tone === "accent" && "bg-accent text-accent-ink",
        tone === "light" && "bg-fg text-ink",
        tone === "outline" && "border border-line-2 text-fg-2",
        className,
      )}
    >
      {children}
    </span>
  );
}
