import type { ClerkRole, ProfileInput, Repeat, Weekday } from "./types";

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

export function formatWhen(
  date: string,
  time: string,
  repeat: Repeat,
): { weekday: Weekday; when: string } | null {
  const dt = new Date(`${date}T${time}`);
  if (Number.isNaN(dt.getTime())) return null;
  const weekday = dt.toLocaleDateString("en-US", { weekday: "short" });
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
  const when =
    repeat === "One-off"
      ? `${weekday} ${time}, ${dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : `${weekday} ${time}`;
  return { weekday, when };
}

export function repeatTag(repeat: Repeat): string {
  return repeat === "One-off" ? "One-off" : `Repeats ${repeat.toLowerCase()}`;
}
