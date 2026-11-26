import type { Metadata } from "next";
import { ShopView } from "@/components/views/ShopView";

export const metadata: Metadata = {
  title: "Shop",
    description:
    "Matchmaker marketplace: partner and vendor listings with outbound links, plus optional Maletas merch later. Demo; nothing is charged.",
};

export default function ShopPage() {
  return <ShopView />;
}
