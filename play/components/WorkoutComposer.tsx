"use client";

import { useEffect, useState } from "react";
import {
  FITNESS_FILE_ACCEPT,
  FITNESS_PRIVACY_NOTE,
  hasWorkoutStats,
  milesFromKm,
  parseWorkoutFile,
  parsedToStats,
  saveFitnessDraft,
  type WorkoutDistanceUnit,
  type WorkoutStats,
} from "@/lib/fitness";

export function WorkoutComposer({
  value,
  onChange,
  showToast,
}: {
  value: WorkoutStats | null;
  onChange: (stats: WorkoutStats | null) => void;
  showToast: (message: string) => void;
}) {
  const [open, setOpen] = useState(Boolean(value && hasWorkoutStats(value)));
  const [busy, setBusy] = useState(false);
  const unit: WorkoutDistanceUnit = value?.distanceUnit === "km" ? "km" : "mi";
  const distanceDisplay =
    value?.distanceMiles != null
      ? unit === "km"
        ? String(Math.round(value.distanceMiles * 1.609344 * 100) / 100)
        : String(value.distanceMiles)
      : "";

  useEffect(() => {
    if (value && hasWorkoutStats(value)) setOpen(true);
  }, [value]);

  function patch(partial: Partial<WorkoutStats>) {
    const next: WorkoutStats = {
      source: value?.source ?? "manual",
      distanceUnit: unit,
      ...value,
      ...partial,
    };
    const cleaned = hasWorkoutStats(next) ? next : { ...next };
    onChange(hasWorkoutStats(cleaned) ? cleaned : { source: next.source, distanceUnit: next.distanceUnit, fileName: next.fileName });
    saveFitnessDraft(hasWorkoutStats(cleaned) ? cleaned : null);
  }

  function numberField(key: "calories" | "steps" | "activeMinutes" | "durationMinutes", raw: string) {
    const n = Number(raw);
    patch({ [key]: raw === "" || !Number.isFinite(n) || n < 0 ? undefined : n });
  }

  function setDistance(raw: string) {
    if (raw === "") {
      patch({ distanceMiles: undefined });
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return;
    patch({ distanceMiles: unit === "km" ? milesFromKm(n) : n, distanceUnit: unit });
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const parsed = await parseWorkoutFile(file);
      const stats = parsedToStats(parsed, "file", file.name, unit);
      if (!hasWorkoutStats(stats)) {
        showToast("No calories, steps, distance or time were found in that file");
        return;
      }
      onChange(stats);
      saveFitnessDraft(stats);
      setOpen(true);
      showToast(parsed.note ?? `Imported from ${file.name} on this device`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not read that file");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="workout-composer">
      <label className="check">
        <input
          type="checkbox"
          checked={open}
          onChange={(event) => {
            setOpen(event.target.checked);
            if (!event.target.checked) {
              onChange(null);
              saveFitnessDraft(null);
            }
          }}
        />
        <span>Optionally add workout stats to this post</span>
      </label>
      {open ? (
        <div className="workout-fields">
          <p className="small muted">{FITNESS_PRIVACY_NOTE}</p>
          <label htmlFor="fitFile">
            Import a file from this device
            <input
              id="fitFile"
              type="file"
              accept={FITNESS_FILE_ACCEPT}
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                void onFile(file);
                event.target.value = "";
              }}
            />
          </label>
          <p className="small muted">
            {busy
              ? "Reading the file in your browser…"
              : value?.fileName
                ? `Imported from ${value.fileName} (parsed on this device). You can edit the numbers.`
                : "GPX, TCX, FIT, CSV or JSON from Fitbit, Google Fit, Apple Health, Strava or Garmin. Or type the numbers below."}
          </p>
          <div className="form two">
            <label htmlFor="fitCal">
              Calories burned
              <input
                id="fitCal"
                type="number"
                min={0}
                inputMode="numeric"
                value={value?.calories ?? ""}
                onChange={(e) => numberField("calories", e.target.value)}
              />
            </label>
            <label htmlFor="fitSteps">
              Steps
              <input
                id="fitSteps"
                type="number"
                min={0}
                inputMode="numeric"
                value={value?.steps ?? ""}
                onChange={(e) => numberField("steps", e.target.value)}
              />
            </label>
            <label htmlFor="fitDist">
              Distance
              <span className="row">
                <input
                  id="fitDist"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={distanceDisplay}
                  onChange={(e) => setDistance(e.target.value)}
                />
                <select
                  aria-label="Distance unit"
                  value={unit}
                  onChange={(e) => patch({ distanceUnit: e.target.value as WorkoutDistanceUnit })}
                >
                  <option value="mi">mi</option>
                  <option value="km">km</option>
                </select>
              </span>
            </label>
            <label htmlFor="fitActive">
              Active minutes
              <input
                id="fitActive"
                type="number"
                min={0}
                inputMode="numeric"
                value={value?.activeMinutes ?? ""}
                onChange={(e) => numberField("activeMinutes", e.target.value)}
              />
            </label>
            <label htmlFor="fitDur">
              Duration (minutes)
              <input
                id="fitDur"
                type="number"
                min={0}
                inputMode="numeric"
                value={value?.durationMinutes ?? ""}
                onChange={(e) => numberField("durationMinutes", e.target.value)}
              />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
