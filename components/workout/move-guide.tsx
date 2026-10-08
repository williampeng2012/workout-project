import { Feather, Info, Target } from "lucide-react";
import { getExerciseByName } from "@/content/exercises";
import { FALLBACK_GUIDE, getMoveGuide, type MoveGuide } from "@/content/move-guides";
import type { FitnessLevel } from "@/lib/training";
import { cn } from "@/lib/cn";

export function resolveGuide(name: string): { guide: MoveGuide; side: "left" | "right" | null } {
  return getMoveGuide(name) ?? { guide: FALLBACK_GUIDE, side: null };
}

/** "What it is / Why / How / Easier option" for one move. */
export function MoveGuideDetails({
  name,
  level,
  showMistakes = false,
  className,
}: {
  name: string;
  level: FitnessLevel | null;
  showMistakes?: boolean;
  className?: string;
}) {
  const { guide, side } = resolveGuide(name);
  const mistakes = showMistakes ? getExerciseByName(name.replace(/\s+[LR]$/, ""))?.commonMistakes : undefined;

  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <p className="t-eyebrow flex items-center gap-1.5 !text-fg-2">
          <Info size={12} aria-hidden /> What it is
        </p>
        <p className="mt-1.5 text-[15.5px] leading-relaxed text-fg">
          {guide.what}
          {side && <span className="font-semibold"> This set is your {side} side.</span>}
        </p>
      </div>
      <div>
        <p className="t-eyebrow flex items-center gap-1.5 !text-fg-2">
          <Target size={12} aria-hidden /> Why you&apos;re doing it
        </p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-fg-2">{guide.why}</p>
      </div>
      <div>
        <p className="t-eyebrow !text-fg-2">How to do it</p>
        <ol className="mt-2 space-y-2">
          {guide.how.map((line, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-snug text-fg">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[12px] font-bold tabular-nums">
                {i + 1}
              </span>
              <span className="pt-0.5">{line}</span>
            </li>
          ))}
        </ol>
      </div>
      {guide.easier && (
        <div
          className={cn(
            "flex gap-3 rounded-[var(--radius)] border p-3.5",
            level === "beginner" ? "border-accent/40 bg-accent/[0.07]" : "border-line bg-white/[0.03]",
          )}
        >
          <Feather size={16} className={cn("mt-0.5 shrink-0", level === "beginner" ? "text-accent" : "text-fg-2")} aria-hidden />
          <p className="text-[14px] leading-snug text-fg-2">
            <span className="font-semibold text-fg">{level === "beginner" ? "Start with the easier version: " : "Easier option: "}</span>
            {guide.easier}
          </p>
        </div>
      )}
      {mistakes && mistakes.length > 0 && (
        <div>
          <p className="t-eyebrow !text-fg-2">Avoid</p>
          <ul className="mt-2 space-y-1.5">
            {mistakes.map((m) => (
              <li key={m} className="t-small flex gap-2">
                <span aria-hidden>·</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
