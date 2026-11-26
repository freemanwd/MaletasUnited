import type { ParsedWorkout, WorkoutDistanceUnit, WorkoutStats } from "./types";

const MI_IN_M = 1609.344;

export function milesFromMeters(meters: number): number {
  return meters / MI_IN_M;
}

export function metersFromMiles(miles: number): number {
  return miles * MI_IN_M;
}

export function kmFromMiles(miles: number): number {
  return miles * 1.609344;
}

export function milesFromKm(km: number): number {
  return km / 1.609344;
}

export function roundStat(n: number, digits = 0): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function hasWorkoutStats(stats: WorkoutStats | null | undefined): boolean {
  if (!stats) return false;
  return [stats.calories, stats.steps, stats.distanceMiles, stats.activeMinutes, stats.durationMinutes].some(
    (n) => typeof n === "number" && Number.isFinite(n) && n > 0,
  );
}

export function parsedToStats(
  parsed: ParsedWorkout,
  source: WorkoutStats["source"],
  fileName?: string,
  preferredUnit: WorkoutDistanceUnit = "mi",
): WorkoutStats {
  const stats: WorkoutStats = { source, fileName, distanceUnit: preferredUnit };
  if (parsed.calories && parsed.calories > 0) stats.calories = Math.round(parsed.calories);
  if (parsed.steps && parsed.steps > 0) stats.steps = Math.round(parsed.steps);
  if (parsed.distanceMeters && parsed.distanceMeters > 0) {
    stats.distanceMiles = roundStat(milesFromMeters(parsed.distanceMeters), 2);
  }
  if (parsed.durationSeconds && parsed.durationSeconds > 0) {
    stats.durationMinutes = Math.max(1, Math.round(parsed.durationSeconds / 60));
  }
  if (parsed.activeSeconds && parsed.activeSeconds > 0) {
    stats.activeMinutes = Math.max(1, Math.round(parsed.activeSeconds / 60));
  }
  return stats;
}

export function formatDistance(stats: WorkoutStats): string | null {
  if (stats.distanceMiles == null || stats.distanceMiles <= 0) return null;
  if (stats.distanceUnit === "km") return `${roundStat(kmFromMiles(stats.distanceMiles), 2)} km`;
  return `${roundStat(stats.distanceMiles, 2)} mi`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export interface StatChip {
  label: string;
  value: string;
}

export function workoutChips(stats: WorkoutStats): StatChip[] {
  const chips: StatChip[] = [];
  if (stats.calories && stats.calories > 0) chips.push({ label: "cal", value: formatNumber(stats.calories) });
  if (stats.steps && stats.steps > 0) chips.push({ label: "steps", value: formatNumber(stats.steps) });
  const distance = formatDistance(stats);
  if (distance) {
    const [value, unit] = distance.split(" ");
    chips.push({ label: unit ?? "mi", value: value ?? distance });
  }
  if (stats.activeMinutes && stats.activeMinutes > 0) {
    chips.push({ label: "active min", value: formatNumber(stats.activeMinutes) });
  }
  if (stats.durationMinutes && stats.durationMinutes > 0) {
    chips.push({ label: "min", value: formatNumber(stats.durationMinutes) });
  }
  return chips;
}
