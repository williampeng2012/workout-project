"use client";

import { useEffect, useRef, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { accountName } from "@/lib/social/api";
import { syncSocial } from "@/lib/social/sync";
import { usePulse } from "@/lib/store/pulse-store";

type Account = { id: string; name: string };

/** Keeps the signed-in user's leaderboard stats and activity feed up to date. */
export function SocialSync() {
  const { hydrated, state, level } = usePulse();
  const [account, setAccount] = useState<Account | null>(null);
  const latest = useRef({ state, level });

  useEffect(() => {
    latest.current = { state, level };
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const apply = (user: Parameters<typeof accountName>[0] | undefined) =>
      setAccount((prev) => {
        if (!user) return null;
        return prev?.id === user.id ? prev : { id: user.id, name: accountName(user) };
      });
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => data.subscription.unsubscribe();
  }, []);

  const signature = [
    state.xp,
    state.streakCount,
    state.streakUpdatedOn,
    state.displayName,
    Object.keys(state.lessonProgress).length,
    Object.keys(state.dailyTasksCompleted).length,
  ].join("|");

  useEffect(() => {
    if (!hydrated || !account) return;
    const timer = window.setTimeout(() => {
      void syncSocial(account, latest.current.state, latest.current.level);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [hydrated, account, signature]);

  return null;
}
