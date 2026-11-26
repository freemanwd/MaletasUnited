import { Suspense } from "react";
import type { Metadata } from "next";
import { TIER } from "@/lib/tier";
import { VipView } from "@/components/views/VipView";

export const metadata: Metadata = {
  title: TIER.productName,
  description: `Private games, host email lists, radius alerts, match alerts and watch-party alerts. $1.99/month or $20/year. Hosts can gift a 1-year ${TIER.name} voucher. Demo; nothing is charged.`,
};

export default function VipPage() {
  return (
    <Suspense
      fallback={
        <div className="wrap">
          <p className="muted">Loading {TIER.productName}…</p>
        </div>
      }
    >
      <VipView />
    </Suspense>
  );
}
