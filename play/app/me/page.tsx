import type { Metadata } from "next";
import { ProfileView } from "@/components/views/ProfileView";

export const metadata: Metadata = {
  title: "Player card",
  description: "Your Maletas player card, games, and invite link.",
};

export default function MePage() {
  return <ProfileView />;
}
