-- Anonymous signup verifies guesses through the boolean RPC; it never reads
-- the stored code. Preserve settings access for existing SPECS officers.
alter policy settings_read on public.specs_settings
  to authenticated
  using (exists (
    select 1 from public.users u
    where u.id = (select auth.uid())
      and u.is_specs_member is true
      and u.specs_role = 'officer'
  ));
