"use client";

import { useMemo } from "react";
import { getLesson } from "@/content/lessons";
import { generateDailyPlan, getTaskHref, getWeeklyProgress } from "@/lib/daily-plan";
import { usePulse } from "@/lib/store/pulse-store";

export function useToday() {
  const pulse = usePulse();
  const { state, currentLessonId, isDailyTaskDone } = pulse;

  const plan = useMemo(
    () =>
      generateDailyPlan({
        currentLessonId,
        habits: state.habits,
        goal: state.goal,
        fitnessLevel: state.fitnessLevel,
      }),
    [currentLessonId, state.habits, state.goal, state.fitnessLevel],
  );

  const weekly = useMemo(
    () => getWeeklyProgress(state.trainingDaysCompleted),
    [state.trainingDaysCompleted],
  );

  const completed = plan.tasks.filter((t) => isDailyTaskDone(t.id)).length;
  const nextTask = plan.tasks.find((t) => !isDailyTaskDone(t.id)) ?? null;
  const progress = plan.tasks.length ? Math.round((completed / plan.tasks.length) * 100) : 0;
  const allDone = plan.tasks.length > 0 && completed === plan.tasks.length;
  const workoutTask = plan.tasks.find((t) => t.type === "workout") ?? null;
  const workout = workoutTask?.lessonId ? getLesson(workoutTask.lessonId) ?? null : null;
  const primaryHref = nextTask ? getTaskHref(nextTask) : "/plan";

  return {
    ...pulse,
    plan,
    weekly,
    completed,
    nextTask,
    progress,
    allDone,
    workout,
    workoutTask,
    primaryHref,
  };
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "Late session";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function todayLabel(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
