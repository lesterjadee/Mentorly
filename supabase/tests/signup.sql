-- Run against the linked project after the signup migration. All fixtures roll back.
begin;
do $$
declare
  test_id uuid;
  test_email text;
  valid_code text;
  scenario record;
  profile public.users%rowtype;
begin
  select invite_code into strict valid_code from public.specs_settings where id = 1;
  for scenario in
    select * from (values
      ('regular', '{"full_name":"Signup audit","role":"student","is_specs_member":false}'::jsonb, false),
      ('member', jsonb_build_object('full_name','Signup audit','specs_invite_code',valid_code), true),
      ('invalid_code', '{"specs_invite_code":"CODEX_INVALID_CODE","role":"specs","is_specs_member":true,"specs_role":"officer"}'::jsonb, false),
      ('optional_missing', '{}'::jsonb, false),
      ('malformed_flags', '{"role":"admin","is_specs_member":"not-a-boolean"}'::jsonb, false)
    ) as cases(name, metadata, expected_member)
  loop
    test_id := gen_random_uuid();
    test_email := 'codex-signup-' || test_id::text || '@gordoncollege.edu.ph';
    insert into auth.users (id, email, raw_user_meta_data) values (test_id, test_email, scenario.metadata);
    select * into strict profile from public.users where id = test_id;
    if profile.is_specs_member is distinct from scenario.expected_member
      or profile.role is distinct from (case when scenario.expected_member then 'both' else 'learner' end)
      or profile.specs_role is distinct from (case when scenario.expected_member then 'member' else null end)
      or profile.full_name is null or profile.email <> test_email then
      raise exception 'Signup scenario % failed', scenario.name;
    end if;
  end loop;

  -- Backend domain enforcement rejects bypasses and rolls back the Auth insert.
  test_id := gen_random_uuid();
  begin
    insert into auth.users (id, email) values (test_id, 'codex-test@example.com');
    raise exception 'Non-college email was accepted';
  exception when check_violation then
    if exists (select 1 from auth.users where id = test_id) then
      raise exception 'Rejected signup left an orphaned Auth user';
    end if;
  end;

  if has_table_privilege('authenticated', 'public.users', 'INSERT')
    or has_column_privilege('authenticated', 'public.users', 'is_specs_member', 'UPDATE')
    or has_column_privilege('authenticated', 'public.users', 'specs_role', 'UPDATE')
    or not has_column_privilege('authenticated', 'public.users', 'bio', 'UPDATE') then
    raise exception 'Profile column permissions are incorrect';
  end if;

  set local role anon;
  if public.validate_specs_invite(valid_code) is distinct from true
    or public.validate_specs_invite('CODEX_INVALID_CODE') is distinct from false
    or public.validate_specs_invite(null) is distinct from false then
    raise exception 'Anonymous invite validation failed';
  end if;
  reset role;

  -- A regular signed-in user cannot discover the stored shared invite code.
  perform set_config('request.jwt.claims', jsonb_build_object('sub', test_id, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if exists (select 1 from public.specs_settings) then
    raise exception 'Regular student can read the stored invite code';
  end if;
  reset role;
end;
$$;
rollback;
