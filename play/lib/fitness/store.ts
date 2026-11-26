import { FITNESS_DRAFT_KEY, type WorkoutStats } from "./types";
import { hasWorkoutStats } from "./format";

export function loadFitnessDraft(): WorkoutStats | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FITNESS_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkoutStats;
    return hasWorkoutStats(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveFitnessDraft(stats: WorkoutStats | null) {
  if (typeof window === "undefined") return;
  try {
    if (!stats || !hasWorkoutStats(stats)) {
      window.localStorage.removeItem(FITNESS_DRAFT_KEY);
      return;
    }
    window.localStorage.setItem(FITNESS_DRAFT_KEY, JSON.stringify(stats));
  } catch {
    // Quota or private mode.
  }
}

export function clearFitnessDraft() {
  saveFitnessDraft(null);
}
