import { COURSES, PROGRAMS } from "@/content/catalog";
import { getClass } from "@/content/classes";
import { getExercise } from "@/content/exercises";
import { getLesson, getOrderedLessons } from "@/content/lessons";
import { XP, levelFromXp, todayKey } from "@/lib/gamification";
import type { PulseState } from "@/lib/store/pulse-store";
import { PRO_NOTIFY_ID } from "./meta";

export type DayActivity = {
  date: string;
  label: string;
  lessons: number;
  habits: number;
  tasks: number;
  minutes: number;
  goalMet: boolean;
  total: number;
  future: boolean;
};

function lessonDay(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso.slice(0, 10) : todayKey(d);
}

/** Everything the user actually logged, bucketed by local calendar day. */
export function buildActivityIndex(state: PulseState) {
  const lessons = new Map<string, { count: number; minutes: number }>();
  for (const [id, iso] of Object.entries(state.lessonProgress)) {
    const key = lessonDay(iso);
    const cur = lessons.get(key) ?? { count: 0, minutes: 0 };
    cur.count += 1;
    cur.minutes += getLesson(id)?.minutes ?? 0;
    lessons.set(key, cur);
  }

  const habits = new Map<string, number>();
  for (const dates of Object.values(state.habitLogs)) {
    for (const d of dates) habits.set(d, (habits.get(d) ?? 0) + 1);
  }

  const tasks = new Map<string, number>();
  for (const id of Object.keys(state.dailyTasksCompleted)) {
    const key = id.slice(0, 10);
    tasks.set(key, (tasks.get(key) ?? 0) + 1);
  }

  const goal = new Set(state.trainingDaysCompleted);

  return (date: Date, today = todayKey()): DayActivity => {
    const key = todayKey(date);
    const l = lessons.get(key);
    const h = habits.get(key) ?? 0;
    const t = tasks.get(key) ?? 0;
    return {
      date: key,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      lessons: l?.count ?? 0,
      habits: h,
      tasks: t,
      minutes: l?.minutes ?? 0,
      goalMet: goal.has(key),
      total: (l?.count ?? 0) + h + t,
      future: key > today,
    };
  };
}

export function lastNDays(state: PulseState, n: number): DayActivity[] {
  const at = buildActivityIndex(state);
  const out: DayActivity[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(at(d));
  }
  return out;
}

/** Monday-start weeks ending with the current week. */
export function calendarWeeks(state: PulseState, weeks: number): DayActivity[][] {
  const at = buildActivityIndex(state);
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - mondayOffset - (weeks - 1) * 7);
  const rows: DayActivity[][] = [];
  for (let w = 0; w < weeks; w++) {
    const row: DayActivity[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      row.push(at(day));
    }
    rows.push(row);
  }
  return rows;
}

export function bestStreak(state: PulseState): number {
  const days = [...new Set(state.trainingDaysCompleted)].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of days) {
    const [y, m, d] = key.split("-").map(Number);
    const cur = new Date(y, m - 1, d);
    if (prev) {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 1);
      run = todayKey(next) === key ? run + 1 : 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = cur;
  }
  return Math.max(best, state.streakCount);
}

export function totalHabitChecks(state: PulseState): number {
  return Object.values(state.habitLogs).reduce((sum, d) => sum + d.length, 0);
}

export type Achievement = {
  id: string;
  title: string;
  requirement: string;
  value: number;
  target: number;
  unit: string;
  earned: boolean;
};

export function buildAchievements(state: PulseState): Achievement[] {
  const lessons = Object.keys(state.lessonProgress).length;
  const totalLessons = getOrderedLessons().length;
  const streak = bestStreak(state);
  const habits = totalHabitChecks(state);
  const tasksPerDay = new Map<string, number>();
  for (const id of Object.keys(state.dailyTasksCompleted)) {
    const k = id.slice(0, 10);
    tasksPerDay.set(k, (tasksPerDay.get(k) ?? 0) + 1);
  }
  const bestPlanDay = Math.max(0, ...tasksPerDay.values());
  const level = levelFromXp(state.xp);

  const list: Array<Omit<Achievement, "earned">> = [
    { id: "first-workout", title: "First step", requirement: "Complete your first workout", value: lessons, target: 1, unit: "workout" },
    { id: "five-workouts", title: "On a roll", requirement: "Complete 5 workouts", value: lessons, target: 5, unit: "workouts" },
    { id: "streak-3", title: "Three straight", requirement: "Hit your daily goal 3 days in a row", value: streak, target: 3, unit: "days" },
    { id: "streak-7", title: "Week warrior", requirement: "Hit your daily goal 7 days in a row", value: streak, target: 7, unit: "days" },
    { id: "hour", title: "Hour of power", requirement: "Log 60 minutes of training", value: state.totalWorkoutMinutes, target: 60, unit: "min" },
    { id: "habits-10", title: "Habit former", requirement: "Check in 10 habits", value: habits, target: 10, unit: "check-ins" },
    { id: "plan-day", title: "Plan crusher", requirement: "Finish 5 plan tasks in one day", value: bestPlanDay, target: 5, unit: "tasks" },
    { id: "level-5", title: "Level five", requirement: `Earn ${4 * XP.LEVEL_EVERY} XP`, value: level, target: 5, unit: "level" },
    { id: "path", title: "Path complete", requirement: `Finish all ${totalLessons} path workouts`, value: lessons, target: totalLessons, unit: "workouts" },
  ];

  return list.map((a) => ({ ...a, value: Math.min(a.value, a.target), earned: a.value >= a.target }));
}

export type NotifyItem = { id: string; kind: string; title: string; href: string };

/** Map a stored notify-me id to something we can name and link to. */
export function resolveNotifyItem(id: string): NotifyItem {
  if (id === PRO_NOTIFY_ID) {
    return { id, kind: "Membership", title: "Pulsepath Pro", href: "/settings/subscription" };
  }
  if (id === "feature-calorie-scan") {
    return { id, kind: "Feature", title: "Meal photo scanning", href: "/calories" };
  }
  if (id.startsWith("video-")) {
    const exercise = getExercise(id.slice("video-".length));
    if (exercise) {
      return { id, kind: "Technique video", title: exercise.name, href: `/learn/${exercise.id}` };
    }
  }
  const bare = id.replace(/^(program|course|class)[-:/]/, "");
  const program = PROGRAMS.find((p) => p.id === bare);
  if (program) return { id, kind: "Program", title: program.title, href: `/programs/${program.id}` };
  const course = COURSES.find((c) => c.id === bare);
  if (course) return { id, kind: "Course", title: course.title, href: `/courses/${course.id}` };
  const cls = getClass(bare);
  if (cls) return { id, kind: "Class", title: cls.title, href: `/classes/${cls.id}` };
  const title = bare.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { id, kind: "Coming soon", title, href: "/discover" };
}
