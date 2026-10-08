import type { Metadata } from "next";
import Link from "next/link";
import { AuthFooter, AuthIntro } from "@/components/auth/auth-intro";
import { SignUpForm } from "@/components/auth/forms";
import { Enter } from "@/components/ui/reveal";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <>
      <AuthIntro
        eyebrow="Start free"
        title="Create account"
        description="Save your progress and sync it across devices."
      />
      <Enter delay={240} variant="enter-soft">
        <SignUpForm />
      </Enter>
      <AuthFooter>
        Already training?{" "}
        <Link href="/sign-in" className="font-semibold text-fg hover:text-accent">
          Sign in
        </Link>
      </AuthFooter>
    </>
  );
}
