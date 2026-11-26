/**
 * Membership levels. Display names and prices live here so screens do not
 * hard-code “Club”, “Open Play”, or “Host”.
 *
 * Game visibility and `user.vip` still use the stable data id `vip`
 * (Club access). “VIP” in the UI is only a guest badge for a host-granted
 * 1-year Club voucher: “VIP guest of <host>”.
 */

export const OPEN_PLAY = {
  id: "open",
  name: "Open Play",
  price: "Free",
  path: "/",
  features: [
    "Search by city, ZIP and format",
    "Join public games",
    "Ads shown",
  ],
} as const;

export const CLUB = {
  id: "club",
  name: "Club",
  productName: "Maletas Club",
  path: "/club",
  monthly: "$1.99",
  yearly: "$20",
  yearlyWas: "$23.88",
  yearlySave: "$3.88",
  features: [
    "Private and invite-only hosted games",
    "Host email lists",
    "Geo search alerts",
    "Match alerts",
    "Watch-party alerts",
    "Light local sponsor units only",
  ],
} as const;

export const HOST_LEVEL = {
  id: "host",
  name: "Host",
  price: "No monthly dues",
  path: "/hosts",
  takeRate: "~3%",
  takeNote:
    "Maletas takes ~3% plus Stripe fees only when money moves. This is a demo / planned fee and is not charged in this preview.",
  features: [
    "No monthly dues",
    "Set your own fees, terms and waivers",
    "Maletas takes ~3% plus Stripe fees only when money moves (demo / planned)",
    "Gift 1-year Club vouchers to guests (25 per host per year)",
  ],
} as const;

export const CAPTAIN = {
  name: "Captain",
  note: "An ad-free Captain tier may come later.",
} as const;

/** Paid player membership (Club). Keep importing this from screens. */
export const TIER = CLUB;

export const LEVELS = [OPEN_PLAY, CLUB, HOST_LEVEL] as const;

export const VOUCHER_PRICING = {
  unitPrice: 20,
  bulkCount: 10,
  bulkPrice: 180,
  defaultMonths: 12,
  yearlyCap: 25,
} as const;

export function vipGuestLabel(hostName: string): string {
  return `VIP guest of ${hostName}`;
}

export function voucherQuote(
  count: number,
  remaining: number = VOUCHER_PRICING.yearlyCap,
): { count: number; total: number; per: number; bulk: boolean } {
  const cap = Math.max(0, Math.min(VOUCHER_PRICING.yearlyCap, Math.floor(remaining)));
  const n = Math.max(0, Math.min(cap, Math.floor(count) || 0));
  if (n === 0) return { count: 0, total: 0, per: VOUCHER_PRICING.unitPrice, bulk: false };
  if (n >= VOUCHER_PRICING.bulkCount) {
    const packs = Math.floor(n / VOUCHER_PRICING.bulkCount);
    const rest = n % VOUCHER_PRICING.bulkCount;
    const total = packs * VOUCHER_PRICING.bulkPrice + rest * VOUCHER_PRICING.unitPrice;
    return { count: n, total, per: total / n, bulk: packs > 0 };
  }
  return { count: n, total: n * VOUCHER_PRICING.unitPrice, per: VOUCHER_PRICING.unitPrice, bulk: false };
}

export function hostVoucherYearStats(
  vouchers: { hostId: string; hostName: string; createdAt: string }[],
  host: { id: string; name: string },
  now = new Date(),
): { year: number; used: number; cap: number; remaining: number } {
  const year = now.getFullYear();
  const used = vouchers.filter((row) => {
    if (row.hostId !== host.id && row.hostName !== host.name) return false;
    const created = new Date(row.createdAt);
    return !Number.isNaN(created.getTime()) && created.getFullYear() === year;
  }).length;
  const cap = VOUCHER_PRICING.yearlyCap;
  return { year, used, cap, remaining: Math.max(0, cap - used) };
}

export function visibilityOptionLabel(
  value: "public" | "vip" | "invite",
): string {
  if (value === "vip") return `${CLUB.name} only — ${CLUB.productName} members`;
  if (value === "invite") return "Invite only — you approve each player";
  return "Public — anyone can join";
}
