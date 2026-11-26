import type { Metadata } from "next";
import { PlusView } from "@/components/views/PlusView";

export const metadata: Metadata = {
  title: "Maletas Plus",
    description: "ZIP and region search for $1.99 a month. Demo; nothing is charged.",
};

export default function PlusPage() {
  return <PlusView />;
}
