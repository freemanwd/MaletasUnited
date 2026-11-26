/**
 * Real sign-up (accounts, database RSVPs) is a private beta.
 *
 * - Preview / staging deployments and `next dev`: ON unless MALETAS_REAL_SIGNUP=off.
 * - Production: OFF unless MALETAS_REAL_SIGNUP=on.
 *
 * Read at request time (call after `connection()` in server components).
 */
export function realSignupEnabled(): boolean {
  const raw = (process.env.MALETAS_REAL_SIGNUP ?? "").trim().toLowerCase();
  if (["on", "true", "1", "yes"].includes(raw)) return true;
  if (["off", "false", "0", "no"].includes(raw)) return false;
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv) return vercelEnv !== "production";
  return process.env.NODE_ENV === "development";
}

/** Comma-separated sign-in emails that can run beta admin tools (flip the sheet, edit games, add hosts). */
export function adminEmails(): string[] {
  return parseEmails(process.env.MALETAS_ADMIN_EMAILS);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export function parseEmails(value: string | undefined): string[] {
  return (value ?? "")
    .split(/[,;\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => /.+@.+\..+/.test(item));
}

export const TERMS_VERSION = "beta-2026-11";
export const TERMS_COOKIE = "maletas_terms";
