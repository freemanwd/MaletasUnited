import { parseFit } from "./fit";
import type { ParsedWorkout } from "./types";

const EARTH_M = 6371000;

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const r1 = (a.lat * Math.PI) / 180;
  const r2 = (b.lat * Math.PI) / 180;
  const dLat = r2 - r1;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r1) * Math.cos(r2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

function text(el: Element | null): string {
  return (el?.textContent ?? "").trim();
}

function parseGpx(xml: string): ParsedWorkout | null {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) return null;
  const pts = [...doc.querySelectorAll("trkpt, rtept")];
  if (pts.length < 2 && !doc.querySelector("metadata, gpx")) return pts.length ? {} : null;
  const points = pts
    .map((pt) => {
      const lat = Number(pt.getAttribute("lat"));
      const lon = Number(pt.getAttribute("lon"));
      const time = text(pt.querySelector("time"));
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      return { lat, lon, time: time ? Date.parse(time) : NaN };
    })
    .filter((p): p is { lat: number; lon: number; time: number } => Boolean(p));
  if (points.length < 2) return points.length ? { note: "The GPX file did not include a usable track." } : null;
  let distanceMeters = 0;
  for (let i = 1; i < points.length; i += 1) distanceMeters += haversine(points[i - 1]!, points[i]!);
  const times = points.map((p) => p.time).filter((t) => Number.isFinite(t));
  const durationSeconds = times.length >= 2 ? Math.max(0, (times[times.length - 1]! - times[0]!) / 1000) : undefined;
  return { distanceMeters, durationSeconds, note: "GPX files usually have distance and time, not calories or steps." };
}

function parseTcx(xml: string): ParsedWorkout | null {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) return null;
  const laps = [...doc.querySelectorAll("Lap")];
  if (!laps.length && !doc.querySelector("Activity, TrainingCenterDatabase")) return null;
  let durationSeconds = 0;
  let distanceMeters = 0;
  let calories = 0;
  for (const lap of laps) {
    durationSeconds += Number(text(lap.querySelector("TotalTimeSeconds"))) || 0;
    distanceMeters += Number(text(lap.querySelector("DistanceMeters"))) || 0;
    calories += Number(text(lap.querySelector("Calories"))) || 0;
  }
  if (!laps.length) {
    const track = [...doc.querySelectorAll("Trackpoint")];
    const first = track[0]?.querySelector("Time");
    const last = track[track.length - 1]?.querySelector("Time");
    if (first && last) durationSeconds = Math.max(0, (Date.parse(text(last)) - Date.parse(text(first))) / 1000);
    const dist = text(track[track.length - 1]?.querySelector("DistanceMeters") ?? null);
    if (dist) distanceMeters = Number(dist) || 0;
  }
  return {
    durationSeconds: durationSeconds || undefined,
    distanceMeters: distanceMeters || undefined,
    calories: calories || undefined,
  };
}

function parseCsvText(textValue: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;
  const src = textValue.replace(/^\uFEFF/, "");
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

function norm(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

type ColKind = "calories" | "steps" | "distanceM" | "distanceKm" | "distanceMi" | "durationS" | "activeS";

function classifyHeader(name: string): ColKind | null {
  const n = norm(name);
  if (!n || /date|time of day|start|end|name|type|activity$/.test(n) && !/duration|time/.test(n)) {
    if (/date|name|type|activity$/.test(n) && !/(calor|step|distance|duration|active|elapsed|moving)/.test(n)) {
      return null;
    }
  }
  if (/calor|energy kcal|energy \(kcal\)/.test(n)) return "calories";
  if (/^steps$|step count|total steps/.test(n)) return "steps";
  if (/distance/.test(n) && /(km|kilometer)/.test(n)) return "distanceKm";
  if (/distance/.test(n) && /(mi|mile)/.test(n)) return "distanceMi";
  if (/distance/.test(n) && /(m\b|meter)/.test(n) && !/km/.test(n)) return "distanceM";
  if (/^miles$|distance mi/.test(n)) return "distanceMi";
  if (/^km$|kilometers/.test(n)) return "distanceKm";
  if (/distance/.test(n)) return "distanceKm"; // many Fitbit/Strava CSVs are km or a unit column
  if (/active min|minutes active|active_minutes/.test(n)) return "activeS";
  if (/moving time|elapsed time|duration|total time/.test(n)) return "durationS";
  return null;
}

function parseDurationCell(raw: string): number | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  const hms = s.match(/^(\d+):(\d{2})(?::(\d{2}(?:\.\d+)?))?$/);
  if (hms) {
    const a = Number(hms[1]);
    const b = Number(hms[2]);
    const c = hms[3] != null ? Number(hms[3]) : 0;
    // h:mm:ss or m:ss
    if (hms[3] != null) return a * 3600 + b * 60 + c;
    return a * 60 + b;
  }
  const num = Number(s.replace(/,/g, "").replace(/[a-z ]+$/i, ""));
  if (!Number.isFinite(num) || num <= 0) return null;
  if (/ms|millisecond/.test(s) || num > 86_400_000) return num / 1000;
  if (/hour|hrs|hr\b/.test(s)) return num * 3600;
  if (/min/.test(s)) return num * 60;
  if (/sec|s\b/.test(s)) return num;
  // Strava often uses seconds; Fitbit duration can be ms.
  if (num > 10_000) return num / 1000;
  return num;
}

function parseNumber(raw: string): number | null {
  const n = Number(String(raw).replace(/,/g, "").replace(/[^\d.eE+-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseCsv(textValue: string): ParsedWorkout | null {
  const rows = parseCsvText(textValue).filter((r) => r.some((c) => c.trim()));
  if (rows.length < 2) return null;
  const header = rows[0]!.map(norm);
  const kinds = header.map(classifyHeader);
  if (!kinds.some(Boolean)) return null;
  const data = rows.slice(1);
  const totalsRow = data.find((r) => /total/.test(norm(r[0] ?? "")));
  const use = totalsRow ? [totalsRow] : data;
  const acc: Required<Record<ColKind, number>> = {
    calories: 0,
    steps: 0,
    distanceM: 0,
    distanceKm: 0,
    distanceMi: 0,
    durationS: 0,
    activeS: 0,
  };
  const selected = totalsRow ? use : data.length <= 3 ? data : [data[data.length - 1]!];
  for (const row of selected) {
    kinds.forEach((kind, i) => {
      if (!kind) return;
      const raw = row[i] ?? "";
      if (kind === "durationS" || kind === "activeS") {
        const sec = parseDurationCell(raw);
        if (sec) acc[kind] += sec;
        return;
      }
      const n = parseNumber(raw);
      if (n) acc[kind] += n;
    });
  }
  const distanceMeters =
    acc.distanceM ||
    (acc.distanceKm ? acc.distanceKm * 1000 : 0) ||
    (acc.distanceMi ? acc.distanceMi * 1609.344 : 0) ||
    undefined;
  const parsed: ParsedWorkout = {
    calories: acc.calories || undefined,
    steps: acc.steps || undefined,
    distanceMeters,
    durationSeconds: acc.durationS || undefined,
    activeSeconds: acc.activeS || undefined,
    note: totalsRow
      ? "Used the totals row in your CSV."
      : data.length > 3
        ? "Used the most recent row in your CSV. You can edit the numbers before posting."
        : undefined,
  };
  return parsed.calories || parsed.steps || parsed.distanceMeters || parsed.durationSeconds || parsed.activeSeconds
    ? parsed
    : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const match = Object.keys(obj).find((k) => norm(k) === norm(key));
    if (!match) continue;
    const value = obj[match];
    if (typeof value === "number" && value > 0) return value;
    if (typeof value === "string") {
      const n = parseNumber(value);
      if (n) return n;
    }
    if (value && typeof value === "object" && "value" in (value as object)) {
      const n = Number((value as { value: unknown }).value);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return undefined;
}

function parseActivityObject(obj: Record<string, unknown>): ParsedWorkout {
  let calories = pickNumber(obj, ["calories", "caloriesBurned", "kcal", "energy", "kilojoules"]);
  if (calories && obj.kilojoules && calories === Number(obj.kilojoules)) calories = calories / 4.184;
  const steps = pickNumber(obj, ["steps", "stepCount", "totalSteps"]);
  const distanceKm = pickNumber(obj, ["distanceKm", "distance_km"]);
  const distanceMi = pickNumber(obj, ["distanceMiles", "distance_mi", "miles"]);
  let distance = pickNumber(obj, ["distance", "distanceMeters", "distance_m"]);
  let distanceMeters: number | undefined;
  if (distanceKm) distanceMeters = distanceKm * 1000;
  else if (distanceMi) distanceMeters = distanceMi * 1609.344;
  else if (distance) {
    // Heuristic: Strava JSON is meters; Fitbit often km if small.
    if (distance > 1000) distanceMeters = distance;
    else distanceMeters = distance * 1000;
  }
  let durationSeconds = pickNumber(obj, ["durationSeconds", "elapsed_time", "moving_time", "duration"]);
  if (durationSeconds && durationSeconds > 10_000) durationSeconds = durationSeconds / 1000;
  const activeMinutes = pickNumber(obj, ["activeMinutes", "veryActiveMinutes", "minutesActive"]);
  return {
    calories,
    steps,
    distanceMeters,
    durationSeconds,
    activeSeconds: activeMinutes ? activeMinutes * 60 : undefined,
  };
}

function mergeParsed(a: ParsedWorkout, b: ParsedWorkout): ParsedWorkout {
  return {
    calories: (a.calories ?? 0) + (b.calories ?? 0) || a.calories,
    steps: (a.steps ?? 0) + (b.steps ?? 0) || a.steps,
    distanceMeters: (a.distanceMeters ?? 0) + (b.distanceMeters ?? 0) || a.distanceMeters,
    durationSeconds: (a.durationSeconds ?? 0) + (b.durationSeconds ?? 0) || a.durationSeconds,
    activeSeconds: (a.activeSeconds ?? 0) + (b.activeSeconds ?? 0) || a.activeSeconds,
  };
}

function parseJson(textValue: string): ParsedWorkout | null {
  let data: unknown;
  try {
    data = JSON.parse(textValue);
  } catch {
    return null;
  }
  const rec = asRecord(data);
  const lists: unknown[] = [];
  if (Array.isArray(data)) lists.push(...data);
  if (rec) {
    for (const key of ["activities", "workouts", "data", "bucket", "metrics", "records"]) {
      const value = rec[key];
      if (Array.isArray(value)) lists.push(...value);
    }
    const direct = parseActivityObject(rec);
    if (direct.calories || direct.steps || direct.distanceMeters || direct.durationSeconds) {
      if (!lists.length) return direct;
    }
  }
  const activities = lists.map(asRecord).filter((row): row is Record<string, unknown> => Boolean(row));
  if (activities.length === 1) return parseActivityObject(activities[0]!);
  if (activities.length > 1) {
    // Prefer the most recent activity rather than summing a whole history export.
    const last = activities[activities.length - 1]!;
    return { ...parseActivityObject(last), note: "Used the last activity in the file. You can edit the numbers before posting." };
  }
  return rec ? parseActivityObject(rec) : null;
}

function hasAny(parsed: ParsedWorkout | null | undefined): parsed is ParsedWorkout {
  if (!parsed) return false;
  return Boolean(parsed.calories || parsed.steps || parsed.distanceMeters || parsed.durationSeconds || parsed.activeSeconds);
}

export async function parseWorkoutFile(file: File): Promise<ParsedWorkout> {
  const name = file.name.toLowerCase();
  const isFit = name.endsWith(".fit") || file.type === "application/octet-stream" && name.endsWith(".fit");
  if (name.endsWith(".fit") || isFit) {
    const totals = parseFit(await file.arrayBuffer());
    if (totals && hasAny(totals)) return totals;
    throw new Error("Could not read workout totals from that FIT file. You can type the stats in, or try GPX, TCX, CSV or JSON.");
  }
  const textValue = await file.text();
  const trimmed = textValue.trim();
  if (!trimmed) throw new Error("That file was empty.");
  if (name.endsWith(".gpx") || trimmed.startsWith("<") && /<gpx[\s>]/i.test(trimmed)) {
    const parsed = parseGpx(trimmed);
    if (hasAny(parsed)) return parsed!;
    throw new Error("Could not find a track in that GPX file.");
  }
  if (name.endsWith(".tcx") || /TrainingCenterDatabase/i.test(trimmed)) {
    const parsed = parseTcx(trimmed);
    if (hasAny(parsed)) return parsed!;
    throw new Error("Could not find lap or track data in that TCX file.");
  }
  if (name.endsWith(".json") || trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const parsed = parseJson(trimmed);
    if (hasAny(parsed)) return parsed!;
    throw new Error("Could not find calories, steps, distance or duration in that JSON file.");
  }
  if (name.endsWith(".csv") || trimmed.includes(",")) {
    const parsed = parseCsv(trimmed);
    if (hasAny(parsed)) return parsed!;
    throw new Error("Could not find a calories, steps, distance or duration column in that CSV.");
  }
  throw new Error("Use a GPX, TCX, FIT, CSV or JSON export from your fitness app, or type the stats in.");
}

export const FITNESS_FILE_ACCEPT = ".gpx,.tcx,.fit,.csv,.json,application/gpx+xml,application/vnd.garmin.tcx+xml,application/json,text/csv";
