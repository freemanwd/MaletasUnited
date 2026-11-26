import type { Metadata } from "next";
import { ShopView } from "@/components/views/ShopView";

export const metadata: Metadata = {
  title: "Shop",
    description: "Sample vendor gear. Checkout is a demo; nothing is charged.",
};

export default function ShopPage() {
  return <ShopView />;
}
