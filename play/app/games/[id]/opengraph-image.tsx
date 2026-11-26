import { SEED_GAMES } from "@/lib/data/seed";
import { playOgImage, ogSize } from "@/lib/og-card";

export const alt = "Maletas Play game";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = SEED_GAMES.find((item) => item.id === id);
  return playOgImage({
    kicker: "Maletas Play",
    title: game?.title ?? "Pickup soccer",
    lines: game ? [game.when, `${game.city}${game.zip ? ` · ${game.zip}` : ""} · ${game.format}`] : [],
  });
}
