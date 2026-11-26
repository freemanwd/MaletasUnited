import type { Metadata } from "next";
import { PlayerProfileView } from "@/components/views/PlayerProfileView";
import { SEED_PLAYERS } from "@/lib/data/seed";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return SEED_PLAYERS.map((player) => ({ handle: player.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const player = SEED_PLAYERS.find((item) => item.handle.toLowerCase() === handle.toLowerCase());
  return {
    title: player ? `${player.name} (@${player.handle})` : "Player",
    description: player
      ? `${player.name} · ${player.position} · ${player.city}. Sample Maletas player card.`
      : "Maletas player profile.",
  };
}

export default async function PlayerPage({ params }: Props) {
  const { handle } = await params;
  return <PlayerProfileView handle={handle} />;
}
