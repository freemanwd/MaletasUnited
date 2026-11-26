# Maletas Play

Pickup soccer web app: a **matchmaker** that collates soccer opportunities around the globe. Games, ruled sign-up sheets, hosts, player profiles, clubhouse, marketplace shop, paid membership (name in `lib/tier.ts`), ads, and admin. Jacksonville, FL is the first hub.

This is **not** the Maletas United marketing site (`site/`) and **not** the GitHub Pages RSVP at the repo root.

## Preview (this version)

- Next.js App Router, TypeScript, prototype design tokens (Big Shoulders Display, Instrument Sans, light/dark).
- Data and auth live behind interfaces with a **localStorage** implementation (`maletas-play-v3`). No Clerk, Stripe, or database accounts yet.
- Searching by city, ZIP and format is **free**. Membership, host vouchers and checkout are labelled **demo**.
- The paid tier display name is configured in `lib/tier.ts` (currently VIP). Kick-off times show in ET.
- `robots` is `noindex`.
- Seed data is generic and labelled sample, except Dave as host of the sample Glen Kernan VIP group. Game times: Saturday mornings plus weeknight games while there is daylight — not Sundays.
- Signing up for a game requires the host’s waiver plus a matchmaker notice. Legal copy is a draft pending attorney review.

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
| `/` | Games list (free city / ZIP / format search + web listings) |
| `/games/[id]` | Game detail + sign-up sheet |
| `/games/new` | Host a game (visibility, fee, terms, waiver) |
| `/hosts` | Hosts and fields |
| `/hosts/vouchers` | Host guest-membership vouchers (QR, demo pay) |
| `/signup` | Join / Sign up onboarding |
| `/clubhouse` | Local feed (thought or photo, likes, comments) |
| `/shop` | Matchmaker marketplace (affiliate + demo merch) |
| `/shop/bag` | Bag (demo checkout) |
| `/vip` | Paid membership (demo; name from `lib/tier.ts`) |
| `/plus` | Redirects to `/vip` |
| `/me` | Your player card |
| `/players/[handle]` | Public player profile |
| `/join/[code]` | Referral invite |
| `/terms` | Terms / Disclaimer (draft) |
| `/advertise` | Advertise with Maletas |
| `/admin` | Sample admin (Clerk role stand-in) |

## Deploy on Vercel

1. **Add New… → Project** and import this repo.
2. Set **Root Directory** to `play`.
3. Build Command `npm run build`, Install `npm install`.
4. Optional env: `NEXT_PUBLIC_PLAY_URL` = the public URL of this deployment.

Do not point DNS at this project until you mean to launch the play app. Production accounts (Clerk, Postgres, Stripe, Places, ads) are listed in `ARCHITECTURE.md`.
