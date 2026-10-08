"use client";

import { HardDrive, LogIn, LogOut, Mail, Pencil, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProviderIcon } from "@/components/auth/social-buttons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { AvatarPicker } from "./avatar";
import { SIGN_IN_METHOD_LABEL, useAccount, type AccountStatus, type SignInMethod } from "./use-account";

function MethodIcon({ method }: { method: SignInMethod }) {
  if (method === "google" || method === "apple") {
    return (
      <span className="flex h-4 w-4 items-center justify-center [&_svg]:!h-[14px] [&_svg]:!w-[14px]">
        <ProviderIcon id={method} />
      </span>
    );
  }
  return method === "email" ? <Mail size={14} aria-hidden /> : <UserRound size={14} aria-hidden />;
}

function MethodLine({ status }: { status: AccountStatus }) {
  let icon: ReactNode;
  let label: string;
  let detail: string | null = null;

  switch (status.kind) {
    case "loading":
      return <Skeleton className="mt-2 h-4 w-44" />;
    case "signed-in":
      icon = <MethodIcon method={status.method} />;
      label = SIGN_IN_METHOD_LABEL[status.method];
      detail = status.email;
      break;
    case "guest":
      icon = <HardDrive size={14} aria-hidden />;
      label = "Guest";
      detail = "Saved on this device";
      break;
    case "signed-out":
      icon = <UserRound size={14} aria-hidden />;
      label = "Not signed in";
      detail = "Progress saved on this device";
      break;
  }

  return (
    <p className="mt-1.5 flex min-w-0 items-center gap-2 text-[13px] text-fg-3">
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white/[0.04] py-0.5 pl-1.5 pr-2.5 font-semibold text-fg-2">
        {icon}
        {label}
      </span>
      {detail && <span className="truncate">{detail}</span>}
    </p>
  );
}

/** Avatar, name and sign-in method in one bar, with the matching account action. */
export function IdentityBar({ name, className }: { name: string; className?: string }) {
  const { status, signOut, signingOut } = useAccount();
  const toast = useToast();

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-[var(--radius-lg)] border border-line bg-surface-1 p-4 sm:gap-5 sm:p-5",
        className,
      )}
    >
      <AvatarPicker name={name} className="h-16 w-16 text-[24px] sm:h-20 sm:w-20 sm:text-[30px]" />

      <div className="min-w-0 flex-1">
        <Link
          href="/settings/profile"
          transitionTypes={["nav-forward"]}
          className="group inline-flex max-w-full items-center gap-2"
          aria-label={`${name} — edit profile`}
        >
          <span className="truncate font-display text-[22px] font-extrabold leading-tight tracking-tight [font-stretch:80%] sm:text-[28px]">
            {name}
          </span>
          <Pencil
            size={14}
            className="shrink-0 text-fg-3 transition-colors group-hover:text-fg"
            aria-hidden
          />
        </Link>
        <MethodLine status={status} />
      </div>

      {status.kind === "signed-in" && (
        <Button
          variant="secondary"
          size="sm"
          loading={signingOut}
          aria-label="Sign out"
          icon={<LogOut size={15} aria-hidden />}
          className="shrink-0 max-sm:w-9 max-sm:px-0"
          onClick={async () => {
            const ok = await signOut();
            toast(ok ? "Signed out" : "Couldn't sign out — try again", ok ? "success" : "info");
          }}
        >
          <span className="max-sm:hidden">Sign out</span>
        </Button>
      )}
      {status.kind === "signed-out" && (
        <ButtonLink
          href="/sign-in"
          size="sm"
          aria-label="Sign in"
          icon={<LogIn size={15} aria-hidden />}
          className="shrink-0 max-sm:w-9 max-sm:px-0"
        >
          <span className="max-sm:hidden">Sign in</span>
        </ButtonLink>
      )}
      {status.kind === "guest" && (
        <ButtonLink
          href="/sign-up"
          size="sm"
          aria-label="Create account"
          icon={<UserPlus size={15} aria-hidden />}
          className="shrink-0 max-sm:w-9 max-sm:px-0"
        >
          <span className="max-sm:hidden">Create account</span>
        </ButtonLink>
      )}
    </div>
  );
}
