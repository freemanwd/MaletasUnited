/**
 * Auth.js (NextAuth v5) for the Maletas Play private beta.
 *
 * - Google sign-in when AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are set.
 * - Email magic link when EMAIL_SERVER / EMAIL_FROM are set (any SMTP sender).
 * - No passwords are stored. Sessions live in Postgres (Drizzle adapter).
 * - Everything is off unless `realSignupEnabled()` (preview on, production off).
 */
import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb, hasDatabase, schema } from "@/lib/db";
import { TERMS_COOKIE, TERMS_VERSION, realSignupEnabled } from "@/lib/beta/flag";

export function googleConfigured(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export function emailConfigured(): boolean {
  return Boolean(process.env.EMAIL_SERVER && process.env.EMAIL_FROM);
}

export function authReady(): boolean {
  return (
    realSignupEnabled() &&
    hasDatabase() &&
    Boolean(process.env.AUTH_SECRET) &&
    (googleConfigured() || emailConfigured())
  );
}

function buildConfig(): NextAuthConfig {
  const base: NextAuthConfig = {
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    pages: { signIn: "/beta", verifyRequest: "/beta?check=email", error: "/beta" },
    providers: [],
  };
  if (!authReady()) {
    return { ...base, session: { strategy: "jwt" }, secret: process.env.AUTH_SECRET || "maletas-beta-disabled" };
  }
  const db = getDb();
  const providers: NextAuthConfig["providers"] = [];
  if (googleConfigured()) providers.push(Google);
  if (emailConfigured()) {
    providers.push(
      Nodemailer({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
        maxAge: 30 * 60,
      }),
    );
  }
  return {
    ...base,
    providers,
    adapter: DrizzleAdapter(db, {
      usersTable: schema.users,
      accountsTable: schema.accounts,
      sessionsTable: schema.sessions,
      verificationTokensTable: schema.verificationTokens,
    }),
    session: { strategy: "database", maxAge: 60 * 60 * 24 * 30 },
    callbacks: {
      session({ session, user }) {
        if (session.user && user) session.user.id = user.id;
        return session;
      },
    },
    events: {
      // The sign-in form sets a short-lived cookie when the terms box is ticked.
      async signIn({ user }) {
        if (!user?.id) return;
        try {
          const jar = await cookies();
          if (jar.get(TERMS_COOKIE)?.value !== TERMS_VERSION) return;
          await db
            .update(schema.users)
            .set({ termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION })
            .where(and(eq(schema.users.id, user.id), isNull(schema.users.termsAcceptedAt)));
        } catch {
          // The /beta page asks again if this didn't stick.
        }
      },
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => buildConfig());
