export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          xp: number;
          level: number;
          streak_count: number;
          streak_updated_on: string | null;
          streak_rewards_claimed: number[];
          goal: string | null;
          training_days: number | null;
          onboarding_done: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          xp?: number;
          level?: number;
          streak_count?: number;
          streak_updated_on?: string | null;
          streak_rewards_claimed?: number[];
          goal?: string | null;
          training_days?: number | null;
          onboarding_done?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          daily_target: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          daily_target?: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["habits"]["Insert"]>;
      };
      habit_logs: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          log_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          log_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["habit_logs"]["Insert"]>;
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed_at: string;
          xp_earned: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed_at?: string;
          xp_earned: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["lesson_progress"]["Insert"]
        >;
      };
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];
export type LessonProgress =
  Database["public"]["Tables"]["lesson_progress"]["Row"];
