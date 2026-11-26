import { NextResponse } from "next/server";
import {
  loadGameWeather,
  tooFar,
  WEATHER_REVALIDATE_SECONDS,
  type GameWeather,
} from "@/lib/weather";
import { GAME_TZ } from "@/lib/format";
import { ZIP_COORDS } from "@/lib/weather/venues";
import type { GameWeatherQuery } from "@/lib/weather/types";

function empty(status: GameWeather["status"], headline: string, windowLabel = ""): GameWeather {
  return {
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
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const startIso = url.searchParams.get("start") ?? "";
  const durationMinutes = Number(url.searchParams.get("duration") ?? 120);
  const timeZone = url.searchParams.get("tz") || GAME_TZ;
  const zip = (url.searchParams.get("zip") ?? "").replace(/\D/g, "").slice(0, 5);

  let coords = { lat, lon };
  if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lon)) {
    const fallback = ZIP_COORDS[zip];
    if (!fallback) {
      return NextResponse.json(empty("no_location", "No location is set for this game yet."));
    }
    coords = fallback;
  }
  if (Math.abs(coords.lat) > 90 || Math.abs(coords.lon) > 180) {
    return NextResponse.json(empty("no_location", "No location is set for this game yet."), { status: 400 });
  }
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json(empty("unavailable", "Forecast is unavailable right now."), { status: 400 });
  }
  if (tooFar(start)) {
    return NextResponse.json(empty("too_far", "The forecast appears about 7 days before the game."));
  }

  const query: GameWeatherQuery = {
    lat: coords.lat,
    lon: coords.lon,
    startIso: start.toISOString(),
    durationMinutes: Number.isFinite(durationMinutes) && durationMinutes > 0 ? Math.min(durationMinutes, 8 * 60) : 120,
    timeZone,
  };

  const weather = await loadGameWeather(query);
  return NextResponse.json(weather, {
    headers: {
      "Cache-Control": `public, s-maxage=${WEATHER_REVALIDATE_SECONDS}, stale-while-revalidate=600`,
    },
  });
}
