import { ArrowUpRight, Check, Clock, Lock, Play } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Media } from "@/components/ui/media";
import { Pill } from "@/components/ui/section";
import { cn } from "@/lib/cn";

/** Portrait image card with layered type. Used for workouts / programs. */
export function PosterCard({
  href,
  image,
  eyebrow,
  title,
  meta,
  badge,
  className,
  vtName,
  size = "md",
  priority,
}: {
  href: string;
  image: string;
  eyebrow?: string;
  title: string;
  meta?: string;
  badge?: ReactNode;
  className?: string;
  vtName?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-forward"]}
      className={cn(
        "group pressable relative block overflow-hidden rounded-[var(--radius)] bg-surface-1",
        size === "sm" && "aspect-[3/4] w-[46vw] max-w-[190px]",
        size === "md" && "aspect-[3/4] w-[62vw] max-w-[260px]",
        size === "lg" && "aspect-[4/5] w-full",
        className,
      )}
    >
      <Media
        src={image}
        alt=""
        zoom
        vtName={vtName}
        priority={priority}
        sizes="(min-width: 768px) 280px, 62vw"
        className="absolute inset-0"
      />
      <div className="scrim-bottom absolute inset-0" />
      {badge && <div className="absolute left-3 top-3">{badge}</div>}
      <span className="glass absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100">
        <ArrowUpRight size={15} aria-hidden />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4">
        {eyebrow && <p className="t-eyebrow !text-fg/70">{eyebrow}</p>}
        <p className={cn("mt-1.5 text-balance font-display font-bold uppercase leading-[0.95] [font-stretch:80%]", size === "sm" ? "text-lg" : "text-[1.45rem]")}>
          {title}
        </p>
        {meta && <p className="mt-2 text-[12px] font-medium text-fg-2">{meta}</p>}
      </div>
    </Link>
  );
}

/** Horizontal row: thumbnail + text. Compact lists (classes, tutorials, results). */
export function RowCard({
  href,
  image,
  title,
  subtitle,
  eyebrow,
  trailing,
  className,
}: {
  href: string;
  image: string;
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-forward"]}
      className={cn(
        "group pressable flex items-center gap-4 rounded-[var(--radius)] border border-line bg-surface-1 p-2.5 pr-4 hover:border-line-2 hover:bg-surface-2",
        className,
      )}
    >
      <Media
        src={image}
        alt=""
        zoom
        sizes="96px"
        className="h-[72px] w-[72px] shrink-0 rounded-[10px]"
      />
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="mb-1">{eyebrow}</div>}
        <p className="truncate text-[15px] font-semibold">{title}</p>
        {subtitle && <p className="t-micro mt-1 truncate !text-[12px]">{subtitle}</p>}
      </div>
      {trailing ?? (
        <ArrowUpRight
          size={17}
          className="shrink-0 text-fg-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
          aria-hidden
        />
      )}
    </Link>
  );
}

/** Timeline step for program / plan lists. */
export function StepRow({
  href,
  index,
  title,
  meta,
  state,
  image,
}: {
  href: string;
  index: number;
  title: string;
  meta: string;
  state: "done" | "current" | "locked" | "open";
  image?: string;
}) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-forward"]}
      className={cn(
        "group pressable relative flex items-center gap-4 rounded-[var(--radius)] border p-3 pr-4",
        state === "current"
          ? "border-accent/40 bg-accent-soft"
          : "border-line bg-surface-1 hover:border-line-2 hover:bg-surface-2",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums",
          state === "done" && "bg-fg text-ink",
          state === "current" && "bg-accent text-accent-ink",
          (state === "locked" || state === "open") && "border border-line-2 text-fg-3",
        )}
      >
        {state === "done" ? (
          <Check size={16} strokeWidth={3} aria-hidden />
        ) : state === "locked" ? (
          <Lock size={14} aria-hidden />
        ) : state === "current" ? (
          <Play size={14} fill="currentColor" aria-hidden />
        ) : (
          String(index).padStart(2, "0")
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[15px] font-semibold", state === "locked" && "text-fg-2")}>
          {title}
        </p>
        <p className="t-micro mt-1 flex items-center gap-1.5 !text-[12px]">
          <Clock size={12} aria-hidden />
          {meta}
        </p>
      </div>
      {image && (
        <Media src={image} alt="" sizes="64px" className={cn("h-12 w-12 shrink-0 rounded-[10px]", state === "locked" && "opacity-50 grayscale")} />
      )}
      {state === "current" && <Pill tone="accent">Up next</Pill>}
    </Link>
  );
}
