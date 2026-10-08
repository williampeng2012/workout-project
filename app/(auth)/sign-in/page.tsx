import type { Metadata } from "next";
import Link from "next/link";
import { AuthFooter, AuthIntro } from "@/components/auth/auth-intro";
import { FormNotice } from "@/components/auth/fields";
import { SignInForm } from "@/components/auth/forms";
import { Enter } from "@/components/ui/reveal";
import { isSupabaseEnvReady } from "@/lib/auth";
import { safeNext } from "@/lib/auth-providers";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { error, error_description, next, reason } = await searchParams;
  const initialError = error
    ? typeof error_description === "string"
      ? error_description
      : "Sign in failed. Please try again."
    : undefined;
  const guestAllowed = !isSupabaseEnvReady();

  return (
    <>
      <AuthIntro eyebrow="Welcome back" title="Sign in" description="Pick up your streak where you left it." />
      {reason === "auth" && (
        <div className="mb-6">
          <FormNotice>Sign in to continue to that page.</FormNotice>
        </div>
      )}
      <Enter delay={240} variant="enter-soft">
        <SignInForm initialError={initialError} next={safeNext(typeof next === "string" ? next : undefined)} />
      </Enter>
      <AuthFooter>
        New to Pulsepath?{" "}
        <Link href="/sign-up" className="font-semibold text-fg hover:text-accent">
          Create an account
        </Link>
        {guestAllowed && (
          <>
            <span className="mx-2 text-fg-4" aria-hidden>
              ·
            </span>
            <Link href="/onboarding" className="font-semibold text-fg-2 hover:text-fg">
              Continue as guest
            </Link>
          </>
        )}
      </AuthFooter>
    </>
  );
}
