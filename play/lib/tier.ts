/**
 * Paid membership product name. Change `name` here to rename the tier
 * everywhere (e.g. to "Premium") without hunting through screens.
 * Data still uses the stable id `vip` on games and users.
 */
export const TIER = {
  id: "vip",
  name: "VIP",
  productName: "Maletas VIP",
  path: "/vip",
} as const;

export const VOUCHER_PRICING = {
  unitPrice: 20,
  bulkCount: 10,
  bulkPrice: 180,
  defaultMonths: 12,
} as const;

export function voucherQuote(count: number): { count: number; total: number; per: number; bulk: boolean } {
  const n = Math.max(1, Math.min(50, Math.floor(count) || 1));
  if (n >= VOUCHER_PRICING.bulkCount) {
    const packs = Math.floor(n / VOUCHER_PRICING.bulkCount);
    const rest = n % VOUCHER_PRICING.bulkCount;
    const total = packs * VOUCHER_PRICING.bulkPrice + rest * VOUCHER_PRICING.unitPrice;
    return { count: n, total, per: total / n, bulk: packs > 0 };
  }
  return { count: n, total: n * VOUCHER_PRICING.unitPrice, per: VOUCHER_PRICING.unitPrice, bulk: false };
}

export function visibilityOptionLabel(
  value: "public" | "vip" | "invite",
): string {
  if (value === "vip") return `${TIER.name} only — ${TIER.productName} members`;
  if (value === "invite") return "Invite only — you approve each player";
  return "Public — anyone can join";
}
