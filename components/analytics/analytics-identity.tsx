"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { identifyUser, OAUTH_PENDING_KEY, resetUser, setUserTraits, track } from "@/lib/analytics";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { accountName, fetchMe } from "@/lib/social/api";
import { usePulse } from "@/lib/store/pulse-store";

/** Ties analytics to the signed-in Supabase user and keeps their profile traits fresh. */
export function AnalyticsIdentity() {
  const { hydrated, state, level } = usePulse();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    let current: string | null = null;

    const apply = (user: User | null | undefined) => {
      if (!user) {
        if (current) resetUser();
        current = null;
        setUserId(null);
        return;
      }
      if (current === user.id) return;
      current = user.id;
      setUserId(user.id);
      identifyUser(user.id, {
        email: user.email,
        name: accountName(user),
        sign_in_method: user.app_metadata?.provider ?? "email",
      });
      fetchMe()
        .then((me) => {
          if (me?.username) setUserTraits({ username: me.username });
        })
        .catch(() => {});
      const pending = sessionStorage.getItem(OAUTH_PENDING_KEY);
      if (pending) {
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
        track("Signed In", { method: pending });
      }
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session?.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => data.subscription.unsubscribe();
  }, []);

  const workoutsCompleted = Object.keys(state.lessonProgress).length;
  useEffect(() => {
    if (!hydrated || !userId) return;
    const timer = window.setTimeout(() => {
      setUserTraits({
        goal: state.goal,
        fitness_level: state.fitnessLevel,
        training_days: state.trainingDays,
        level,
        xp: state.xp,
        streak: state.streakCount,
        total_workout_minutes: state.totalWorkoutMinutes,
        workouts_completed: workoutsCompleted,
      });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [
    hydrated,
    userId,
    level,
    workoutsCompleted,
    state.goal,
    state.fitnessLevel,
    state.trainingDays,
    state.xp,
    state.streakCount,
    state.totalWorkoutMinutes,
  ]);

  return null;
}
