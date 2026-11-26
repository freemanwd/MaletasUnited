import type { Metadata } from "next";
import { HostGameView } from "@/components/views/HostGameView";

export const metadata: Metadata = {
  title: "Host a game",
  description: "Publish a one-off, weekly, or fortnightly pickup game and open a sign-up sheet.",
};

export default function NewGamePage() {
  return <HostGameView />;
}
