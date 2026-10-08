import type { Metadata } from "next";
import { AuthIntro } from "@/components/auth/auth-intro";
import { ResetPasswordForm } from "@/components/auth/forms";
import { Enter } from "@/components/ui/reveal";

export const metadata: Metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return (
    <>
      <AuthIntro
        eyebrow="Account recovery"
        title="New password"
        description="Choose a strong password you don't use anywhere else."
      />
      <Enter delay={240} variant="enter-soft">
        <ResetPasswordForm />
      </Enter>
    </>
  );
}
