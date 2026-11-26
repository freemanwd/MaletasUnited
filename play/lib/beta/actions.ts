"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { TERMS_COOKIE, TERMS_VERSION, realSignupEnabled } from "./flag";
import { zonedToUtc } from "./rules";
import * as svc from "./service";

export type ActionState = { ok: boolean; message: string } | null;

const OFF: ActionState = { ok: false, message: "Real sign-up isn’t switched on here yet." };

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
}

function safePath(raw: string): string {
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/beta";
}

function done(result: svc.Result, paths: string[]): ActionState {
  for (const p of paths) revalidatePath(p);
  return result;
}

export async function signInAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  if (str(form, "terms") !== "on") {
    return { ok: false, message: "Tick the box to agree that Maletas is only a matchmaker." };
  }
  const jar = await cookies();
  jar.set(TERMS_COOKIE, TERMS_VERSION, { httpOnly: true, sameSite: "lax", secure: true, maxAge: 60 * 60, path: "/" });
  const redirectTo = safePath(str(form, "next") || "/beta");
  const provider = str(form, "provider");
  if (provider === "email") {
    const email = str(form, "email").trim();
    if (!/.+@.+\..+/.test(email)) return { ok: false, message: "Enter your email for the sign-in link." };
    try {
      await signIn("nodemailer", { email, redirectTo });
    } catch (err) {
      unstable_rethrow(err);
      return { ok: false, message: "We couldn’t send the sign-in email. Try again, or use Google." };
    }
    return { ok: true, message: "Check your email for the sign-in link." };
  }
  try {
    await signIn("google", { redirectTo });
  } catch (err) {
    unstable_rethrow(err);
    return { ok: false, message: "Google sign-in isn’t available right now. Try again." };
  }
  return null;
}

export async function signOutAction(): Promise<void> {
  if (!realSignupEnabled()) return;
  await signOut({ redirectTo: "/beta" });
}

export async function acceptTermsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  if (str(form, "terms") !== "on") return { ok: false, message: "Tick the box to continue." };
  return done(await svc.acceptTerms(await svc.getViewer(), TERMS_VERSION), ["/beta"]);
}

export async function updateNameAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  return done(await svc.updateDisplayName(await svc.getViewer(), str(form, "displayName")), ["/beta"]);
}

export async function rsvpAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  const gameId = str(form, "gameId");
  const intent = str(form, "intent") === "out" ? "out" : "in";
  return done(await svc.setMyRsvp(await svc.getViewer(), gameId, intent), [`/games/${gameId}`]);
}

export async function addGuestAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  const gameId = str(form, "gameId");
  return done(await svc.addGuest(await svc.getViewer(), gameId, str(form, "guestName")), [`/games/${gameId}`]);
}

export async function removeGuestAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  const gameId = str(form, "gameId");
  return done(await svc.removeGuest(await svc.getViewer(), gameId, str(form, "rsvpId")), [`/games/${gameId}`]);
}

export async function gameSettingsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  const gameId = str(form, "gameId");
  const tz = str(form, "timezone") || "America/New_York";
  const startsAt = str(form, "startsAt") ? zonedToUtc(str(form, "startsAt"), tz) : undefined;
  if (startsAt === null) return { ok: false, message: "Pick a valid date and time." };
  const cap = str(form, "cap") ? Number(str(form, "cap")) : undefined;
  return done(
    await svc.updateGameSettings(await svc.getViewer(), gameId, {
      startsAt,
      cap,
      feeModel: str(form, "feeModel").trim() || undefined,
      venue: str(form, "venue").trim() || undefined,
    }),
    [`/games/${gameId}`],
  );
}

export async function sheetOfficialAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  const gameId = str(form, "gameId");
  const official = str(form, "sheetIsOfficial") === "true";
  const res = await svc.updateGameSettings(await svc.getViewer(), gameId, { sheetIsOfficial: official });
  return done(
    res.ok
      ? { ok: true, message: official ? "The Google Sheet is the official list again." : "App RSVPs are now the official list for this game." }
      : res,
    [`/games/${gameId}`],
  );
}

export async function addHostAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  const gameId = str(form, "gameId");
  return done(await svc.addHost(await svc.getViewer(), gameId, str(form, "email"), str(form, "label")), [`/games/${gameId}`]);
}

export async function removeHostAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  const gameId = str(form, "gameId");
  return done(await svc.removeHost(await svc.getViewer(), gameId, str(form, "email")), [`/games/${gameId}`]);
}

export async function issueVoucherAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  return done(await svc.issueVoucher(await svc.getViewer(), str(form, "note"), str(form, "gameId") || null), ["/beta"]);
}

export async function redeemVoucherAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!realSignupEnabled()) return OFF;
  return done(await svc.redeemVoucher(await svc.getViewer(), str(form, "code")), ["/beta"]);
}
