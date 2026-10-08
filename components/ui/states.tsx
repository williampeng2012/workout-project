"use client";

import { Bell, BellRing, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink, Button } from "./button";
import { Media } from "./media";
import { Enter } from "./reveal";
import { TopBar } from "./top-bar";
import { useToast } from "./toast";
import { usePulse } from "@/lib/store/pulse-store";
import { cn } from "@/lib/cn";

/**
 * Full placeholder screen for features / content that aren't ready yet.
 * Always navigable, always has Back, and offers a real "Notify me" toggle.
 */
export function ComingSoon({
  id,
  eyebrow = "Coming soon",
  title,
  description,
  image,
  fallback = "/home",
  details,
  primary,
  children,
}: {
  /** Stable id used for the notify-me preference */
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  image?: string;
  fallback?: string;
  details?: Array<{ label: string; value: string }>;
  primary?: { label: string; href: string };
  children?: ReactNode;
}) {
  const { state, toggleNotify, hydrated } = usePulse();
  const toast = useToast();
  const subscribed = hydrated && state.notifyRequests.includes(id);

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title={title} fallback={fallback} overlay={Boolean(image)} />

      {image ? (
        <div className="relative h-[58vh] min-h-[380px] w-full lg:h-[62vh]">
          <Enter variant="enter-focus" className="absolute inset-0">
            <Media src={image} alt="" priority className="h-full w-full" imgClassName="grayscale-[35%]" />
          </Enter>
          <div className="scrim-bottom absolute inset-0" />
          <div className="absolute inset-0 bg-ink/25" />
        </div>
      ) : (
        <div className="h-20" />
      )}

      <div className={cn("page-x relative mx-auto max-w-[1180px]", image && "-mt-40")}>
        <div className="max-w-2xl">
          <Enter delay={60}>
            <p className="t-eyebrow flex items-center gap-2 !text-accent">
              <Sparkles size={13} aria-hidden />
              {eyebrow}
            </p>
          </Enter>
          <Enter delay={120}>
            <h1 className="t-display mt-4 text-balance">{title}</h1>
          </Enter>
          <Enter delay={200}>
            <p className="t-body mt-4 max-w-[52ch] text-[16px]">{description}</p>
          </Enter>

          {details && details.length > 0 && (
            <Enter delay={260}>
              <dl className="mt-8 grid grid-cols-3 border-y border-line py-5">
                {details.map((d, i) => (
                  <div key={d.label} className={cn(i > 0 && "border-l border-line pl-4")}>
                    <dt className="t-micro uppercase tracking-[0.14em]">{d.label}</dt>
                    <dd className="mt-1.5 text-[15px] font-semibold">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </Enter>
          )}

          <Enter delay={320}>
            <div className="mt-8 flex items-center gap-3 rounded-[var(--radius)] border border-line bg-surface-1 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <span className="spinner !h-4 !w-4 !border-[1.5px] opacity-80" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Content is being prepared</p>
                <p className="t-micro mt-0.5">
                  Our coaches are filming and reviewing every session.
                </p>
              </div>
            </div>
          </Enter>

          <Enter delay={380}>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant={subscribed ? "secondary" : "primary"}
                icon={subscribed ? <BellRing size={17} aria-hidden /> : <Bell size={17} aria-hidden />}
                onClick={() => {
                  const on = toggleNotify(id);
                  toast(on ? "We'll let you know when it's live" : "Notification removed", on ? "success" : "info");
                }}
                aria-pressed={subscribed}
              >
                {subscribed ? "You'll be notified" : "Notify me"}
              </Button>
              {primary && (
                <ButtonLink href={primary.href} size="lg" variant="secondary">
                  {primary.label}
                </ButtonLink>
              )}
            </div>
          </Enter>

          {children && <div className="mt-12">{children}</div>}
        </div>
      </div>
    </main>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius)] border border-dashed border-line-2 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-fg-2">
          {icon}
        </span>
      )}
      <p className="t-heading">{title}</p>
      {description && <p className="t-small mt-2 max-w-[34ch]">{description}</p>}
      {action && (
        <ButtonLink href={action.href} variant="secondary" size="sm" className="mt-5">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className="page-x mx-auto max-w-[1180px] pt-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-12 w-2/3" />
      <Skeleton className="mt-8 aspect-[4/5] w-full !rounded-[var(--radius-lg)] sm:aspect-[16/9]" />
      <div className="mt-4 grid grid-cols-5 gap-3">
        <Skeleton className="col-span-3 h-40" />
        <Skeleton className="col-span-2 h-40" />
      </div>
      <Skeleton className="mt-8 h-6 w-40" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-56 w-44 shrink-0" />
        <Skeleton className="h-56 w-44 shrink-0" />
        <Skeleton className="h-56 w-44 shrink-0" />
      </div>
    </div>
  );
}
