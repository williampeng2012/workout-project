import { XP, xpIntoLevel } from "@/lib/gamification";

export function XpBar({ xp, level }: { xp: number; level: number }) {
  const into = xpIntoLevel(xp);
  const pct = Math.min(100, (into / XP.LEVEL_EVERY) * 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-display text-sm font-semibold tracking-wide">
          Level {level}
        </span>
        <span className="text-xs text-fg-muted">
          {into}/{XP.LEVEL_EVERY} XP
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-fg transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
