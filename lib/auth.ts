export function isPublicPath(pathname: string): boolean {
  if (
    pathname === "/" ||
    pathname === "/sign-in" ||
    pathname === "/sign-up"
  ) {
    return true;
  }

  if (pathname.startsWith("/auth/")) {
    return true;
  }

  return false;
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
