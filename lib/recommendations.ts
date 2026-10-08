import {
  CATEGORIES,
  COURSES,
  IMAGES,
  PROGRAMS,
  getClassImage,
  getLessonFocus,
  getLessonImage,
  getProgramForLesson,
  type CategoryId,
} from "@/content/catalog";
import { formatClassTime, getUpcomingLiveClass } from "@/content/classes";
import { getLesson, getOrderedLessons, type Lesson } from "@/content/lessons";
import type { Slide } from "@/components/ui/carousel";
import type { PulseState } from "@/lib/store/pulse-store";

const GOAL_FOCUS: Record<NonNullable<PulseState["goal"]>, CategoryId[]> = {
  fat_loss: ["hiit", "cardio", "core"],
  muscle: ["strength", "core", "hiit"],
  maintain: ["mobility", "core", "strength"],
};

export function goalFocus(goal: PulseState["goal"]): CategoryId[] {
  return goal ? GOAL_FOCUS[goal] : ["strength", "mobility", "core"];
}

export function orderedCategories(goal: PulseState["goal"]) {
  const focus = goalFocus(goal);
  return [...CATEGORIES].sort((a, b) => {
    const ia = focus.indexOf(a.id);
    const ib = focus.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

/** Workouts that match the user's goal, prioritising ones not yet done. */
export function recommendedWorkouts(
  goal: PulseState["goal"],
  completed: Set<string>,
  limit = 6,
): Lesson[] {
  const focus = goalFocus(goal);
  const score = (l: Lesson) => {
    const f = getLessonFocus(l.id);
    const match = focus.findIndex((c) => f.includes(c));
    return (completed.has(l.id) ? 100 : 0) + (match === -1 ? 10 : match);
  };
  return [...getOrderedLessons()].sort((a, b) => score(a) - score(b)).slice(0, limit);
}

export function featuredSlides(input: {
  goal: PulseState["goal"];
  currentLessonId: string | null;
}): Slide[] {
  const slides: Slide[] = [];
  const current = input.currentLessonId ? getLesson(input.currentLessonId) : null;
  const program = current ? getProgramForLesson(current.id) : PROGRAMS[0];

  if (program) {
    slides.push({
      id: `program-${program.id}`,
      image: program.image,
      eyebrow: `Program · ${program.level}`,
      title: program.title,
      description: program.tagline,
      cta: { label: "Continue program", href: `/programs/${program.id}` },
      secondary: { label: "All programs", href: "/programs" },
    });
  }

  const live = getUpcomingLiveClass();
  if (live) {
    slides.push({
      id: `live-${live.id}`,
      image: getClassImage(live),
      eyebrow: `Live · ${formatClassTime(live.scheduledAt)}`,
      title: live.title,
      description: `${live.duration} minutes with ${live.trainer}. ${live.spotsLeft ?? 0} spots left.`,
      cta: { label: "View class", href: `/classes/${live.id}` },
      secondary: { label: "Schedule", href: "/classes" },
      live: true,
    });
  }

  const course = COURSES[0];
  slides.push({
    id: `course-${course.id}`,
    image: course.image,
    eyebrow: `Course · ${course.lessons} lessons`,
    title: course.title,
    description: course.tagline,
    cta: { label: "Start course", href: `/courses/${course.id}` },
  });

  const focus = goalFocus(input.goal)[0];
  const cat = CATEGORIES.find((c) => c.id === focus);
  if (cat) {
    slides.push({
      id: `cat-${cat.id}`,
      image: cat.image,
      eyebrow: "Picked for your goal",
      title: `${cat.label} sessions`,
      description: cat.tagline,
      cta: { label: `Explore ${cat.label}`, href: `/categories/${cat.id}` },
    });
  }

  const soon = PROGRAMS.find((p) => p.status === "coming-soon");
  if (soon) {
    slides.push({
      id: `soon-${soon.id}`,
      image: soon.image,
      eyebrow: "Coming soon",
      title: soon.title,
      description: soon.tagline,
      cta: { label: "Get notified", href: `/programs/${soon.id}` },
    });
  }

  return slides;
}

export function workoutImage(lessonId: string | null | undefined): string {
  return lessonId ? getLessonImage(lessonId) : IMAGES.strength;
}
