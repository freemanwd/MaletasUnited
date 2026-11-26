import type {
  ClerkRole,
  FeeCadence,
  Game,
  ProfileInput,
  Repeat,
  SessionUser,
  Weekday,
} from "./types";
import { FEE_CADENCE_LABELS } from "./types";
import { TIER } from "./tier";

export const GAME_TZ = "America/New_York";
export const GAME_TZ_LABEL = "ET";

export function initials(name: string): string {
  return name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    const last = parts[parts.length - 1] ?? "";
    return `${parts[0]} ${last[0]}.`;
  }
  return parts[0] ?? "";
}

export function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function zipPrefix(value: string): string {
  return value.replace(/\W/g, "").slice(0, 3).toLowerCase();
}

export function rolesFromLabel(label: ProfileInput["rolesLabel"]): ClerkRole[] {
  if (label === "Host") return ["host"];
  if (label === "Player and host") return ["player", "host"];
  return ["player"];
}

export function rolesLabel(roles: ClerkRole[]): ProfileInput["rolesLabel"] {
  const isPlayer = roles.includes("player");
  const isHost = roles.includes("host");
  if (isPlayer && isHost) return "Player and host";
  if (isHost) return "Host";
  return "Player";
}

export function displayRole(roles: ClerkRole[]): string {
  return rolesLabel(roles);
}

export function ensureHostRole(roles: ClerkRole[]): ClerkRole[] {
  if (roles.includes("host")) return roles;
  return roles.includes("player") ? ["player", "host"] : ["host"];
}

export function slugHandle(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "player"
  );
}

export function uniqueHandle(desired: string, taken: Set<string>): string {
  const base = slugHandle(desired);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}${n}`)) n += 1;
  return `${base}${n}`;
}

export function makeInviteCode(name: string): string {
  const stem =
    name
      .split(/\s+/)[0]
      ?.toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8) || "PLAYER";
  const n = Math.floor(100 + Math.random() * 900);
  return `MAL-${stem}${n}`;
}

export function to12h(time: string): string {
  const [hourRaw, minuteRaw] = time.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

export function formatGameWhen(opts: {
  weekday: Weekday;
  kickoff: string;
  repeat: Repeat;
  nextDate?: string;
}): string {
  const clock = `${to12h(opts.kickoff)} ${GAME_TZ_LABEL}`;
  if (opts.nextDate) {
    const dt = new Date(`${opts.nextDate}T12:00:00`);
    const datePart = Number.isNaN(dt.getTime())
      ? opts.nextDate
      : dt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: GAME_TZ,
        });
    const line = `${opts.weekday} ${datePart}, ${clock}`;
    return opts.repeat === "One-off" ? line : `${line} · weekly`;
  }
  return `${opts.weekday} ${clock}`;
}

export function formatWhen(
  date: string,
  time: string,
  repeat: Repeat,
): { weekday: Weekday; when: string; nextDate: string } | null {
  const dt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(dt.getTime())) return null;
  const weekday = dt.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: GAME_TZ,
  });
  if (weekday === "Sun") return null;
  if (
    weekday !== "Mon" &&
    weekday !== "Tue" &&
    weekday !== "Wed" &&
    weekday !== "Thu" &&
    weekday !== "Fri" &&
    weekday !== "Sat"
  ) {
    return null;
  }
  const nextDate = date;
  return {
    weekday,
    nextDate,
    when: formatGameWhen({ weekday, kickoff: time, repeat, nextDate }),
  };
}

export function displayFee(game: Game): string {
  const cadence = FEE_CADENCE_LABELS[game.feeCadence] ?? "";
  if (game.feeCadence === "free") {
    return game.feeLabel && game.feeLabel !== "Free" ? game.feeLabel : "Free";
  }
  const amountRaw = game.feeAmount || game.fee || "";
  const amount = /^\d/.test(amountRaw.trim()) ? `$${amountRaw.trim()}` : amountRaw;
  const label = game.feeLabel || cadence;
  const parts = [label];
  if (amount && amount !== label) parts.push(amount);
  if (cadence && cadence !== label) parts.push(cadence.toLowerCase());
  parts.push("paid directly to host");
  return parts.join(" · ");
}

export function membershipCaption(user: SessionUser | null): string | null {
  if (!user?.vip) return null;
  if (user.sponsoredBy && user.sponsoredUntil) {
    const until = new Date(user.sponsoredUntil);
    const datePart = Number.isNaN(until.getTime())
      ? user.sponsoredUntil
      : until.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: GAME_TZ,
        });
    return `Sponsored by ${user.sponsoredBy} until ${datePart}`;
  }
  if (user.vipPlan === "yearly") return `${TIER.productName} · yearly`;
  if (user.vipPlan === "monthly") return `${TIER.productName} · monthly`;
  return TIER.productName;
}

export function makeVoucherCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `MAL-GIFT-${n}`;
}

export function repeatTag(repeat: Repeat): string {
  return repeat === "One-off" ? "One-off" : `Repeats ${repeat.toLowerCase()}`;
}
