import { CLASSES, type FitnessClass } from "./classes";
import { EXERCISES, type Exercise } from "./exercises";
import { LESSONS, getOrderedLessons, type Lesson } from "./lessons";

/* ─────────────── Photography ─────────────── */

export const IMAGES = {
  strength: "/images/hero-strength.jpg",
  hiit: "/images/hiit.jpg",
  mobility: "/images/mobility.jpg",
  core: "/images/core.jpg",
  cardio: "/images/cardio.jpg",
  class: "/images/class.jpg",
  recovery: "/images/recovery.jpg",
  auth: "/images/auth.jpg",
  power: "/images/power.jpg",
  home: "/images/home-training.jpg",
  lower: "/images/lower-body.jpg",
} as const;

export type ImageKey = keyof typeof IMAGES;

/* ─────────────── Categories ─────────────── */

export type CategoryId =
  | "strength"
  | "hiit"
  | "core"
  | "mobility"
  | "cardio"
  | "recovery";

export type Category = {
  id: CategoryId;
  label: string;
  tagline: string;
  image: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "strength",
    label: "Strength",
    tagline: "Build a stronger base with bodyweight power.",
    image: IMAGES.strength,
  },
  {
    id: "hiit",
    label: "HIIT",
    tagline: "Short, sharp intervals that leave you breathless.",
    image: IMAGES.hiit,
  },
  {
    id: "core",
    label: "Core",
    tagline: "Stability and control from the center out.",
    image: IMAGES.core,
  },
  {
    id: "mobility",
    label: "Mobility",
    tagline: "Move freely. Recover faster. Stand taller.",
    image: IMAGES.mobility,
  },
  {
    id: "cardio",
    label: "Cardio",
    tagline: "Raise the engine. Keep the rhythm.",
    image: IMAGES.cardio,
  },
  {
    id: "recovery",
    label: "Recovery",
    tagline: "Breathe, release and reset between sessions.",
    image: IMAGES.recovery,
  },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/* ─────────────── Workouts (lessons) ─────────────── */

const LESSON_META: Record<
  string,
  { image: string; focus: CategoryId[]; intensity: 1 | 2 | 3 }
> = {
  f1: { image: IMAGES.home, focus: ["cardio", "strength"], intensity: 1 },
  f2: { image: IMAGES.mobility, focus: ["mobility"], intensity: 1 },
  f3: { image: IMAGES.core, focus: ["core"], intensity: 2 },
  f4: { image: IMAGES.lower, focus: ["strength"], intensity: 2 },
  p1: { image: IMAGES.power, focus: ["strength"], intensity: 2 },
  p2: { image: IMAGES.lower, focus: ["strength", "hiit"], intensity: 3 },
  p3: { image: IMAGES.hiit, focus: ["hiit", "cardio"], intensity: 3 },
  p4: { image: IMAGES.strength, focus: ["strength"], intensity: 2 },
  fl1: { image: IMAGES.mobility, focus: ["mobility"], intensity: 1 },
  fl2: { image: IMAGES.core, focus: ["core"], intensity: 2 },
  fl3: { image: IMAGES.recovery, focus: ["recovery", "mobility"], intensity: 1 },
  fl4: { image: IMAGES.hiit, focus: ["hiit", "strength"], intensity: 3 },
};

export function getLessonImage(lessonId: string): string {
  return LESSON_META[lessonId]?.image ?? IMAGES.strength;
}

export function getLessonFocus(lessonId: string): CategoryId[] {
  return LESSON_META[lessonId]?.focus ?? ["strength"];
}

export function getLessonIntensity(lessonId: string): 1 | 2 | 3 {
  return LESSON_META[lessonId]?.intensity ?? 2;
}

export const INTENSITY_LABELS = { 1: "Easy", 2: "Moderate", 3: "Intense" } as const;

export function getLessonsByCategory(id: CategoryId): Lesson[] {
  return getOrderedLessons().filter((l) => getLessonFocus(l.id).includes(id));
}

/* ─────────────── Programs ─────────────── */

export type ProgramStatus = "available" | "coming-soon";

export type Program = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  level: string;
  weeks: number;
  status: ProgramStatus;
  /** Unit id in content/lessons for available programs */
  unitId?: string;
  coach: string;
};

export const PROGRAMS: Program[] = [
  {
    id: "foundation",
    unitId: "foundation",
    title: "Foundation",
    tagline: "Learn the movements that everything else is built on.",
    description:
      "Four short sessions that teach squats, hinges, pushes and core control. The ideal starting point — no equipment, no guesswork.",
    image: IMAGES.home,
    level: "Beginner",
    weeks: 1,
    status: "available",
    coach: "Coach Maya",
  },
  {
    id: "power",
    unitId: "power",
    title: "Power Base",
    tagline: "Turn good form into real strength.",
    description:
      "Progressive push, leg and posterior-chain work with higher density intervals. Builds on Foundation and raises the ceiling.",
    image: IMAGES.power,
    level: "Intermediate",
    weeks: 2,
    status: "available",
    coach: "Coach James",
  },
  {
    id: "flow",
    unitId: "flow",
    title: "Flow & Core",
    tagline: "Mobility, control and a capstone to finish the path.",
    description:
      "Joint-friendly flows, deep core work and an evening wind-down — ending in the Path Capstone that tests everything you learned.",
    image: IMAGES.mobility,
    level: "All levels",
    weeks: 2,
    status: "available",
    coach: "Coach Priya",
  },
  {
    id: "run-5k",
    title: "Road to 5K",
    tagline: "A guided run-walk plan for your first 5K.",
    description:
      "Eight weeks of coached run-walk intervals, strength support and recovery days designed to get you across the line.",
    image: IMAGES.cardio,
    level: "Beginner",
    weeks: 8,
    status: "coming-soon",
    coach: "Coach Alex",
  },
  {
    id: "strength-8",
    title: "Strength 8",
    tagline: "Eight weeks of structured progressive overload.",
    description:
      "Dumbbell and kettlebell strength blocks with deloads, tracked loads and technique checkpoints.",
    image: IMAGES.strength,
    level: "Intermediate",
    weeks: 8,
    status: "coming-soon",
    coach: "Coach James",
  },
  {
    id: "reset-14",
    title: "Reset 14",
    tagline: "Fourteen days of mobility and recovery.",
    description:
      "Daily ten-minute mobility and breathwork sessions to undo desk hours and restore range of motion.",
    image: IMAGES.recovery,
    level: "All levels",
    weeks: 2,
    status: "coming-soon",
    coach: "Coach Priya",
  },
];

export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}

export function getProgramLessons(program: Program): Lesson[] {
  if (!program.unitId) return [];
  return getOrderedLessons().filter((l) => l.unitId === program.unitId);
}

export function getProgramForLesson(lessonId: string): Program | undefined {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  return PROGRAMS.find((p) => p.unitId === lesson.unitId);
}

export const AVAILABLE_PROGRAMS = PROGRAMS.filter(
  (p) => p.status === "available",
);

/* ─────────────── Courses (technique) ─────────────── */

export type Course = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  lessons: number;
  minutes: number;
  status: ProgramStatus;
  exerciseIds: string[];
};

export const COURSES: Course[] = [
  {
    id: "form-fundamentals",
    title: "Form Fundamentals",
    tagline: "Master the five movements behind every workout.",
    description:
      "Step-by-step technique guides for squats, push-ups, planks, glute bridges and lunges — with common mistakes and safety cues.",
    image: IMAGES.lower,
    lessons: 5,
    minutes: 25,
    status: "available",
    exerciseIds: [
      "bodyweight-squats",
      "push-ups",
      "plank",
      "glute-bridge",
      "lunges",
    ],
  },
  {
    id: "core-control",
    title: "Core Control",
    tagline: "Anti-extension, anti-rotation and breathing mechanics.",
    description:
      "A focused course on bracing, dead bugs, planks and breathing for a stable, pain-free trunk.",
    image: IMAGES.core,
    lessons: 3,
    minutes: 15,
    status: "available",
    exerciseIds: ["dead-bug", "plank", "mountain-climbers"],
  },
  {
    id: "breathwork",
    title: "Breathwork Basics",
    tagline: "Down-regulate, focus and recover with your breath.",
    description:
      "Box breathing, nasal breathing and recovery protocols you can use before sleep or between sets.",
    image: IMAGES.recovery,
    lessons: 6,
    minutes: 40,
    status: "coming-soon",
    exerciseIds: [],
  },
  {
    id: "kettlebell-101",
    title: "Kettlebell 101",
    tagline: "Swings, cleans and goblet squats — done right.",
    description:
      "Learn safe hinge mechanics and the essential kettlebell lifts, from grip to lockout.",
    image: IMAGES.power,
    lessons: 7,
    minutes: 55,
    status: "coming-soon",
    exerciseIds: [],
  },
];

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

/* ─────────────── Exercise & class imagery ─────────────── */

const EXERCISE_CATEGORY_IMAGE: Record<Exercise["category"], string> = {
  warmup: IMAGES.home,
  strength: IMAGES.lower,
  cardio: IMAGES.hiit,
  core: IMAGES.core,
  mobility: IMAGES.mobility,
  cooldown: IMAGES.recovery,
};

const EXERCISE_IMAGE_OVERRIDES: Record<string, string> = {
  "push-ups": IMAGES.power,
  "jumping-jacks": IMAGES.home,
  burpees: IMAGES.hiit,
  "mountain-climbers": IMAGES.cardio,
  "glute-bridge": IMAGES.strength,
};

export function getExerciseImage(exercise: Exercise): string {
  return (
    EXERCISE_IMAGE_OVERRIDES[exercise.id] ??
    EXERCISE_CATEGORY_IMAGE[exercise.category]
  );
}

export function exerciseMatchesCategory(
  exercise: Exercise,
  id: CategoryId,
): boolean {
  if (id === "recovery") return exercise.category === "cooldown" || exercise.category === "mobility";
  if (id === "hiit") return exercise.category === "cardio";
  return exercise.category === id;
}

export function getExercisesByCategoryId(id: CategoryId): Exercise[] {
  return EXERCISES.filter((e) => exerciseMatchesCategory(e, id));
}

const CLASS_IMAGE: Record<FitnessClass["category"], string> = {
  hiit: IMAGES.hiit,
  strength: IMAGES.power,
  yoga: IMAGES.mobility,
  cardio: IMAGES.cardio,
  mobility: IMAGES.recovery,
};

export function getClassImage(cls: FitnessClass): string {
  if (cls.id === "live-hiit-morning") return IMAGES.class;
  return CLASS_IMAGE[cls.category];
}

export function classMatchesCategory(cls: FitnessClass, id: CategoryId): boolean {
  if (id === "mobility") return cls.category === "yoga" || cls.category === "mobility";
  if (id === "recovery") return cls.category === "mobility" || cls.category === "yoga";
  if (id === "core") return cls.id === "replay-core-crusher";
  return cls.category === id;
}

export function getClassesByCategoryId(id: CategoryId): FitnessClass[] {
  return CLASSES.filter((c) => classMatchesCategory(c, id));
}

/* ─────────────── Search ─────────────── */

export type SearchResult = {
  id: string;
  kind: "Workout" | "Program" | "Tutorial" | "Class" | "Course";
  title: string;
  subtitle: string;
  href: string;
  image: string;
};

export function searchCatalog(raw: string): SearchResult[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const has = (...fields: string[]) =>
    fields.some((f) => f.toLowerCase().includes(q));

  const results: SearchResult[] = [];

  for (const l of getOrderedLessons()) {
    if (has(l.title, ...l.steps.map((s) => s.name), ...getLessonFocus(l.id))) {
      results.push({
        id: `w-${l.id}`,
        kind: "Workout",
        title: l.title,
        subtitle: `${l.minutes} min · ${l.steps.length} moves`,
        href: `/workouts/${l.id}`,
        image: getLessonImage(l.id),
      });
    }
  }
  for (const p of PROGRAMS) {
    if (has(p.title, p.tagline, p.level)) {
      results.push({
        id: `p-${p.id}`,
        kind: "Program",
        title: p.title,
        subtitle: p.status === "available" ? `${p.level} · ${p.weeks} wk` : "Coming soon",
        href: `/programs/${p.id}`,
        image: p.image,
      });
    }
  }
  for (const e of EXERCISES) {
    if (has(e.name, e.category, ...e.muscles)) {
      results.push({
        id: `e-${e.id}`,
        kind: "Tutorial",
        title: e.name,
        subtitle: e.muscles.slice(0, 3).join(" · "),
        href: `/learn/${e.id}`,
        image: getExerciseImage(e),
      });
    }
  }
  for (const c of CLASSES) {
    if (has(c.title, c.trainer, c.category, c.description)) {
      results.push({
        id: `c-${c.id}`,
        kind: "Class",
        title: c.title,
        subtitle: `${c.trainer} · ${c.duration} min`,
        href: `/classes/${c.id}`,
        image: getClassImage(c),
      });
    }
  }
  for (const c of COURSES) {
    if (has(c.title, c.tagline)) {
      results.push({
        id: `k-${c.id}`,
        kind: "Course",
        title: c.title,
        subtitle: c.status === "available" ? `${c.lessons} lessons` : "Coming soon",
        href: `/courses/${c.id}`,
        image: c.image,
      });
    }
  }

  return results;
}

export const SEARCH_SUGGESTIONS = [
  "Core",
  "Squats",
  "HIIT",
  "Mobility",
  "Push-ups",
  "Yoga",
];
