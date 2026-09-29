# La Passion Travel

Next.js + TypeScript + Tailwind v4 + Supabase.

## Run locally
1. `npm install`
2. `cp .env.example .env.local`, then fill in the values
3. Run `supabase/schema.sql` in the Supabase SQL Editor
4. `npm run dev`

## Supabase staff access

Run [supabase/schema.sql](supabase/schema.sql) in the SQL Editor as the project owner. It creates `profiles`, upgrades `leads` without removing existing lead data, and replaces policies on those two tables with staff-only RLS. Keep the `private` schema out of Supabase API exposed schemas.

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Supabase Auth, plus the server-only `SUPABASE_SERVICE_ROLE_KEY` for public lead submissions. The optional server-only `SUPABASE_URL` can use the same project URL. After provisioning a staff account, sign in at `/admin/login`; `/admin/leads` provides traffic and status filters, and each lead has a detail page for assignment, status, and notes. There is no public sign-up page.

Create each sales/admin account in Supabase **Authentication → Users** with an email and password (or an invitation). Then provision that Auth user's profile in the SQL Editor; an Auth account without a profile cannot read leads. For the first admin, replace these example values with the real account details:

```sql
insert into public.profiles (id, email, full_name, role)
select id, email, 'Admin Name', 'admin'
from auth.users
where lower(email) = lower('admin@example.com');

select id, email, full_name, role
from public.profiles
where lower(email) = lower('admin@example.com');
```

Use the same process with role `sales` for sales accounts. The profile insert must return a row when verified; if it does not, check that the Auth account exists and its email matches. Only the project owner/service role may add profiles or change roles. Never use a `NEXT_PUBLIC_` prefix for `SUPABASE_SERVICE_ROLE_KEY`.

Before using the dashboard, verify against the Supabase project with its publishable key and actual signed-in sessions:

1. As an anonymous visitor, `SELECT` from `leads` fails; the public form still submits through `/api/leads`.
2. As an Auth user without a profile, `SELECT` from `leads` returns no rows, and profile writes fail.
3. As a provisioned `sales` user, the lead list and staff profile names are visible; updating `status`, `assigned_to`, and `sales_note` works.
4. As that sales user, updating `profiles.role` or a customer field such as `leads.full_name` fails.

Deleting an Auth user deletes their profile and clears their lead assignments. If a staff member's Auth email changes, update the matching `profiles.email` from the SQL Editor as well.

## Checks
`npm run typecheck && npm run test && npm run build`

## Deploy
Push to GitHub → import the repository into Vercel → set the environment variables under Settings → Environment Variables.
Use `SUPABASE_SERVICE_ROLE_KEY` and `LEAD_WEBHOOK_*` only on the server.

## Attribution
- `lib/attribution/capture.ts`: reads UTM parameters, click IDs, and referrers
- `lib/attribution/storage.ts`: records first touch once and updates last touch only when a marketing signal is present (key: `lp_attribution_v1`)
- `lib/attribution/classify.ts`: classifies paid, organic, direct, and referral traffic
- The server recalculates `traffic_type` and `traffic_channel` from first touch instead of trusting the client

## Change images or steps
- Images: `lib/journey-config.ts` (`IMAGES`)
- Steps and options: `lib/journey-config.ts` and `components/journey/JourneyBuilder.tsx`
# la-passion-travel
