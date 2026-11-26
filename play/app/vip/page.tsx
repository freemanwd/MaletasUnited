import type { Metadata } from "next";
import { VipView } from "@/components/views/VipView";

export const metadata: Metadata = {
  title: "Maletas VIP",
  description:
    "Private games, host email lists, radius alerts, match alerts and watch-party alerts. $1.99/month or $20/year. Demo; nothing is charged.",
};

export default function VipPage() {
  return <VipView />;
}
