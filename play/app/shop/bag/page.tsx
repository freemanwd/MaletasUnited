import type { Metadata } from "next";
import { BagView } from "@/components/views/BagView";

export const metadata: Metadata = {
  title: "Bag",
  description: "Demo bag. Checkout is not connected.",
};

export default function BagPage() {
  return <BagView />;
}
