"use client";

import { useState } from "react";
import { OAUTH_PENDING_KEY, track } from "@/lib/analytics";
import {
  OAUTH_PROVIDERS,
  isProviderReady,
  signInWithProvider,
  type OAuthProvider,
  type OAuthProviderId,
} from "@/lib/auth-providers";
import { cn } from "@/lib/cn";
import { FormNotice } from "./fields";

export function ProviderIcon({ id }: { id: OAuthProviderId }) {
  if (id === "apple") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="currentColor">
        <path d="M16.37 12.73c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79a4.44 4.44 0 0 0-3.75 2.28c-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.39-3.67zM14.1 5.98c.63-.77 1.06-1.83.94-2.9-.91.04-2.02.61-2.67 1.37-.58.68-1.1 1.77-.96 2.81 1.02.08 2.06-.52 2.69-1.28z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z" />
    </svg>
  );
}

export function SocialButtons({ next, mode }: { next: string; mode: "sign-in" | "sign-up" }) {
  const [pending, setPending] = useState<OAuthProviderId | null>(null);
  const [notice, setNotice] = useState<{ tone: "info" | "error"; text: string } | null>(null);

  async function onSelect(provider: OAuthProvider) {
    setNotice(null);
    if (!isProviderReady(provider)) {
      setNotice({
        tone: "info",
        text: `${provider.label} sign-in isn't connected in this build yet. Use email, or continue as a guest — your progress stays on this device.`,
      });
      return;
    }
    setPending(provider.id);
    track("OAuth Started", { provider: provider.id, mode });
    sessionStorage.setItem(OAUTH_PENDING_KEY, provider.id);
    const { error } = await signInWithProvider(provider, next);
    if (error) {
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      track("Auth Failed", { method: provider.id, mode });
      setNotice({ tone: "error", text: error });
      setPending(null);
    }
  }

  const [primary, ...others] = OAUTH_PROVIDERS;
  const verb = mode === "sign-up" ? "Sign up" : "Continue";

  return (
    <div className="space-y-2.5">
      <ProviderButton
        provider={primary}
        label={`${verb} with ${primary.label}`}
        pending={pending === primary.id}
        disabled={pending !== null}
        onClick={() => onSelect(primary)}
        emphasis
      />
      {others.length > 0 && (
        <div className={cn("grid gap-2.5", others.length > 1 && "grid-cols-2")}>
          {others.map((p) => (
            <ProviderButton
              key={p.id}
              provider={p}
              label={`${verb} with ${p.label}`}
              pending={pending === p.id}
              disabled={pending !== null}
              onClick={() => onSelect(p)}
            />
          ))}
        </div>
      )}
      {notice ? (
        <FormNotice tone={notice.tone}>{notice.text}</FormNotice>
      ) : (
        !OAUTH_PROVIDERS.some(isProviderReady) && (
          <p className="pt-1 text-center text-[12px] text-fg-4">Social sign-in is being connected.</p>
        )
      )}
    </div>
  );
}

function ProviderButton({
  provider,
  label,
  pending,
  disabled,
  onClick,
  emphasis,
}: {
  provider: OAuthProvider;
  label: string;
  pending: boolean;
  disabled: boolean;
  onClick: () => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={pending || undefined}
      className={cn(
        "pressable relative flex h-[52px] w-full items-center justify-center gap-3 rounded-full text-[15px] font-semibold disabled:opacity-50",
        emphasis
          ? "bg-fg text-ink hover:bg-white"
          : "border border-line-2 bg-white/[0.03] text-fg hover:border-white/25 hover:bg-white/[0.06]",
      )}
    >
      {pending ? <span className="spinner" aria-hidden /> : <ProviderIcon id={provider.id} />}
      {pending ? "Redirecting…" : label}
    </button>
  );
}
