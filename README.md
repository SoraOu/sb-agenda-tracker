# Sangguniang Bayan Agenda Tracker

Static web app (vanilla HTML/JS) with a Supabase backend (Postgres + Auth + Storage + Realtime).

## Files
- `index.html` – the app
- `config.js` – your Supabase URL and anon key (the only file you need to edit)
- `supabase/schema.sql` – database table, security policies, storage bucket
- `.nojekyll` – tells GitHub Pages to serve files as-is

## Setup
1. Create a project at supabase.com (region: Singapore).
2. **SQL Editor** → paste and run `supabase/schema.sql`.
3. **Authentication → Providers → Email** → turn OFF "Allow new users to sign up" (otherwise anyone can register).
4. **Authentication → Users → Add user** → create an account for each staff member.
5. **Project Settings → API** → copy the Project URL and `anon` key into `config.js`.
6. Push to GitHub, then **Settings → Pages → Deploy from branch (main, / root)**.

## Notes
- Free Supabase projects pause after 1 week of inactivity; restore from the dashboard, or upgrade to Pro to avoid it.
- The first sign-in on a browser that has old local data will offer to import it into the cloud (only if the table is empty).
- Every signed-in user can read and edit everything. Add a roles column and tighter policies if you need view-only accounts.
