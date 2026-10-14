"use client";

import {
  AtSign,
  BookOpen,
  Check,
  Clock,
  Copy,
  Database,
  Dumbbell,
  Flame,
  RefreshCw,
  Share2,
  Trophy,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { SectionIntro, SwitchRow } from "@/components/account/ui";
import { Pill } from "@/components/ui/section";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { TopBar } from "@/components/ui/top-bar";
import { useToast } from "@/components/ui/toast";
import { Enter } from "@/components/ui/reveal";
import { setUserTraits, track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { usePulse } from "@/lib/store/pulse-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  USERNAME_RE,
  SocialError,
  addFriendByCode,
  cancelRequest,
  currentUser,
  ensureProfile,
  fetchFeed,
  fetchMe,
  fetchOverview,
  fetchGlobalBoard,
  fetchRequests,
  findByUsername,
  formatFriendCode,
  inviteUrl,
  normalizeUsername,
  parseFriendCode,
  regenerateFriendCode,
  removeFriend,
  respondToRequest,
  sendFriendRequest,
  setLeaderboardVisibility,
  setUsername,
  type FeedItem,
  type FoundProfile,
  type FriendRequest,
  type GlobalRow,
  type MyProfile,
  type OverviewRow,
  type Relation,
} from "@/lib/social/api";
import { PersonSheet, type Person } from "./person-sheet";
import { Avatar, inputClass, liveStreak, nameOf, timeAgo } from "./shared";

type Data = {
  uid: string;
  me: MyProfile;
  overview: OverviewRow[];
  feed: FeedItem[];
  requests: FriendRequest[];
  loadedAt: number;
};

type Status =
  | { kind: "loading" }
  | { kind: "unconfigured" }
  | { kind: "signed-out" }
  | { kind: "setup" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Data };

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}

async function fetchStatus(localName: string): Promise<Status> {
  if (!isSupabaseConfigured()) return { kind: "unconfigured" };
  try {
    const user = await currentUser();
    if (!user) return { kind: "signed-out" };
    await ensureProfile(user.id, localName || user.name);
    const [me, overview, feed, requests] = await Promise.all([
      fetchMe(),
      fetchOverview(),
      fetchFeed(),
      fetchRequests(user.id),
    ]);
    if (!me) return { kind: "error", message: "Couldn't load your profile." };
    return { kind: "ready", data: { uid: user.id, me, overview, feed, requests, loadedAt: Date.now() } };
  } catch (err) {
    if (err instanceof SocialError && err.kind === "setup") return { kind: "setup" };
    return { kind: "error", message: errorMessage(err) };
  }
}

export function FriendsView() {
  const { state: pulse } = usePulse();
  const [status, setStatus] = useState<Status>(() =>
    isSupabaseConfigured() ? { kind: "loading" } : { kind: "unconfigured" },
  );

  const fallbackName = pulse.displayName.trim();
  const load = useCallback(async () => setStatus(await fetchStatus(fallbackName)), [fallbackName]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    fetchStatus("").then((next) => active && setStatus(next));
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page-bottom min-h-dvh">
      <TopBar title="Friends" fallback="/profile" />
      <div className="page-x mx-auto max-w-[1180px]">
        <SectionIntro
          eyebrow="Train together"
          title="Friends"
          description="Add friends, race for this week's XP and see what everyone's training."
        />
        {status.kind === "loading" && <FriendsSkeleton />}
        {status.kind === "unconfigured" && (
          <EmptyState
            icon={<Users size={20} aria-hidden />}
            title="Friends needs an account"
            description="Sign-in isn't set up in this build, so there's no one to connect with yet."
          />
        )}
        {status.kind === "signed-out" && (
          <EmptyState
            icon={<Users size={20} aria-hidden />}
            title="Sign in to add friends"
            description="Your friends, leaderboard and activity are tied to your account."
            action={{ label: "Sign in", href: "/sign-in?next=/friends" }}
          />
        )}
        {status.kind === "setup" && (
          <Notice
            icon={<Database size={20} aria-hidden />}
            title="One database step left"
            description="Friends needs its tables in Supabase. Run the SQL from supabase/migrations in the Supabase SQL Editor, then try again."
            onRetry={load}
          />
        )}
        {status.kind === "error" && (
          <Notice
            icon={<X size={20} aria-hidden />}
            title="Couldn't load friends"
            description={status.message}
            onRetry={load}
          />
        )}
        {status.kind === "ready" && <Ready data={status.data} reload={load} />}
      </div>
    </main>
  );
}

type Scope = "friends" | "everyone";

type GlobalState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; rows: GlobalRow[] };

function Ready({ data, reload }: { data: Data; reload: () => Promise<void> }) {
  const toast = useToast();
  const friends = data.overview.filter((r) => !r.is_self);
  const [scope, setScope] = useState<Scope>("friends");
  const [global, setGlobal] = useState<GlobalState>({ kind: "idle" });
  const [person, setPerson] = useState<Person | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [visible, setVisible] = useState(data.me.show_on_leaderboard);
  const closePerson = useCallback(() => setPerson(null), []);

  const loadGlobal = useCallback(async () => {
    setGlobal((g) => (g.kind === "ready" ? g : { kind: "loading" }));
    try {
      setGlobal({ kind: "ready", rows: await fetchGlobalBoard() });
    } catch (err) {
      setGlobal({ kind: "error", message: errorMessage(err) });
    }
  }, []);

  function changeScope(next: Scope) {
    track("Leaderboard Scope Changed", { scope: next });
    setScope(next);
    if (next === "everyone") void loadGlobal();
  }

  function openPerson(p: Person) {
    track("Friend Profile Viewed", { relation: p.relation, scope });
    setPerson(p);
  }

  function patchRelation(id: string, relation: Relation) {
    setPerson((p) => (p && p.id === id ? { ...p, relation } : p));
    setGlobal((g) => (g.kind === "ready" ? { kind: "ready", rows: g.rows.map((r) => (r.id === id ? { ...r, relation } : r)) } : g));
  }

  async function add(p: Person) {
    setBusyId(p.id);
    try {
      const result = await sendFriendRequest(p.id);
      if (result === "not_found") {
        toast("That account no longer exists", "info");
        return;
      }
      const nowFriends = result === "accepted" || result === "already_friends";
      track("Friend Request Sent", { source: person ? "profile" : "leaderboard", result });
      patchRelation(p.id, nowFriends ? "friends" : "outgoing");
      toast(nowFriends ? `You and ${nameOf(p)} are now friends` : `Request sent to ${nameOf(p)}`);
      await reload();
    } catch (err) {
      toast(errorMessage(err), "info");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p: Pick<Person, "id" | "display_name" | "username">) {
    if (!window.confirm(`Remove ${nameOf(p)} from your friends?`)) return;
    setBusyId(p.id);
    try {
      await removeFriend(data.uid, p.id);
      track("Friend Removed");
      toast(`Removed ${nameOf(p)}`, "info");
      setPerson(null);
      patchRelation(p.id, "none");
      await reload();
    } catch (err) {
      toast(errorMessage(err), "info");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleVisible(next: boolean) {
    setVisible(next);
    try {
      await setLeaderboardVisibility(data.uid, next);
      track("Leaderboard Visibility Changed", { visible: next });
      toast(next ? "You're on the Everyone leaderboard" : "You're hidden from the Everyone leaderboard");
      if (global.kind !== "idle") void loadGlobal();
    } catch (err) {
      setVisible(!next);
      toast(errorMessage(err), "info");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-10 lg:order-2 lg:col-span-5">
        <Enter delay={120}>
          <InviteCard data={data} reload={reload} />
        </Enter>
        <Enter delay={180}>
          <AddFriend reload={reload} />
        </Enter>
        {data.requests.length > 0 && <Requests requests={data.requests} reload={reload} />}
        <Enter delay={220}>
          <Card title="Privacy">
            <SwitchRow
              label="Show me on Everyone"
              description="People outside your friends see your name, level and XP on the Everyone leaderboard, and can send you a request. Your streak and activity stay friends-only."
              checked={visible}
              onChange={toggleVisible}
            />
          </Card>
        </Enter>
      </div>
      <div className="space-y-10 lg:order-1 lg:col-span-7">
        <Enter delay={160}>
          <Leaderboard
            scope={scope}
            onScope={changeScope}
            rows={data.overview}
            global={global}
            hasFriends={friends.length > 0}
            visible={visible}
            busyId={busyId}
            onOpen={openPerson}
            onAdd={add}
            onRemove={remove}
            onShowMe={() => toggleVisible(true)}
            onRetry={loadGlobal}
          />
        </Enter>
        <Enter delay={220}>
          <Feed items={data.feed} uid={data.uid} now={data.loadedAt} />
        </Enter>
      </div>
      {person && (
        <PersonSheet
          key={person.id}
          person={person}
          busy={busyId === person.id}
          onClose={closePerson}
          onAdd={add}
          onRemove={remove}
        />
      )}
    </div>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 className="t-eyebrow">{title}</h2>
        {action}
      </div>
      <div className="rounded-[var(--radius)] border border-line bg-surface-1">{children}</div>
    </section>
  );
}

function InviteCard({ data, reload }: { data: Data; reload: () => Promise<void> }) {
  const toast = useToast();
  const [code, setCode] = useState(data.me.friend_code);
  const [rotating, setRotating] = useState(false);

  async function copy(text: string, message: string, what: "code" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      track(what === "code" ? "Friend Code Copied" : "Invite Link Copied");
      toast(message);
    } catch {
      toast("Couldn't copy — select it and copy manually", "info");
    }
  }

  async function share() {
    const url = inviteUrl(code);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Pulsepath", text: "Train with me on Pulsepath", url });
        track("Invite Shared");
        return;
      } catch (err) {
        if ((err as DOMException).name === "AbortError") return;
      }
    }
    await copy(url, "Invite link copied", "link");
  }

  async function rotate() {
    if (!window.confirm("Make a new friend code? Your old code and invite link will stop working.")) return;
    setRotating(true);
    try {
      setCode(await regenerateFriendCode());
      track("Friend Code Regenerated");
      toast("New friend code ready");
      void reload();
    } catch (err) {
      toast(errorMessage(err), "info");
    } finally {
      setRotating(false);
    }
  }

  return (
    <Card title="Your invite">
      <div className="p-5">
        <UsernameRow uid={data.uid} username={data.me.username} onSaved={reload} />
        <div className="mt-5 border-t border-line pt-5">
          <p className="t-micro uppercase tracking-[0.14em]">Friend code</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="flex-1 font-mono text-[28px] font-semibold tracking-[0.12em]" aria-label={`Friend code ${code.split("").join(" ")}`}>
              {formatFriendCode(code)}
            </p>
            <IconButton label="Copy friend code" variant="plain" onClick={() => copy(formatFriendCode(code), "Friend code copied", "code")}>
              <Copy size={17} aria-hidden />
            </IconButton>
            <IconButton label="Make a new code" variant="plain" onClick={rotate} disabled={rotating}>
              <RefreshCw size={17} aria-hidden className={cn(rotating && "animate-spin")} />
            </IconButton>
          </div>
          <p className="t-micro mt-1 !text-[12.5px]">Anyone with your code or link is added instantly.</p>
          <Button block className="mt-4" icon={<Share2 size={16} aria-hidden />} onClick={share}>
            Share invite link
          </Button>
        </div>
      </div>
    </Card>
  );
}

function UsernameRow({ uid, username, onSaved }: { uid: string; username: string | null; onSaved: () => Promise<void> }) {
  const toast = useToast();
  const [editing, setEditing] = useState(!username);
  const [value, setValue] = useState(username ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    const next = normalizeUsername(value);
    if (next === username) return setEditing(false);
    if (!USERNAME_RE.test(next)) return setError("Use 3–20 lowercase letters, numbers or _.");
    setSaving(true);
    setError(null);
    try {
      await setUsername(uid, next);
      track("Username Set", { first_time: !username });
      setUserTraits({ username: next });
      toast(`You're @${next}`);
      setEditing(false);
      await onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!editing && username) {
    return (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-fg-2">
          <AtSign size={17} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="t-micro uppercase tracking-[0.14em]">Username</p>
          <p className="truncate text-[17px] font-semibold">@{username}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={save} noValidate>
      <label htmlFor="friends-username" className="block text-[15px] font-semibold">
        {username ? "Change username" : "Pick a username"}
      </label>
      <p className="t-micro mt-1 !text-[12.5px]">Friends can find you by searching @{value ? normalizeUsername(value) || "you" : "you"}.</p>
      <div className="mt-3 flex gap-2">
        <input
          id="friends-username"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder="e.g. alex_runs"
          maxLength={21}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "friends-username-error" : undefined}
          className={inputClass}
        />
        <Button type="submit" loading={saving} className="h-12 shrink-0">
          Save
        </Button>
      </div>
      {error && (
        <p id="friends-username-error" className="mt-2 text-[13px] text-[#ff8a7a]">
          {error}
        </p>
      )}
      {username && (
        <button type="button" onClick={() => setEditing(false)} className="t-micro mt-2 underline-offset-4 hover:underline">
          Cancel
        </button>
      )}
    </form>
  );
}

function AddFriend({ reload }: { reload: () => Promise<void> }) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<FoundProfile | null>(null);
  const [requesting, setRequesting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const raw = query.trim();
    if (!raw) return;
    setBusy(true);
    setError(null);
    setFound(null);
    try {
      const code = raw.startsWith("@") ? null : parseFriendCode(raw);
      if (code) {
        const res = await addFriendByCode(code);
        track("Friend Added By Code", { result: res.result, source: "add_form" });
        if (res.result === "added") {
          toast(`You and ${nameOf(res.friend)} are now friends`);
          setQuery("");
          await reload();
          return;
        }
        if (res.result === "already_friends") {
          toast(`You're already friends with ${nameOf(res.friend)}`, "info");
          setQuery("");
          return;
        }
        if (res.result === "self") return setError("That's your own friend code.");
      }
      const username = normalizeUsername(raw);
      if (!USERNAME_RE.test(username)) {
        return setError(code ? "No one has that friend code." : "Enter a friend code or an @username.");
      }
      const profile = await findByUsername(username);
      if (!profile) return setError(code ? "No one has that code or username." : `No one goes by @${username}.`);
      setFound(profile);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function request(profile: FoundProfile) {
    setRequesting(true);
    try {
      const result = await sendFriendRequest(profile.id);
      track("Friend Request Sent", { source: "search", result });
      if (result === "accepted" || result === "already_friends") {
        setFound({ ...profile, relation: "friends" });
        toast(`You and ${nameOf(profile)} are now friends`);
      } else {
        setFound({ ...profile, relation: "outgoing" });
        toast(`Request sent to ${nameOf(profile)}`);
      }
      await reload();
    } catch (err) {
      toast(errorMessage(err), "info");
    } finally {
      setRequesting(false);
    }
  }

  return (
    <Card title="Add a friend">
      <form onSubmit={submit} className="p-5" noValidate>
        <label htmlFor="friends-add" className="sr-only">
          Friend code or username
        </label>
        <div className="flex gap-2">
          <input
            id="friends-add"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            placeholder="@username or code"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "friends-add-error" : undefined}
            className={inputClass}
          />
          <Button type="submit" loading={busy} disabled={!query.trim()} className="h-12 shrink-0" icon={<UserPlus size={16} aria-hidden />}>
            Add
          </Button>
        </div>
        {error && (
          <p id="friends-add-error" className="mt-2 text-[13px] text-[#ff8a7a]">
            {error}
          </p>
        )}
        {found && (
          <div className="mt-4 flex items-center gap-3 rounded-[var(--radius)] bg-white/[0.03] p-3">
            <Avatar name={nameOf(found)} self={found.relation === "self"} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{nameOf(found)}</p>
              <p className="t-micro truncate">
                @{found.username} · Lv {found.level}
              </p>
            </div>
            {found.relation === "none" && (
              <Button size="sm" loading={requesting} onClick={() => request(found)}>
                Add friend
              </Button>
            )}
            {found.relation === "incoming" && (
              <Button size="sm" loading={requesting} onClick={() => request(found)}>
                Accept
              </Button>
            )}
            {found.relation === "outgoing" && <Pill>Requested</Pill>}
            {found.relation === "friends" && (
              <Pill tone="accent">
                <Check size={12} strokeWidth={3} aria-hidden /> Friends
              </Pill>
            )}
            {found.relation === "self" && <Pill>You</Pill>}
          </div>
        )}
      </form>
    </Card>
  );
}

function Requests({ requests, reload }: { requests: FriendRequest[]; reload: () => Promise<void> }) {
  const toast = useToast();
  const [pending, setPending] = useState<string | null>(null);

  async function act(req: FriendRequest, action: "accept" | "decline" | "cancel") {
    setPending(req.id);
    try {
      if (action === "cancel") await cancelRequest(req.id);
      else await respondToRequest(req.id, action === "accept");
      track("Friend Request Responded", { action });
      if (action === "accept") toast(`You and ${nameOf(req.other)} are now friends`);
      await reload();
    } catch (err) {
      toast(errorMessage(err), "info");
    } finally {
      setPending(null);
    }
  }

  const incoming = requests.filter((r) => r.direction === "incoming");
  const outgoing = requests.filter((r) => r.direction === "outgoing");

  return (
    <Card title={incoming.length > 0 ? `Requests · ${incoming.length}` : "Sent requests"}>
      <ul className="divide-y divide-line">
        {[...incoming, ...outgoing].map((req) => (
          <li key={req.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <Avatar name={nameOf(req.other)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{nameOf(req.other)}</p>
              <p className="t-micro truncate">
                {req.direction === "incoming" ? "Wants to be friends" : "Waiting for them to accept"}
              </p>
            </div>
            {req.direction === "incoming" ? (
              <div className="flex shrink-0 gap-1.5">
                <Button size="sm" loading={pending === req.id} onClick={() => act(req, "accept")}>
                  Accept
                </Button>
                <IconButton label={`Decline ${nameOf(req.other)}`} variant="plain" disabled={pending === req.id} onClick={() => act(req, "decline")}>
                  <X size={17} aria-hidden />
                </IconButton>
              </div>
            ) : (
              <Button size="sm" variant="ghost" loading={pending === req.id} onClick={() => act(req, "cancel")}>
                Cancel
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function toPerson(row: OverviewRow | GlobalRow): Person {
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    level: row.level,
    xp: row.xp,
    weekly_xp: row.weekly_xp,
    relation: "relation" in row ? row.relation : row.is_self ? "self" : "friends",
  };
}

function RankCell({ rank, crown }: { rank: number | null; crown: boolean }) {
  return (
    <span className={cn("w-6 shrink-0 text-center text-[15px] font-semibold tabular-nums", crown ? "text-accent" : "text-fg-3")}>
      {crown ? <Trophy size={16} className="mx-auto" aria-label="1st" /> : (rank ?? "–")}
    </span>
  );
}

function WeeklyXp({ xp }: { xp: number }) {
  return (
    <p className="shrink-0 text-right">
      <span className="block text-[17px] font-semibold tabular-nums">{xp}</span>
      <span className="t-micro">XP</span>
    </p>
  );
}

function Leaderboard({
  scope,
  onScope,
  rows,
  global,
  hasFriends,
  visible,
  busyId,
  onOpen,
  onAdd,
  onRemove,
  onShowMe,
  onRetry,
}: {
  scope: Scope;
  onScope: (s: Scope) => void;
  rows: OverviewRow[];
  global: GlobalState;
  hasFriends: boolean;
  visible: boolean;
  busyId: string | null;
  onOpen: (p: Person) => void;
  onAdd: (p: Person) => void;
  onRemove: (p: Person) => void;
  onShowMe: () => void;
  onRetry: () => Promise<void>;
}) {
  return (
    <Card title="This week" action={<span className="t-micro">Resets Monday</span>}>
      <div className="border-b border-line p-3 sm:px-4">
        <Segmented
          label="Leaderboard"
          value={scope}
          onChange={onScope}
          className="w-full"
          options={[
            { value: "friends", label: "Friends" },
            { value: "everyone", label: "Everyone" },
          ]}
        />
      </div>

      {scope === "friends" ? (
        <>
          <ol className="divide-y divide-line">
            {rows.map((row, i) => {
              const streak = liveStreak(row.streak_count, row.streak_updated_on);
              const person = toPerson(row);
              return (
                <li key={row.id} className={cn("flex items-center gap-3 px-4 py-3.5 sm:px-5", row.is_self && "bg-white/[0.02]")}>
                  <RankCell rank={i + 1} crown={i === 0 && hasFriends} />
                  <PersonButton row={row} onOpen={() => onOpen(person)}>
                    <span>Lv {row.level}</span>
                    <span aria-hidden>·</span>
                    <Flame size={12} aria-hidden className={cn(streak > 0 ? "text-accent" : "text-fg-4")} />
                    <span>{streak > 0 ? `${streak}-day streak` : "No streak"}</span>
                  </PersonButton>
                  <WeeklyXp xp={row.weekly_xp} />
                  {row.is_self ? (
                    <span className="w-8 shrink-0" aria-hidden />
                  ) : (
                    <IconButton
                      label={`Remove ${nameOf(row)}`}
                      variant="plain"
                      className="!h-8 !w-8 text-fg-3"
                      disabled={busyId === row.id}
                      onClick={() => onRemove(person)}
                    >
                      <UserMinus size={15} aria-hidden />
                    </IconButton>
                  )}
                </li>
              );
            })}
          </ol>
          {!hasFriends && (
            <p className="t-small border-t border-line px-5 py-4">
              Share your invite link, or find people on <strong className="text-fg">Everyone</strong> and add them.
            </p>
          )}
        </>
      ) : (
        <GlobalList global={global} visible={visible} busyId={busyId} onOpen={onOpen} onAdd={onAdd} onShowMe={onShowMe} onRetry={onRetry} />
      )}
    </Card>
  );
}

function PersonButton({
  row,
  onOpen,
  children,
}: {
  row: OverviewRow | GlobalRow;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="pressable -my-1 flex min-w-0 flex-1 items-center gap-3 rounded-[12px] py-1 text-left"
    >
      <Avatar name={nameOf(row)} self={row.is_self} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="truncate">{nameOf(row)}</span>
          {row.is_self && <Pill className="!h-5 !px-2 !text-[10px]">You</Pill>}
        </span>
        <span className="t-micro mt-0.5 flex items-center gap-1.5 truncate">{children}</span>
      </span>
    </button>
  );
}

function GlobalList({
  global,
  visible,
  busyId,
  onOpen,
  onAdd,
  onShowMe,
  onRetry,
}: {
  global: GlobalState;
  visible: boolean;
  busyId: string | null;
  onOpen: (p: Person) => void;
  onAdd: (p: Person) => void;
  onShowMe: () => void;
  onRetry: () => Promise<void>;
}) {
  if (global.kind === "idle" || global.kind === "loading") {
    return (
      <div className="space-y-3 p-4 sm:p-5" aria-busy="true" aria-label="Loading leaderboard">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  if (global.kind === "error") {
    return (
      <div className="px-5 py-8 text-center">
        <p className="t-small">{global.message}</p>
        <Button variant="secondary" size="sm" className="mt-4" icon={<RefreshCw size={14} aria-hidden />} onClick={() => void onRetry()}>
          Try again
        </Button>
      </div>
    );
  }

  const others = global.rows.filter((r) => !r.is_self);
  return (
    <>
      <ol className="divide-y divide-line">
        {global.rows.map((row) => {
          const person = toPerson(row);
          return (
            <li key={row.id} className={cn("flex items-center gap-3 px-4 py-3.5 sm:px-5", row.is_self && "bg-white/[0.02]")}>
              <RankCell rank={row.rank} crown={row.rank === 1 && others.length > 0} />
              <PersonButton row={row} onOpen={() => onOpen(person)}>
                {row.username && (
                  <>
                    <span className="truncate">@{row.username}</span>
                    <span aria-hidden>·</span>
                  </>
                )}
                <span className="shrink-0">Lv {row.level}</span>
              </PersonButton>
              <WeeklyXp xp={row.weekly_xp} />
              <span className="flex w-8 shrink-0 justify-center">
                {row.relation === "none" && (
                  <IconButton
                    label={`Add ${nameOf(row)} as a friend`}
                    variant="plain"
                    className="!h-8 !w-8 !text-accent"
                    disabled={busyId === row.id}
                    onClick={() => onAdd(person)}
                  >
                    <UserPlus size={16} aria-hidden />
                  </IconButton>
                )}
                {row.relation === "incoming" && (
                  <IconButton
                    label={`Accept ${nameOf(row)}'s friend request`}
                    variant="plain"
                    className="!h-8 !w-8 !text-accent"
                    disabled={busyId === row.id}
                    onClick={() => onAdd(person)}
                  >
                    <Check size={16} strokeWidth={2.5} aria-hidden />
                  </IconButton>
                )}
                {row.relation === "outgoing" && (
                  <span className="text-fg-3" title="Request sent">
                    <Clock size={15} aria-label="Request sent" />
                  </span>
                )}
                {row.relation === "friends" && (
                  <span className="text-fg-3" title="Friends">
                    <Users size={15} aria-label="Friends" />
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      {others.length === 0 && (
        <p className="t-small border-t border-line px-5 py-4">No one else is on the board yet. Invite a friend to get it going.</p>
      )}
      {!visible && (
        <div className="flex items-center gap-3 border-t border-line px-5 py-4">
          <p className="t-small flex-1">You&apos;re hidden, so others can&apos;t see you here.</p>
          <Button size="sm" variant="secondary" onClick={onShowMe}>
            Show me
          </Button>
        </div>
      )}
    </>
  );
}

const FEED_ICON = { lesson: BookOpen, workout: Dumbbell, streak: Flame } as const;

function Feed({ items, uid, now }: { items: FeedItem[]; uid: string; now: number }) {
  return (
    <Card title="Activity">
      {items.length === 0 ? (
        <p className="t-small px-5 py-8 text-center">Finished lessons, workouts and streaks from you and your friends show up here.</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => {
            const Icon = FEED_ICON[item.kind] ?? Dumbbell;
            const who = item.user_id === uid ? "You" : nameOf(item.profile);
            return (
              <li key={item.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-fg-2">
                  <Icon size={16} aria-hidden className={cn(item.kind === "streak" && "text-accent")} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] leading-snug text-fg-2">
                    <span className="font-semibold text-fg">{who}</span>{" "}
                    {item.kind === "lesson" && "completed "}
                    {item.kind === "workout" && "finished "}
                    {item.kind === "streak" && (who === "You" ? "are on a " : "is on a ")}
                    <span className="font-semibold text-fg">{item.title}</span>
                  </p>
                  <p className="t-micro mt-1">
                    {timeAgo(item.created_at, now)}
                    {item.xp > 0 && ` · +${item.xp} XP`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function Notice({
  icon,
  title,
  description,
  onRetry,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onRetry: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col items-center rounded-[var(--radius)] border border-dashed border-line-2 px-6 py-12 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-fg-2">{icon}</span>
      <p className="t-heading">{title}</p>
      <p className="t-small mt-2 max-w-[40ch]">{description}</p>
      <Button
        variant="secondary"
        size="sm"
        className="mt-5"
        loading={busy}
        icon={<RefreshCw size={14} aria-hidden />}
        onClick={async () => {
          setBusy(true);
          await onRetry();
          setBusy(false);
        }}
      >
        Try again
      </Button>
    </div>
  );
}

function FriendsSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12" aria-busy="true" aria-label="Loading friends">
      <div className="space-y-4 lg:order-2 lg:col-span-5">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="space-y-4 lg:order-1 lg:col-span-7">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
