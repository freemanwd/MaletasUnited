# Maletas Play — architecture and production roadmap

This folder is the pickup soccer web app. It is a **separate site** from the Maletas United marketing site (`site/`) and from the GitHub Pages RSVP at the repo root.

Deploy on Vercel with **Root Directory = `play`**.

Maletas is **only a matchmaker**. It collates soccer opportunities around the globe. It is not a nonprofit, not a host, not a field operator, and not an organizer. Each host, field and player works out terms, fees, liability and waivers among themselves. Legal copy in the app is a **draft pending attorney review**.

## This version (v4 preview)

No Clerk, Stripe, or database accounts exist yet. The UI talks only to a repository interface. Checkout, membership, vouchers, ads, reports and friend requests are labelled **demo**.

Membership levels are defined in `lib/tier.ts`:

- **Open Play** (free) — search, join public games, ads shown
- **Club** (`TIER`, $1.99/mo or $20/yr) — private games, host email lists, geo search, match alerts, watch-party alerts; light local sponsor units only. Path `/club` (`/vip` and `/plus` redirect here)
- **Host** — no monthly dues; hosts set fees, terms and waivers. Maletas takes ~3% plus Stripe fees only when money moves (demo / planned)
- **VIP** is **not** a plan. It is a status badge on a guest who holds a host-granted 1-year Club voucher: “VIP guest of \<host\>”

Game visibility and `user.vip` still use the stable data id `vip` for Club access. A Captain ad-free tier is mentioned as coming later only.

Kick-off times are formatted in `America/New_York` with an **ET** label (`lib/format.ts`). The sample Glen Kernan game is Saturday **Nov 28, 2026, 8:00 AM ET**.

| Concern | Interface | Implementation now | Swap later |
| --- | --- | --- | --- |
| Data | `lib/data/repository.ts` (`DataRepository`) | `lib/data/local-repository.ts` + `localStorage` key `maletas-play-v3`, seeded from `lib/data/seed.ts` | Vercel Postgres / Neon via Prisma or Drizzle |
| Auth | `lib/auth/types.ts` (`AuthAdapter`) — Clerk-shaped `SessionUser` with `roles: ("player" \| "host" \| "admin")[]` | `/signup` onboarding + local profile form | Clerk; map `publicMetadata.roles` |
| Payments | Club + host vouchers + merch bag labelled **demo** | `setVip`, `buyVouchers`, `redeemVoucher`; checkout is a stand-in | Stripe Billing (Club monthly $1.99 / yearly $20) + voucher SKUs ($20 each, bulk 10 for $180, **25 per host per year**) + Stripe Connect for host fees (~3% + Stripe, planned) |
| Search | `zipPrefix` (first 3 characters) | **Free** client filter by city, ZIP, format | Geocoding + radius search. Radius *alerts* stay membership |
| Host terms | Visibility, `feeCadence` / `feeLabel` / `feeAmount`, `hostTerms`, `hostWaiver`, `hideAddressUntilApproved` | Host form + waiver modal. Fees shown on game card/detail with a matchmaker disclaimer | Store per-game in Postgres; keep waiver hash + `acceptedAt`. Do not collect host fees until legal review |
| Host vouchers | `MembershipVoucher` | Host tools at `/hosts/vouchers`: count, duration (default 1 year), game/group, QR, demo pay, **25/host/year cap**. Redeem on `/club` (also `/vip` or `/plus?voucher=`). Badge: “VIP guest of &lt;host&gt;”. Admin/host dashboards list codes | Stripe Checkout for the host; webhook marks codes paid |
| External listings | `ExternalListing` | Seed rows labelled “listed from the web” | Ingest by ZIP (Places, directories, partner feeds) — see below |
| Shop | `Product.kind` `affiliate` \| `merch` | Outbound/affiliate links + demo merch bag | Affiliate network + Stripe Connect merch |
| Ads | `Ad` + `/advertise` | Open Play sees full ads; Club sees light local sponsor units | Direct local IO, AdSense/Ad Manager, affiliates — see below |
| Social | `DirectoryPlayer`, `Friendship`, `Post` (text + optional `workout` stats + demo image data URL + comments) | Join CTA, `/signup`, Clubhouse composer, optional opt-in workout stats, Share button, nav to own `/players/[handle]`, `/p/[id]` permalinks | Postgres graph; Clerk user id as player id; Blob for photos; see fitness and share below |
| Referrals | Invite code on the player card, `/join/[code]` | Count stored in `referralCounts` | Server-side attribution on Clerk sign-up |
| Legal | `lib/legal.ts`, `/terms` | Draft notices on games, host flow, signup. `FEE_NOTICE`: fees are between host and player | Attorney-reviewed ToS; versioned acceptances |

Screens are App Router routes. They import `usePlay()` / `DataRepository` methods, not `localStorage` directly, so a Postgres adapter should not require UI rewrites.

Jacksonville, FL is the first hub. Seed games follow the real Maletas pattern: weekend pickup, mostly Saturday mornings, plus weeknight games while there is daylight. No Sundays. Seed hosts, players (except Dave as the Glen Kernan Club host), fields, vendors, listings and ads are labelled sample data — not real organizations or partnerships. Culhane's Irish Pub is named only as Maletas' 2026 World Cup watch-party spot.

## Folder map

```
play/
  app/                 routes, metadata, robots (noindex)
  components/          shell, sheets, forms, views
  lib/types.ts         domain types (keep stable)
  lib/tier.ts          Open Play / Club / Host names and voucher cap
  lib/legal.ts         draft matchmaker copy
  lib/visibility.ts    membership / address / friends helpers
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
- Session token: expose `publicMetadata.roles` (`player`, `host`, `admin`) and `publicMetadata.vip`
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

**Code:** implement `AuthAdapter` with `@clerk/nextjs`. Replace the Join modal with Clerk `<SignIn/>` / `<SignUp/>`. Keep the player-card fields (handle, position, city, ZIP, bio, social, privacy) in Postgres keyed by `user.id`. Gate `/admin` with `hasRole("admin")`. Public profiles stay at `/players/[handle]`.

### 3. Vercel Postgres / Neon (Prisma or Drizzle)

**Account:** Vercel Marketplace → Neon (or Vercel Postgres). One database for play — do not share it with the marketing site.

**Env** (names vary slightly by Marketplace integration)

| Variable | Where |
| --- | --- |
| `POSTGRES_URL` | Pooled connection (serverless) |
| `POSTGRES_URL_NON_POOLING` | Direct URL for migrations |
| `POSTGRES_PRISMA_URL` | If using Prisma on Neon |
| `DATABASE_URL` | Drizzle / generic |

**Code:** add `lib/data/postgres-repository.ts` implementing `DataRepository`. Tables for `users`, `profiles`, `games`, `rosters`, `waivers`, `host_terms`, `posts`, `likes`, `products`, `vendors`, `listings`, `ads`, `friendships`, `blocks`, `reports`, `carts`, `referrals`. Run migrations in CI or `vercel.json` build. Keep `seed.ts` as a `npm run db:seed` script with the same labelled sample rows.

Waiver acknowledgements (`play-at-your-own-risk-v1` + `matchmaker-draft-v1` + host-waiver hash) must be stored per user per game with `acceptedAt`. Hide `fieldPrivate` until `approvedIds` contains the player.

### 4. Stripe Billing (Maletas Club) + Connect (host fees later)

**Account:** Stripe (test mode first). Enable Billing. Enable Connect (Express or Standard) only when Maletas merch or host fee collection goes live.

**Dashboard**

- Product named from `TIER.productName` (currently **Maletas Club**) with two prices: **$1.99 / month** and **$20 / year** (annual saves $3.88 vs 12 × $1.99) → copy both Price IDs
- Host voucher SKU: **$20 / year** per guest Club membership, bulk **10 for $180**, default **25 per host per year**
- Webhook endpoint `https://<play-host>/api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `account.updated`
- Connect: onboarding for merch vendors later; application fee = the commission % from Admin
- Host game fees stay **paid directly to the host** until a Connect destination-charge flow exists. Do not collect host fees in Stripe until legal review.

**Env**

| Variable | Where |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client Checkout / Elements |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification |
| `STRIPE_CLUB_MONTHLY_PRICE_ID` | Club monthly |
| `STRIPE_CLUB_YEARLY_PRICE_ID` | Club yearly |
| `STRIPE_CONNECT_CLIENT_ID` | Connect OAuth (if used) |

**Code:** `/club` starts Checkout Session in subscription mode with the chosen price. `/hosts/vouchers` starts a one-time Checkout for N vouchers (25/host/year cap), then stores codes. Shop affiliate cards stay outbound links (no Stripe). Optional merch uses Connect. Mark UI copy as live only after webhooks set `user.vip` / `user.vipPlan` / `sponsoredBy` from Stripe, not from a local toggle. Host participation fees stay **paid directly to the host** until a Connect destination-charge flow exists; planned take is **~3% plus Stripe fees only when money moves**.

Club perks to wire after Billing:

- Access to `visibility: vip | invite` hosted games
- Host email lists (Resend segment)
- Radius / geographic search **alerts** (not the free search itself)
- Match alerts when a sheet opens near you
- Watch-party alerts (pub viewings of FIFA World Cup and pro league matches)

### 5. Free search, then geocoding for Club alerts

Searching and browsing games by city, ZIP and format is **free for everyone** (Open Play). Do not put a Club gate on `filterGames`.

**Account:** a maps provider (Mapbox, Google Maps Platform, or MapLibre + a geocoder). Jacksonville is hub zero; store `lat`/`lng` on games and on the search origin.

**Env**

| Variable | Where |
| --- | --- |
| `MAPS_API_KEY` or `NEXT_PUBLIC_MAPBOX_TOKEN` | Server geocode + optional client map |

Replace `zipPrefix` in `filterGames` with: geocode the query → haversine / PostGIS `ST_DWithin` against game coordinates. **Geo search alerts** (push/email when a matching game appears inside N miles) stay a Club perk.

### 6. External listings ingest (leagues, clubs, public pickup)

UI already mixes host-posted games with `ExternalListing` rows labelled **listed from the web** (`sourceName`, `sourceUrl`, `lastChecked`, city/ZIP). Seed rows are fictitious. Do not invent real organizations or claim partnerships.

**Proposed ingest (by ZIP)**

1. **Google Places API** (or equivalent) — query soccer fields, indoor arenas, pubs with “soccer” / “fútbol” in the ZIP. Store `place_id`, attribution, and a last-checked timestamp. Must follow [Google Maps Platform Terms](https://cloud.google.com/maps-platform/terms): display required attribution, do not cache Places results beyond allowed periods, do not imply Google endorses Maletas.
2. **League / club directories** — crawl or API where the source ToS allows (USSF affiliates, local adult rec sites, park-and-rec calendars). Prefer official feeds or written permission. Keep a `robots.txt` / ToS log per source. If a source forbids scraping, skip it.
3. **Partner feeds and submissions** — CSV/JSON drop or a public “submit a listing” form. A human (or admin screen) marks `verifiedAt`. Never auto-claim a partnership badge.
4. **Watch parties** — Places + partner pubs. Culhane's Irish Pub is the real 2026 World Cup example; other pubs need their own permission.

**Legal notes:** listings are pointers, not Maletas events. The source’s terms govern play. Do not host copyrighted league schedules verbatim if the source forbids it; link out. Refresh `lastChecked` on a cron. Tombstone rows that 404.

**Env examples**

| Variable | Source |
| --- | --- |
| `GOOGLE_PLACES_API_KEY` | Places (server only) |
| `LISTINGS_CRON_SECRET` | Vercel Cron auth |

### 7. Ads and local sponsorships

Slots today: local sponsor cards in the games list and clubhouse feed, plus one banner. Open Play sees full ads labelled **Ad · sample**. Club members see **light local sponsor** units only. `/advertise` is the local-sponsor pitch (fields, pubs, shops).

**Options to turn on (pick in this order)**

1. **Direct local sponsorships** — insertion order with a Jacksonville field, pub or shop. Store creatives in Blob / CMS. Highest relevance, no third-party ToS. Invoice outside the app at first.
2. **Google AdSense or Ad Manager** — fill leftover inventory. Requires privacy policy, cookie consent if using personalized ads, and `ads.txt`. Keep ads labelled. Do not place ads on `/terms`.
3. **Affiliate programs** — shop outbound links already use `rel="sponsored"`. Networks (e.g. Impact, CJ, Amazon Associates if ever used) need their own disclosure.

**Env**

| Variable | Where |
| --- | --- |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | If AdSense |
| `GAM_NETWORK_CODE` | If Ad Manager |

Do not load ad scripts in this preview. Keep the `Ad` table so sales can replace sample rows without a UI rewrite.

### 8. Shop as a matchmaker marketplace

Partner/vendor cards are outbound or affiliate. Optional Maletas merch is a later Stripe Connect product. Do not imply Maletas manufactures the affiliate goods. Commission % on Admin applies to Connect merch, not to clicks, unless an affiliate network reports it.

### 9. Social graph

`/players/[handle]` is the public player card (bio, position, city, games played/hosted, friends, posts, photos). Privacy is `public` or `friends-only`. Blocking removes friendships and hides posts. Reports persist in `reports` for an admin queue. Clubhouse posts may include a demo image data URL and comments. Production should store photos in Blob, not in Postgres rows.

Production: unique handle constraint, rate-limit friend requests, store blocks server-side, and never show `fieldPrivate` on a profile.

### 10. Referral tracking

Invite URLs are already `/join/[code]`. After Clerk:

- Persist `inviteCode` on `profiles`
- On sign-up, read `?ref=` or `/join/[code]`, store `referredByUserId`
- Increment the inviter’s `invites` in Postgres (not `localStorage`)

### 11. Notifications

**Accounts (pick one per channel)**

- Email: Resend or Postmark (sheet open near you, weekly clubhouse, host email lists, watch-party alerts)
- SMS: Twilio (optional)
- Push: Web Push VAPID keys, or OneSignal / Firebase

**Env examples**

| Variable | Channel |
| --- | --- |
| `RESEND_API_KEY` | Email |
| `RESEND_FROM` | From address |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM` | SMS |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web push |

Club alerts need geocoding (step 5) plus a subscriber table and a cron or queue (Vercel Cron is enough at this scale).

### 12. Attorney review

Replace `lib/legal.ts` after counsel signs off. Bump `MATCHMAKER_NOTICE_VERSION` and require re-acknowledgement. Keep the matchmaker positioning: Maletas is not liable for players, hosts or fields.

---


### 13. Fitness tracker stats and social share

Clubhouse posts can optionally include workout stats (calories, steps, miles or km, active minutes, duration). Players type the numbers in, or import a file **from their own device**. Parsing is **client-side only** (`lib/fitness/parse.ts`, plus a small FIT reader in `lib/fitness/fit.ts`). Supported exports today: **GPX, TCX, FIT, CSV, JSON** from apps such as Fitbit, Google Fit, Apple Health, Strava or Garmin. Limits: GPX usually has distance and time, not calories or steps; FIT support is best-effort for session/lap totals; multi-row CSVs and JSON history exports use a totals row when present, otherwise the most recent activity. Raw files are not uploaded. A draft may sit in `localStorage` (`maletas-play-fitness-draft`) until the player posts or clears it. Posted stats are stored on the `Post` (`workout`) and, in this demo, also only in `localStorage`. The composer is opt-in and shows a short privacy note. A compact stat strip renders on the post.

Share is always user-confirmed. `ShareButton` calls `navigator.share` (Web Share API, with a photo `File` when `canShare({ files })` allows it) and otherwise offers X, Facebook, WhatsApp, LinkedIn, Reddit, email and copy link. Prefill includes a light “via Maletas Play” mention and a `https://maletas-play.vercel.app/...` link (`lib/share.ts`). There is **no auto-posting** into anyone’s social accounts.

Dynamic Open Graph / Twitter images use `next/og` (`lib/og-card.tsx`) at `/games/[id]`, `/clubhouse` and `/p/[id]`. Seed posts get a unique card; player-authored posts that exist only in this browser fall back to a generic Clubhouse image, because crawlers cannot read `localStorage`.

**Later direct-connect paths (not in this preview)**

- **Fitbit Web API** — OAuth 2.0 on the web; request the minimum activity scopes; store refresh tokens server-side only after legal review.
- **Strava OAuth** — works in a normal web app (`activity:read`); pull recent activities after the user connects.
- **Google Fit / Garmin** — also have web OAuth APIs; treat them the same way (explicit connect, least privilege, revocable).
- **Apple HealthKit** — not available to a website. A native iOS app or a wrapper (Capacitor, React Native, or a PWA that still ships a native HealthKit plugin) is required.
- **Android Health Connect** — same constraint: a native or wrapped Android app, not a plain web page.

**Privacy and HIPAA-adjacent cautions**

Maletas is a soccer matchmaker, not a health-care provider, and this feature is not a medical record. Do not assume HIPAA applies, and do not assume it does not — get counsel before holding health or fitness data on a server, offering OAuth connections, or advertising health claims. Until then: keep imports on-device; do not upload GPX/FIT/CSV exports; minimize what a post stores (aggregates the player chose, not heart-rate streams or precise GPS traces); make sharing opt-in; let the player edit or omit numbers; do not sell or target ads from health data; and document retention when a real backend exists. Fitness numbers are not medical advice.

## What not to mix

- Do not point this Vercel project at the repo root (that is the RSVP `index.html`).
- Do not set Root Directory to `site/` (marketing).
- Do not put Clerk/Stripe/Places secrets in the marketing project.
- Do not index this preview until product and legal (terms + host waivers) are ready.
- Do not collect host fees or claim real league partnerships in this dataset.
