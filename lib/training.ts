import { UNITS, getOrderedLessons, type Lesson, type LessonStep } from "@/content/lessons";

export type Goal = "fat_loss" | "muscle" | "maintain";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export type TrainingProfile = { goal: Goal | null; level: FitnessLevel | null };

export const LEVEL_OPTIONS: Array<{ id: FitnessLevel; label: string; blurb: string }> = [
  {
    id: "beginner",
    label: "New to this",
    blurb: "Little or no training. Every move is explained, sets are short and rests are long.",
  },
  {
    id: "intermediate",
    label: "Some experience",
    blurb: "You work out now and then and know a squat from a lunge.",
  },
  {
    id: "advanced",
    label: "Train regularly",
    blurb: "You're fit and want more rounds, more reps and less rest.",
  },
];

export const LEVEL_LABELS: Record<FitnessLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

type Dial = { reps: number; time: number; rest: number; rounds: number; roundRest: number };

/** Base dose per level. Intermediate matches the authored workouts. */
const LEVEL_DIALS: Record<FitnessLevel, Dial> = {
  beginner: { reps: 0.7, time: 0.75, rest: 30, rounds: 1, roundRest: 0 },
  intermediate: { reps: 1, time: 1, rest: 20, rounds: 1, roundRest: 45 },
  advanced: { reps: 1.25, time: 1.25, rest: 15, rounds: 2, roundRest: 60 },
};

/** How the goal shifts that dose. */
const GOAL_DIALS: Record<Goal, { reps: number; time: number; rest: number; extraRound: boolean }> = {
  fat_loss: { reps: 1.1, time: 1.15, rest: 0.75, extraRound: true },
  muscle: { reps: 1.2, time: 1, rest: 1.25, extraRound: true },
  maintain: { reps: 1, time: 1, rest: 1, extraRound: false },
};

export type PersonalStep = LessonStep & { round: number; roundCount: number };

export type PersonalWorkout = {
  steps: PersonalStep[];
  rounds: number;
  /** Seconds of work + rest, excluding time spent reading move guides. */
  seconds: number;
  minutes: number;
  restSeconds: number;
};

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

function scaleStep(step: LessonStep, dial: Dial, goal: (typeof GOAL_DIALS)[Goal]): LessonStep {
  if (step.type === "timer") {
    return { ...step, value: Math.max(15, roundTo(step.value * dial.time * goal.time, 5)) };
  }
  // Alternating moves are authored in even counts; keep them even.
  const even = step.value % 2 === 0 && step.value >= 12;
  const raw = step.value * dial.reps * goal.reps;
  return { ...step, value: Math.max(4, even ? roundTo(raw, 2) : Math.round(raw)) };
}

/** A lesson resized for the user's level and goal. */
export function personalizeLesson(lesson: Lesson, profile: TrainingProfile): PersonalWorkout {
  const dial = LEVEL_DIALS[profile.level ?? "intermediate"];
  const goal = GOAL_DIALS[profile.goal ?? "maintain"];
  const rounds = dial.rounds + (goal.extraRound && profile.level && profile.level !== "beginner" ? 1 : 0);
  const rest = Math.max(10, roundTo(dial.rest * goal.rest, 5));

  const steps: PersonalStep[] = [];
  for (let round = 1; round <= rounds; round++) {
    lesson.steps.forEach((step, i) => {
      const scaled = scaleStep(step, dial, goal);
      const lastInRound = i === lesson.steps.length - 1;
      steps.push({
        ...scaled,
        id: `${step.id}-r${round}`,
        round,
        roundCount: rounds,
        restSeconds: lastInRound ? (round < rounds ? dial.roundRest : 0) : step.restSeconds > 0 ? rest : 0,
      });
    });
  }

  const seconds = steps.reduce((sum, s) => sum + (s.type === "timer" ? s.value : s.value * 3) + s.restSeconds, 0);
  return { steps, rounds, seconds, minutes: Math.max(1, Math.round(seconds / 60)), restSeconds: rest };
}

/** Timed single-exercise sessions (warm-up, cool-down) use the low or high end of their range. */
export function pickDuration(range: string, level: FitnessLevel | null): number {
  const nums = (range.match(/\d+/g) ?? ["30"]).map(Number);
  return level === "advanced" ? nums[nums.length - 1] : nums[0];
}

const UNIT_ORDER: Record<FitnessLevel, Record<Goal, string[]>> = {
  beginner: {
    fat_loss: ["foundation", "flow", "power"],
    muscle: ["foundation", "flow", "power"],
    maintain: ["foundation", "flow", "power"],
  },
  intermediate: {
    fat_loss: ["foundation", "power", "flow"],
    muscle: ["foundation", "power", "flow"],
    maintain: ["foundation", "flow", "power"],
  },
  advanced: {
    fat_loss: ["power", "flow", "foundation"],
    muscle: ["power", "flow", "foundation"],
    maintain: ["flow", "power", "foundation"],
  },
};

/** The order the user's path unlocks workouts in. */
export function lessonOrderFor(profile: TrainingProfile): Lesson[] {
  if (!profile.level) return getOrderedLessons();
  const units = UNIT_ORDER[profile.level][profile.goal ?? "maintain"];
  const rank = (unitId: string) => {
    const i = units.indexOf(unitId);
    return i === -1 ? units.length + (UNITS.find((u) => u.id === unitId)?.order ?? 0) : i;
  };
  return [...getOrderedLessons()].sort((a, b) => rank(a.unitId) - rank(b.unitId));
}

export function profileSummary(profile: TrainingProfile, lesson: Lesson): string {
  const w = personalizeLesson(lesson, profile);
  const parts = [`${w.rounds} round${w.rounds > 1 ? "s" : ""}`, `${w.restSeconds}s rest`, `~${w.minutes} min`];
  return parts.join(" · ");
}
