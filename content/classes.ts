import type { Difficulty } from "./exercises";

export type ClassType = "live" | "replay";

export type FitnessClass = {
  id: string;
  title: string;
  trainer: string;
  trainerBio: string;
  duration: number;
  difficulty: Difficulty;
  type: ClassType;
  /** ISO date string for live classes, or recorded date for replays */
  scheduledAt: string;
  description: string;
  category: "hiit" | "strength" | "yoga" | "cardio" | "mobility";
  spotsLeft?: number;
};

export const CLASSES: FitnessClass[] = [
  {
    id: "live-hiit-morning",
    title: "Morning HIIT Blast",
    trainer: "Coach Maya",
    trainerBio: "Certified HIIT instructor · 8 years experience",
    duration: 30,
    difficulty: "intermediate",
    type: "live",
    scheduledAt: getNextLiveTime(10, 0),
    description:
      "High-energy interval training to kickstart your metabolism. No equipment needed.",
    category: "hiit",
    spotsLeft: 12,
  },
  {
    id: "live-strength-upper",
    title: "Upper Body Strength",
    trainer: "Coach James",
    trainerBio: "Strength & conditioning coach · NASM certified",
    duration: 45,
    difficulty: "intermediate",
    type: "live",
    scheduledAt: getNextLiveTime(17, 30),
    description:
      "Build upper body power with bodyweight and resistance band movements.",
    category: "strength",
    spotsLeft: 8,
  },
  {
    id: "live-yoga-flow",
    title: "Evening Yoga Flow",
    trainer: "Coach Priya",
    trainerBio: "RYT-500 yoga instructor · Mobility specialist",
    duration: 40,
    difficulty: "beginner",
    type: "live",
    scheduledAt: getNextLiveTime(19, 0),
    description:
      "Wind down with a gentle flow focused on flexibility and breath work.",
    category: "yoga",
    spotsLeft: 20,
  },
  {
    id: "replay-core-crusher",
    title: "Core Crusher Replay",
    trainer: "Coach Maya",
    trainerBio: "Certified HIIT instructor · 8 years experience",
    duration: 25,
    difficulty: "intermediate",
    type: "replay",
    scheduledAt: "2026-08-20T14:00:00",
    description:
      "A focused core session targeting abs, obliques, and lower back stability.",
    category: "strength",
  },
  {
    id: "replay-cardio-dance",
    title: "Cardio Dance Party",
    trainer: "Coach Alex",
    trainerBio: "Dance fitness instructor · Zumba certified",
    duration: 35,
    difficulty: "beginner",
    type: "replay",
    scheduledAt: "2026-08-18T11:00:00",
    description:
      "Fun, follow-along dance cardio that doesn't feel like a workout.",
    category: "cardio",
  },
  {
    id: "replay-mobility-reset",
    title: "Full Body Mobility Reset",
    trainer: "Coach Priya",
    trainerBio: "RYT-500 yoga instructor · Mobility specialist",
    duration: 20,
    difficulty: "beginner",
    type: "replay",
    scheduledAt: "2026-08-15T09:00:00",
    description:
      "Release tension and improve range of motion with guided mobility drills.",
    category: "mobility",
  },
  {
    id: "replay-hiit-express",
    title: "HIIT Express 15",
    trainer: "Coach James",
    trainerBio: "Strength & conditioning coach · NASM certified",
    duration: 15,
    difficulty: "advanced",
    type: "replay",
    scheduledAt: "2026-08-12T07:00:00",
    description:
      "Maximum effort in minimum time. Perfect for busy mornings.",
    category: "hiit",
  },
];

function getNextLiveTime(hour: number, minute: number): string {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target.toISOString();
}

export function getLiveClasses(): FitnessClass[] {
  return CLASSES.filter((c) => c.type === "live").sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );
}

export function getReplayClasses(): FitnessClass[] {
  return CLASSES.filter((c) => c.type === "replay").sort(
    (a, b) =>
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
  );
}

export function getClass(id: string): FitnessClass | undefined {
  return CLASSES.find((c) => c.id === id);
}

export function getUpcomingLiveClass(): FitnessClass | undefined {
  return getLiveClasses()[0];
}

export function formatClassTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (d.toDateString() === today.toDateString()) return `Today ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow ${time}`;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const CATEGORY_LABELS: Record<FitnessClass["category"], string> = {
  hiit: "HIIT",
  strength: "Strength",
  yoga: "Yoga",
  cardio: "Cardio",
  mobility: "Mobility",
};
