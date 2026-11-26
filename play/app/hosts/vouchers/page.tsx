import type { Metadata } from "next";
import { TIER } from "@/lib/tier";
import { HostVouchersView } from "@/components/views/HostVouchersView";

export const metadata: Metadata = {
  title: "Host Club vouchers",
  description: `Buy 1-year ${TIER.productName} vouchers for guests (25 per host per year). Demo Stripe stand-in.`,
};

export default function HostVouchersPage() {
  return <HostVouchersView />;
}
