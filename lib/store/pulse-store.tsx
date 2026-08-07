"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getOrderedLessons } from "@/content/lessons";
import {
  applyDailyGoalComplete,
  daysUntilNextStreakBonus,
  isDailyGoalMet,
  levelFromXp,
  todayKey,
  XP,
} from "@/lib/gamification";

const STORAGE_KEY = "pulsepath-v1";

export type LocalHabit = {
  id: string;
  name: string;
  sortOrder: number;
};

export type PulseState = {
  xp: number;
  streakCount: number;
  streakUpdatedOn: string | null;
  streakRewardsClaimed: number[];
  goal: "fat_loss" | "muscle" | "maintain" | null;
  trainingDays: number | null;
  onboardingDone: boolean;
  habits: LocalHabit[];
  habitLogs: Record<string, string[]>;
  lessonProgress: Record<string, string>;
  dailyGoalApplied: string[];
};

const DEFAULT_HABITS: LocalHabit[] = [
  { id: "h-water", name: "Drink water", sortOrder: 0 },
  { id: "h-stretch", name: "Stretch 5 min", sortOrder: 1 },
  { id: "h-walk", name: "Walk 10 min", sortOrder: 2 },
];

export const defaultState = (): PulseState => ({
  xp: 0,
  streakCount: 0,
  streakUpdatedOn: null,
  streakRewardsClaimed: [],
  goal: null,
  trainingDays: null,
  onboardingDone: false,
  habits: DEFAULT_HABITS,
  habitLogs: {},
  lessonProgress: {},
  dailyGoalApplied: [],
});

function loadState(): PulseState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) } as PulseState;
  } catch {
    return defaultState();
  }
}

function saveState(state: PulseState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function countHabitsToday(state: PulseState, day: string): number {
  return state.habits.filter((h) =>
    (state.habitLogs[h.id] ?? []).includes(day),
  ).length;
}

function countLessonsToday(state: PulseState, day: string): number {
  return Object.values(state.lessonProgress).filter((iso) =>
    iso.startsWith(day),
  ).length;
}

function habitXpEarnedToday(state: PulseState, day: string): number {
  let checks = 0;
  for (const dates of Object.values(state.habitLogs)) {
    checks += dates.filter((d) => d === day).length;
  }
  return Math.min(checks * XP.HABIT_CHECKIN, XP.HABIT_DAILY_CAP);
}

type DailyGoalMeta = {
  bonusXp: number;
  claimedMilestone: number | null;
};

function maybeApplyDailyGoal(state: PulseState): {
  state: PulseState;
  meta: DailyGoalMeta;
} {
  const day = todayKey();
  if (state.dailyGoalApplied.includes(day)) {
    return { state, meta: { bonusXp: 0, claimedMilestone: null } };
  }

  const met = isDailyGoalMet({
    lessonsCompletedToday: countLessonsToday(state, day),
    habitsCheckedToday: countHabitsToday(state, day),
  });
  if (!met) {
    return { state, meta: { bonusXp: 0, claimedMilestone: null } };
  }

  const streak = applyDailyGoalComplete({
    streakCount: state.streakCount,
    streakUpdatedOn: state.streakUpdatedOn,
    streakRewardsClaimed: state.streakRewardsClaimed,
  });

  const claimedMilestone =
    streak.streakRewardsClaimed.find(
      (d) => !state.streakRewardsClaimed.includes(d),
    ) ?? null;

  return {
    state: {
      ...state,
      xp: state.xp + streak.bonusXp,
      streakCount: streak.streakCount,
      streakUpdatedOn: streak.streakUpdatedOn,
      streakRewardsClaimed: streak.streakRewardsClaimed,
      dailyGoalApplied: [...state.dailyGoalApplied, day],
    },
    meta: { bonusXp: streak.bonusXp, claimedMilestone },
  };
}

export type CompleteLessonResult = {
  xpEarned: number;
  bonusXp: number;
  claimedMilestone: number | null;
  alreadyDone: boolean;
};

type PulseStore = {
  hydrated: boolean;
  state: PulseState;
  level: number;
  completedLessonIds: Set<string>;
  currentLessonId: string | null;
  lessonsCompletedToday: number;
  habitsCheckedToday: number;
  dailyGoalMet: boolean;
  nextStreakBonus: { daysLeft: number; rewardXp: number } | null;
  completeOnboarding: (input: {
    goal: PulseState["goal"];
    trainingDays: number;
    habitNames: string[];
  }) => void;
  toggleHabitToday: (habitId: string) => { xpDelta: number; checked: boolean };
  completeLesson: (lessonId: string) => CompleteLessonResult;
  resetDemo: () => void;
};

const PulseContext = createContext<PulseStore | null>(null);

export function PulseProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PulseState>(defaultState);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  const completeOnboarding = useCallback(
    (input: {
      goal: PulseState["goal"];
      trainingDays: number;
      habitNames: string[];
    }) => {
      setState((prev) => ({
        ...prev,
        goal: input.goal,
        trainingDays: input.trainingDays,
        onboardingDone: true,
        habits: input.habitNames.map((name, i) => ({
          id: `h-${i}-${name.toLowerCase().replace(/\s+/g, "-")}`,
          name,
          sortOrder: i,
        })),
        habitLogs: {},
      }));
    },
    [],
  );

  const toggleHabitToday = useCallback(
    (habitId: string): { xpDelta: number; checked: boolean } => {
      const day = todayKey();
      const prev = state;
      const logs = { ...prev.habitLogs };
      const list = [...(logs[habitId] ?? [])];
      const idx = list.indexOf(day);

      if (idx >= 0) {
        list.splice(idx, 1);
        logs[habitId] = list;
        const next = { ...prev, habitLogs: logs };
        setState(next);
        return { xpDelta: 0, checked: false };
      }

      const earned = habitXpEarnedToday(prev, day);
      const xpDelta = earned < XP.HABIT_DAILY_CAP ? XP.HABIT_CHECKIN : 0;
      list.push(day);
      logs[habitId] = list;
      const withXp = { ...prev, habitLogs: logs, xp: prev.xp + xpDelta };
      const { state: next } = maybeApplyDailyGoal(withXp);
      setState(next);
      return { xpDelta, checked: true };
    },
    [state],
  );

  const completeLesson = useCallback(
    (lessonId: string): CompleteLessonResult => {
      const prev = state;
      if (prev.lessonProgress[lessonId]) {
        return {
          xpEarned: 0,
          bonusXp: 0,
          claimedMilestone: null,
          alreadyDone: true,
        };
      }

      const xpEarned = XP.LESSON_COMPLETE;
      const withLesson: PulseState = {
        ...prev,
        xp: prev.xp + xpEarned,
        lessonProgress: {
          ...prev.lessonProgress,
          [lessonId]: new Date().toISOString(),
        },
      };
      const { state: next, meta } = maybeApplyDailyGoal(withLesson);
      setState(next);
      return {
        xpEarned,
        bonusXp: meta.bonusXp,
        claimedMilestone: meta.claimedMilestone,
        alreadyDone: false,
      };
    },
    [state],
  );

  const resetDemo = useCallback(() => {
    const fresh = defaultState();
    setState(fresh);
    saveState(fresh);
  }, []);

  const day = todayKey();
  const completedLessonIds = useMemo(
    () => new Set(Object.keys(state.lessonProgress)),
    [state.lessonProgress],
  );

  const ordered = getOrderedLessons();
  const currentLessonId =
    ordered.find((l) => !completedLessonIds.has(l.id))?.id ?? null;

  const lessonsCompletedToday = countLessonsToday(state, day);
  const habitsCheckedToday = countHabitsToday(state, day);
  const dailyGoalMet =
    state.dailyGoalApplied.includes(day) ||
    isDailyGoalMet({ lessonsCompletedToday, habitsCheckedToday });

  const nextStreakBonus = daysUntilNextStreakBonus(
    state.streakCount,
    state.streakRewardsClaimed,
  );

  const value: PulseStore = {
    hydrated,
    state,
    level: levelFromXp(state.xp),
    completedLessonIds,
    currentLessonId,
    lessonsCompletedToday,
    habitsCheckedToday,
    dailyGoalMet,
    nextStreakBonus,
    completeOnboarding,
    toggleHabitToday,
    completeLesson,
    resetDemo,
  };

  return (
    <PulseContext.Provider value={value}>{children}</PulseContext.Provider>
  );
}

export function usePulse(): PulseStore {
  const ctx = useContext(PulseContext);
  if (!ctx) throw new Error("usePulse must be used within PulseProvider");
  return ctx;
}

export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
