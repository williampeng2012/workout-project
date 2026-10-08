"use client";

import { ArrowUpRight, ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Accessible on/off switch. */
export function Switch({
  checked,
  onChange,
  label,
  describedBy,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  describedBy?: string;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={cn(
        "pressable relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-300",
        checked ? "border-accent bg-accent" : "border-line-2 bg-white/[0.06] hover:bg-white/[0.1]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full shadow-sm transition-[left,background-color] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          checked ? "left-[calc(100%-24px)] bg-accent-ink" : "left-[3px] bg-fg",
        )}
      />
    </button>
  );
}

/** Label + description + switch row, used in settings groups. */
export function SwitchRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block cursor-pointer text-[15px] font-semibold">
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className="t-micro mt-1 !text-[12.5px]">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onChange={onChange}
        label={label}
        describedBy={description ? `${id}-desc` : undefined}
      />
    </div>
  );
}

/** A titled, hairline-divided list. Deliberately flat — no card stacks. */
export function MenuGroup({
  title,
  children,
  className,
  footer,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <section className={className} aria-label={title}>
      {title && <h2 className="t-eyebrow mb-3 px-1">{title}</h2>}
      <div className="divide-y divide-line overflow-hidden rounded-[var(--radius)] border border-line bg-surface-1">
        {children}
      </div>
      {footer && <div className="t-micro mt-3 px-1 !text-[12.5px]">{footer}</div>}
    </section>
  );
}

export function MenuRow({
  href,
  icon: Icon,
  label,
  description,
  value,
  external,
}: {
  href: string;
  icon?: LucideIcon;
  label: string;
  description?: string;
  value?: ReactNode;
  external?: boolean;
}) {
  const content = (
    <>
      {Icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-fg-2 transition-colors group-hover:text-fg">
          <Icon size={17} aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold">{label}</span>
        {description && <span className="t-micro mt-0.5 block truncate !text-[12.5px]">{description}</span>}
      </span>
      {value !== undefined && (
        <span className="shrink-0 text-[13px] font-medium text-fg-3">{value}</span>
      )}
      {external ? (
        <ArrowUpRight size={16} className="shrink-0 text-fg-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      ) : (
        <ChevronRight size={17} className="shrink-0 text-fg-3 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
      )}
    </>
  );
  const className =
    "group pressable flex min-h-[64px] items-center gap-3.5 px-4 py-3 hover:bg-white/[0.03] sm:px-5";

  if (external) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} transitionTypes={["nav-forward"]} className={className}>
      {content}
    </Link>
  );
}

/** Sub-page intro used under a TopBar. */
export function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="pb-8 pt-4 lg:pt-8">
      {eyebrow && (
        <p className="t-eyebrow enter-soft" style={{ ["--d" as string]: "0ms" }}>
          {eyebrow}
        </p>
      )}
      <h1 className="t-display enter mt-3 max-w-[14ch] text-balance" style={{ ["--d" as string]: "60ms" }}>
        {title}
      </h1>
      {description && (
        <p className="t-body enter-soft mt-4 max-w-[48ch]" style={{ ["--d" as string]: "140ms" }}>
          {description}
        </p>
      )}
    </header>
  );
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}
