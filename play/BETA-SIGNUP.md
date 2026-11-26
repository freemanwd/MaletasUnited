# Real sign-up beta (accounts + database RSVPs)

Private test for hosts and the GK list keeper before anything goes live.

## Switch

| Where | Default | Override |
| --- | --- | --- |
| Preview deployments, `next dev` | **On** | `MALETAS_REAL_SIGNUP=off` |
| Production | **Off** (`/api/auth/*` returns 404, no beta UI) | `MALETAS_REAL_SIGNUP=on` |

The flag is read at request time (`lib/beta/flag.ts`). Changing a Vercel env var still needs a redeploy.

## Pieces

- **Database**: Neon Postgres (Vercel Marketplace) via Drizzle. Schema `lib/db/schema.ts`, migrations in `drizzle/`.
  `npm run build` runs `scripts/db-migrate.mjs` first: it applies migrations and seeds the GK game
  (`jax-glen-kernan`, Sat Nov 28, 2026, 8:00 AM ET, cap 20) plus hosts from `MALETAS_GK_HOST_EMAILS`.
  It skips when no database is attached, and on production while the flag is off.
- **Auth**: Auth.js v5 (`auth.ts`) with database sessions. Google sign-in and/or an email magic link.
  No passwords stored. Sign-up requires ticking the matchmaker terms box (stored as `users.terms_accepted_at`);
  nobody can RSVP or redeem/issue vouchers until it's set.
- **Tables**: `users` (+ Auth.js `accounts`, `sessions`, `verification_tokens`), `games`, `game_hosts`,
  `rsvps` (status `in` / `waitlist` / `out`; role `host` / `player` / `guest`), `host_vouchers`.
- **Rules** (`lib/beta/rules.ts`, tests: `npm test`):
  - Cap counts hosts, players and guests. When full, new RSVPs go to the waitlist; when someone drops,
    the oldest waitlist entry is promoted automatically (row lock on the game prevents overfilling).
  - Only hosts of a game (email in `game_hosts`) can add guests. Guests have no host rights, so guests can't invite guests.
  - Hosts (and admins) can issue up to **25 vouchers per calendar year**; each gives the redeemer 1 year as "VIP guest of &lt;host&gt;".
- **UI**: `/beta` (sign in, terms, name, redeem/issue vouchers) and a **Test RSVPs (beta)** card on each game page
  (`components/beta/BetaRsvpSection.tsx`). The Google Sheet stays the official list until an admin clicks
  "Make app RSVPs official" (per-game `games.sheet_is_official`).

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` (or `POSTGRES_URL`) | Set by the Neon integration (app uses the pooled URL; migrations prefer `DATABASE_URL_UNPOOLED`) |
| `AUTH_SECRET` | Random 32+ byte secret for Auth.js |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth client (optional if email is set) |
| `EMAIL_SERVER`, `EMAIL_FROM` | SMTP for magic links, e.g. `smtps://user%40gmail.com:APP_PASSWORD@smtp.gmail.com:465` (optional if Google is set) |
| `MALETAS_ADMIN_EMAILS` | Comma-separated sign-in emails for admin tools (flip sheet, edit game, add hosts) |
| `MALETAS_GK_HOST_EMAILS` | Seed hosts for the GK game: `Name <email>, Name <email>` |
| `MALETAS_REAL_SIGNUP` | `on` / `off` override (see above) |

Google OAuth redirect URI for a branch preview:
`https://<branch-alias>.vercel.app/api/auth/callback/google`.

## Local

```bash
DATABASE_URL=postgres://... AUTH_SECRET=... EMAIL_SERVER=smtp://127.0.0.1:3025 EMAIL_FROM=test@example.com \
  npm run db:migrate && npm run dev
```
