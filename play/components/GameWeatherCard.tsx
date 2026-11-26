"use client";

import { useEffect, useState } from "react";
import type { Game } from "@/lib/types";
import type { GameWeather } from "@/lib/weather";
import { coordsForGame, gameKickoffWindow } from "@/lib/weather";

export function GameWeatherCard({ game }: { game: Game }) {
  const [weather, setWeather] = useState<GameWeather | null>(null);
  const [failed, setFailed] = useState(false);
  const coords = coordsForGame(game);
  const window = gameKickoffWindow(game);

  useEffect(() => {
    if (!coords || !window) return;
    const params = new URLSearchParams({
      lat: String(coords.lat),
      lon: String(coords.lon),
      start: window.start.toISOString(),
      duration: String(Math.round((window.end.getTime() - window.start.getTime()) / 60000)),
      tz: window.timeZone,
      zip: game.zip ?? "",
    });
    let cancelled = false;
    setFailed(false);
    fetch(`/api/weather?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: GameWeather) => {
        if (!cancelled) setWeather(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [coords?.lat, coords?.lon, window?.start.getTime(), window?.timeZone, game.zip, game.id]);

  if (!coords || !window) {
    return (
      <aside className="card weather-card" aria-label="Game day weather">
        <h3>Game-day weather</h3>
        <p className="muted">A forecast will appear once this game has a location.</p>
      </aside>
    );
  }

  if (failed) {
    return (
      <aside className="card weather-card" aria-label="Game day weather">
        <h3>Game-day weather</h3>
        <p>Forecast is unavailable right now.</p>
        <p className="small muted">The host or list keeper makes the call on cancellations.</p>
      </aside>
    );
  }

  if (!weather) {
    return (
      <aside className="card weather-card" aria-label="Game day weather">
        <h3>Game-day weather</h3>
        <p className="muted">Checking the forecast…</p>
      </aside>
    );
  }

  const temp =
    weather.temperatureF != null
      ? weather.temperatureHighF != null && weather.temperatureHighF !== weather.temperatureF
        ? `${Math.round(weather.temperatureF)}–${Math.round(weather.temperatureHighF)}°F`
        : `${Math.round(weather.temperatureF)}°F`
      : null;
  const feels =
    weather.feelsLikeF != null && weather.temperatureF != null && Math.round(weather.feelsLikeF) !== Math.round(weather.temperatureF)
      ? `feels like ${Math.round(weather.feelsLikeF)}°F`
      : null;

  return (
    <aside className="card weather-card" aria-label="Game day weather">
      <h3>Game-day weather</h3>
      <p className="small muted">{weather.windowLabel}</p>
      <p className={`weather-banner ${weather.level}`} role="status">
        {weather.headline}
      </p>
      {weather.status === "ok" ? (
        <ul className="weather-facts">
          {weather.conditions ? <li>{weather.conditions}</li> : null}
          {temp ? (
            <li>
              {temp}
              {feels ? ` (${feels})` : ""}
            </li>
          ) : null}
          {weather.precipChance != null ? <li>Rain chance {weather.precipChance}%</li> : null}
          {weather.windMph != null ? <li>Wind {Math.round(weather.windMph)} mph</li> : null}
        </ul>
      ) : null}
      <p className="small muted">{weather.detail}</p>
      {weather.sourceLabel ? (
        <p className="small muted weather-source">Source: {weather.sourceLabel}</p>
      ) : null}
    </aside>
  );
}
