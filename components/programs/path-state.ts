import { getCategory, getLessonFocus } from "@/content/catalog";
import { getOrderedLessons, type Lesson, type LessonStep } from "@/content/lessons";

export type NodeState = "done" | "current" | "locked" | "open";

/** Position of a lesson on the path relative to the user's current lesson. */
export function getLessonState(
  lessonId: string,
  completed: Set<string>,
  currentLessonId: string | null,
  order: Lesson[] = getOrderedLessons(),
): NodeState {
  if (completed.has(lessonId)) return "done";
  if (lessonId === currentLessonId) return "current";
  if (!currentLessonId) return "open";
  const idx = order.findIndex((l) => l.id === lessonId);
  const cur = order.findIndex((l) => l.id === currentLessonId);
  return idx > cur ? "locked" : "open";
}

export function nextIncomplete(lessons: Lesson[], completed: Set<string>): Lesson | null {
  return lessons.find((l) => !completed.has(l.id)) ?? null;
}

export function stepAmount(step: LessonStep): string {
  return step.type === "timer" ? `${step.value} sec` : `${step.value} reps`;
}

export function lessonMeta(lesson: Lesson): string {
  return `${lesson.minutes} min · ${lesson.steps.length} moves`;
}

export function focusLabels(lessonId: string): string[] {
  return getLessonFocus(lessonId).map((f) => getCategory(f)?.label ?? f);
}

/** Props noted in move names, e.g. "Tricep Dips (chair)". */
export function lessonEquipment(lesson: Lesson): string[] {
  const found = new Set<string>();
  for (const s of lesson.steps) {
    const m = s.name.match(/\(([^)]+)\)/);
    if (m) found.add(m[1].charAt(0).toUpperCase() + m[1].slice(1));
  }
  return [...found];
}
