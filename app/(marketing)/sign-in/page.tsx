import Link from "next/link";
import { SignInForm } from "@/components/auth-forms";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="font-display text-lg font-bold">
        Pulsepath
      </Link>
      <h1 className="font-display mt-8 text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Welcome back. Keep your streak alive.
      </p>
      <div className="mt-8">
        <SignInForm />
      </div>
      <p className="mt-6 text-center text-sm text-fg-muted">
        No account?{" "}
        <Link href="/sign-up" className="text-fg underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
