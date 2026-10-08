const PUBLIC_PATHS = new Set(["/", "/sign-in", "/sign-up", "/forgot-password", "/reset-password"]);
const PUBLIC_PREFIXES = ["/auth/", "/legal/", "/images/"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function isSupabaseEnvReady(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      key !== "your-anon-key",
  );
}
