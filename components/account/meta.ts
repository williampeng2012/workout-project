import type { PulseState } from "@/lib/store/pulse-store";

export type Goal = NonNullable<PulseState["goal"]>;

export const GOALS: Array<{ id: Goal; label: string; blurb: string }> = [
  { id: "fat_loss", label: "Fat loss", blurb: "Move daily, stay consistent" },
  { id: "muscle", label: "Build muscle", blurb: "Strength through short sets" },
  { id: "maintain", label: "Stay sharp", blurb: "Keep the habit alive" },
];

export function goalLabel(goal: PulseState["goal"]): string | null {
  return GOALS.find((g) => g.id === goal)?.label ?? null;
}

export const TRAINING_DAYS = { MIN: 2, MAX: 7 } as const;

export const SETTINGS_SECTIONS = {
  profile: { title: "Edit profile", description: "Name and training goal" },
  training: { title: "Training preferences", description: "Fitness level, weekly target and timer sounds" },
  notifications: { title: "Notifications", description: "Reminders and weekly recap" },
  units: { title: "Units", description: "Metric or imperial" },
  data: { title: "Your data", description: "Export or reset what's stored here" },
  subscription: { title: "Subscription", description: "Pulsepath Pro" },
  help: { title: "Help & FAQ", description: "How XP, streaks and plans work" },
  about: { title: "About", description: "Version and legal" },
} as const;

export type SettingsSectionId = keyof typeof SETTINGS_SECTIONS;

export function isSettingsSection(value: string): value is SettingsSectionId {
  return Object.prototype.hasOwnProperty.call(SETTINGS_SECTIONS, value);
}

export const SUPPORT_EMAIL = "support@pulsepath.app";
export const PRO_NOTIFY_ID = "pulsepath-pro";
