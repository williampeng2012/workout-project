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
import { getOrderedLessons, type Lesson } from "@/content/lessons";
import {
  applyDailyGoalComplete,
  daysUntilNextStreakBonus,
  isDailyGoalMet,
  levelFromXp,
  todayKey,
  XP,
} from "@/lib/gamification";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { lessonOrderFor, type FitnessLevel } from "@/lib/training";

/** Shared key used before accounts existed; still the only key when Supabase isn't configured. */
const STORAGE_KEY = "pulsepath-v1";
const GUEST_KEY = "pulsepath-guest-v1";
const accountKey = (uid: string) => `${STORAGE_KEY}:${uid}`;
/** Written by lib/social/sync.ts once an account has synced from this browser. */
const SOCIAL_SNAPSHOT_PREFIX = "pulsepath-social:";

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
  /** Sets workout volume, rest and program order; null = intermediate defaults. */
  fitnessLevel: FitnessLevel | null;
  trainingDays: number | null;
  onboardingDone: boolean;
  habits: LocalHabit[];
  habitLogs: Record<string, string[]>;
  lessonProgress: Record<string, string>;
  dailyGoalApplied: string[];
  /** taskId -> completion ISO timestamp for today's plan */
  dailyTasksCompleted: Record<string, string>;
  /** Total minutes logged from workouts */
  totalWorkoutMinutes: number;
  /** Dates when daily goal was met (for weekly chart) */
  trainingDaysCompleted: string[];
  displayName: string;
  /** Square JPEG data URL (≤256px), or null to show initials */
  avatar: string | null;
  /** Content ids the user asked to be notified about (coming-soon items) */
  notifyRequests: string[];
  recentSearches: string[];
  preferences: Preferences;
  /** day (YYYY-MM-DD) -> foods logged that day */
  foodLogs: Record<string, FoodEntry[]>;
  body: BodyProfile | null;
  /** User-set daily calorie target; null = use the calculated one */
  calorieTargetOverride: number | null;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type FoodEntry = {
  id: string;
  name: string;
  kcal: number;
  meal: MealType;
  loggedAt: string;
};

export type BodyProfile = {
  sex: "female" | "male";
  age: number;
  heightCm: number;
  weightKg: number;
};

export type Preferences = {
  units: "metric" | "imperial";
  workoutReminders: boolean;
  classReminders: boolean;
  weeklyRecap: boolean;
  restTimerSound: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  units: "metric",
  workoutReminders: true,
  classReminders: true,
  weeklyRecap: false,
  restTimerSound: true,
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
  fitnessLevel: null,
  trainingDays: null,
  onboardingDone: false,
  habits: DEFAULT_HABITS,
  habitLogs: {},
  lessonProgress: {},
  dailyGoalApplied: [],
  dailyTasksCompleted: {},
  totalWorkoutMinutes: 0,
  trainingDaysCompleted: [],
  displayName: "",
  avatar: null,
  notifyRequests: [],
  recentSearches: [],
  preferences: DEFAULT_PREFERENCES,
  foodLogs: {},
  body: null,
  calorieTargetOverride: null,
});

function parseState(raw: string | null): PulseState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PulseState>;
    return {
      ...defaultState(),
      ...parsed,
      preferences: { ...DEFAULT_PREFERENCES, ...(parsed.preferences ?? {}) },
    } as PulseState;
  } catch {
    return null;
  }
}

function loadState(key: string): PulseState {
  if (typeof window === "undefined") return defaultState();
  try {
    return parseState(localStorage.getItem(key)) ?? defaultState();
  } catch {
    return defaultState();
  }
}

function saveState(key: string, state: PulseState) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Storage full or blocked; progress stays in memory for this visit.
  }
}

/**
 * With accounts, each signed-in user gets their own copy so switching accounts
 * on one browser never shows (or syncs) someone else's progress.
 */
function storageKey(uid: string | null): string {
  if (!isSupabaseConfigured()) return STORAGE_KEY;
  return uid ? accountKey(uid) : GUEST_KEY;
}

/**
 * Data saved before progress was scoped per account lives under the old shared
 * key. Hand it to the account it most likely belongs to: the only account that
 * ever synced from this browser, or the one whose name matches it.
 */
function claimLegacyData(user: User) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const synced = Object.keys(localStorage)
    .filter((k) => k.startsWith(SOCIAL_SNAPSHOT_PREFIX))
    .map((k) => k.slice(SOCIAL_SNAPSHOT_PREFIX.length));

  let owner: string | null = null;
  if (synced.length === 0) owner = user.id;
  else if (synced.length === 1) owner = synced[0];
  else if (synced.includes(user.id) && nameMatches(parseState(raw)?.displayName ?? "", user)) owner = user.id;
  if (!owner) return;

  if (!localStorage.getItem(accountKey(owner))) localStorage.setItem(accountKey(owner), raw);
  localStorage.removeItem(STORAGE_KEY);
}

function nameMatches(saved: string, user: User): boolean {
  const name = saved.trim().toLowerCase();
  if (!name) return false;
  const meta = user.user_metadata ?? {};
  return [meta.display_name, meta.full_name, meta.name, user.email?.split("@")[0]]
    .filter((c): c is string => typeof c === "string" && c.length > 0)
    .map((c) => c.trim().toLowerCase())
    .some((c) => c === name || c.startsWith(`${name} `) || name.startsWith(`${c} `));
}

/** Things done before signing in (e.g. the name typed on sign-up) carry over to a new account. */
function adoptGuestData(uid: string) {
  const raw = localStorage.getItem(GUEST_KEY);
  if (!raw) return;
  if (!localStorage.getItem(accountKey(uid))) localStorage.setItem(accountKey(uid), raw);
  localStorage.removeItem(GUEST_KEY);
}

function countHabitsToday(state: PulseState, day: string): number {
  return state.habits.filter((h) =>
    (state.habitLogs[h.id] ?? []).includes(day),
  ).length;
}

function countLessonsToday(state: PulseState, day: string): number {
  return Object.values(state.lessonProgress).filter(
    (iso) => todayKey(new Date(iso)) === day,
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
      trainingDaysCompleted: state.trainingDaysCompleted.includes(day)
        ? state.trainingDaysCompleted
        : [...state.trainingDaysCompleted, day],
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
  /** Supabase user whose progress `state` holds; null for guests or without accounts. */
  ownerId: string | null;
  state: PulseState;
  level: number;
  completedLessonIds: Set<string>;
  /** Workouts in the order this user's path unlocks them. */
  lessonOrder: Lesson[];
  currentLessonId: string | null;
  lessonsCompletedToday: number;
  habitsCheckedToday: number;
  dailyGoalMet: boolean;
  nextStreakBonus: { daysLeft: number; rewardXp: number } | null;
  todayTasksCompleted: number;
  todayTasksTotal: number;
  completeOnboarding: (input: {
    goal: PulseState["goal"];
    fitnessLevel: FitnessLevel;
    trainingDays: number;
    habitNames: string[];
  }) => void;
  toggleHabitToday: (habitId: string) => { xpDelta: number; checked: boolean };
  completeLesson: (lessonId: string) => CompleteLessonResult;
  completeDailyTask: (taskId: string, durationMinutes?: number) => void;
  isDailyTaskDone: (taskId: string) => boolean;
  resetDemo: () => void;
  updateProfile: (input: {
    displayName?: string;
    goal?: PulseState["goal"];
    fitnessLevel?: FitnessLevel;
    trainingDays?: number;
  }) => void;
  updateAvatar: (avatar: string | null) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  toggleNotify: (id: string) => boolean;
  addHabit: (name: string) => void;
  removeHabit: (habitId: string) => void;
  pushRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  addFood: (entry: { name: string; kcal: number; meal: MealType }, day?: string) => FoodEntry | null;
  removeFood: (day: string, entryId: string) => void;
  restoreFood: (day: string, entry: FoodEntry) => void;
  updateBody: (body: BodyProfile | null) => void;
  setCalorieTarget: (kcal: number | null) => void;
};

const PulseContext = createContext<PulseStore | null>(null);

export function PulseProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PulseState>(defaultState);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // localStorage is only readable after mount; hydrating once here is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(loadState(STORAGE_KEY));
      setHydrated(true);
      return;
    }
    const supabase = createClient();
    let current: string | null | undefined;
    const apply = (user: User | null | undefined) => {
      const uid = user?.id ?? null;
      if (uid === current) return;
      current = uid;
      if (user) {
        claimLegacyData(user);
        adoptGuestData(user.id);
      }
      setOwnerId(uid);
      setState(loadState(storageKey(uid)));
      setHydrated(true);
    };
    supabase.auth
      .getSession()
      .then(({ data }) => apply(data.session?.user))
      .catch(() => apply(null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(storageKey(ownerId), state);
  }, [state, hydrated, ownerId]);

  const completeOnboarding = useCallback(
    (input: {
      goal: PulseState["goal"];
      fitnessLevel: FitnessLevel;
      trainingDays: number;
      habitNames: string[];
    }) => {
      setState((prev) => ({
        ...prev,
        goal: input.goal,
        fitnessLevel: input.fitnessLevel,
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
        totalWorkoutMinutes:
          prev.totalWorkoutMinutes +
          (getOrderedLessons().find((l) => l.id === lessonId)?.minutes ?? 0),
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

  const completeDailyTask = useCallback(
    (taskId: string, durationMinutes = 0) => {
      setState((prev) => {
        if (prev.dailyTasksCompleted[taskId]) return prev;
        return {
          ...prev,
          dailyTasksCompleted: {
            ...prev.dailyTasksCompleted,
            [taskId]: new Date().toISOString(),
          },
          totalWorkoutMinutes:
            prev.totalWorkoutMinutes + durationMinutes,
        };
      });
    },
    [],
  );

  const isDailyTaskDone = useCallback(
    (taskId: string) => !!state.dailyTasksCompleted[taskId],
    [state.dailyTasksCompleted],
  );

  const resetDemo = useCallback(() => {
    const fresh = defaultState();
    setState(fresh);
    saveState(storageKey(ownerId), fresh);
  }, [ownerId]);

  const updateProfile = useCallback(
    (input: {
      displayName?: string;
      goal?: PulseState["goal"];
      fitnessLevel?: FitnessLevel;
      trainingDays?: number;
    }) => {
      setState((prev) => ({
        ...prev,
        ...(input.displayName !== undefined
          ? { displayName: input.displayName.trim().slice(0, 40) }
          : {}),
        ...(input.goal !== undefined ? { goal: input.goal } : {}),
        ...(input.fitnessLevel !== undefined ? { fitnessLevel: input.fitnessLevel } : {}),
        ...(input.trainingDays !== undefined
          ? { trainingDays: input.trainingDays }
          : {}),
      }));
    },
    [],
  );

  const updateAvatar = useCallback((avatar: string | null) => {
    setState((prev) => ({ ...prev, avatar }));
  }, []);

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...patch },
    }));
  }, []);

  const toggleNotify = useCallback(
    (id: string) => {
      const on = !state.notifyRequests.includes(id);
      setState((prev) => ({
        ...prev,
        notifyRequests: on
          ? [...prev.notifyRequests.filter((x) => x !== id), id]
          : prev.notifyRequests.filter((x) => x !== id),
      }));
      return on;
    },
    [state.notifyRequests],
  );

  const addHabit = useCallback((name: string) => {
    const clean = name.trim().slice(0, 32);
    if (!clean) return;
    setState((prev) => {
      if (prev.habits.some((h) => h.name.toLowerCase() === clean.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        habits: [
          ...prev.habits,
          {
            id: `h-${Date.now().toString(36)}`,
            name: clean,
            sortOrder: prev.habits.length,
          },
        ],
      };
    });
  }, []);

  const removeHabit = useCallback((habitId: string) => {
    setState((prev) => {
      const logs = { ...prev.habitLogs };
      delete logs[habitId];
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== habitId),
        habitLogs: logs,
      };
    });
  }, []);

  const pushRecentSearch = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    setState((prev) => ({
      ...prev,
      recentSearches: [
        q,
        ...prev.recentSearches.filter(
          (s) => s.toLowerCase() !== q.toLowerCase(),
        ),
      ].slice(0, 6),
    }));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setState((prev) => ({ ...prev, recentSearches: [] }));
  }, []);

  const addFood = useCallback(
    (input: { name: string; kcal: number; meal: MealType }, day = todayKey()): FoodEntry | null => {
      const name = input.name.trim().slice(0, 60);
      const kcal = Math.round(input.kcal);
      if (!name || !Number.isFinite(kcal) || kcal <= 0 || kcal > 5000) return null;
      const entry: FoodEntry = {
        id: `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        kcal,
        meal: input.meal,
        loggedAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        foodLogs: { ...prev.foodLogs, [day]: [...(prev.foodLogs[day] ?? []), entry] },
      }));
      return entry;
    },
    [],
  );

  const removeFood = useCallback((day: string, entryId: string) => {
    setState((prev) => ({
      ...prev,
      foodLogs: {
        ...prev.foodLogs,
        [day]: (prev.foodLogs[day] ?? []).filter((e) => e.id !== entryId),
      },
    }));
  }, []);

  const restoreFood = useCallback((day: string, entry: FoodEntry) => {
    setState((prev) => {
      const list = prev.foodLogs[day] ?? [];
      if (list.some((e) => e.id === entry.id)) return prev;
      return { ...prev, foodLogs: { ...prev.foodLogs, [day]: [...list, entry] } };
    });
  }, []);

  const updateBody = useCallback((body: BodyProfile | null) => {
    setState((prev) => ({ ...prev, body }));
  }, []);

  const setCalorieTarget = useCallback((kcal: number | null) => {
    setState((prev) => ({
      ...prev,
      calorieTargetOverride:
        kcal === null || !Number.isFinite(kcal) ? null : Math.min(6000, Math.max(800, Math.round(kcal))),
    }));
  }, []);

  const day = todayKey();
  const completedLessonIds = useMemo(
    () => new Set(Object.keys(state.lessonProgress)),
    [state.lessonProgress],
  );

  const lessonOrder = useMemo(
    () => lessonOrderFor({ goal: state.goal, level: state.fitnessLevel }),
    [state.goal, state.fitnessLevel],
  );
  const currentLessonId =
    lessonOrder.find((l) => !completedLessonIds.has(l.id))?.id ?? null;

  const lessonsCompletedToday = countLessonsToday(state, day);
  const habitsCheckedToday = countHabitsToday(state, day);
  const dailyGoalMet =
    state.dailyGoalApplied.includes(day) ||
    isDailyGoalMet({ lessonsCompletedToday, habitsCheckedToday });

  const nextStreakBonus = daysUntilNextStreakBonus(
    state.streakCount,
    state.streakRewardsClaimed,
  );

  const todayTaskPrefix = `${day}-`;
  const todayCompletedTasks = Object.keys(state.dailyTasksCompleted).filter(
    (k) => k.startsWith(todayTaskPrefix),
  ).length;

  const value: PulseStore = {
    hydrated,
    ownerId,
    state,
    level: levelFromXp(state.xp),
    completedLessonIds,
    lessonOrder,
    currentLessonId,
    lessonsCompletedToday,
    habitsCheckedToday,
    dailyGoalMet,
    nextStreakBonus,
    todayTasksCompleted: todayCompletedTasks,
    todayTasksTotal: 0,
    completeOnboarding,
    toggleHabitToday,
    completeLesson,
    completeDailyTask,
    isDailyTaskDone,
    resetDemo,
    updateProfile,
    updateAvatar,
    updatePreferences,
    toggleNotify,
    addHabit,
    removeHabit,
    pushRecentSearch,
    clearRecentSearches,
    addFood,
    removeFood,
    restoreFood,
    updateBody,
    setCalorieTarget,
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
