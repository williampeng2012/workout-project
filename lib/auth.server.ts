import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { isSupabaseEnvReady } from "@/lib/auth";

export async function getSessionUser(): Promise<User | null> {
  if (!isSupabaseEnvReady()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();

  if (!user) {
    throw new Error("You must be signed in to do that.");
  }

  return user;
}
