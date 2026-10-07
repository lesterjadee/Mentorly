-- Keep the existing learner/tutor/both constraint and all existing accounts.
-- The Auth insert trigger is the sole source of public.users rows.
create or replace function public.validate_specs_invite(invite_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.specs_settings s
    where s.id = 1
      and nullif(btrim($1), '') is not null
      and s.invite_code = btrim($1)
  );
$$;

revoke all on function public.validate_specs_invite(text) from public;
grant execute on function public.validate_specs_invite(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  member boolean;
begin
  if new.email is null or lower(new.email) !~ '^[^@[:space:]]+@gordoncollege[.]edu[.]ph$' then
    raise exception 'Only @gordoncollege.edu.ph emails are allowed.' using errcode = '23514';
  end if;

  -- User-editable role/member flags never grant membership. Check the code
  -- against the database even when the browser has already verified it.
  member := public.validate_specs_invite(new.raw_user_meta_data->>'specs_invite_code');

  insert into public.users (
    id, email, full_name, school, course, role, is_specs_member, specs_role
  ) values (
    new.id,
    new.email,
    coalesce(nullif(btrim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    coalesce(nullif(btrim(new.raw_user_meta_data->>'school'), ''), 'Gordon College'),
    coalesce(new.raw_user_meta_data->>'course', ''),
    case when member then 'both' else 'learner' end,
    member,
    case when member then 'member' else null end
  );

  return new;
end;
$$;

-- Trigger execution does not require clients to have EXECUTE permission.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Clients edit personal fields only; membership is assigned by the trigger.
-- Preserve SELECT policies and RLS, including ownership checks on UPDATE.
revoke insert, update on public.users from anon, authenticated;
grant update (full_name, school, course, bio, avatar_url) on public.users to authenticated;
alter policy users_update_own on public.users
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
