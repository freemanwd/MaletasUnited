import type { Game } from "../types";
import { GAME_TZ } from "../format";
import { evaluateWeather } from "./evaluate";
import { fetchNws, fetchOpenMeteo } from "./providers";
import {
  FORECAST_HORIZON_DAYS,
  WEATHER_REVALIDATE_SECONDS,
  type GameWeather,
  type GameWeatherQuery,
} from "./types";
import { coordsForGame } from "./venues";
import { formatWindowLabel, gameKickoffWindow } from "./window";

export { coordsForGame } from "./venues";
export { formatWindowLabel, gameKickoffWindow } from "./window";
export { WEATHER_REVALIDATE_SECONDS, FORECAST_HORIZON_DAYS } from "./types";
export type { GameWeather } from "./types";

export function weatherQueryForGame(game: Game): GameWeatherQuery | { error: "no_location" | "bad_window" } {
  const coords = coordsForGame(game);
  if (!coords) return { error: "no_location" };
  const window = gameKickoffWindow(game);
  if (!window) return { error: "bad_window" };
  return {
    lat: coords.lat,
    lon: coords.lon,
    startIso: window.start.toISOString(),
    durationMinutes: Math.round((window.end.getTime() - window.start.getTime()) / 60000),
    timeZone: window.timeZone || GAME_TZ,
  };
}

export function tooFar(start: Date, now = new Date()): boolean {
  const horizon = now.getTime() + FORECAST_HORIZON_DAYS * 24 * 60 * 60 * 1000;
  return start.getTime() > horizon + 12 * 60 * 60 * 1000;
}

export async function loadGameWeather(query: GameWeatherQuery): Promise<GameWeather> {
  const start = new Date(query.startIso);
  const end = new Date(start.getTime() + query.durationMinutes * 60_000);
  const windowLabel = formatWindowLabel(start, end, query.timeZone);
  const empty = (status: GameWeather["status"], headline: string): GameWeather => ({
    status,
    level: "ok",
    headline,
    detail: "The host or list keeper makes the call on cancellations.",
    conditions: "",
    temperatureF: null,
    temperatureHighF: null,
    feelsLikeF: null,
    precipChance: null,
    windMph: null,
    thunder: false,
    alerts: [],
    source: null,
    sourceLabel: "",
    windowLabel,
  });

  if (Number.isNaN(start.getTime())) return empty("unavailable", "Forecast is unavailable right now");
  if (tooFar(start)) {
    return empty("too_far", "The forecast appears about 7 days before the game.");
  }

  try {
    const nws = await fetchNws(query);
    if (nws?.periods.length) {
      return evaluateWeather({
        periods: nws.periods,
        alerts: nws.alerts,
        source: "nws",
        windowLabel,
      });
    }
  } catch {
    // Fall through to Open-Meteo.
  }

  try {
    const periods = await fetchOpenMeteo(query);
    if (periods?.length) {
      return evaluateWeather({
        periods,
        alerts: [],
        source: "open-meteo",
        windowLabel,
      });
    }
  } catch {
    // Both sources failed.
  }

  return empty("unavailable", "Forecast is unavailable right now");
}
