"use client";

import type { PostgrestError, SupabaseClient, User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Friends data layer (see supabase/migrations/20260930000000_friends.sql).
 * Untyped client: the generated `Database` type doesn't cover these tables/RPCs.
 */
function db(): SupabaseClient {
  return createClient() as unknown as SupabaseClient;
}

export type PublicProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
};

export type MyProfile = PublicProfile & { friend_code: string; show_on_leaderboard: boolean };

export type Relation = "self" | "friends" | "outgoing" | "incoming" | "none";

export type FoundProfile = PublicProfile & { level: number; relation: Relation };

export type OverviewRow = PublicProfile & {
  level: number;
  xp: number;
  streak_count: number;
  streak_updated_on: string | null;
  weekly_xp: number;
  is_self: boolean;
};

export type FeedItem = {
  id: string;
  user_id: string;
  kind: "lesson" | "workout" | "streak";
  title: string | null;
  xp: number;
  created_at: string;
  profile: Pick<PublicProfile, "display_name" | "username"> | null;
};

export type FriendRequest = {
  id: string;
  created_at: string;
  direction: "incoming" | "outgoing";
  other: PublicProfile;
};

export class SocialError extends Error {
  constructor(
    message: string,
    /** `setup`: the friends migration hasn't been applied to this project yet. */
    readonly kind: "setup" | "taken" | "invalid" | "auth" | "other" = "other",
  ) {
    super(message);
  }
}

function fail(error: PostgrestError | null): never | void {
  if (!error) return;
  if (error.code === "PGRST205" || error.code === "PGRST202" || error.code === "42P01" || error.code === "42883") {
    throw new SocialError("Friends isn't set up in the database yet.", "setup");
  }
  if (error.code === "23505") throw new SocialError("That username is taken.", "taken");
  if (error.code === "23514") throw new SocialError("Use 3–20 lowercase letters, numbers or _.", "invalid");
  throw new SocialError(error.message);
}

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(input: string): string {
  return input.trim().replace(/^@+/, "").toLowerCase();
}

/** 8-char friend code, dash optional, any case. */
export function parseFriendCode(input: string): string | null {
  const clean = input.trim().replace(/[\s-]/g, "").toUpperCase();
  return /^[A-Z0-9]{8}$/.test(clean) ? clean : null;
}

export function formatFriendCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export function inviteUrl(code: string): string {
  return `${window.location.origin}/invite/${code}`;
}

/** Monday 00:00 in the viewer's timezone. */
export function startOfWeek(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/** Name from the auth provider (Google full name, sign-up name, or email prefix). */
export function accountName(user: User): string {
  const meta = user.user_metadata ?? {};
  const name = meta.display_name || meta.full_name || meta.name || user.email?.split("@")[0] || "";
  return String(name).trim().slice(0, 60);
}

export async function currentUser(): Promise<{ id: string; name: string } | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await db().auth.getUser();
  return data.user ? { id: data.user.id, name: accountName(data.user) } : null;
}

/** Create the profile row if the signup trigger never ran for this user. */
export async function ensureProfile(uid: string, displayName?: string): Promise<void> {
  const row: Record<string, unknown> = { id: uid };
  if (displayName) row.display_name = displayName;
  const { error } = await db().from("profiles").upsert(row, { onConflict: "id", ignoreDuplicates: true });
  fail(error);
}

/** friend_code isn't selectable on `profiles`; the owner reads it through this RPC. */
export async function fetchMe(): Promise<MyProfile | null> {
  const { data, error } = await db().rpc("my_profile");
  fail(error);
  return ((data as MyProfile[] | null) ?? [])[0] ?? null;
}

export async function setLeaderboardVisibility(uid: string, show: boolean): Promise<void> {
  const { error } = await db().from("profiles").update({ show_on_leaderboard: show }).eq("id", uid);
  fail(error);
}

export async function setUsername(uid: string, raw: string): Promise<string> {
  const username = normalizeUsername(raw);
  if (!USERNAME_RE.test(username)) {
    throw new SocialError("Use 3–20 lowercase letters, numbers or _.", "invalid");
  }
  const { error } = await db().from("profiles").update({ username }).eq("id", uid);
  fail(error);
  return username;
}

export async function findByUsername(raw: string): Promise<FoundProfile | null> {
  const { data, error } = await db().rpc("find_profile_by_username", { p_username: normalizeUsername(raw) });
  fail(error);
  return ((data as FoundProfile[] | null) ?? [])[0] ?? null;
}

export type SendResult = "requested" | "accepted" | "already_friends" | "already_requested" | "self" | "not_found";

export async function sendFriendRequest(targetId: string): Promise<SendResult> {
  const { data, error } = await db().rpc("send_friend_request", { p_target: targetId });
  fail(error);
  return data as SendResult;
}

export async function respondToRequest(requestId: string, accept: boolean): Promise<void> {
  const { error } = await db().rpc("respond_friend_request", { p_request: requestId, p_accept: accept });
  fail(error);
}

export async function cancelRequest(requestId: string): Promise<void> {
  const { error } = await db().from("friendships").delete().eq("id", requestId);
  fail(error);
}

export async function removeFriend(me: string, other: string): Promise<void> {
  const { error } = await db()
    .from("friendships")
    .delete()
    .or(`and(requester_id.eq.${me},addressee_id.eq.${other}),and(requester_id.eq.${other},addressee_id.eq.${me})`);
  fail(error);
}

export type AddByCodeResult = {
  result: "added" | "already_friends" | "self" | "not_found";
  friend: PublicProfile | null;
};

export async function addFriendByCode(code: string): Promise<AddByCodeResult> {
  const { data, error } = await db().rpc("add_friend_by_code", { p_code: code });
  fail(error);
  const row = ((data as (PublicProfile & { result: AddByCodeResult["result"] })[] | null) ?? [])[0];
  if (!row) return { result: "not_found", friend: null };
  return {
    result: row.result,
    friend: row.id ? { id: row.id, username: row.username, display_name: row.display_name } : null,
  };
}

export async function regenerateFriendCode(): Promise<string> {
  const { data, error } = await db().rpc("regenerate_friend_code");
  fail(error);
  return data as string;
}

export async function fetchOverview(): Promise<OverviewRow[]> {
  const { data, error } = await db().rpc("friend_overview", { p_since: startOfWeek().toISOString() });
  fail(error);
  return (data as OverviewRow[] | null) ?? [];
}

export type GlobalRow = PublicProfile & {
  level: number;
  xp: number;
  weekly_xp: number;
  /** Null for the caller when they've hidden themselves. */
  rank: number | null;
  relation: Relation;
  is_self: boolean;
};

export async function fetchGlobalBoard(limit = 50): Promise<GlobalRow[]> {
  const { data, error } = await db().rpc("global_leaderboard", { p_since: startOfWeek().toISOString(), p_limit: limit });
  fail(error);
  return (data as GlobalRow[] | null) ?? [];
}

export type FriendProfile = PublicProfile & {
  level: number;
  xp: number;
  streak_count: number;
  streak_updated_on: string | null;
  weekly_xp: number;
  sessions: number;
  sessions_this_week: number;
  joined_at: string;
};

/** Null unless `id` is you or an accepted friend. */
export async function fetchFriendProfile(id: string): Promise<FriendProfile | null> {
  const { data, error } = await db().rpc("friend_profile", { p_user: id, p_since: startOfWeek().toISOString() });
  fail(error);
  return ((data as FriendProfile[] | null) ?? [])[0] ?? null;
}

export async function fetchUserFeed(id: string, limit = 8): Promise<FeedItem[]> {
  const { data, error } = await db()
    .from("activities")
    .select("id, user_id, kind, title, xp, created_at, profile:profiles(display_name, username)")
    .eq("user_id", id)
    .neq("kind", "xp")
    .order("created_at", { ascending: false })
    .limit(limit);
  fail(error);
  return (data as unknown as FeedItem[] | null) ?? [];
}

export async function fetchFeed(limit = 30): Promise<FeedItem[]> {
  const { data, error } = await db()
    .from("activities")
    .select("id, user_id, kind, title, xp, created_at, profile:profiles(display_name, username)")
    .neq("kind", "xp")
    .order("created_at", { ascending: false })
    .limit(limit);
  fail(error);
  return (data as unknown as FeedItem[] | null) ?? [];
}

export async function fetchRequests(me: string): Promise<FriendRequest[]> {
  const { data, error } = await db()
    .from("friendships")
    .select(
      "id, created_at, requester_id, requester:profiles!friendships_requester_id_fkey(id, username, display_name), addressee:profiles!friendships_addressee_id_fkey(id, username, display_name)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  fail(error);
  type Row = { id: string; created_at: string; requester_id: string; requester: PublicProfile; addressee: PublicProfile };
  return ((data as unknown as Row[] | null) ?? []).map((r) => ({
    id: r.id,
    created_at: r.created_at,
    direction: r.requester_id === me ? "outgoing" : "incoming",
    other: r.requester_id === me ? r.addressee : r.requester,
  }));
}

export type ActivityInsert = { kind: "lesson" | "workout" | "streak" | "xp"; title: string | null; xp: number };

export async function upsertStats(
  uid: string,
  stats: { displayName: string; xp: number; level: number; streakCount: number; streakUpdatedOn: string | null },
): Promise<void> {
  const row: Record<string, unknown> = {
    id: uid,
    xp: stats.xp,
    level: stats.level,
    streak_count: stats.streakCount,
    streak_updated_on: stats.streakUpdatedOn,
  };
  if (stats.displayName) row.display_name = stats.displayName;
  const { error } = await db().from("profiles").upsert(row, { onConflict: "id" });
  fail(error);
}

export async function insertActivities(uid: string, items: ActivityInsert[]): Promise<void> {
  if (items.length === 0) return;
  const { error } = await db()
    .from("activities")
    .insert(items.map((i) => ({ user_id: uid, kind: i.kind, title: i.title, xp: Math.min(1000, Math.max(0, i.xp)) })));
  fail(error);
}
