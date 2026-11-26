import type { Metadata } from "next";
import { TIER } from "@/lib/tier";
import { HostVouchersView } from "@/components/views/HostVouchersView";

export const metadata: Metadata = {
  title: "Host vouchers",
  description: `Buy 1-year ${TIER.productName} vouchers for guests. Demo Stripe stand-in.`,
};

export default function HostVouchersPage() {
  return <HostVouchersView />;
}
