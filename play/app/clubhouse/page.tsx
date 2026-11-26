import type { Metadata } from "next";
import { ClubhouseView } from "@/components/views/ClubhouseView";

export const metadata: Metadata = {
  title: "Clubhouse",
  description: "Local pickup soccer feed for Jacksonville and example hubs.",
};

export default function ClubhousePage() {
  return <ClubhouseView />;
}
