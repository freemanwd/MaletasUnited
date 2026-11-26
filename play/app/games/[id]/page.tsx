import type { Metadata } from "next";
import { GameDetailView } from "@/components/views/GameDetailView";
import { SEED_GAMES } from "@/lib/data/seed";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return SEED_GAMES.map((game) => ({ id: game.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const game = SEED_GAMES.find((item) => item.id === id);
  const title = game ? `${game.title} sign-up sheet` : "Game";
  const description = game
    ? `${game.title} · ${game.when} · ${game.city}. Play at your own risk.`
    : "Pickup soccer sign-up sheet.";
  return {
    title,
    description,
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function GamePage({ params }: Props) {
  const { id } = await params;
  return <GameDetailView id={id} />;
}
