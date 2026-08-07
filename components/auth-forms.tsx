"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-2xl border border-border bg-bg-elevated p-5 text-sm text-fg-muted">
        <p>Supabase isn&apos;t configured yet.</p>
        <p className="mt-2">
          Copy <code className="text-fg">.env.local.example</code> to{" "}
          <code className="text-fg">.env.local</code>, add your project keys, then
          run the migration in{" "}
          <code className="text-fg">supabase/migrations</code>.
        </p>
        <p className="mt-4">
          For now, use{" "}
          <a href="/onboarding" className="text-fg underline">
            local demo mode
          </a>{" "}
          — progress saves in this browser.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) throw err;
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-fg-muted">
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-fg"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-fg-muted">
          Password
        </span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-fg"
        />
      </label>
      {error && <p className="text-sm text-fg-muted">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-fg py-3.5 text-sm font-semibold text-bg disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-2xl border border-border bg-bg-elevated p-5 text-sm text-fg-muted">
        <p>
          Auth needs Supabase. Until then,{" "}
          <a href="/onboarding" className="text-fg underline">
            start the local demo
          </a>
          .
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
        },
      });
      if (err) throw err;
      if (data.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        setMessage("Check your email to confirm, then sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-fg-muted">
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-fg"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-fg-muted">
          Password
        </span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-fg"
        />
      </label>
      {error && <p className="text-sm text-fg-muted">{error}</p>}
      {message && <p className="text-sm text-fg-muted">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-fg py-3.5 text-sm font-semibold text-bg disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
