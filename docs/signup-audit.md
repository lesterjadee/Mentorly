# Supabase signup audit and repair

Project: `mentorly` / `gylktjkkkkazzbnskotg`. Investigation: October 8, 2026 (Asia/Shanghai).

## Root cause and evidence

Auth logs for failed `POST /signup` requests, including `2026-10-07T15:12:40Z`, report:

```text
ERROR: new row for relation "users" violates check constraint "users_role_check" (SQLSTATE 23514)
```

The later `25P02` transaction-aborted error is a consequence. The original failure is `23514`.

The only non-internal trigger on `auth.users` is `on_auth_user_created`, an AFTER INSERT trigger calling `public.handle_new_user()`. Its insert copied `raw_user_meta_data.role`, defaulting to `student`. The frontend sent `student` for regular students and `specs` for members. Both violate the existing constraint, which permits only `learner`, `tutor`, and `both`. The failing trigger statement was reproduced directly against the live schema; the failed transaction retained no test account.

Supabase documents this class of failure in its [database error troubleshooting guide](https://supabase.com/docs/guides/troubleshooting/database-error-saving-new-user-RU_EwB) and [Auth profile trigger guide](https://supabase.com/docs/guides/auth/managing-user-data).

## Frontend transaction trace

`src/app/(auth)/register/page.tsx` is a Client Component. Its three steps collect full name, college email/password, an optional invite code, and agreement to terms. School and course are fixed to Gordon College and Computer Science. No student-number/year-level fields are collected. There is no signup server action or API route.

Previously `auth.signUp()` sent this metadata through `options.data`:

```ts
{
  full_name: fullName,
  school: 'Gordon College',
  course: 'Computer Science',
  role: isSpecsMember ? 'specs' : 'student',
  is_specs_member: isSpecsMember,
}
```

The snake_case name/school/course fields matched the trigger. The role values did not match the schema. The invite code itself was never sent to Auth.

Invite verification previously SELECTed `specs_settings.invite_code` anonymously, but its SELECT policy allowed only `authenticated`. Member signup also slept 1.5 seconds, called `getUser()`, and attempted a profile UPDATE. Email confirmation is enabled, so signup returns no session; this update was unreliable and its error was ignored. It did not create a duplicate profile, but it duplicated membership assignment outside the Auth transaction.

The corrected metadata is:

```ts
{
  full_name: fullName.trim(),
  school: 'Gordon College',
  course: 'Computer Science',
  ...(inviteCode.trim() ? { specs_invite_code: inviteCode.trim() } : {}),
}
```

Email is trimmed/lowercased and validated against the exact college domain. A nonempty invite code is validated through the boolean RPC both when requested and immediately before signup. Invalid codes block the frontend signup request. The trigger independently verifies the code. Direct API requests with an invalid/missing code receive an ordinary learner profile, never membership. Client-controlled role/member/officer flags are ignored.

## Schema and permissions

Signup uses `auth.users`, `public.users`, and `public.specs_settings`. There are no separate `profiles`, membership, student, or role tables in this project's public schema.

`public.users` has an `id` primary key and an FK to `auth.users(id)` with ON DELETE CASCADE. `full_name`, `email`, and `updated_at` are NOT NULL. The first two are supplied by the trigger, with an email-local-part fallback for a missing name. `updated_at` retains its existing UTC default. Role is text with a default of `learner` and the three-value CHECK above. Membership defaults to false; `specs_role` is nullable. No relevant enum, generated field, or email unique constraint blocks signup. No non-internal trigger runs on `public.users` or `specs_settings`. The unrelated review trigger does not run during signup.

`specs_settings` contains the existing id=1 row with a nonempty shared invite code. Its integer id is the PK and invite_code is NOT NULL. No invite/membership data was changed.

The trigger was already SECURITY DEFINER, owned by postgres. The fix retains the required privileged trigger execution, sets an empty search_path, qualifies application tables/functions, and revokes direct client execution. It inserts exactly one profile within the Auth transaction and returns NEW. The old upsert that could overwrite a profile has been removed.

RLS remains enabled. Existing authenticated profile SELECT access remains. Clients cannot INSERT profiles or UPDATE membership/role fields; authenticated users can UPDATE only full_name, school, course, bio, and avatar_url under the ownership policy. `users_update_own` now includes both USING and WITH CHECK. `settings_read` now allows existing SPECS officers to read the stored code. Signup uses `validate_specs_invite(text)`, which intentionally exposes only a boolean to anon/authenticated and has an empty search_path.

## Applied migrations

Both migrations are applied to the live Supabase project. Local version numbers match Supabase migration history:

- `20261007155029_fix_atomic_signup_profile.sql`: replaces `handle_new_user`; adds `validate_specs_invite`; limits profile writes and strengthens `users_update_own`.
- `20261007160040_restrict_specs_invite_visibility.sql`: limits `settings_read` to SPECS officers.

The `on_auth_user_created` trigger itself and `users_role_check` remain unchanged. Existing rows, tables, accounts, profiles, and settings were preserved. These migrations patch the existing database; they are not a fresh-database schema bootstrap.

## Verification

| Check | Result |
| --- | --- |
| Real Auth signup, regular student | HTTP 200; one Auth user and one `learner` profile, membership false |
| Real Auth signup, valid SPECS invite | HTTP 200; one profile, role `both`, membership true, specs_role `member` |
| Anonymous invite RPC: valid/invalid/empty | HTTP 200 with true/false/false |
| Invalid invite in browser | Validation error shown; no signup submitted |
| Valid invite in browser | Membership confirmation shown |
| Non-college email in browser | Continue disabled and college-domain error shown |
| Missing optional metadata | Database trigger passes; third HTTP signup hit existing email-send limit (429) |
| Malformed member flags / arbitrary role / officer claim | Database trigger passes and grants no membership |
| Backend non-college email | Rejected atomically; no orphan |
| Confirmed fixture sign-in, regular and member | Password sign-in succeeds; authenticated profile access succeeds |
| Profile edit / membership escalation | Personal edit succeeds; direct membership/officer update rejected |
| Browser login/dashboard | Regular and member account flows verified separately using confirmed test fixtures |
| SQL regression checks | `supabase/tests/signup.sql` passes; all fixtures rolled back |
| TypeScript / signup-page ESLint / production build / diff whitespace | Pass |

The real Auth signups required email confirmation and returned no session. To verify sign-in without using a real college inbox or consuming further email quota, separate confirmed fixtures were inserted with only synthetic test credentials and removed after verification. No existing real user's password was available, so their sign-in was not directly exercised. The preexisting profile was checked for exact preservation with a whole-row hash.

Auth logs for the two successful signup requests record status 200 and no role-check/500 failure after the fix. The third request records `over_email_send_rate_limit`, a separate quota limitation. No email-auth settings were changed to bypass it.

Temporary accounts are uniquely tagged and cleanup matches both that marker and exact synthetic emails. API test sessions were signed out; deletion cascaded to profiles/identities/sessions. Final database counts match the baseline: one real Auth user, one profile, zero orphaned users, and the preexisting profile hash unchanged.

Security advisors still flag the boolean invite RPC's deliberate SECURITY DEFINER exposure. This is required for pre-login validation; it reads only the single settings row, returns no stored code, and performs no writes. Preexisting advisory findings for the unrelated review function's search_path/execution grants and disabled leaked-password protection were not changed as part of this signup fix.

## Deployment status

The live database repair is applied. Frontend changes are local and require deployment to the existing Vercel application. Older deployed clients do not send `specs_invite_code`; they can register regular accounts after the trigger fix, but cannot gain SPECS membership through their old client flags. Deploy the updated frontend to complete the member signup rollout. This repository was not committed, pushed, or deployed by this task.
