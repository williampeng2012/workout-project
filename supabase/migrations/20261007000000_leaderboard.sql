-- Global leaderboard (opt-out), friend profiles, and column-level profile privacy.
-- Run after 20260930000000_friends.sql. Safe to re-run.

alter table public.profiles
  add column if not exists show_on_leaderboard boolean not null default true;

-- ─────────────────────────────────────────────────────────────
-- Column privacy: RLS decides which rows you see, these grants decide which
-- columns. friend_code is a bearer token (it adds you instantly), so nobody can
-- select it directly — not even the owner, who reads it through my_profile().
-- ─────────────────────────────────────────────────────────────
revoke select on public.profiles from public, anon, authenticated;
grant select (id, username, display_name, level, xp, streak_count, streak_updated_on, show_on_leaderboard, created_at)
  on public.profiles to authenticated;

create or replace function public.my_profile()
returns table (id uuid, username text, display_name text, friend_code text, show_on_leaderboard boolean)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.username, p.display_name, p.friend_code, p.show_on_leaderboard
  from public.profiles p
  where p.id = auth.uid();
$$;

-- ─────────────────────────────────────────────────────────────
-- Everyone leaderboard: weekly XP across all visible users. Strangers only get
-- name, handle, level and XP. The caller is always included (rank is null when
-- they've hidden themselves).
-- ─────────────────────────────────────────────────────────────
drop function if exists public.global_leaderboard(timestamptz, integer);
create function public.global_leaderboard(p_since timestamptz, p_limit integer default 50)
returns table (
  id uuid,
  username text,
  display_name text,
  level integer,
  xp integer,
  weekly_xp integer,
  rank integer,
  relation text,
  is_self boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with weekly as (
    select a.user_id, sum(a.xp)::integer as wxp
    from public.activities a
    where a.created_at >= p_since
    group by a.user_id
  ),
  board as (
    select
      p.id, p.username, p.display_name, p.level, p.xp, p.show_on_leaderboard,
      coalesce(w.wxp, 0) as weekly_xp
    from public.profiles p
    left join weekly w on w.user_id = p.id
    where p.show_on_leaderboard or p.id = auth.uid()
  ),
  ranked as (
    select b.*,
      case when b.show_on_leaderboard
        then (row_number() over (partition by b.show_on_leaderboard order by b.weekly_xp desc, b.xp desc, b.id))::integer
      end as rnk
    from board b
  )
  select r.id, r.username, r.display_name, r.level, r.xp, r.weekly_xp, r.rnk,
    public.relation_to(r.id), r.id = auth.uid()
  from ranked r
  where auth.uid() is not null
    and (r.rnk <= least(greatest(coalesce(p_limit, 50), 1), 100) or r.id = auth.uid())
  order by r.rnk nulls last, r.id;
$$;

-- ─────────────────────────────────────────────────────────────
-- Friend profile: full stats for yourself or an accepted friend, nothing otherwise.
-- ─────────────────────────────────────────────────────────────
drop function if exists public.friend_profile(uuid, timestamptz);
create function public.friend_profile(p_user uuid, p_since timestamptz)
returns table (
  id uuid,
  username text,
  display_name text,
  level integer,
  xp integer,
  streak_count integer,
  streak_updated_on date,
  weekly_xp integer,
  sessions integer,
  sessions_this_week integer,
  joined_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id, p.username, p.display_name, p.level, p.xp, p.streak_count, p.streak_updated_on,
    coalesce((select sum(a.xp) from public.activities a
      where a.user_id = p.id and a.created_at >= p_since), 0)::integer,
    (select count(*) from public.activities a
      where a.user_id = p.id and a.kind in ('lesson', 'workout'))::integer,
    (select count(*) from public.activities a
      where a.user_id = p.id and a.kind in ('lesson', 'workout') and a.created_at >= p_since)::integer,
    p.created_at
  from public.profiles p
  where p.id = p_user
    and auth.uid() is not null
    and (p.id = auth.uid() or public.are_friends(auth.uid(), p.id));
$$;

revoke execute on function
  public.my_profile(),
  public.global_leaderboard(timestamptz, integer),
  public.friend_profile(uuid, timestamptz)
from public, anon;

grant execute on function
  public.my_profile(),
  public.global_leaderboard(timestamptz, integer),
  public.friend_profile(uuid, timestamptz)
to authenticated;
