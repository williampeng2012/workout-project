import { getLesson, getOrderedLessons, type Lesson } from "@/content/lessons";
import { getExerciseByName } from "@/content/exercises";
import { todayKey } from "@/lib/gamification";
import { personalizeLesson, type FitnessLevel } from "@/lib/training";

export type DailyTaskType =
  | "warmup"
  | "workout"
  | "exercise"
  | "habit"
  | "cooldown";

export type DailyTask = {
  id: string;
  type: DailyTaskType;
  title: string;
  description: string;
  durationMinutes: number;
  lessonId?: string;
  exerciseId?: string;
  habitId?: string;
};

export type DailyPlan = {
  date: string;
  tasks: DailyTask[];
  totalMinutes: number;
};

export function generateDailyPlan(input: {
  currentLessonId: string | null;
  habits: { id: string; name: string }[];
  goal: "fat_loss" | "muscle" | "maintain" | null;
  fitnessLevel?: FitnessLevel | null;
}): DailyPlan {
  const date = todayKey();
  const tasks: DailyTask[] = [];

  tasks.push({
    id: `${date}-warmup`,
    type: "warmup",
    title: "Dynamic Warm-up",
    description: "Light movement to prepare your body",
    durationMinutes: 3,
    exerciseId: "jumping-jacks",
  });

  const lesson = input.currentLessonId
    ? getLesson(input.currentLessonId)
    : getOrderedLessons().find((l) => l) ?? null;

  if (lesson) {
    const sized = personalizeLesson(lesson, { goal: input.goal, level: input.fitnessLevel ?? null });
    tasks.push({
      id: `${date}-workout`,
      type: "workout",
      title: lesson.title,
      description: `Today's main workout · ${sized.minutes} min${sized.rounds > 1 ? ` · ${sized.rounds} rounds` : ""}`,
      durationMinutes: sized.minutes,
      lessonId: lesson.id,
    });
  }

  const focusExercise = pickFocusExercise(lesson);
  if (focusExercise) {
    tasks.push({
      id: `${date}-exercise`,
      type: "exercise",
      title: `Learn: ${focusExercise.name}`,
      description: "Review form and technique",
      durationMinutes: 5,
      exerciseId: focusExercise.id,
    });
  }

  const habit = input.habits[0];
  if (habit) {
    tasks.push({
      id: `${date}-habit`,
      type: "habit",
      title: habit.name,
      description: "Daily wellness habit",
      durationMinutes: 5,
      habitId: habit.id,
    });
  }

  tasks.push({
    id: `${date}-cooldown`,
    type: "cooldown",
    title: "Cool-down Stretch",
    description: "Gentle stretching to recover",
    durationMinutes: 3,
    exerciseId: "cat-cow",
  });

  return {
    date,
    tasks,
    totalMinutes: tasks.reduce((sum, t) => sum + t.durationMinutes, 0),
  };
}

function pickFocusExercise(lesson: Lesson | null | undefined) {
  if (!lesson || lesson.steps.length === 0) return null;
  const step = lesson.steps[0];
  return getExerciseByName(step.name) ?? null;
}

export function getTaskHref(task: DailyTask): string {
  if (task.lessonId) return `/lesson/${task.lessonId}?taskId=${task.id}`;
  if (task.exerciseId && (task.type === "warmup" || task.type === "cooldown")) {
    return `/workout/${task.exerciseId}?taskId=${task.id}`;
  }
  if (task.exerciseId) return `/learn/${task.exerciseId}`;
  if (task.habitId) return "/checkin";
  return "/plan";
}

export function getTaskActionLabel(task: DailyTask): string {
  switch (task.type) {
    case "workout":
      return "Start workout";
    case "warmup":
    case "cooldown":
      return "Start session";
    case "exercise":
      return "Open tutorial";
    case "habit":
      return "Check in";
  }
}

export function getTaskTypeLabel(type: DailyTaskType): string {
  const labels: Record<DailyTaskType, string> = {
    warmup: "Warm-up",
    workout: "Workout",
    exercise: "Tutorial",
    habit: "Habit",
    cooldown: "Cool-down",
  };
  return labels[type];
}

export function getWeeklyProgress(completedDates: string[]): {
  days: { label: string; date: string; completed: boolean }[];
  completedCount: number;
} {
  const today = new Date();
  const days: { label: string; date: string; completed: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2),
      date: key,
      completed: completedDates.includes(key),
    });
  }

  return {
    days,
    completedCount: days.filter((d) => d.completed).length,
  };
}
