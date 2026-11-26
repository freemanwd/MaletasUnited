import type { Metadata } from "next";
import { GamesView } from "@/components/views/GamesView";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Maletas is a matchmaker that collates soccer opportunities around the globe. Search by city, ZIP and format is free. Jacksonville, FL is the first hub.",
};

export default function HomePage() {
  return <GamesView />;
}
