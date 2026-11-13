-- Sillage accounts: every person's wardrobe is theirs alone. The curated catalogue
-- is readable by anyone and written only by the service role.

create table if not exists public.catalogue (
  id text primary key,
  house text not null,
  name text not null,
  notes text[] not null default '{}',
  family text,
  colour text,
  profile jsonb,          -- the hand-authored scent profile; never generated
  bottle jsonb            -- the bottle's form, from the brand's photos
);

create table if not exists public.wardrobe (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  scent_id text not null,
  ownership text not null check (ownership in ('owned', 'finished', 'wishlist')),
  score smallint check (score between 0 and 10),
  updated_at timestamptz not null default now(),
  primary key (user_id, scent_id)
);

create table if not exists public.wears (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  scent_id text not null,
  day date not null,
  primary key (user_id, scent_id, day)
);

create table if not exists public.own_bottles (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  id text not null,
  house text not null check (char_length(house) between 2 and 40),
  name text not null check (char_length(name) between 2 and 60),
  notes text[] not null default '{}',
  added_on date not null default current_date,
  primary key (user_id, id)
);

alter table public.catalogue enable row level security;
alter table public.wardrobe enable row level security;
alter table public.wears enable row level security;
alter table public.own_bottles enable row level security;

drop policy if exists "catalogue is public" on public.catalogue;
create policy "catalogue is public" on public.catalogue for select to anon, authenticated using (true);

drop policy if exists "own wardrobe" on public.wardrobe;
create policy "own wardrobe" on public.wardrobe for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "own wears" on public.wears;
create policy "own wears" on public.wears for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "own bottles" on public.own_bottles;
create policy "own bottles" on public.own_bottles for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select on public.catalogue to anon, authenticated;
grant select, insert, update, delete on public.wardrobe, public.wears, public.own_bottles to authenticated;

-- Apple requires that an account can be deleted from inside the app.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
