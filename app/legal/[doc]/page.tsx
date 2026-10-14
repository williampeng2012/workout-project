import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { TopBar } from "@/components/ui/top-bar";
import { Enter } from "@/components/ui/reveal";

type Doc = {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
};

const DOCS: Record<string, Doc> = {
  privacy: {
    title: "Privacy Policy",
    intro:
      "A plain-language summary of how Pulsepath handles your data today. The full policy is being prepared and will replace this summary before public launch.",
    sections: [
      {
        heading: "What stays on your device",
        body: "Without an account, your goal, schedule, habits, workout history, XP and streaks are stored only in your browser's local storage. Clearing site data or using Reset demo data in Settings removes them.",
      },
      {
        heading: "Accounts",
        body: "If you create an account, your email address and training progress are stored with our authentication and database provider so you can sign in on other devices. We never see or store your password in plain text.",
      },
      {
        heading: "Social sign-in",
        body: "If Google or Apple sign-in is offered, we only receive the basic profile details those providers share (such as name and email) to create your account.",
      },
      {
        heading: "Usage analytics",
        body: "We use Mixpanel and Google Analytics to understand how Pulsepath is used: pages you visit, buttons you tap, and actions like starting or finishing a workout. If you're signed in, this is linked to your account (including your email and name) so we can improve the app for you. We never record what you type into text fields.",
      },
      {
        heading: "What we don't do",
        body: "We don't sell your data, show third-party ads, or share your training history with advertisers.",
      },
      {
        heading: "Your choices",
        body: "You can export your data or reset it at any time from Settings → Data. To delete an account, contact support@pulsepath.app.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro:
      "A short summary of the rules for using Pulsepath. The full terms are being prepared and will replace this summary before public launch.",
    sections: [
      {
        heading: "Train safely",
        body: "Pulsepath provides general fitness guidance, not medical advice. Check with a qualified professional before starting a new exercise program, and stop if you feel pain, dizziness or shortness of breath.",
      },
      {
        heading: "Your account",
        body: "Keep your sign-in details private and let us know if you suspect unauthorised access. You're responsible for activity on your account.",
      },
      {
        heading: "Content",
        body: "Workouts, technique guides and imagery in Pulsepath are provided for your personal use. Please don't redistribute them.",
      },
      {
        heading: "Preview features",
        body: "Some features are marked as coming soon or in preview. They may change or be removed as we improve the product.",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  return { title: DOCS[doc]?.title ?? "Not found" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const content = DOCS[doc];
  if (!content) notFound();
  const other = doc === "privacy" ? { href: "/legal/terms", label: "Terms of Service" } : { href: "/legal/privacy", label: "Privacy Policy" };

  return (
    <div className="min-h-dvh bg-ink">
      <TopBar title={content.title} fallback="/" />
      <main className="page-x mx-auto max-w-[760px] pb-[calc(var(--safe-bottom)+64px)] pt-8 md:pt-14">
        <Enter variant="enter-soft">
          <p className="t-eyebrow flex items-center gap-2">
            <FileText size={14} aria-hidden /> Legal · Summary
          </p>
        </Enter>
        <Enter delay={80} as="h1" className="t-display mt-4">
          {content.title}
        </Enter>
        <Enter delay={160} variant="enter-soft" as="p" className="t-body mt-5 text-[17px]">
          {content.intro}
        </Enter>

        <Enter delay={240} variant="enter-soft">
          <ol className="mt-12 divide-y divide-line border-y border-line">
            {content.sections.map((s, i) => (
              <li key={s.heading} className="grid gap-3 py-7 md:grid-cols-[64px_1fr]">
                <span className="t-num text-2xl text-fg-4">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="t-heading">{s.heading}</h2>
                  <p className="t-body mt-2">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Enter>

        <p className="t-small mt-10">
          Questions?{" "}
          <a href="mailto:support@pulsepath.app" className="font-semibold text-fg underline underline-offset-2">
            support@pulsepath.app
          </a>
          <span className="mx-2 text-fg-4" aria-hidden>
            ·
          </span>
          <Link href={other.href} className="font-semibold text-fg hover:text-accent">
            {other.label}
          </Link>
        </p>
      </main>
    </div>
  );
}
