import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

export function AuthIntro({
  eyebrow,
  title,
  description,
  back,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="pressable enter-soft -ml-1.5 mb-6 inline-flex items-center gap-1 rounded-full py-1 pl-1 pr-3 text-[13px] font-semibold text-fg-2 hover:text-fg"
        >
          <ChevronLeft size={17} aria-hidden /> {back.label}
        </Link>
      )}
      <p className="t-eyebrow enter-soft" style={{ ["--d" as string]: "60ms" }}>
        {eyebrow}
      </p>
      <h1 className="t-display enter mt-3" style={{ ["--d" as string]: "120ms" }}>
        {title}
      </h1>
      {description && (
        <p className="t-body enter-soft mt-3" style={{ ["--d" as string]: "200ms" }}>
          {description}
        </p>
      )}
    </header>
  );
}

export function AuthFooter({ children }: { children: ReactNode }) {
  return (
    <p className="enter-soft mt-8 text-center text-[14px] text-fg-3" style={{ ["--d" as string]: "360ms" }}>
      {children}
    </p>
  );
}
