"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type SignInMethod = "email" | "google" | "apple" | "other";

export type AccountStatus =
  | { kind: "loading" }
  /** Supabase isn't configured: local demo, progress lives on this device only */
  | { kind: "guest" }
  | { kind: "signed-out" }
  | { kind: "signed-in"; email: string | null; method: SignInMethod };

export const SIGN_IN_METHOD_LABEL: Record<SignInMethod, string> = {
  email: "Email",
  google: "Google",
  apple: "Apple",
  other: "Account",
};

function methodOf(user: User): SignInMethod {
  const provider = user.app_metadata?.provider;
  if (provider === "email" || provider === "google" || provider === "apple") return provider;
  return "other";
}

function statusFor(user: User | null | undefined): AccountStatus {
  return user
    ? { kind: "signed-in", email: user.email ?? null, method: methodOf(user) }
    : { kind: "signed-out" };
}

export function useAccount() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [status, setStatus] = useState<AccountStatus>(
    configured ? { kind: "loading" } : { kind: "guest" },
  );
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!cancelled) setStatus(statusFor(data.user));
      })
      .catch(() => {
        if (!cancelled) setStatus({ kind: "signed-out" });
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setStatus(statusFor(session?.user));
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  const signOut = useCallback(async (): Promise<boolean> => {
    if (!configured) return false;
    setSigningOut(true);
    try {
      const { error } = await createClient().auth.signOut();
      if (error) return false;
      router.replace("/");
      router.refresh();
      return true;
    } catch {
      return false;
    } finally {
      setSigningOut(false);
    }
  }, [configured, router]);

  return { status, configured, signOut, signingOut };
}
