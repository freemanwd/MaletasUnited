import type { Metadata } from "next";
import { Suspense } from "react";
import { BetaAccount } from "@/components/beta/BetaAccount";

export const metadata: Metadata = {
  title: "Beta sign-in",
  description: "Private test of real Maletas Play accounts and RSVPs.",
  robots: { index: false, follow: false },
};

export default function BetaPage({ searchParams }: PageProps<"/beta">) {
  return (
    <div className="wrap">
      <h2>Maletas Play beta account</h2>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <BetaAccount searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
