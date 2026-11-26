import type { Metadata } from "next";
import { AdvertiseView } from "@/components/views/AdvertiseView";

export const metadata: Metadata = {
  title: "Advertise with Maletas",
  description: "Local sponsor placements for fields, pubs and shops. Demo; no insertion orders.",
};

export default function AdvertisePage() {
  return <AdvertiseView />;
}
