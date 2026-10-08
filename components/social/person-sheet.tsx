"use client";

import { BookOpen, Check, Dumbbell, Flame, Lock, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import {
  fetchFriendProfile,
  fetchUserFeed,
  type FeedItem,
  type FriendProfile,
  type PublicProfile,
  type Relation,
} from "@/lib/social/api";
import { Avatar, liveStreak, nameOf, timeAgo } from "./shared";

/** What we already know about someone from a leaderboard row. */
export type Person = PublicProfile & {
  level: number;
  xp: number;
  weekly_xp: number;
  relation: Relation;
};

type Detail = { kind: "loading" } | { kind: "error" } | { kind: "ready"; profile: FriendProfile | null; feed: FeedItem[]; at: number };

const FEED_ICON = { lesson: BookOpen, workout: Dumbbell, streak: Flame } as const;

export function PersonSheet({
  person,
  busy,
  onClose,
  onAdd,
  onRemove,
}: {
  person: Person;
  busy: boolean;
  onClose: () => void;
  onAdd: (p: Person) => void;
  onRemove: (p: Person) => void;
}) {
  const full = person.relation === "friends" || person.relation === "self";
  const [detail, setDetail] = useState<Detail>({ kind: "loading" });

  useEffect(() => {
    if (!full) return;
    let active = true;
    Promise.all([fetchFriendProfile(person.id), fetchUserFeed(person.id)])
      .then(([profile, feed]) => active && setDetail({ kind: "ready", profile, feed, at: Date.now() }))
      .catch(() => active && setDetail({ kind: "error" }));
    return () => {
      active = false;
    };
  }, [person.id, full]);

  const name = nameOf(person);
  const profile = detail.kind === "ready" ? detail.profile : null;
  const streak = profile ? liveStreak(profile.streak_count, profile.streak_updated_on) : 0;

  const stats: Array<{ label: string; value: string }> = full
    ? [
        { label: "This week", value: `${profile?.weekly_xp ?? person.weekly_xp} XP` },
        { label: "Streak", value: profile ? (streak > 0 ? `${streak} days` : "—") : "…" },
        { label: "Workouts", value: profile ? String(profile.sessions) : "…" },
        { label: "Level", value: String(profile?.level ?? person.level) },
        { label: "Total XP", value: (profile?.xp ?? person.xp).toLocaleString() },
        {
          label: "Joined",
          value: profile ? new Date(profile.joined_at).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "…",
        },
      ]
    : [
        { label: "Level", value: String(person.level) },
        { label: "This week", value: `${person.weekly_xp} XP` },
        { label: "Total XP", value: person.xp.toLocaleString() },
      ];

  return (
    <Sheet open onClose={onClose} title={person.relation === "self" ? "Your profile" : "Profile"}>
      <div className="flex items-center gap-4">
        <Avatar name={name} self={person.relation === "self"} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[19px] font-semibold">{name}</p>
          <p className="t-micro mt-0.5 truncate">
            {person.username ? `@${person.username} · ` : ""}Lv {person.level}
            {person.relation === "friends" && " · Friends"}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-1 px-3 py-3.5">
            <dt className="t-micro uppercase tracking-[0.12em]">{s.label}</dt>
            <dd className="mt-1 truncate text-[16px] font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      {full ? (
        <section className="mt-6" aria-label="Recent activity">
          <h3 className="t-eyebrow mb-2">Recent activity</h3>
          {detail.kind === "loading" && (
            <div className="space-y-2" aria-busy="true">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {detail.kind === "error" && <p className="t-small">Couldn&apos;t load activity. Close and try again.</p>}
          {detail.kind === "ready" && detail.feed.length === 0 && (
            <p className="t-small">No workouts logged yet.</p>
          )}
          {detail.kind === "ready" && detail.feed.length > 0 && (
            <ul className="max-h-56 space-y-1 overflow-y-auto">
              {detail.feed.map((item) => {
                const Icon = FEED_ICON[item.kind] ?? Dumbbell;
                return (
                  <li key={item.id} className="flex items-center gap-3 py-1.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-fg-2">
                      <Icon size={14} aria-hidden className={cn(item.kind === "streak" && "text-accent")} />
                    </span>
                    <p className="min-w-0 flex-1 truncate text-[14px] text-fg-2">
                      {item.kind === "lesson" && "Completed "}
                      {item.kind === "workout" && "Finished "}
                      {item.kind === "streak" && "Hit a "}
                      <span className="font-semibold text-fg">{item.title}</span>
                    </p>
                    <span className="t-micro shrink-0">{timeAgo(item.created_at, detail.at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : (
        <p className="t-small mt-5 flex items-start gap-2">
          <Lock size={14} aria-hidden className="mt-0.5 shrink-0" />
          <span>Become friends with {name} to see their streak, workouts and activity.</span>
        </p>
      )}

      <div className="mt-6">
        {person.relation === "none" && (
          <Button block loading={busy} icon={<UserPlus size={16} aria-hidden />} onClick={() => onAdd(person)}>
            Add friend
          </Button>
        )}
        {person.relation === "incoming" && (
          <Button block loading={busy} icon={<Check size={16} aria-hidden />} onClick={() => onAdd(person)}>
            Accept friend request
          </Button>
        )}
        {person.relation === "outgoing" && (
          <Button block variant="secondary" disabled>
            Request sent · waiting for {name}
          </Button>
        )}
        {person.relation === "friends" && (
          <Button block variant="ghost" loading={busy} icon={<UserMinus size={16} aria-hidden />} onClick={() => onRemove(person)}>
            Remove friend
          </Button>
        )}
      </div>
    </Sheet>
  );
}
