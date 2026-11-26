# Maletas Play

Pickup soccer web app: games, ruled sign-up sheets, hosts, player cards, clubhouse, shop, Maletas Plus, and admin. Jacksonville, FL is the first hub.

This is **not** the Maletas United marketing site (`site/`) and **not** the GitHub Pages RSVP at the repo root.

## Preview (this version)

- Next.js App Router, TypeScript, prototype design tokens (Big Shoulders Display, Instrument Sans, light/dark).
- Data and auth live behind interfaces with a **localStorage** implementation. No Clerk, Stripe, or database accounts yet.
- Plus and checkout are labelled **demo**.
- `robots` is `noindex`.
- Seed data is generic and labelled sample. Game times: Saturday mornings plus weeknight games while there is daylight — not Sundays.
- Signing up for a game requires a play-at-your-own-risk waiver acknowledgement.

```bash
cd play
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
```

## Routes

| Path | Screen |
| --- | --- |
| `/` | Games list |
| `/games/[id]` | Game detail + sign-up sheet |
| `/games/new` | Host a game (one-off / weekly / every 2 weeks) |
| `/hosts` | Hosts and fields |
| `/clubhouse` | Local feed |
| `/shop` | Shop |
| `/shop/bag` | Bag (demo checkout) |
| `/plus` | Maletas Plus (demo) |
| `/me` | Player card + invite link |
| `/join/[code]` | Referral invite |
| `/admin` | Sample admin (Clerk role stand-in) |

## Deploy on Vercel

1. **Add New… → Project** and import this repo.
2. Set **Root Directory** to `play`.
3. Build Command `npm run build`, Install `npm install`.
4. Optional env: `NEXT_PUBLIC_PLAY_URL` = the public URL of this deployment.

Do not point DNS at this project until you mean to launch the play app. Production accounts (Clerk, Postgres, Stripe) are listed in `ARCHITECTURE.md`.
