import {
  FORECAST_HORIZON_DAYS,
  WEATHER_REVALIDATE_SECONDS,
  WEATHER_USER_AGENT,
  type GameWeatherQuery,
  type NwsAlertSummary,
  type WeatherPeriod,
} from "./types";
import { isSafetyWatch, isWarningEvent, parseWindMph, periodFromText } from "./evaluate";

const FETCH_INIT: RequestInit = {
  headers: {
    "User-Agent": WEATHER_USER_AGENT,
    Accept: "application/geo+json, application/json",
  },
  next: { revalidate: WEATHER_REVALIDATE_SECONDS },
};

async function getJson(url: string, timeoutMs = 10_000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...FETCH_INIT, signal: ctrl.signal });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

export function periodsInWindow(periods: WeatherPeriod[], start: Date, end: Date): WeatherPeriod[] {
  return periods.filter((p) => {
    const ps = new Date(p.startIso);
    const pe = new Date(p.endIso);
    if (Number.isNaN(ps.getTime()) || Number.isNaN(pe.getTime())) return false;
    return overlaps(ps, pe, start, end);
  });
}

interface NwsPeriod {
  startTime?: string;
  endTime?: string;
  temperature?: number;
  temperatureUnit?: string;
  shortForecast?: string;
  detailedForecast?: string;
  windSpeed?: string;
  probabilityOfPrecipitation?: { value?: number | null };
}

interface NwsAlertProps {
  event?: string;
  severity?: string;
  headline?: string;
  messageType?: string;
  onset?: string;
  effective?: string;
  expires?: string;
  ends?: string;
}

function toF(value: number, unit?: string): number {
  if (unit && /c/i.test(unit) && !/f/i.test(unit)) return Math.round((value * 9) / 5 + 32);
  return value;
}

function nwsPeriod(p: NwsPeriod): WeatherPeriod | null {
  if (!p.startTime || typeof p.temperature !== "number") return null;
  const end = p.endTime ?? p.startTime;
  const pop = p.probabilityOfPrecipitation?.value;
  const conditions = [p.shortForecast, p.detailedForecast].filter(Boolean).join(". ");
  return periodFromText({
    startIso: p.startTime,
    endIso: end,
    conditions,
    temperatureF: toF(p.temperature, p.temperatureUnit),
    precipChance: typeof pop === "number" ? pop : null,
    precipInches: null,
    windMph: parseWindMph(p.windSpeed),
  });
}

function alertWindow(props: NwsAlertProps): { start: Date; end: Date } | null {
  const startRaw = props.onset || props.effective;
  const endRaw = props.ends || props.expires;
  if (!startRaw && !endRaw) return null;
  const start = new Date(startRaw || endRaw || "");
  const end = new Date(endRaw || startRaw || "");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return { start, end };
}

export async function fetchNws(query: GameWeatherQuery): Promise<{
  periods: WeatherPeriod[];
  alerts: NwsAlertSummary[];
} | null> {
  const lat = query.lat.toFixed(4);
  const lon = query.lon.toFixed(4);
  const start = new Date(query.startIso);
  const end = new Date(start.getTime() + query.durationMinutes * 60_000);

  const points = (await getJson(`https://api.weather.gov/points/${lat},${lon}`)) as {
    properties?: { forecastHourly?: string };
  };
  const hourlyUrl = points.properties?.forecastHourly;
  if (!hourlyUrl) return null;

  const hourly = (await getJson(hourlyUrl)) as { properties?: { periods?: NwsPeriod[] } };
  const periods = (hourly.properties?.periods ?? [])
    .map(nwsPeriod)
    .filter((p): p is WeatherPeriod => Boolean(p));
  if (!periods.length) return null;

  let alerts: NwsAlertSummary[] = [];
  try {
    const raw = (await getJson(`https://api.weather.gov/alerts/active?point=${lat},${lon}`)) as {
      features?: { properties?: NwsAlertProps }[];
    };
    alerts = (raw.features ?? [])
      .map((f) => f.properties ?? {})
      .map((props) => {
        const event = props.event ?? "Alert";
        const window = alertWindow(props);
        if (!window || !overlaps(window.start, window.end, start, end)) return null;
        return {
          event,
          severity: props.severity ?? "",
          headline: (props.headline ?? event).replace(/\s+/g, " ").trim(),
          isWarning: isWarningEvent(event, props.messageType),
          isSevereWatch: isSafetyWatch(event),
        } satisfies NwsAlertSummary;
      })
      .filter((a): a is NwsAlertSummary => Boolean(a));
  } catch {
    alerts = [];
  }

  return { periods: periodsInWindow(periods, start, end), alerts };
}

const OM_THUNDER = new Set([95, 96, 99]);
const OM_HEAVY = new Set([65, 67, 82, 96, 99]);

const OM_TEXT: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Icy fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorms",
  96: "Thunderstorms with hail",
  99: "Thunderstorms with heavy hail",
};

export async function fetchOpenMeteo(query: GameWeatherQuery): Promise<WeatherPeriod[] | null> {
  const start = new Date(query.startIso);
  const end = new Date(start.getTime() + query.durationMinutes * 60_000);
  const params = new URLSearchParams({
    latitude: String(query.lat),
    longitude: String(query.lon),
    hourly:
      "temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: query.timeZone || "America/New_York",
    forecast_days: String(FORECAST_HORIZON_DAYS + 1),
  });
  const raw = (await getJson(`https://api.open-meteo.com/v1/forecast?${params}`)) as {
    hourly?: {
      time?: string[];
      temperature_2m?: Array<number | null>;
      apparent_temperature?: Array<number | null>;
      precipitation_probability?: Array<number | null>;
      precipitation?: Array<number | null>;
      weather_code?: Array<number | null>;
      wind_speed_10m?: Array<number | null>;
      wind_gusts_10m?: Array<number | null>;
    };
  };
  const h = raw.hourly;
  if (!h?.time?.length) return null;
  const periods: WeatherPeriod[] = [];
  for (let i = 0; i < h.time.length; i += 1) {
    const t = h.time[i];
    const temp = h.temperature_2m?.[i];
    if (!t || typeof temp !== "number") continue;
    const startMs = openMeteoLocalMs(t, query.timeZone);
    if (Number.isNaN(startMs)) continue;
    const endMs = startMs + 60 * 60 * 1000;
    const code = h.weather_code?.[i] ?? 0;
    const conditions = OM_TEXT[code] ?? "Forecast";
    const period = periodFromText({
      startIso: new Date(startMs).toISOString(),
      endIso: new Date(endMs).toISOString(),
      conditions,
      temperatureF: temp,
      feelsLikeF: typeof h.apparent_temperature?.[i] === "number" ? h.apparent_temperature[i] as number : undefined,
      precipChance: typeof h.precipitation_probability?.[i] === "number" ? h.precipitation_probability[i] as number : null,
      precipInches: typeof h.precipitation?.[i] === "number" ? h.precipitation[i] as number : null,
      windMph: typeof h.wind_speed_10m?.[i] === "number" ? h.wind_speed_10m[i] as number : null,
      windGustMph: typeof h.wind_gusts_10m?.[i] === "number" ? h.wind_gusts_10m[i] as number : null,
    });
    if (OM_THUNDER.has(code)) period.thunder = true;
    if (OM_HEAVY.has(code)) period.heavyRain = true;
    periods.push(period);
  }
  return periodsInWindow(periods, start, end);
}

/** Parse an Open-Meteo `YYYY-MM-DDTHH:MM` wall time in a named zone. */
export function openMeteoLocalMs(stamp: string, timeZone: string): number {
  const [date, time] = stamp.split("T");
  if (!date || !time) return Date.parse(stamp);
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const wanted = Date.UTC(y, m - 1, d, hh, mm ?? 0, 0);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const asUtc = (ms: number) => {
    const parts = Object.fromEntries(fmt.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));
    return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  };
  let instant = wanted;
  for (let i = 0; i < 4; i += 1) {
    const delta = wanted - asUtc(instant);
    if (delta === 0) break;
    instant += delta;
  }
  return instant;
}
