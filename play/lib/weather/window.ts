import type { Game, Weekday } from "../types";
import { GAME_TZ } from "../format";

const WEEKDAY_INDEX: Record<Weekday, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Instant whose wall-clock in `timeZone` is `date` (YYYY-MM-DD) + `time` (HH:MM). */
export function instantFromZonedParts(date: string, time: string, timeZone: string): Date | null {
  const dateParts = date.split("-").map(Number);
  const timeParts = time.split(":").map(Number);
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  const hour = timeParts[0];
  const minute = timeParts[1] ?? 0;
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return null;

  const wanted = Date.UTC(year, month - 1, day, hour, minute, 0);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  function tzAsUtc(ms: number): number {
    const parts = Object.fromEntries(fmt.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));
    return Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      0,
    );
  }

  let instant = wanted;
  for (let i = 0; i < 4; i += 1) {
    const delta = wanted - tzAsUtc(instant);
    if (delta === 0) break;
    instant += delta;
  }
  if (tzAsUtc(instant) !== wanted) return null;
  return new Date(instant);
}

export function nextDateForWeekday(weekday: Weekday, timeZone: string, from = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = (d: Date) => Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  const today = parts(from);
  const todayIdx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[today.weekday ?? ""] ?? 0;
  const target = WEEKDAY_INDEX[weekday];
  let add = (target - todayIdx + 7) % 7;
  const date = `${today.year}-${today.month}-${today.day}`;
  if (add === 0) return date;
  const base = new Date(`${date}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + add);
  const shifted = parts(base);
  return `${shifted.year}-${shifted.month}-${shifted.day}`;
}

export function gameKickoffWindow(game: Pick<Game, "nextDate" | "weekday" | "kickoff" | "timezone" | "durationMinutes" | "repeat">): {
  start: Date;
  end: Date;
  date: string;
  timeZone: string;
} | null {
  const timeZone = game.timezone || GAME_TZ;
  const date = game.nextDate || nextDateForWeekday(game.weekday, timeZone);
  const start = instantFromZonedParts(date, game.kickoff || "08:00", timeZone);
  if (!start) return null;
  const duration = game.durationMinutes && game.durationMinutes > 0 ? game.durationMinutes : 120;
  return { start, end: new Date(start.getTime() + duration * 60_000), date, timeZone };
}

export function formatWindowLabel(start: Date, end: Date, timeZone: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const startLabel = start.toLocaleString("en-US", opts);
  const endClock = end.toLocaleString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
  return `${startLabel} – ${endClock}`;
}
