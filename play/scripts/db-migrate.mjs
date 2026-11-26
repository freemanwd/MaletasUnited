/**
 * Apply Drizzle migrations and seed the beta games. Runs before `next build`.
 *
 * - Skips when no database is attached (DATABASE_URL / POSTGRES_URL).
 * - Skips on production unless MALETAS_REAL_SIGNUP=on.
 * - Seeding never overwrites edits: games insert once; hosts from
 *   MALETAS_GK_HOST_EMAILS are added if missing.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

// Prefer a direct (unpooled) connection for DDL; fall back to the pooled URL.
const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;
const flag = (process.env.MALETAS_REAL_SIGNUP || "").toLowerCase();
const isProd = process.env.VERCEL_ENV === "production";

if (!url) {
  console.log("[db-migrate] No DATABASE_URL; skipping migrations.");
  process.exit(0);
}
if (isProd && !["on", "true", "1", "yes"].includes(flag)) {
  console.log("[db-migrate] Production with real sign-up off; skipping migrations.");
  process.exit(0);
}

const local = /localhost|127\.0\.0\.1/.test(url);
const pool = new pg.Pool({ connectionString: url, max: 1, ssl: local ? undefined : { rejectUnauthorized: true } });
const db = drizzle(pool);

try {
  await migrate(db, { migrationsFolder: new URL("../drizzle", import.meta.url).pathname });
  console.log("[db-migrate] Migrations applied.");

  await pool.query(
    `insert into games (id, title, host_name, venue, starts_at, timezone, cap, fee_model, sheet_is_official)
     values ($1, $2, $3, $4, $5, $6, $7, $8, true)
     on conflict (id) do nothing`,
    [
      "jax-glen-kernan",
      "Maletas at Glen Kernan",
      "Dave",
      "Glen Kernan area (private field)",
      "2026-11-28T13:00:00Z", // Sat Nov 28, 2026, 8:00 AM ET
      "America/New_York",
      20,
      "Free / pay what you can (set by the hosts)",
    ],
  );

  // "Name <email>" or bare emails, comma or semicolon separated.
  const hosts = (process.env.MALETAS_GK_HOST_EMAILS || "")
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = /^(.*?)<([^>]+)>$/.exec(s);
      return m ? { label: m[1].trim() || null, email: m[2].trim().toLowerCase() } : { label: null, email: s.toLowerCase() };
    })
    .filter((h) => /.+@.+\..+/.test(h.email));
  for (const h of hosts) {
    await pool.query(
      `insert into game_hosts (game_id, email, label) values ($1, $2, $3) on conflict (game_id, email) do nothing`,
      ["jax-glen-kernan", h.email, h.label],
    );
  }
  const { rows } = await pool.query(
    `select (select count(*) from games where id = 'jax-glen-kernan')::int as games,
            (select count(*) from game_hosts where game_id = 'jax-glen-kernan')::int as hosts`,
  );
  console.log(
    `[db-migrate] Seed checked: ${hosts.length} host email(s) from env; database has GK game=${rows[0].games}, GK hosts=${rows[0].hosts}.`,
  );
} catch (err) {
  console.error("[db-migrate] Failed:", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
