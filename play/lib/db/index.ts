import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

/** Neon's Vercel integration sets DATABASE_URL (pooled) and POSTGRES_URL. */
export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

export function hasDatabase(): boolean {
  return Boolean(databaseUrl());
}

const globalForDb = globalThis as unknown as { __maletasDb?: Db };

/** Lazily connect so builds and pages work before the database is attached. */
export function getDb(): Db {
  if (globalForDb.__maletasDb) return globalForDb.__maletasDb;
  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL is not set");
  const local = /localhost|127\.0\.0\.1/.test(url);
  const pool = new Pool({
    connectionString: url,
    max: 5,
    ssl: local ? undefined : { rejectUnauthorized: true },
  });
  globalForDb.__maletasDb = drizzle(pool, { schema });
  return globalForDb.__maletasDb;
}

export { schema };
