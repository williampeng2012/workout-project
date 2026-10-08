-- Friends: usernames + friend codes, friendships, activity feed, weekly leaderboard.
-- Run after 20260807000000_pulsepath_core.sql.

-- ─────────────────────────────────────────────────────────────
-- Profiles: public handle + shareable friend code
-- ─────────────────────────────────────────────────────────────

-- 8 chars from an unambiguous alphabet (no 0/O, 1/I). Uses uuid bytes so it
-- doesn't depend on which schema pgcrypto lives in.
create or replace function public.gen_friend_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
  picks constant int[] := array[0, 1, 2, 3, 4, 5, 10, 11];
  code text := '';
  i int;
begin
  foreach i in array picks loop
    code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return code;
end;
$$;

alter table public.profiles
  add column if not exists username text,
  add column if not exists friend_code text not null default public.gen_friend_code();

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9_]{3,20}$');

create unique index if not exists profiles_username_key on public.profiles (username);
create unique index if not exists profiles_friend_code_key on public.profiles (friend_code);

-- Pick up the Google display name for new OAuth users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Friendships (one row per pair, either direction)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id)
);

create unique index if not exists friendships_pair_key
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_addressee_idx on public.friendships (addressee_id, status);
create index if not exists friendships_requester_idx on public.friendships (requester_id, status);

create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester_id = a and addressee_id = b) or (requester_id = b and addressee_id = a))
  );
$$;

-- Friends or a pending request either way: enough to see each other's name.
create or replace function public.is_connected(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships
    where (requester_id = a and addressee_id = b) or (requester_id = b and addressee_id = a)
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Activity: feed items + XP ledger for the weekly leaderboard.
-- kind = 'xp' rows only carry XP (habits, bonuses) and are hidden from the feed.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('lesson', 'workout', 'streak', 'xp')),
  title text check (char_length(title) <= 120),
  xp integer not null default 0 check (xp between 0 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists activities_user_created_idx
  on public.activities (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table public.friendships enable row level security;
alter table public.activities enable row level security;

drop policy if exists "profiles_select_connected" on public.profiles;
create policy "profiles_select_connected" on public.profiles
  for select using (public.is_connected(auth.uid(), id));

-- Inserts/accepts go through the functions below so nobody can forge an
-- accepted friendship; members may read or delete (unfriend / cancel / decline).
drop policy if exists "friendships_select_member" on public.friendships;
create policy "friendships_select_member" on public.friendships
  for select using (auth.uid() in (requester_id, addressee_id));

drop policy if exists "friendships_delete_member" on public.friendships;
create policy "friendships_delete_member" on public.friendships
  for delete using (auth.uid() in (requester_id, addressee_id));

drop policy if exists "activities_select_self_or_friends" on public.activities;
create policy "activities_select_self_or_friends" on public.activities
  for select using (user_id = auth.uid() or public.are_friends(auth.uid(), user_id));

drop policy if exists "activities_insert_own" on public.activities;
create policy "activities_insert_own" on public.activities
  for insert with check (user_id = auth.uid());

drop policy if exists "activities_delete_own" on public.activities;
create policy "activities_delete_own" on public.activities
  for delete using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- RPCs
-- ─────────────────────────────────────────────────────────────

-- Relationship of the caller to `other`.
create or replace function public.relation_to(other uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when other = auth.uid() then 'self'
    when exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and ((f.requester_id = auth.uid() and f.addressee_id = other)
          or (f.requester_id = other and f.addressee_id = auth.uid()))
    ) then 'friends'
    when exists (
      select 1 from public.friendships f
      where f.status = 'pending' and f.requester_id = auth.uid() and f.addressee_id = other
    ) then 'outgoing'
    when exists (
      select 1 from public.friendships f
      where f.status = 'pending' and f.requester_id = other and f.addressee_id = auth.uid()
    ) then 'incoming'
    else 'none'
  end;
$$;

-- Exact (case-insensitive) match only, so usernames can't be enumerated.
create or replace function public.find_profile_by_username(p_username text)
returns table (id uuid, username text, display_name text, level integer, relation text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.username, p.display_name, p.level, public.relation_to(p.id)
  from public.profiles p
  where auth.uid() is not null
    and p.username = lower(trim(both '@ ' from p_username));
$$;

create or replace function public.send_friend_request(p_target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  existing public.friendships;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if p_target = me then return 'self'; end if;
  if not exists (select 1 from public.profiles where id = p_target) then return 'not_found'; end if;

  select * into existing from public.friendships
  where (requester_id = me and addressee_id = p_target) or (requester_id = p_target and addressee_id = me);

  if found then
    if existing.status = 'accepted' then return 'already_friends'; end if;
    if existing.requester_id = me then return 'already_requested'; end if;
    -- They already asked us: sending back means yes.
    update public.friendships set status = 'accepted', responded_at = now() where id = existing.id;
    return 'accepted';
  end if;

  insert into public.friendships (requester_id, addressee_id) values (me, p_target);
  return 'requested';
end;
$$;

create or replace function public.respond_friend_request(p_request uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_accept then
    update public.friendships
    set status = 'accepted', responded_at = now()
    where id = p_request and addressee_id = auth.uid() and status = 'pending';
  else
    delete from public.friendships
    where id = p_request and addressee_id = auth.uid() and status = 'pending';
  end if;
end;
$$;

-- Sharing your code/link is the consent, so this connects immediately.
create or replace function public.add_friend_by_code(p_code text)
returns table (id uuid, display_name text, username text, result text)
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  target public.profiles;
  existing public.friendships;
  outcome text;
begin
  if me is null then raise exception 'not authenticated'; end if;

  select * into target from public.profiles p
  where p.friend_code = upper(regexp_replace(p_code, '[^A-Za-z0-9]', '', 'g'));
  if not found then
    return query select null::uuid, null::text, null::text, 'not_found'::text;
    return;
  end if;

  if target.id = me then
    outcome := 'self';
  else
    select * into existing from public.friendships f
    where (f.requester_id = me and f.addressee_id = target.id)
       or (f.requester_id = target.id and f.addressee_id = me);
    if found and existing.status = 'accepted' then
      outcome := 'already_friends';
    elsif found then
      update public.friendships set status = 'accepted', responded_at = now() where friendships.id = existing.id;
      outcome := 'added';
    else
      insert into public.friendships (requester_id, addressee_id, status, responded_at)
      values (me, target.id, 'accepted', now());
      outcome := 'added';
    end if;
  end if;

  return query select target.id, target.display_name, target.username, outcome;
end;
$$;

create or replace function public.regenerate_friend_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  code text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  loop
    code := public.gen_friend_code();
    exit when not exists (select 1 from public.profiles where friend_code = code);
  end loop;
  update public.profiles set friend_code = code where id = auth.uid();
  return code;
end;
$$;

-- Caller + accepted friends with XP earned since `p_since` (start of the week).
create or replace function public.friend_overview(p_since timestamptz)
returns table (
  id uuid,
  username text,
  display_name text,
  level integer,
  xp integer,
  streak_count integer,
  streak_updated_on date,
  weekly_xp integer,
  is_self boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with people as (
    select auth.uid() as pid
    union
    select case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
    from public.friendships f
    where f.status = 'accepted' and auth.uid() in (f.requester_id, f.addressee_id)
  )
  select
    p.id, p.username, p.display_name, p.level, p.xp, p.streak_count, p.streak_updated_on,
    coalesce((
      select sum(a.xp) from public.activities a
      where a.user_id = p.id and a.created_at >= p_since
    ), 0)::integer,
    p.id = auth.uid()
  from people
  join public.profiles p on p.id = people.pid
  where auth.uid() is not null
  order by 8 desc, p.xp desc;
$$;

-- are_friends / is_connected stay executable by everyone: RLS policies call
-- them for any role, and they only answer yes/no.
revoke execute on function
  public.gen_friend_code(),
  public.relation_to(uuid),
  public.find_profile_by_username(text),
  public.send_friend_request(uuid),
  public.respond_friend_request(uuid, boolean),
  public.add_friend_by_code(text),
  public.regenerate_friend_code(),
  public.friend_overview(timestamptz)
from public, anon;

grant execute on function
  public.gen_friend_code(),
  public.relation_to(uuid),
  public.find_profile_by_username(text),
  public.send_friend_request(uuid),
  public.respond_friend_request(uuid, boolean),
  public.add_friend_by_code(text),
  public.regenerate_friend_code(),
  public.friend_overview(timestamptz)
to authenticated;
