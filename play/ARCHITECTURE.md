# Maletas Play — architecture and production roadmap

This folder is the pickup soccer web app (hosts, sheets, clubhouse, shop, Plus). It is a **separate site** from the Maletas United marketing site (`site/`) and from the GitHub Pages RSVP at the repo root.

Deploy on Vercel with **Root Directory = `play`**.

## This version (v1 preview)

No Clerk, Stripe, or database accounts exist yet. The UI talks only to a repository interface.

| Concern | Interface | Implementation now | Swap later |
| --- | --- | --- | --- |
| Data | `lib/data/repository.ts` (`DataRepository`) | `lib/data/local-repository.ts` + `localStorage` key `maletas-play-v1`, seeded from `lib/data/seed.ts` | Vercel Postgres / Neon via Prisma or Drizzle |
| Auth | `lib/auth/types.ts` (`AuthAdapter`) — Clerk-shaped `SessionUser` with `roles: ("player" \| "host" \| "admin")[]` | Local profile form, browser-only | Clerk; map `publicMetadata.roles` |
| Payments | Plus + bag screens labelled **demo** | Toggle Plus in memory; checkout button disabled | Stripe Billing (Plus) + Stripe Connect (vendors) |
| Search | `zipPrefix` (first 3 characters) | Client filter | Geocoding + radius search |
| Referrals | Invite code on the player card, `/join/[code]` | Count stored in `referralCounts` | Server-side attribution on Clerk sign-up |

Screens are App Router routes. They import `usePlay()` / `DataRepository` methods, not `localStorage` directly, so a Postgres adapter should not require UI rewrites.

Jacksonville, FL is the first hub. Seed games follow the real Maletas pattern: weekend pickup, mostly Saturday mornings, plus weeknight games while there is daylight. No Sundays. Seed hosts, players, fields, and vendors are labelled sample data — not real people, venues, or partnerships.

## Folder map

```
play/
  app/                 routes, metadata, robots (noindex)
  components/          shell, sheets, forms, views
  lib/types.ts         domain types (keep stable)
  lib/auth/types.ts    Clerk-shaped auth adapter
  lib/data/repository.ts
  lib/data/local-repository.ts
  lib/data/seed.ts
  lib/play-context.tsx client store wiring the adapters
```

---

## Production steps

Do these in order. Each step lists the **account to create** and the **env vars** to add on the Vercel project for this app (Root Directory `play`).

### 1. Vercel project

**Account:** Vercel team or personal account. Import `freemanwd/MaletasUnited`.

**Settings**

- Root Directory: `play`
- Framework: Next.js
- Build: `npm run build`
- Optional: `NEXT_PUBLIC_PLAY_URL` = the canonical public URL (used for `metadataBase` and invite links)

**Env**

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_PLAY_URL` | Canonical URL, OG tags, copied invite links |

Keep `robots` at `noindex` until you want the play app indexed. The marketing site in `site/` is a different Vercel project.

### 2. Clerk auth and roles

**Account:** [Clerk](https://clerk.com) application. Enable Email (and optionally Google).

**Dashboard**

- Paths: sign-in `/sign-in`, sign-up `/sign-up`
- Session token: expose `publicMetadata.roles` (`player`, `host`, `admin`)
- Assign the owner `["player","host","admin"]`. Hosts get `host` when they publish a game (or via a Clerk user metadata update).

**Env**

| Variable | Where |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Vercel + `.env.local` |
| `CLERK_SECRET_KEY` | Vercel (server only) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/me` |

**Code:** implement `AuthAdapter` with `@clerk/nextjs`. Replace the Join modal with Clerk `<SignIn/>` / `<SignUp/>`. Keep the player-card fields (position, city, ZIP, bio, social) in Postgres keyed by `user.id`. Gate `/admin` with `hasRole("admin")`.

### 3. Vercel Postgres / Neon (Prisma or Drizzle)

**Account:** Vercel Marketplace → Neon (or Vercel Postgres). One database for play — do not share it with the marketing site.

**Env** (names vary slightly by Marketplace integration)

| Variable | Where |
| --- | --- |
| `POSTGRES_URL` | Pooled connection (serverless) |
| `POSTGRES_URL_NON_POOLING` | Direct URL for migrations |
| `POSTGRES_PRISMA_URL` | If using Prisma on Neon |
| `DATABASE_URL` | Drizzle / generic |

**Code:** add `lib/data/postgres-repository.ts` implementing `DataRepository`. Tables for `users`, `profiles`, `games`, `rosters`, `waivers`, `posts`, `likes`, `products`, `vendors`, `carts`, `referrals`. Run migrations in CI or `vercel.json` build. Keep `seed.ts` as a `npm run db:seed` script with the same labelled sample rows.

Waiver acknowledgements (`play-at-your-own-risk-v1`) must be stored per user per game with `acceptedAt`.

### 4. Stripe Billing (Plus) + Connect (shop)

**Account:** Stripe (test mode first). Enable Billing. Enable Connect (Express or Standard) for vendor payouts.

**Dashboard**

- Product **Maletas Plus** at $1.99 / month → copy Price ID
- Webhook endpoint `https://<play-host>/api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `account.updated`
- Connect: onboarding link for vendors; application fee = the commission % from Admin

**Env**

| Variable | Where |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client Checkout / Elements |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification |
| `STRIPE_PLUS_PRICE_ID` | Plus subscription |
| `STRIPE_CONNECT_CLIENT_ID` | Connect OAuth (if used) |

**Code:** Plus page starts Checkout Session in subscription mode. Shop checkout creates a destination charge or separate charges and transfers, with `application_fee_amount` from `vendors.rate`. Mark UI copy as live only after webhooks set `user.plus` from Stripe, not from a local toggle.

### 5. Geocoding and radius search

**Account:** a maps provider (Mapbox, Google Maps Platform, or MapLibre + a geocoder). Jacksonville is hub zero; store `lat`/`lng` on games and on the search origin.

**Env**

| Variable | Where |
| --- | --- |
| `MAPS_API_KEY` or `NEXT_PUBLIC_MAPBOX_TOKEN` | Server geocode + optional client map |

Replace `zipPrefix` in `filterGames` with: geocode the query → haversine / PostGIS `ST_DWithin` against game coordinates. Plus still gates ZIP/region search.

### 6. Referral tracking

Invite URLs are already `/join/[code]`. After Clerk:

- Persist `inviteCode` on `profiles`
- On sign-up, read `?ref=` or `/join/[code]`, store `referredByUserId`
- Increment the inviter’s `invites` in Postgres (not `localStorage`)
- Optional: Clerk `unsafeMetadata.referralCode` during sign-up

No extra vendor account. Uses Clerk + Postgres from steps 2–3.

### 7. Notifications

**Accounts (pick one per channel)**

- Email: Resend or Postmark (sheet open near you, weekly clubhouse)
- SMS: Twilio (optional; hosts already have email)
- Push: Web Push VAPID keys, or OneSignal / Firebase

**Env examples**

| Variable | Channel |
| --- | --- |
| `RESEND_API_KEY` | Email |
| `RESEND_FROM` | From address |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM` | SMS |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web push |

Plus “alerts when a sheet opens near you” needs geocoding (step 5) plus a subscriber table and a cron or queue (Vercel Cron is enough at this scale).

---

## What not to mix

- Do not point this Vercel project at the repo root (that is the RSVP `index.html`).
- Do not set Root Directory to `site/` (marketing).
- Do not put Clerk/Stripe secrets in the marketing project.
- Do not index this preview until product and legal (waiver) are ready.
