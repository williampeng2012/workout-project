import type { Metadata } from "next";
import Link from "next/link";
import { AuthFooter, AuthIntro } from "@/components/auth/auth-intro";
import { ForgotPasswordForm } from "@/components/auth/forms";
import { Enter } from "@/components/ui/reveal";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthIntro
        back={{ href: "/sign-in", label: "Sign in" }}
        eyebrow="Account recovery"
        title="Forgot password"
        description="Enter the email you signed up with and we'll send a link to set a new password."
      />
      <Enter delay={240} variant="enter-soft">
        <ForgotPasswordForm />
      </Enter>
      <AuthFooter>
        Remembered it?{" "}
        <Link href="/sign-in" className="font-semibold text-fg hover:text-accent">
          Back to sign in
        </Link>
      </AuthFooter>
    </>
  );
}
