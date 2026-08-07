export type StepType = "rep" | "timer";

export type LessonStep = {
  id: string;
  name: string;
  type: StepType;
  /** reps count or seconds */
  value: number;
  restSeconds: number;
};

export type Lesson = {
  id: string;
  unitId: string;
  title: string;
  minutes: number;
  xp: number;
  steps: LessonStep[];
};

export type Unit = {
  id: string;
  title: string;
  order: number;
};

export const UNITS: Unit[] = [
  { id: "foundation", title: "Foundation", order: 1 },
  { id: "power", title: "Power Base", order: 2 },
  { id: "flow", title: "Flow & Core", order: 3 },
];

function steps(
  items: Array<[string, StepType, number, number?]>,
): LessonStep[] {
  return items.map(([name, type, value, restSeconds = 15], i) => ({
    id: `s${i + 1}`,
    name,
    type,
    value,
    restSeconds,
  }));
}

export const LESSONS: Lesson[] = [
  {
    id: "f1",
    unitId: "foundation",
    title: "Wake Up Body",
    minutes: 6,
    xp: 20,
    steps: steps([
      ["Jumping Jacks", "timer", 30],
      ["Bodyweight Squats", "rep", 12],
      ["Push-up Hold", "timer", 20],
      ["Glute Bridge", "rep", 12],
      ["Standing March", "timer", 30, 0],
    ]),
  },
  {
    id: "f2",
    unitId: "foundation",
    title: "Desk Reset",
    minutes: 5,
    xp: 20,
    steps: steps([
      ["Neck Circles", "timer", 20],
      ["Shoulder Rolls", "rep", 10],
      ["Wall Push-ups", "rep", 10],
      ["Hip Opener Stretch", "timer", 30],
      ["Calf Raises", "rep", 15, 0],
    ]),
  },
  {
    id: "f3",
    unitId: "foundation",
    title: "Core Ignite",
    minutes: 7,
    xp: 20,
    steps: steps([
      ["Dead Bug", "rep", 10],
      ["Plank", "timer", 30],
      ["Bird Dog", "rep", 10],
      ["Side Plank L", "timer", 20],
      ["Side Plank R", "timer", 20],
      ["Hollow Hold", "timer", 20, 0],
    ]),
  },
  {
    id: "f4",
    unitId: "foundation",
    title: "Lower Body Primer",
    minutes: 8,
    xp: 20,
    steps: steps([
      ["Squat to Stand", "rep", 10],
      ["Reverse Lunges", "rep", 12],
      ["Sumo Squat Pulse", "timer", 30],
      ["Single-leg Balance L", "timer", 20],
      ["Single-leg Balance R", "timer", 20],
      ["Good Mornings", "rep", 12, 0],
    ]),
  },
  {
    id: "p1",
    unitId: "power",
    title: "Push Power",
    minutes: 8,
    xp: 20,
    steps: steps([
      ["Push-ups", "rep", 10],
      ["Pike Push-ups", "rep", 8],
      ["Tricep Dips (chair)", "rep", 10],
      ["Plank Shoulder Tap", "rep", 16],
      ["Superman Hold", "timer", 25, 0],
    ]),
  },
  {
    id: "p2",
    unitId: "power",
    title: "Leg Drive",
    minutes: 9,
    xp: 20,
    steps: steps([
      ["Jump Squats", "rep", 10],
      ["Walking Lunges", "rep", 16],
      ["Wall Sit", "timer", 35],
      ["Lateral Lunges", "rep", 12],
      ["Calf Raise Burn", "timer", 30, 0],
    ]),
  },
  {
    id: "p3",
    unitId: "power",
    title: "Full Body Blast",
    minutes: 10,
    xp: 20,
    steps: steps([
      ["Burpees", "rep", 8],
      ["Mountain Climbers", "timer", 30],
      ["Squat Thrusters", "rep", 12],
      ["High Knees", "timer", 30],
      ["Push-up to Down Dog", "rep", 8],
      ["Plank", "timer", 40, 0],
    ]),
  },
  {
    id: "p4",
    unitId: "power",
    title: "Posterior Chain",
    minutes: 8,
    xp: 20,
    steps: steps([
      ["Hip Hinge", "rep", 12],
      ["Single-leg RDL L", "rep", 8],
      ["Single-leg RDL R", "rep", 8],
      ["Glute Bridge March", "rep", 16],
      ["Prone Y Raise", "rep", 12, 0],
    ]),
  },
  {
    id: "fl1",
    unitId: "flow",
    title: "Mobility Flow",
    minutes: 7,
    xp: 20,
    steps: steps([
      ["World's Greatest Stretch", "timer", 40],
      ["Cat-Cow", "rep", 10],
      ["Thoracic Rotation", "rep", 10],
      ["Deep Squat Hold", "timer", 40],
      ["Forward Fold", "timer", 30, 0],
    ]),
  },
  {
    id: "fl2",
    unitId: "flow",
    title: "Core Flow",
    minutes: 8,
    xp: 20,
    steps: steps([
      ["Dead Bug Slow", "rep", 12],
      ["Copenhagen Prep", "timer", 20],
      ["Hollow Rock", "rep", 10],
      ["Side Plank Reach", "rep", 12],
      ["Bear Crawl Hold", "timer", 30, 0],
    ]),
  },
  {
    id: "fl3",
    unitId: "flow",
    title: "Evening Wind-down",
    minutes: 6,
    xp: 20,
    steps: steps([
      ["Child's Pose", "timer", 40],
      ["Figure-4 Stretch L", "timer", 30],
      ["Figure-4 Stretch R", "timer", 30],
      ["Supine Twist", "timer", 40],
      ["Box Breathing", "timer", 45, 0],
    ]),
  },
  {
    id: "fl4",
    unitId: "flow",
    title: "Path Capstone",
    minutes: 10,
    xp: 20,
    steps: steps([
      ["Jumping Jacks", "timer", 40],
      ["Push-ups", "rep", 12],
      ["Squats", "rep", 15],
      ["Plank", "timer", 45],
      ["Lunges", "rep", 16],
      ["Burpees", "rep", 8],
      ["Cool-down Stretch", "timer", 40, 0],
    ]),
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getOrderedLessons(): Lesson[] {
  const unitOrder = new Map(UNITS.map((u) => [u.id, u.order]));
  return [...LESSONS].sort((a, b) => {
    const u = (unitOrder.get(a.unitId) ?? 0) - (unitOrder.get(b.unitId) ?? 0);
    if (u !== 0) return u;
    return LESSONS.indexOf(a) - LESSONS.indexOf(b);
  });
}

export function getUnitTitle(unitId: string): string {
  return UNITS.find((u) => u.id === unitId)?.title ?? unitId;
}
