import { getLessonIntensity } from "@/content/catalog";
import { getLesson } from "@/content/lessons";
import { todayKey } from "@/lib/gamification";
import type { BodyProfile, FoodEntry, MealType, PulseState } from "@/lib/store/pulse-store";

/** Used for burn estimates until the user adds their weight. */
export const REFERENCE_WEIGHT_KG = 70;

export const MEALS: { id: MealType; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snacks" },
];

/** Compendium-of-Physical-Activities style MET values. */
const MET = {
  lesson: { 1: 3.8, 2: 5.0, 3: 8.0 } as Record<1 | 2 | 3, number>,
  warmup: 4.0,
  cooldown: 2.3,
  technique: 2.8,
  walk: 3.5,
};

/** Fixed-duration plan tasks, keyed by the suffix of their `${day}-<type>` id. */
const PLAN_TASKS: Record<string, { label: string; minutes: number; met: number }> = {
  warmup: { label: "Dynamic warm-up", minutes: 3, met: MET.warmup },
  exercise: { label: "Technique practice", minutes: 5, met: MET.technique },
  cooldown: { label: "Cool-down stretch", minutes: 3, met: MET.cooldown },
};

export function kcalFor(met: number, minutes: number, weightKg: number): number {
  return Math.round(((met * 3.5 * weightKg) / 200) * minutes);
}

export type BurnItem = { id: string; label: string; detail: string; minutes: number; kcal: number };

export function burnedOn(state: PulseState, day: string): { total: number; items: BurnItem[]; weightKnown: boolean } {
  const weight = state.body?.weightKg ?? REFERENCE_WEIGHT_KG;
  const items: BurnItem[] = [];

  for (const [lessonId, iso] of Object.entries(state.lessonProgress)) {
    if (todayKey(new Date(iso)) !== day) continue;
    const lesson = getLesson(lessonId);
    if (!lesson) continue;
    const intensity = getLessonIntensity(lessonId);
    items.push({
      id: `lesson-${lessonId}`,
      label: lesson.title,
      detail: "Workout",
      minutes: lesson.minutes,
      kcal: kcalFor(MET.lesson[intensity], lesson.minutes, weight),
    });
  }

  for (const taskId of Object.keys(state.dailyTasksCompleted)) {
    if (!taskId.startsWith(`${day}-`)) continue;
    const task = PLAN_TASKS[taskId.slice(day.length + 1)];
    if (!task) continue;
    items.push({
      id: taskId,
      label: task.label,
      detail: "Daily plan",
      minutes: task.minutes,
      kcal: kcalFor(task.met, task.minutes, weight),
    });
  }

  for (const habit of state.habits) {
    const walk = /walk\s+(\d{1,3})\s*min/i.exec(habit.name);
    if (!walk || !(state.habitLogs[habit.id] ?? []).includes(day)) continue;
    const minutes = Number(walk[1]);
    items.push({
      id: `habit-${habit.id}`,
      label: habit.name,
      detail: "Habit",
      minutes,
      kcal: kcalFor(MET.walk, minutes, weight),
    });
  }

  return { total: items.reduce((s, i) => s + i.kcal, 0), items, weightKnown: !!state.body };
}

export function foodsOn(state: PulseState, day: string): FoodEntry[] {
  return state.foodLogs[day] ?? [];
}

export function eatenOn(state: PulseState, day: string): number {
  return foodsOn(state, day).reduce((s, f) => s + f.kcal, 0);
}

/** Mifflin–St Jeor resting energy expenditure. */
export function bmr(body: BodyProfile): number {
  const base = 10 * body.weightKg + 6.25 * body.heightCm - 5 * body.age;
  return Math.round(body.sex === "male" ? base + 5 : base - 161);
}

export function activityFactor(trainingDays: number | null): number {
  const d = trainingDays ?? 3;
  if (d <= 1) return 1.2;
  if (d <= 3) return 1.375;
  if (d <= 5) return 1.55;
  return 1.725;
}

const GOAL_DEFAULTS = { fat_loss: 1800, muscle: 2500, maintain: 2100 } as const;

export type CalorieTarget = {
  kcal: number;
  source: "custom" | "calculated" | "default";
  maintenance?: number;
  bmr?: number;
};

export function calculatedTarget(
  body: BodyProfile,
  goal: PulseState["goal"],
  trainingDays: number | null,
): Required<Omit<CalorieTarget, "source">> {
  const rest = bmr(body);
  const maintenance = Math.round(rest * activityFactor(trainingDays));
  const adjusted =
    goal === "fat_loss"
      ? maintenance - Math.min(500, Math.round(maintenance * 0.18))
      : goal === "muscle"
        ? maintenance + 250
        : maintenance;
  const floor = body.sex === "male" ? 1500 : 1200;
  return { kcal: Math.max(floor, Math.round(adjusted / 10) * 10), maintenance, bmr: rest };
}

export function dailyTarget(state: PulseState): CalorieTarget {
  if (state.calorieTargetOverride) return { kcal: state.calorieTargetOverride, source: "custom" };
  if (state.body) return { ...calculatedTarget(state.body, state.goal, state.trainingDays), source: "calculated" };
  return { kcal: GOAL_DEFAULTS[state.goal ?? "maintain"], source: "default" };
}

export function goalAdjustmentLabel(goal: PulseState["goal"]): string {
  if (goal === "fat_loss") return "a moderate deficit for fat loss";
  if (goal === "muscle") return "a small surplus for muscle gain";
  return "maintenance";
}

/** Approximate values for quick logging. */
export const FOOD_PRESETS: { name: string; kcal: number; meal: MealType }[] = [
  { name: "Oatmeal, 1 cup cooked", kcal: 160, meal: "breakfast" },
  { name: "2 eggs, scrambled", kcal: 180, meal: "breakfast" },
  { name: "Greek yogurt, 170 g", kcal: 100, meal: "breakfast" },
  { name: "Toast with butter", kcal: 140, meal: "breakfast" },
  { name: "Latte, 350 ml", kcal: 190, meal: "breakfast" },
  { name: "Chicken breast, 150 g", kcal: 250, meal: "lunch" },
  { name: "White rice, 1 cup", kcal: 205, meal: "lunch" },
  { name: "Salad with dressing", kcal: 250, meal: "lunch" },
  { name: "Salmon fillet, 150 g", kcal: 310, meal: "dinner" },
  { name: "Pasta, 1 cup cooked", kcal: 220, meal: "dinner" },
  { name: "Pizza, 1 slice", kcal: 285, meal: "dinner" },
  { name: "Banana", kcal: 105, meal: "snack" },
  { name: "Apple", kcal: 95, meal: "snack" },
  { name: "Almonds, 28 g", kcal: 165, meal: "snack" },
  { name: "Protein shake", kcal: 130, meal: "snack" },
  { name: "Avocado, half", kcal: 120, meal: "snack" },
];

export function mealForNow(date = new Date()): MealType {
  const h = date.getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h >= 17 && h < 22) return "dinner";
  return "snack";
}

export function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return todayKey(new Date(y, m - 1, d + delta));
}

export function dayLabel(day: string, today = todayKey()): string {
  if (day === today) return "Today";
  if (day === shiftDay(today, -1)) return "Yesterday";
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export const LB_PER_KG = 2.20462;
export const CM_PER_IN = 2.54;
