import type { Metadata } from "next";
import { GamesView } from "@/components/views/GamesView";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Find a pickup soccer game. Jacksonville, FL is the first hub. Saturday mornings and weeknights while there is daylight.",
};

export default function HomePage() {
  return <GamesView />;
}
