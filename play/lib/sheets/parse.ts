/** Parse a public Google Sheet sign-up CSV. Names only — never emails. */

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const SKIP_NAMES = /^(hosts?|players?|waitlist|waitlist below|full|signup|sign[- ]up)$/i;
const MAX_RE = /\bmax\s+(\d+)/i;
const WAITLIST_RE = /^waitlist\b/i;
const FULL_RE = /^full$/i;

export const SHEET_REVALIDATE_SECONDS = 5 * 60;

export interface ParsedSignupSheet {
  capacity: number | null;
  hosts: string[];
  players: string[];
  waitlist: string[];
  full: boolean;
  dateLabel: string | null;
}

export function stripEmail(value: string): string | null {
  const stripped = value.replace(EMAIL_RE, " ").replace(/\s+/g, " ").trim();
  return stripped || null;
}

function isName(value: string): boolean {
  if (!value) return false;
  if (SKIP_NAMES.test(value)) return false;
  if (MAX_RE.test(value)) return false;
  if (FULL_RE.test(value) || WAITLIST_RE.test(value)) return false;
  return true;
}

/** Minimal CSV parser that respects quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");
  while (i < src.length) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i += 1;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export function parseSignupSheet(csv: string): ParsedSignupSheet {
  const rows = parseCsv(csv);
  let capacity: number | null = null;
  let dateLabel: string | null = null;
  const hosts: string[] = [];
  const players: string[] = [];
  const waitlist: string[] = [];
  let section: "players" | "waitlist" = "players";
  let sawFull = false;

  rows.forEach((raw, index) => {
    const cells = raw.map((c) => stripEmail(c.trim()) ?? "");
    const first = cells[0] ?? "";
    const second = cells[1] ?? "";
    const third = cells[2] ?? "";

    if (index === 0) {
      const maxHit = MAX_RE.exec([first, second, third].join(" "));
      if (maxHit) capacity = Number(maxHit[1]);
      if (/\d{1,2}\/\d{1,2}/.test(third)) dateLabel = third;
      if (second && !/^hosts?$/i.test(second) && isName(second)) hosts.push(second);
      return;
    }

    if (FULL_RE.test(first)) {
      sawFull = true;
      if (second && isName(second) && !hosts.includes(second)) hosts.push(second);
      return;
    }
    if (WAITLIST_RE.test(first) || WAITLIST_RE.test(second)) {
      section = "waitlist";
      return;
    }

    if (second && isName(second) && !hosts.includes(second)) hosts.push(second);

    if (first && isName(first)) {
      if (section === "waitlist") {
        if (!waitlist.includes(first)) waitlist.push(first);
      } else if (!players.includes(first) && !hosts.includes(first)) {
        players.push(first);
      }
    }
  });

  const taken = hosts.length + players.length;
  const full = sawFull || (capacity != null && taken >= capacity);
  return { capacity, hosts, players, waitlist, full, dateLabel };
}

export function sheetExportUrl(sheetId: string, gid = "0"): string {
  const id = encodeURIComponent(sheetId);
  const tab = encodeURIComponent(gid);
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${tab}`;
}

export function sheetEditUrl(sheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/edit`;
}
