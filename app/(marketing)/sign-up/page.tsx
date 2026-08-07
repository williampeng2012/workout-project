import Link from "next/link";
import { SignUpForm } from "@/components/auth-forms";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="font-display text-lg font-bold">
        Pulsepath
      </Link>
      <h1 className="font-display mt-8 text-3xl font-bold">Create account</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Sync progress across devices when Supabase is connected.
      </p>
      <div className="mt-8">
        <SignUpForm />
      </div>
      <p className="mt-6 text-center text-sm text-fg-muted">
        Already training?{" "}
        <Link href="/sign-in" className="text-fg underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
