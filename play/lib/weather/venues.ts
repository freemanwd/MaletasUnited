/** Stored or ZIP-centroid coordinates for demo games. US ZIPs only. */
export const VENUE_COORDS: Record<string, { lat: number; lon: number; label: string }> = {
  // Glen Kernan Parkway, Jacksonville FL 32224 (club / neighborhood pitch).
  "jax-glen-kernan": { lat: 30.2569962, lon: -81.468468, label: "Glen Kernan, Jacksonville FL 32224" },
};

/** Zippopotam.us centroids captured for the sample hubs. */
export const ZIP_COORDS: Record<string, { lat: number; lon: number }> = {
  "32224": { lat: 30.3031, lon: -81.4404 },
  "32204": { lat: 30.3189, lon: -81.6854 },
  "32216": { lat: 30.2787, lon: -81.5831 },
  "32211": { lat: 30.348, lon: -81.5882 },
  "32250": { lat: 30.2801, lon: -81.4165 },
  "33130": { lat: 25.7672, lon: -80.2059 },
  "30318": { lat: 33.7865, lon: -84.4454 },
  "78704": { lat: 30.2428, lon: -97.7658 },
};

export function coordsForGame(game: {
  id: string;
  lat?: number;
  lon?: number;
  zip?: string;
}): { lat: number; lon: number } | null {
  if (typeof game.lat === "number" && typeof game.lon === "number" && Number.isFinite(game.lat) && Number.isFinite(game.lon)) {
    return { lat: game.lat, lon: game.lon };
  }
  const venue = VENUE_COORDS[game.id];
  if (venue) return { lat: venue.lat, lon: venue.lon };
  const zip = (game.zip ?? "").replace(/\D/g, "").slice(0, 5);
  const fallback = ZIP_COORDS[zip];
  if (fallback) return fallback;
  return null;
}
