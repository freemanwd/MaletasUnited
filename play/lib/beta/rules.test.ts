import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canAddGuest,
  promotionsFor,
  redeemDecision,
  statusForJoin,
  utcToZonedInput,
  voucherCode,
  vouchersRemaining,
  zonedToUtc,
  type RosterEntry,
} from "./rules.ts";

const t0 = new Date("2026-11-26T12:00:00Z");
const at = (min: number) => new Date(t0.getTime() + min * 60_000);

test("join goes in until the cap, then waitlist", () => {
  assert.equal(statusForJoin(0, 20), "in");
  assert.equal(statusForJoin(19, 20), "in");
  assert.equal(statusForJoin(20, 20), "waitlist");
  assert.equal(statusForJoin(25, 20), "waitlist");
});

test("drop promotes the oldest waitlist entry", () => {
  const entries: RosterEntry[] = [
    { id: "a", status: "in", role: "host", queuedAt: at(0) },
    { id: "b", status: "out", role: "player", queuedAt: at(1) },
    { id: "w2", status: "waitlist", role: "player", queuedAt: at(5) },
    { id: "w1", status: "waitlist", role: "guest", queuedAt: at(3) },
  ];
  assert.deepEqual(promotionsFor(entries, 2), ["w1"]);
  assert.deepEqual(promotionsFor(entries, 3), ["w1", "w2"]);
  assert.deepEqual(promotionsFor(entries, 1), []);
});

test("only hosts add guests; guests can't invite guests", () => {
  assert.equal(canAddGuest({ isHostOfGame: true, signedIn: true, termsAccepted: true }).ok, true);
  const guest = canAddGuest({ isHostOfGame: false, signedIn: true, termsAccepted: true });
  assert.equal(guest.ok, false);
  assert.equal(canAddGuest({ isHostOfGame: true, signedIn: true, termsAccepted: false }).ok, false);
  assert.equal(canAddGuest({ isHostOfGame: true, signedIn: false, termsAccepted: true }).ok, false);
});

test("25 vouchers per host per year", () => {
  assert.equal(vouchersRemaining(0), 25);
  assert.equal(vouchersRemaining(24), 1);
  assert.equal(vouchersRemaining(25), 0);
  assert.equal(vouchersRemaining(30), 0);
});

test("voucher redemption gives one year of VIP and is single use", () => {
  const v = { redeemedByUserId: null, redeemBy: new Date("2027-11-26T00:00:00Z"), hostUserId: "host" };
  const ok = redeemDecision(v, "guest", t0);
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.vipUntil.toISOString(), "2027-11-26T12:00:00.000Z");
  assert.equal(redeemDecision({ ...v, redeemedByUserId: "other" }, "guest", t0).ok, false);
  assert.equal(redeemDecision(v, "host", t0).ok, false);
  assert.equal(redeemDecision({ ...v, redeemBy: new Date("2026-01-01T00:00:00Z") }, "guest", t0).ok, false);
});

test("voucher codes look right", () => {
  assert.match(voucherCode(), /^MAL-VIP-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
});

test("ET wall clock converts both ways across DST", () => {
  assert.equal(zonedToUtc("2026-11-28T08:00", "America/New_York")?.toISOString(), "2026-11-28T13:00:00.000Z");
  assert.equal(zonedToUtc("2026-07-04T08:00", "America/New_York")?.toISOString(), "2026-07-04T12:00:00.000Z");
  assert.equal(utcToZonedInput(new Date("2026-11-28T13:00:00Z"), "America/New_York"), "2026-11-28T08:00");
  assert.equal(zonedToUtc("bad", "America/New_York"), null);
});
