import {
  FEELS_LIKE_COLD_F,
  FEELS_LIKE_HEAT_F,
  HEAVY_RAIN_INCHES_PER_HOUR,
  RAIN_CAUTION_CHANCE,
  WIND_CAUTION_MPH,
  type GameWeather,
  type NwsAlertSummary,
  type WeatherLevel,
  type WeatherPeriod,
  type WeatherSource,
} from "./types";

const THUNDER_RE = /thunder|t-?storm|lightning/i;
const HEAVY_RAIN_RE = /heavy rain|downpour|torrential/i;

export function mentionsThunder(text: string): boolean {
  return THUNDER_RE.test(text);
}

export function mentionsHeavyRain(text: string): boolean {
  return HEAVY_RAIN_RE.test(text);
}

/** NWS wind chill, valid roughly T <= 50°F and wind >= 3 mph. */
export function windChillF(tempF: number, windMph: number): number {
  const v = Math.max(windMph, 0);
  if (tempF > 50 || v < 3) return tempF;
  const v16 = v ** 0.16;
  return 35.74 + 0.6215 * tempF - 35.75 * v16 + 0.4275 * tempF * v16;
}

export function feelsLikeF(tempF: number, windMph: number | null): number {
  if (windMph == null) return tempF;
  return Math.round(windChillF(tempF, windMph));
}

export function parseWindMph(raw: string | number | null | undefined): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (!raw) return null;
  const nums = String(raw).match(/\d+(?:\.\d+)?/g);
  if (!nums?.length) return null;
  return Math.max(...nums.map(Number));
}

export function isSafetyWatch(event: string): boolean {
  return /tornado|thunderstorm|lightning/i.test(event) && /watch/i.test(event);
}

export function isWarningEvent(event: string, messageType?: string): boolean {
  if (messageType && /warning/i.test(messageType)) return true;
  return /warning/i.test(event);
}

export function evaluateWeather(opts: {
  periods: WeatherPeriod[];
  alerts: NwsAlertSummary[];
  source: WeatherSource;
  windowLabel: string;
}): GameWeather {
  const { periods, alerts, source, windowLabel } = opts;
  const sourceLabel =
    source === "nws" ? "National Weather Service" : "Open-Meteo (NWS unavailable)";

  if (!periods.length) {
    return {
      status: "unavailable",
      level: "ok",
      headline: "Forecast is unavailable right now",
      detail: "The host or list keeper makes the call on cancellations.",
      conditions: "",
      temperatureF: null,
      temperatureHighF: null,
      feelsLikeF: null,
      precipChance: null,
      windMph: null,
      thunder: false,
      alerts: [],
      source,
      sourceLabel,
      windowLabel,
    };
  }

  const temps = periods.map((p) => p.temperatureF);
  const feels = periods.map((p) => p.feelsLikeF);
  const wind = periods.map((p) => p.windMph).filter((n): n is number => n != null);
  const pops = periods.map((p) => p.precipChance).filter((n): n is number => n != null);
  const temperatureF = temps[0] ?? null;
  const temperatureHighF = Math.max(...temps);
  const feelsLike = feels.length ? Math.round(Math.min(...feels)) : null;
  const feelsHot = feels.length ? Math.round(Math.max(...feels)) : null;
  const windMph = wind.length ? Math.max(...wind) : null;
  const precipChance = pops.length ? Math.max(...pops) : null;
  const thunder = periods.some((p) => p.thunder);
  const heavyRain = periods.some((p) => p.heavyRain);
  const conditions = periods[0]?.conditions ?? "";

  const safetyAlerts = alerts.filter((a) => a.isWarning || a.isSevereWatch);

  const reasons: { level: WeatherLevel; headline: string }[] = [];
  if (thunder) {
    reasons.push({
      level: "alert",
      headline:
        "Thunderstorms are in the forecast. Take care, and follow the list keeper if the game is called.",
    });
  }
  if (safetyAlerts.length) {
    reasons.push({
      level: "alert",
      headline:
        "A National Weather Service warning is in effect during this kickoff window. Check with the list keeper before you head out.",
    });
  }
  if (feelsLike != null && feelsLike <= FEELS_LIKE_COLD_F) {
    reasons.push({
      level: "alert",
      headline: `It may feel quite cold (feels like ${feelsLike}°F). Dress warm; the list keeper makes the call if the game is on.`,
    });
  }
  if (feelsHot != null && feelsHot >= FEELS_LIKE_HEAT_F) {
    reasons.push({
      level: "alert",
      headline: `It may feel very hot (feels like ${feelsHot}°F). Bring water; the list keeper makes the call if the game is on.`,
    });
  }
  if (heavyRain || (precipChance != null && precipChance >= RAIN_CAUTION_CHANCE)) {
    reasons.push({
      level: "caution",
      headline: "Showers look more likely; the game is on unless the list keeper says otherwise.",
    });
  }
  if (windMph != null && windMph > WIND_CAUTION_MPH) {
    reasons.push({
      level: "caution",
      headline: "It may be breezy during the game.",
    });
  }

  const alert = reasons.find((r) => r.level === "alert");
  const caution = reasons.find((r) => r.level === "caution");
  const picked = alert ?? caution;
  const level: WeatherLevel = picked?.level ?? "ok";
  const headline = picked?.headline ?? "Looks good for soccer";

  const rainNote =
    precipChance != null && precipChance >= 30 && precipChance < RAIN_CAUTION_CHANCE
      ? "Some showers possible; the game is on unless the list keeper says otherwise."
      : null;

  const detail = [
    rainNote,
    "The host or list keeper makes the call on cancellations.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    status: "ok",
    level,
    headline,
    detail,
    conditions,
    temperatureF,
    temperatureHighF: temperatureHighF !== temperatureF ? temperatureHighF : null,
    feelsLikeF: feelsLike,
    precipChance,
    windMph,
    thunder,
    alerts: safetyAlerts,
    source,
    sourceLabel,
    windowLabel,
  };
}

export function periodFromText(opts: {
  startIso: string;
  endIso: string;
  conditions: string;
  temperatureF: number;
  feelsLikeF?: number;
  precipChance: number | null;
  precipInches: number | null;
  windMph: number | null;
  windGustMph?: number | null;
}): WeatherPeriod {
  const conditions = opts.conditions;
  const windMph = opts.windMph;
  const feels = opts.feelsLikeF ?? feelsLikeF(opts.temperatureF, windMph);
  return {
    startIso: opts.startIso,
    endIso: opts.endIso,
    conditions,
    temperatureF: opts.temperatureF,
    feelsLikeF: feels,
    precipChance: opts.precipChance,
    precipInches: opts.precipInches,
    windMph,
    windGustMph: opts.windGustMph ?? null,
    thunder: mentionsThunder(conditions),
    heavyRain:
      mentionsHeavyRain(conditions) ||
      (opts.precipInches != null && opts.precipInches >= HEAVY_RAIN_INCHES_PER_HOUR),
  };
}
