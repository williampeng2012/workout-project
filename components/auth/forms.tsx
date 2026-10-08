"use client";

import { ArrowRight, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { isEmailAuthReady, safeNext } from "@/lib/auth-providers";
import { usePulse } from "@/lib/store/pulse-store";
import { createClient } from "@/lib/supabase/client";
import { Divider, FormNotice, PasswordField, TextField, validateEmail, validateNewPassword } from "./fields";
import { SocialButtons } from "./social-buttons";

function useGuestHref() {
  const { hydrated, state } = usePulse();
  return hydrated && state.onboardingDone ? "/home" : "/onboarding";
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Email or password is incorrect.";
  if (m.includes("email not confirmed")) return "Confirm your email first — check your inbox for the link.";
  if (m.includes("already registered")) return "An account with this email already exists. Try signing in.";
  if (m.includes("rate limit")) return "Too many attempts. Wait a minute and try again.";
  return message;
}

function NotConnectedNotice() {
  const guestHref = useGuestHref();
  return (
    <FormNotice
      action={
        <Link
          href={guestHref}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg hover:text-accent"
        >
          Continue as guest <ArrowRight size={14} aria-hidden />
        </Link>
      }
    >
      Accounts aren&apos;t connected in this build yet, so email sign-in can&apos;t complete. Your
      training is saved on this device in the meantime.
    </FormNotice>
  );
}

export function SignInForm({ initialError, next = "/home" }: { initialError?: string; next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const emailError = touched ? validateEmail(email) : null;
  const passwordError = touched && !password ? "Enter your password." : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (validateEmail(email) || !password) return;
    if (!isEmailAuthReady()) {
      setBlocked(true);
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
      if (err) throw err;
      router.push(safeNext(next));
      router.refresh();
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : "Sign in failed."));
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SocialButtons next={next} mode="sign-in" />
      <Divider label="or with email" />
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
        />
        <div>
          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
          />
          <div className="mt-2.5 flex justify-end">
            <Link href="/forgot-password" className="text-[13px] font-semibold text-fg-2 hover:text-fg">
              Forgot password?
            </Link>
          </div>
        </div>
        {error && <FormNotice tone="error">{error}</FormNotice>}
        {blocked && <NotConnectedNotice />}
        <Button type="submit" size="lg" block loading={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

export function SignUpForm({ next = "/onboarding" }: { next?: string }) {
  const router = useRouter();
  const { updateProfile } = usePulse();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const emailError = touched ? validateEmail(email) : null;
  const passwordError = touched ? validateNewPassword(password) : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (validateEmail(email) || validateNewPassword(password)) return;
    if (name.trim()) updateProfile({ displayName: name.trim() });
    if (!isEmailAuthReady()) {
      setBlocked(true);
      return;
    }
    setLoading(true);
    try {
      const { data, error: err } = await createClient().auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
          data: name.trim() ? { full_name: name.trim() } : undefined,
        },
      });
      if (err) throw err;
      if (data.session) {
        router.push(safeNext(next));
        router.refresh();
      } else {
        setSentTo(email.trim());
        setLoading(false);
      }
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : "Couldn't create your account."));
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <CheckInbox
        email={sentTo}
        title="Confirm your email"
        body="We sent a confirmation link. Open it on this device to finish creating your account."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SocialButtons next={next} mode="sign-up" />
      <Divider label="or with email" />
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          label="Name"
          name="name"
          autoComplete="given-name"
          placeholder="What should we call you?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          hint="Optional"
        />
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
        />
        <PasswordField
          label="Password"
          name="new-password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          showStrength
        />
        {error && <FormNotice tone="error">{error}</FormNotice>}
        {blocked && <NotConnectedNotice />}
        <Button type="submit" size="lg" block loading={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-center text-[12.5px] leading-relaxed text-fg-3">
          By continuing you agree to our{" "}
          <Link href="/legal/terms" className="text-fg-2 underline underline-offset-2 hover:text-fg">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="text-fg-2 underline underline-offset-2 hover:text-fg">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const emailError = touched ? validateEmail(email) : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (validateEmail(email)) return;
    if (!isEmailAuthReady()) {
      setBlocked(true);
      return;
    }
    setLoading(true);
    const { error: err } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    // Don't reveal whether an account exists — only surface throttling/network errors.
    if (err && /rate limit|network|fetch/i.test(err.message)) {
      setError(friendlyAuthError(err.message));
      return;
    }
    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <CheckInbox
        email={sentTo}
        title="Check your inbox"
        body="If an account exists for this email, a reset link is on its way. The link expires in one hour."
        onRetry={() => setSentTo(null)}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        autoFocus
      />
      {error && <FormNotice tone="error">{error}</FormNotice>}
      {blocked && <NotConnectedNotice />}
      <Button type="submit" size="lg" block loading={loading}>
        {loading ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [done, setDone] = useState(false);

  const passwordError = touched ? validateNewPassword(password) : null;
  const confirmError = touched && confirm !== password ? "Passwords don't match." : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (validateNewPassword(password) || confirm !== password) return;
    if (!isEmailAuthReady()) {
      setBlocked(true);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setExpired(true);
      setLoading(false);
      return;
    }
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(friendlyAuthError(err.message));
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/home"), 1400);
  }

  if (done) {
    return (
      <FormNotice tone="success">
        Password updated. Taking you to your training…
      </FormNotice>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <PasswordField
        label="New password"
        name="new-password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={passwordError}
        showStrength
        autoFocus
      />
      <PasswordField
        label="Confirm password"
        name="confirm-password"
        autoComplete="new-password"
        placeholder="Repeat it"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={confirmError}
      />
      {error && <FormNotice tone="error">{error}</FormNotice>}
      {expired && (
        <FormNotice
          tone="error"
          action={
            <Link href="/forgot-password" className="text-[13px] font-semibold text-fg underline underline-offset-2">
              Request a new link
            </Link>
          }
        >
          This reset link has expired or was already used.
        </FormNotice>
      )}
      {blocked && <NotConnectedNotice />}
      <Button type="submit" size="lg" block loading={loading}>
        {loading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

function CheckInbox({
  email,
  title,
  body,
  onRetry,
}: {
  email: string;
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="enter-soft" role="status">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink">
        <MailCheck size={24} aria-hidden />
      </span>
      <h2 className="t-title mt-6">{title}</h2>
      <p className="t-body mt-3">
        {body} <span className="font-semibold text-fg">{email}</span>
      </p>
      <div className="mt-8 flex flex-wrap gap-2.5">
        <ButtonLink href="/sign-in" size="lg" variant="light">
          Back to sign in
        </ButtonLink>
        {onRetry && (
          <Button size="lg" variant="ghost" onClick={onRetry}>
            Use a different email
          </Button>
        )}
      </div>
    </div>
  );
}
