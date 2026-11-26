/**
 * Pure RSVP and voucher rules (no database). Unit-tested in rules.test.ts.
 */

export type RsvpStatus = "in" | "waitlist" | "out";
export type RsvpRole = "host" | "player" | "guest";

export interface RosterEntry {
  id: string;
  status: RsvpStatus;
  role: RsvpRole;
  queuedAt: Date;
}

export const VOUCHERS_PER_HOST_PER_YEAR = 25;
export const VIP_MONTHS = 12;
export const VOUCHER_REDEEM_WINDOW_MONTHS = 12;

/** New or returning RSVP: in if a spot is open, otherwise the waitlist. */
export function statusForJoin(inCount: number, cap: number): Exclude<RsvpStatus, "out"> {
  return inCount < cap ? "in" : "waitlist";
}

/**
 * Who moves up from the waitlist: fill every open spot, oldest waitlist entry first.
 * Returns ids in promotion order.
 */
export function promotionsFor(entries: RosterEntry[], cap: number): string[] {
  const inCount = entries.filter((e) => e.status === "in").length;
  const open = Math.max(0, cap - inCount);
  if (!open) return [];
  return entries
    .filter((e) => e.status === "waitlist")
    .sort((a, b) => a.queuedAt.getTime() - b.queuedAt.getTime() || a.id.localeCompare(b.id))
    .slice(0, open)
    .map((e) => e.id);
}

export type GuestDecision = { ok: true } | { ok: false; reason: string };

/**
 * Only hosts of the game add guests. A guest (or a VIP voucher guest) is never a host
 * of that game, so guests cannot invite guests.
 */
export function canAddGuest(actor: { isHostOfGame: boolean; signedIn: boolean; termsAccepted: boolean }): GuestDecision {
  if (!actor.signedIn) return { ok: false, reason: "Sign in first." };
  if (!actor.termsAccepted) return { ok: false, reason: "Accept the matchmaker terms first." };
  if (!actor.isHostOfGame) return { ok: false, reason: "Only hosts can add guests. Guests can’t invite guests." };
  return { ok: true };
}

export function vouchersRemaining(issuedThisYear: number): number {
  return Math.max(0, VOUCHERS_PER_HOST_PER_YEAR - issuedThisYear);
}

/** Calendar-year window (UTC) used for the 25-per-host cap. */
export function yearWindow(now: Date): { start: Date; end: Date } {
  const y = now.getUTCFullYear();
  return { start: new Date(Date.UTC(y, 0, 1)), end: new Date(Date.UTC(y + 1, 0, 1)) };
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

export type RedeemDecision = { ok: true; vipUntil: Date } | { ok: false; reason: string };

export function redeemDecision(
  voucher: { redeemedByUserId: string | null; redeemBy: Date; hostUserId: string },
  userId: string,
  now: Date,
): RedeemDecision {
  if (voucher.redeemedByUserId) {
    return voucher.redeemedByUserId === userId
      ? { ok: false, reason: "You already redeemed this voucher." }
      : { ok: false, reason: "That voucher was already used." };
  }
  if (voucher.hostUserId === userId) return { ok: false, reason: "Hosts can’t redeem their own vouchers." };
  if (voucher.redeemBy.getTime() < now.getTime()) return { ok: false, reason: "That voucher has expired." };
  return { ok: true, vipUntil: addMonths(now, VIP_MONTHS) };
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** e.g. MAL-VIP-7K3Q-9XPA. */
export function voucherCode(random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  const bytes = random(8);
  const chars = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]);
  return `MAL-VIP-${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}`;
}

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Convert a wall-clock time in a time zone (e.g. "2026-11-28T08:00" in America/New_York)
 * to a UTC Date.
 */
export function zonedToUtc(local: string, timeZone: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const offset = (at: number) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(at));
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute")) - at;
  };
  let ts = guess - offset(guess);
  ts = guess - offset(ts);
  return new Date(ts);
}

/** Inverse of zonedToUtc for <input type="datetime-local"> values. */
export function utcToZonedInput(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
