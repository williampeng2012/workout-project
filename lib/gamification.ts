/** XP / streak / level rules — tunable constants */

export const XP = {
  LESSON_COMPLETE: 20,
  HABIT_CHECKIN: 5,
  HABIT_DAILY_CAP: 20,
  LEVEL_EVERY: 100,
} as const;

export const STREAK_BONUSES: ReadonlyArray<{ days: number; xp: number }> = [
  { days: 3, xp: 15 },
  { days: 7, xp: 40 },
  { days: 14, xp: 80 },
  { days: 30, xp: 200 },
];

export const DAILY_GOAL = {
  /** Complete 1 lesson OR this many habit check-ins today */
  HABIT_QUOTA: 2,
} as const;

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP.LEVEL_EVERY) + 1;
}

export function xpIntoLevel(xp: number): number {
  return xp % XP.LEVEL_EVERY;
}

export function xpToNextLevel(xp: number): number {
  return XP.LEVEL_EVERY - xpIntoLevel(xp);
}

/** YYYY-MM-DD in local timezone */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function yesterdayKey(date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export type StreakState = {
  streakCount: number;
  streakUpdatedOn: string | null;
  streakRewardsClaimed: number[];
};

export type StreakApplyResult = StreakState & {
  continued: boolean;
  bonusXp: number;
  claimedMilestone: number | null;
};

/**
 * Call when today's daily goal is newly completed.
 * Same calendar day only continues once; bonuses fire once per milestone.
 */
export function applyDailyGoalComplete(
  state: StreakState,
  now = new Date(),
): StreakApplyResult {
  const today = todayKey(now);
  const yesterday = yesterdayKey(now);

  if (state.streakUpdatedOn === today) {
    return {
      ...state,
      continued: false,
      bonusXp: 0,
      claimedMilestone: null,
    };
  }

  let streakCount = 1;
  if (state.streakUpdatedOn === yesterday) {
    streakCount = state.streakCount + 1;
  }

  const claimed = [...state.streakRewardsClaimed];
  let bonusXp = 0;
  let claimedMilestone: number | null = null;

  for (const bonus of STREAK_BONUSES) {
    if (streakCount >= bonus.days && !claimed.includes(bonus.days)) {
      claimed.push(bonus.days);
      bonusXp += bonus.xp;
      claimedMilestone = bonus.days;
    }
  }

  return {
    streakCount,
    streakUpdatedOn: today,
    streakRewardsClaimed: claimed,
    continued: true,
    bonusXp,
    claimedMilestone,
  };
}

export function daysUntilNextStreakBonus(
  streakCount: number,
  claimed: number[],
): { daysLeft: number; rewardXp: number } | null {
  for (const bonus of STREAK_BONUSES) {
    if (!claimed.includes(bonus.days) && streakCount < bonus.days) {
      return { daysLeft: bonus.days - streakCount, rewardXp: bonus.xp };
    }
  }
  return null;
}

export function isDailyGoalMet(input: {
  lessonsCompletedToday: number;
  habitsCheckedToday: number;
}): boolean {
  return (
    input.lessonsCompletedToday >= 1 ||
    input.habitsCheckedToday >= DAILY_GOAL.HABIT_QUOTA
  );
}
