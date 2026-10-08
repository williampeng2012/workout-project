"use client";

import { getLesson } from "@/content/lessons";
import { XP } from "@/lib/gamification";
import type { PulseState } from "@/lib/store/pulse-store";
import { insertActivities, upsertStats, type ActivityInsert } from "./api";

/** What this device last reported, so each completion is posted to the feed once. */
type Snapshot = { xp: number; streak: number; lessons: string[]; tasks: string[] };

const snapshotKey = (uid: string) => `pulsepath-social:${uid}`;

const TASK_TITLES: Record<string, string> = {
  warmup: "Dynamic Warm-up",
  exercise: "Technique practice",
  cooldown: "Cool-down Stretch",
  workout: "Daily workout",
};

function readSnapshot(uid: string): Snapshot | null {
  try {
    const raw = localStorage.getItem(snapshotKey(uid));
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}

function takeSnapshot(state: PulseState): Snapshot {
  return {
    xp: state.xp,
    streak: state.streakCount,
    lessons: Object.keys(state.lessonProgress),
    tasks: Object.keys(state.dailyTasksCompleted),
  };
}

function diff(prev: Snapshot, state: PulseState): ActivityInsert[] {
  const seenLessons = new Set(prev.lessons);
  const seenTasks = new Set(prev.tasks);
  const events: ActivityInsert[] = [];

  const newLessons = Object.keys(state.lessonProgress).filter((id) => !seenLessons.has(id));
  for (const id of newLessons) {
    events.push({ kind: "lesson", title: getLesson(id)?.title ?? "a lesson", xp: XP.LESSON_COMPLETE });
  }

  for (const id of Object.keys(state.dailyTasksCompleted)) {
    if (seenTasks.has(id)) continue;
    const type = id.slice(id.lastIndexOf("-") + 1);
    // Finishing a lesson also ticks the day's workout task; don't post it twice.
    if (type === "workout" && newLessons.length > 0) continue;
    const title = TASK_TITLES[type];
    if (title) events.push({ kind: "workout", title, xp: 0 });
  }

  if (state.streakCount > prev.streak && state.streakCount > 1) {
    events.push({ kind: "streak", title: `${state.streakCount}-day streak`, xp: 0 });
  }

  const accounted = events.reduce((sum, e) => sum + e.xp, 0);
  const rest = state.xp - prev.xp - accounted;
  if (rest > 0) events.push({ kind: "xp", title: null, xp: rest });

  return events;
}

let queue: Promise<void> = Promise.resolve();

/**
 * Push local progress to Supabase: profile stats for the leaderboard, plus one
 * activity per new completion. The first sync on a device only records a baseline.
 */
export function syncSocial(
  user: { id: string; name: string },
  state: PulseState,
  level: number,
): Promise<void> {
  const uid = user.id;
  queue = queue
    .then(async () => {
      await upsertStats(uid, {
        displayName: state.displayName.trim() || user.name,
        xp: state.xp,
        level,
        streakCount: state.streakCount,
        streakUpdatedOn: state.streakUpdatedOn,
      });

      const prev = readSnapshot(uid);
      // A lower XP total means progress was reset; start a fresh baseline.
      if (prev && state.xp >= prev.xp) {
        await insertActivities(uid, diff(prev, state));
      }
      localStorage.setItem(snapshotKey(uid), JSON.stringify(takeSnapshot(state)));
    })
    .catch(() => {
      // Offline or the friends migration isn't applied yet; retry on the next change.
    });
  return queue;
}
