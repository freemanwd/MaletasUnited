export type WeatherLevel = "ok" | "caution" | "alert";

export type WeatherSource = "nws" | "open-meteo";

export interface GameWeatherQuery {
  lat: number;
  lon: number;
  /** Kickoff instant (UTC). */
  startIso: string;
  durationMinutes: number;
  timeZone: string;
}

export interface WeatherPeriod {
  startIso: string;
  endIso: string;
  conditions: string;
  temperatureF: number;
  feelsLikeF: number;
  precipChance: number | null;
  precipInches: number | null;
  windMph: number | null;
  windGustMph: number | null;
  thunder: boolean;
  heavyRain: boolean;
}

export interface NwsAlertSummary {
  event: string;
  severity: string;
  headline: string;
  isWarning: boolean;
  isSevereWatch: boolean;
}

export interface GameWeather {
  status: "ok" | "unavailable" | "too_far" | "no_location";
  level: WeatherLevel;
  headline: string;
  detail: string;
  conditions: string;
  temperatureF: number | null;
  temperatureHighF: number | null;
  feelsLikeF: number | null;
  precipChance: number | null;
  windMph: number | null;
  thunder: boolean;
  alerts: NwsAlertSummary[];
  source: WeatherSource | null;
  sourceLabel: string;
  windowLabel: string;
}

export const WEATHER_USER_AGENT = "MaletasPlay (maletasunited@gmail.com)";
export const WEATHER_REVALIDATE_SECONDS = 45 * 60;
export const FORECAST_HORIZON_DAYS = 7;

/** Red banner: real safety issues only. */
export const FEELS_LIKE_COLD_F = 40;
export const FEELS_LIKE_HEAT_F = 95;
/** Soft amber note, not a red headline. */
export const RAIN_CAUTION_CHANCE = 70;
export const WIND_CAUTION_MPH = 20;
export const HEAVY_RAIN_INCHES_PER_HOUR = 0.3;
