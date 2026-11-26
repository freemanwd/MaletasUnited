import { Suspense } from "react";
import type { Metadata } from "next";
import { TIER } from "@/lib/tier";
import { ClubView } from "@/components/views/ClubView";

export const metadata: Metadata = {
  title: TIER.productName,
  description: `Open Play is free. ${TIER.productName} is $1.99/month or $20/year for private games and alerts. Hosts pay no monthly dues. Demo; nothing is charged.`,
};

export default function ClubPage() {
  return (
    <Suspense
      fallback={
        <div className="wrap">
          <p className="muted">Loading {TIER.productName}…</p>
        </div>
      }
    >
      <ClubView />
    </Suspense>
  );
}
