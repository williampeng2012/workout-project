"use client";

import { Check, Link2Off, UserRound, Users } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Enter } from "@/components/ui/reveal";
import { TopBar } from "@/components/ui/top-bar";
import { usePulse } from "@/lib/store/pulse-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  SocialError,
  addFriendByCode,
  currentUser,
  ensureProfile,
  parseFriendCode,
  type AddByCodeResult,
} from "@/lib/social/api";
import { Avatar, nameOf } from "./shared";

type Status =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "setup" }
  | { kind: "error"; message: string }
  | ({ kind: "done" } & AddByCodeResult);

export function InviteAccept({ code }: { code: string }) {
  const { state } = usePulse();
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const started = useRef(false);

  useEffect(() => {
    // Accepting is a write; don't repeat it on Strict Mode's double mount.
    if (started.current) return;
    started.current = true;
    (async () => {
      const clean = parseFriendCode(code);
      if (!isSupabaseConfigured() || !clean) return setStatus({ kind: "done", result: "not_found", friend: null });
      try {
        const user = await currentUser();
        if (!user) return setStatus({ kind: "signed-out" });
        await ensureProfile(user.id, state.displayName.trim() || user.name);
        setStatus({ kind: "done", ...(await addFriendByCode(clean)) });
      } catch (err) {
        if (err instanceof SocialError && err.kind === "setup") return setStatus({ kind: "setup" });
        setStatus({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong." });
      }
    })();
  }, [code, state.displayName]);

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title="Friend invite" fallback="/friends" />
      <div className="page-x mx-auto flex max-w-[560px] flex-col items-center pt-16 text-center">
        {status.kind === "loading" && (
          <>
            <span className="spinner !h-8 !w-8" aria-hidden />
            <p className="t-small mt-5">Adding your friend…</p>
          </>
        )}
        {status.kind === "signed-out" && (
          <Result
            icon={<Users size={26} aria-hidden />}
            title="Sign in to accept"
            description="Sign in and you'll be added as friends right away."
            primary={{ label: "Sign in", href: `/sign-in?next=/invite/${encodeURIComponent(code)}` }}
          />
        )}
        {status.kind === "setup" && (
          <Result
            icon={<Users size={26} aria-hidden />}
            title="Friends isn't ready yet"
            description="The friends database hasn't been set up for this app yet."
            primary={{ label: "Go home", href: "/home" }}
          />
        )}
        {status.kind === "error" && (
          <Result
            icon={<Link2Off size={26} aria-hidden />}
            title="Couldn't accept the invite"
            description={status.message}
            primary={{ label: "Open Friends", href: "/friends" }}
          />
        )}
        {status.kind === "done" && <Done status={status} />}
      </div>
    </main>
  );
}

function Done({ status }: { status: AddByCodeResult }) {
  const name = nameOf(status.friend);
  switch (status.result) {
    case "added":
      return (
        <Result
          avatar={name}
          badge
          title={`You and ${name} are friends`}
          description="Race each other on this week's leaderboard and follow each other's training."
          primary={{ label: "See friends", href: "/friends" }}
          secondary={{ label: "Start training", href: "/home" }}
        />
      );
    case "already_friends":
      return (
        <Result
          avatar={name}
          title={`You're already friends with ${name}`}
          primary={{ label: "See friends", href: "/friends" }}
        />
      );
    case "self":
      return (
        <Result
          icon={<UserRound size={26} aria-hidden />}
          title="That's your own invite"
          description="Send this link to a friend — when they open it, you'll be connected."
          primary={{ label: "Open Friends", href: "/friends" }}
        />
      );
    default:
      return (
        <Result
          icon={<Link2Off size={26} aria-hidden />}
          title="This invite doesn't work"
          description="The link may be mistyped, or your friend made a new code. Ask them to share it again."
          primary={{ label: "Open Friends", href: "/friends" }}
        />
      );
  }
}

function Result({
  icon,
  avatar,
  badge,
  title,
  description,
  primary,
  secondary,
}: {
  icon?: ReactNode;
  avatar?: string;
  badge?: boolean;
  title: string;
  description?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <>
      <Enter variant="enter-focus" className="relative">
        {avatar ? (
          <Avatar name={avatar} size={72} />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06] text-fg-2">{icon}</span>
        )}
        {badge && (
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-accent text-accent-ink">
            <Check size={14} strokeWidth={3} aria-hidden />
          </span>
        )}
      </Enter>
      <Enter delay={80}>
        <h1 className="t-title mt-7 text-balance">{title}</h1>
      </Enter>
      {description && (
        <Enter delay={140}>
          <p className="t-body mt-3 max-w-[40ch]">{description}</p>
        </Enter>
      )}
      <Enter delay={200} className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <ButtonLink href={primary.href} size="lg">
          {primary.label}
        </ButtonLink>
        {secondary && (
          <ButtonLink href={secondary.href} size="lg" variant="secondary">
            {secondary.label}
          </ButtonLink>
        )}
      </Enter>
    </>
  );
}
