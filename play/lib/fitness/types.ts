export type WorkoutDistanceUnit = "mi" | "km";
export type WorkoutSource = "manual" | "file";

export interface WorkoutStats {
  calories?: number;
  steps?: number;
  /** Canonical stored distance in miles. */
  distanceMiles?: number;
  /** Unit the player chose to show. */
  distanceUnit?: WorkoutDistanceUnit;
  activeMinutes?: number;
  durationMinutes?: number;
  source: WorkoutSource;
  fileName?: string;
}

export interface ParsedWorkout {
  calories?: number;
  steps?: number;
  distanceMeters?: number;
  durationSeconds?: number;
  activeSeconds?: number;
  note?: string;
}

export const FITNESS_DRAFT_KEY = "maletas-play-fitness-draft";

export const FITNESS_PRIVACY_NOTE =
  "Health and workout numbers stay on this device unless you add them to a post. Files from Fitbit, Apple Health, Google Fit, Strava or Garmin are read in your browser and are not uploaded to Maletas. This is not a medical record, and Maletas is not your health-care provider.";
