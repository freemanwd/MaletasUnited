import type { ClerkRole, ProfileInput, SessionUser } from "../types";

/**
 * Auth adapter shaped for a later Clerk swap.
 *
 * Clerk mapping (production):
 * - `id` → `user.id`
 * - `email` → `user.primaryEmailAddress?.emailAddress`
 * - `imageUrl` → `user.imageUrl`
 * - `roles` → `user.publicMetadata.roles` as `ClerkRole[]`
 * - `vip` → Stripe Billing subscription (Maletas VIP) or `publicMetadata.vip`
 *
 * Local demo: profiles live in localStorage. `signInWithClerk` is a no-op
 * placeholder so UI can call the same surface later.
 */
export interface AuthAdapter {
  getSession(): Promise<SessionUser | null>;
  register(input: ProfileInput): Promise<SessionUser>;
  updateProfile(input: ProfileInput): Promise<SessionUser>;
  signOut(): Promise<void>;
  /** Stand-in for Clerk `<SignIn/>`. No accounts exist yet. */
  signInWithClerk(): Promise<void>;
  hasRole(role: ClerkRole): boolean;
  /** Preview-only: grant or revoke the admin role without Clerk. */
  setDemoAdmin(enabled: boolean): Promise<SessionUser | null>;
}

export const CLERK_ROLE_DOC = {
  player: "Can join sheets, post in the clubhouse, shop, and hold VIP.",
  host: "Can publish games (one-off, weekly, fortnightly) and manage their sheets.",
  admin: "Can open /admin (counts, VIP revenue, vendor commission).",
} as const;
