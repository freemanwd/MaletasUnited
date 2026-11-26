import "server-only";
import { alias } from "drizzle-orm/pg-core";
import { and, asc, desc, eq, gt, gte, inArray, lt, ne, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb, schema } from "@/lib/db";
import type { Db } from "@/lib/db";
import { isAdminEmail } from "./flag";
import {
  VOUCHER_REDEEM_WINDOW_MONTHS,
  addMonths,
  canAddGuest,
  normalizeCode,
  promotionsFor,
  redeemDecision,
  statusForJoin,
  voucherCode,
  vouchersRemaining,
  yearWindow,
  type RsvpRole,
  type RsvpStatus,
} from "./rules";

const { users, games, gameHosts, rsvps, hostVouchers } = schema;

export interface Viewer {
  id: string;
  email: string | null;
  displayName: string;
  termsAccepted: boolean;
  isAdmin: boolean;
}

export type Result = { ok: boolean; message: string };

export function displayNameOf(u: { displayName?: string | null; name?: string | null; email?: string | null }): string {
  return u.displayName?.trim() || u.name?.trim() || (u.email ? u.email.split("@")[0] : "Player");
}

export async function getViewer(): Promise<Viewer | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const [row] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!row) return null;
  return {
    id: row.id,
    email: row.email?.toLowerCase() ?? null,
    displayName: displayNameOf(row),
    termsAccepted: Boolean(row.termsAcceptedAt),
    isAdmin: isAdminEmail(row.email),
  };
}

async function isHostOf(db: Db | Parameters<Parameters<Db["transaction"]>[0]>[0], gameId: string, email: string | null) {
  if (!email) return false;
  const [row] = await db
    .select({ email: gameHosts.email })
    .from(gameHosts)
    .where(and(eq(gameHosts.gameId, gameId), eq(gameHosts.email, email.toLowerCase())))
    .limit(1);
  return Boolean(row);
}

export async function isHostAnywhere(email: string | null): Promise<boolean> {
  if (!email) return false;
  const [row] = await getDb()
    .select({ email: gameHosts.email })
    .from(gameHosts)
    .where(eq(gameHosts.email, email.toLowerCase()))
    .limit(1);
  return Boolean(row);
}

export interface BoardEntry {
  id: string;
  name: string;
  role: RsvpRole;
  status: RsvpStatus;
  queuedAt: Date;
  userId: string | null;
  invitedBy: string | null;
  vipOf: string | null;
}

export interface GameBoard {
  game: typeof games.$inferSelect;
  hosts: { email: string; label: string | null }[];
  going: BoardEntry[];
  waitlist: BoardEntry[];
  outCount: number;
  me: BoardEntry | null;
  viewerIsHost: boolean;
}

/** Active VIP guest badges: userId -> host display name. */
async function vipBadges(userIds: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (!userIds.length) return out;
  const host = schema.users;
  const rows = await getDb()
    .select({
      userId: hostVouchers.redeemedByUserId,
      hostName: host.displayName,
      hostRealName: host.name,
      hostEmail: host.email,
    })
    .from(hostVouchers)
    .innerJoin(host, eq(host.id, hostVouchers.hostUserId))
    .where(and(inArray(hostVouchers.redeemedByUserId, userIds), gt(hostVouchers.vipUntil, new Date())));
  for (const r of rows) {
    if (r.userId) out.set(r.userId, displayNameOf({ displayName: r.hostName, name: r.hostRealName, email: r.hostEmail }));
  }
  return out;
}

export async function getGameBoard(gameId: string, viewer: Viewer | null): Promise<GameBoard | null> {
  const db = getDb();
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) return null;
  const hosts = await db
    .select({ email: gameHosts.email, label: gameHosts.label })
    .from(gameHosts)
    .where(eq(gameHosts.gameId, gameId))
    .orderBy(asc(gameHosts.createdAt));
  const inviter = alias(users, "inviter");
  // Flat columns: drizzle nulls nested objects wrongly when one table is joined twice.
  const rows = await db
    .select({
      r: rsvps,
      uDisplayName: users.displayName,
      uName: users.name,
      uEmail: users.email,
      invDisplayName: inviter.displayName,
      invName: inviter.name,
      invEmail: inviter.email,
    })
    .from(rsvps)
    .leftJoin(users, eq(users.id, rsvps.userId))
    .leftJoin(inviter, eq(inviter.id, rsvps.invitedByUserId))
    .where(eq(rsvps.gameId, gameId))
    .orderBy(asc(rsvps.queuedAt), asc(rsvps.id));
  const badges = await vipBadges(rows.map((x) => x.r.userId).filter((v): v is string => Boolean(v)));
  const entries: BoardEntry[] = rows.map((x) => ({
    id: x.r.id,
    name:
      x.r.role === "guest"
        ? (x.r.guestName ?? "Guest")
        : displayNameOf({ displayName: x.uDisplayName, name: x.uName, email: x.uEmail }),
    role: x.r.role,
    status: x.r.status,
    queuedAt: x.r.queuedAt,
    userId: x.r.userId,
    invitedBy: x.r.invitedByUserId
      ? displayNameOf({ displayName: x.invDisplayName, name: x.invName, email: x.invEmail })
      : null,
    vipOf: x.r.userId ? (badges.get(x.r.userId) ?? null) : null,
  }));
  return {
    game,
    hosts,
    going: entries.filter((e) => e.status === "in"),
    waitlist: entries.filter((e) => e.status === "waitlist"),
    outCount: entries.filter((e) => e.status === "out").length,
    me: viewer ? (entries.find((e) => e.userId === viewer.id) ?? null) : null,
    viewerIsHost: viewer ? hosts.some((h) => h.email === viewer.email) : false,
  };
}

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Lock the game row so concurrent RSVPs can't overfill the cap. */
async function lockGame(tx: Tx, gameId: string) {
  const res = await tx.execute(sql`select cap from games where id = ${gameId} for update`);
  const cap = (res.rows[0] as { cap?: number } | undefined)?.cap;
  return typeof cap === "number" ? cap : null;
}

async function countIn(tx: Tx, gameId: string) {
  const [row] = await tx
    .select({ n: sql<number>`count(*)::int` })
    .from(rsvps)
    .where(and(eq(rsvps.gameId, gameId), eq(rsvps.status, "in")));
  return row?.n ?? 0;
}

/** Fill open spots from the waitlist, oldest first. Returns promoted rsvp ids. */
async function rebalance(tx: Tx, gameId: string, cap: number): Promise<string[]> {
  const active = await tx
    .select({ id: rsvps.id, status: rsvps.status, role: rsvps.role, queuedAt: rsvps.queuedAt })
    .from(rsvps)
    .where(and(eq(rsvps.gameId, gameId), ne(rsvps.status, "out")));
  const promote = promotionsFor(active, cap);
  if (promote.length) {
    await tx
      .update(rsvps)
      .set({ status: "in", updatedAt: new Date() })
      .where(inArray(rsvps.id, promote));
  }
  return promote;
}

function requireReady(viewer: Viewer | null): Result | null {
  if (!viewer) return { ok: false, message: "Sign in first." };
  if (!viewer.termsAccepted) return { ok: false, message: "Accept the matchmaker terms first (Account page)." };
  return null;
}

export async function setMyRsvp(viewer: Viewer | null, gameId: string, intent: "in" | "out"): Promise<Result> {
  const blocked = requireReady(viewer);
  if (blocked || !viewer) return blocked!;
  const db = getDb();
  return db.transaction(async (tx) => {
    const cap = await lockGame(tx, gameId);
    if (cap == null) return { ok: false, message: "That game isn’t in the beta database." };
    const role: RsvpRole = (await isHostOf(tx, gameId, viewer.email)) ? "host" : "player";
    const [existing] = await tx
      .select()
      .from(rsvps)
      .where(and(eq(rsvps.gameId, gameId), eq(rsvps.userId, viewer.id)))
      .limit(1);
    const now = new Date();
    if (intent === "in") {
      if (existing && existing.status !== "out") {
        return { ok: true, message: existing.status === "in" ? "You’re already in." : "You’re already on the waitlist." };
      }
      const status = statusForJoin(await countIn(tx, gameId), cap);
      if (existing) {
        await tx
          .update(rsvps)
          .set({ status, role, queuedAt: now, updatedAt: now })
          .where(eq(rsvps.id, existing.id));
      } else {
        await tx.insert(rsvps).values({ gameId, userId: viewer.id, role, status, queuedAt: now });
      }
      return { ok: true, message: status === "in" ? "You’re in. See you there!" : "The game is full, so you’re on the waitlist. You’ll move up automatically if someone drops." };
    }
    if (!existing || existing.status === "out") return { ok: true, message: "You weren’t on the list." };
    await tx.update(rsvps).set({ status: "out", updatedAt: now }).where(eq(rsvps.id, existing.id));
    const promoted = await rebalance(tx, gameId, cap);
    return {
      ok: true,
      message: promoted.length ? "You’re out. The next person on the waitlist moved up." : "You’re out. Thanks for letting the group know.",
    };
  });
}

export async function addGuest(viewer: Viewer | null, gameId: string, guestName: string): Promise<Result> {
  const name = guestName.trim().slice(0, 60);
  if (!name) return { ok: false, message: "Add the guest’s name." };
  const db = getDb();
  return db.transaction(async (tx) => {
    const cap = await lockGame(tx, gameId);
    if (cap == null) return { ok: false, message: "That game isn’t in the beta database." };
    const decision = canAddGuest({
      signedIn: Boolean(viewer),
      termsAccepted: Boolean(viewer?.termsAccepted),
      isHostOfGame: viewer ? await isHostOf(tx, gameId, viewer.email) : false,
    });
    if (!decision.ok || !viewer) return { ok: false, message: decision.ok ? "Sign in first." : decision.reason };
    const status = statusForJoin(await countIn(tx, gameId), cap);
    await tx.insert(rsvps).values({
      gameId,
      guestName: name,
      invitedByUserId: viewer.id,
      role: "guest",
      status,
      queuedAt: new Date(),
    });
    return { ok: true, message: status === "in" ? `${name} is in as your guest.` : `Game is full. ${name} is on the waitlist.` };
  });
}

export async function removeGuest(viewer: Viewer | null, gameId: string, rsvpId: string): Promise<Result> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const cap = await lockGame(tx, gameId);
    if (cap == null) return { ok: false, message: "That game isn’t in the beta database." };
    if (!viewer || !(viewer.isAdmin || (await isHostOf(tx, gameId, viewer.email)))) {
      return { ok: false, message: "Only hosts can remove guests." };
    }
    const updated = await tx
      .update(rsvps)
      .set({ status: "out", updatedAt: new Date() })
      .where(and(eq(rsvps.id, rsvpId), eq(rsvps.gameId, gameId), eq(rsvps.role, "guest")))
      .returning({ id: rsvps.id });
    if (!updated.length) return { ok: false, message: "Guest not found." };
    await rebalance(tx, gameId, cap);
    return { ok: true, message: "Guest removed." };
  });
}

export async function updateGameSettings(
  viewer: Viewer | null,
  gameId: string,
  patch: { startsAt?: Date; cap?: number; feeModel?: string; venue?: string; sheetIsOfficial?: boolean },
): Promise<Result> {
  if (!viewer?.isAdmin) return { ok: false, message: "Only beta admins can change game settings." };
  if (patch.cap != null && (!Number.isInteger(patch.cap) || patch.cap < 2 || patch.cap > 60)) {
    return { ok: false, message: "Cap must be between 2 and 60." };
  }
  const db = getDb();
  return db.transaction(async (tx) => {
    const cap = await lockGame(tx, gameId);
    if (cap == null) return { ok: false, message: "That game isn’t in the beta database." };
    await tx
      .update(games)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(games.id, gameId));
    if (patch.cap != null) await rebalance(tx, gameId, patch.cap);
    return { ok: true, message: "Game updated." };
  });
}

export async function addHost(viewer: Viewer | null, gameId: string, email: string, label: string): Promise<Result> {
  if (!viewer?.isAdmin) return { ok: false, message: "Only beta admins can add hosts." };
  const clean = email.trim().toLowerCase();
  if (!/.+@.+\..+/.test(clean)) return { ok: false, message: "Enter the host’s sign-in email." };
  await getDb()
    .insert(gameHosts)
    .values({ gameId, email: clean, label: label.trim() || null })
    .onConflictDoUpdate({ target: [gameHosts.gameId, gameHosts.email], set: { label: label.trim() || null } });
  return { ok: true, message: `${label.trim() || clean} can now host this game.` };
}

export async function removeHost(viewer: Viewer | null, gameId: string, email: string): Promise<Result> {
  if (!viewer?.isAdmin) return { ok: false, message: "Only beta admins can remove hosts." };
  await getDb().delete(gameHosts).where(and(eq(gameHosts.gameId, gameId), eq(gameHosts.email, email.toLowerCase())));
  return { ok: true, message: "Host removed." };
}

// ---------- Vouchers ----------

export interface VoucherSummary {
  remaining: number;
  issued: (typeof hostVouchers.$inferSelect & { redeemedByName: string | null })[];
}

export async function hostVoucherSummary(viewer: Viewer): Promise<VoucherSummary> {
  const db = getDb();
  const { start, end } = yearWindow(new Date());
  const rows = await db
    .select({ v: hostVouchers, u: { displayName: users.displayName, name: users.name, email: users.email } })
    .from(hostVouchers)
    .leftJoin(users, eq(users.id, hostVouchers.redeemedByUserId))
    .where(eq(hostVouchers.hostUserId, viewer.id))
    .orderBy(desc(hostVouchers.issuedAt))
    .limit(50);
  const thisYear = rows.filter((r) => r.v.issuedAt >= start && r.v.issuedAt < end).length;
  return {
    remaining: vouchersRemaining(thisYear),
    issued: rows.map((r) => ({ ...r.v, redeemedByName: r.u?.email || r.u?.name ? displayNameOf(r.u) : null })),
  };
}

export async function issueVoucher(viewer: Viewer | null, note: string, gameId: string | null): Promise<Result> {
  const blocked = requireReady(viewer);
  if (blocked || !viewer) return blocked!;
  if (!(viewer.isAdmin || (await isHostAnywhere(viewer.email)))) {
    return { ok: false, message: "Only hosts can give VIP guest vouchers." };
  }
  const db = getDb();
  return db.transaction(async (tx) => {
    // Serialize per host so two clicks can't pass the cap.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"voucher:" + viewer.id}))`);
    const now = new Date();
    const { start, end } = yearWindow(now);
    const [row] = await tx
      .select({ n: sql<number>`count(*)::int` })
      .from(hostVouchers)
      .where(and(eq(hostVouchers.hostUserId, viewer.id), gte(hostVouchers.issuedAt, start), lt(hostVouchers.issuedAt, end)));
    if (vouchersRemaining(row?.n ?? 0) <= 0) {
      return { ok: false, message: "You’ve used all 25 guest vouchers for this year." };
    }
    const code = voucherCode();
    await tx.insert(hostVouchers).values({
      code,
      hostUserId: viewer.id,
      gameId,
      note: note.trim().slice(0, 80) || null,
      issuedAt: now,
      redeemBy: addMonths(now, VOUCHER_REDEEM_WINDOW_MONTHS),
    });
    return { ok: true, message: `Voucher ${code} is ready. Share it with your guest.` };
  });
}

export async function redeemVoucher(viewer: Viewer | null, rawCode: string): Promise<Result> {
  const blocked = requireReady(viewer);
  if (blocked || !viewer) return blocked!;
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, message: "Enter a voucher code." };
  const db = getDb();
  return db.transaction(async (tx) => {
    const res = await tx.execute(sql`select id from host_vouchers where code = ${code} for update`);
    const vid = (res.rows[0] as { id?: string } | undefined)?.id;
    if (!vid) return { ok: false, message: "We couldn’t find that code." };
    const [v] = await tx.select().from(hostVouchers).where(eq(hostVouchers.id, vid)).limit(1);
    const now = new Date();
    const decision = redeemDecision(v, viewer.id, now);
    if (!decision.ok) return { ok: false, message: decision.reason };
    await tx
      .update(hostVouchers)
      .set({ redeemedByUserId: viewer.id, redeemedAt: now, vipUntil: decision.vipUntil })
      .where(eq(hostVouchers.id, vid));
    const [host] = await tx.select().from(users).where(eq(users.id, v.hostUserId)).limit(1);
    return {
      ok: true,
      message: `You’re a VIP guest of ${host ? displayNameOf(host) : "your host"} until ${decision.vipUntil.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" })}.`,
    };
  });
}

export async function myVipBadge(viewer: Viewer): Promise<{ hostName: string; until: Date } | null> {
  const host = schema.users;
  const [row] = await getDb()
    .select({ until: hostVouchers.vipUntil, displayName: host.displayName, name: host.name, email: host.email })
    .from(hostVouchers)
    .innerJoin(host, eq(host.id, hostVouchers.hostUserId))
    .where(and(eq(hostVouchers.redeemedByUserId, viewer.id), gt(hostVouchers.vipUntil, new Date())))
    .orderBy(desc(hostVouchers.vipUntil))
    .limit(1);
  return row?.until ? { hostName: displayNameOf(row), until: row.until } : null;
}

export async function acceptTerms(viewer: Viewer | null, version: string): Promise<Result> {
  if (!viewer) return { ok: false, message: "Sign in first." };
  await getDb()
    .update(users)
    .set({ termsAcceptedAt: new Date(), termsVersion: version })
    .where(eq(users.id, viewer.id));
  return { ok: true, message: "Thanks. You can RSVP now." };
}

export async function updateDisplayName(viewer: Viewer | null, name: string): Promise<Result> {
  if (!viewer) return { ok: false, message: "Sign in first." };
  const clean = name.trim().slice(0, 40);
  if (!clean) return { ok: false, message: "Enter the name you want on the list." };
  await getDb().update(users).set({ displayName: clean }).where(eq(users.id, viewer.id));
  return { ok: true, message: "Name saved." };
}
