export function StreakFlame({
  count,
  size = "md",
}: {
  count: number;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "h-16 w-12" : size === "sm" ? "h-8 w-6" : "h-12 w-9";
  const text =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${dim} animate-flame`} aria-hidden>
        <svg viewBox="0 0 40 56" className="h-full w-full fill-fg">
          <path d="M20 2C14 14 6 18 6 32c0 10 6 18 14 18s14-8 14-18C34 18 26 14 20 2z" />
          <path
            className="fill-bg"
            d="M20 22c-3 6-6 8-6 14 0 5 3 9 6 9s6-4 6-9c0-6-3-8-6-14z"
            opacity="0.35"
          />
        </svg>
      </div>
      <div>
        <p className={`font-display font-bold leading-none ${text}`}>{count}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-fg-muted">
          day streak
        </p>
      </div>
    </div>
  );
}
