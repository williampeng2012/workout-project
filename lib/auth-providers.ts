import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Social sign-in registry. A provider only becomes "ready" once both:
 *  1. Supabase is configured (NEXT_PUBLIC_SUPABASE_URL + anon key), and
 *  2. its NEXT_PUBLIC_AUTH_<PROVIDER>_ENABLED flag is "true" — set this only
 *     after the provider is enabled in Supabase → Authentication → Providers.
 * Until then the UI shows an honest "not connected yet" notice.
 */
export type OAuthProviderId = "google" | "apple";

export type OAuthProvider = {
  id: OAuthProviderId;
  label: string;
  enabled: boolean;
};

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    id: "google",
    label: "Google",
    enabled: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true",
  },
  {
    id: "apple",
    label: "Apple",
    enabled: process.env.NEXT_PUBLIC_AUTH_APPLE_ENABLED === "true",
  },
];

export function isProviderReady(provider: OAuthProvider): boolean {
  return provider.enabled && isSupabaseConfigured();
}

export function isEmailAuthReady(): boolean {
  return isSupabaseConfigured();
}

export function safeNext(next: string | undefined | null, fallback = "/home"): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function signInWithProvider(
  provider: OAuthProvider,
  next: string,
): Promise<{ error?: string }> {
  if (!isProviderReady(provider)) {
    return { error: `${provider.label} sign-in isn't connected yet.` };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider.id,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
    },
  });
  return error ? { error: error.message } : {};
}
