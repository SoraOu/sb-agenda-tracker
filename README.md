# Sangguniang Bayan Agenda Tracker

Static web app (vanilla HTML/JS) with a Supabase backend (Postgres + Auth + Storage + Realtime).

## Files
**Pages** (one per window; the nav bar links between them)
- `index.html` – Home (committee workload + types of documents)
- `legislative.html` – Legislative Documents register
- `barangay.html` – Barangay Documents register

**Shared code** (loaded by every page, so a fix is made once)
- `styles.css` – all styling
- `theme.js` – colour themes and light/dark mode
- `shell.js` – page header and navigation bar
- `app.js` – data, Supabase sync, alerts, tables, Add/Edit form, sign-in
- `logo.jpg` – the Sangguniang Bayan seal

**Config / backend**
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

## Adding a new page
Copy `legislative.html`, change `data-page` and the `<title>`, then add a line to the `NAV` list in `shell.js`.
Old bookmarks such as `/#register` and `/#barangay` are redirected to the new pages by `index.html`.
