import type { Metadata } from "next";
import { TermsView } from "@/components/views/TermsView";

export const metadata: Metadata = {
  title: "Terms / Disclaimer",
  description:
    "Draft matchmaker terms. Maletas is not a nonprofit, not a host, and not liable for games, fields or players.",
};

export default function TermsPage() {
  return <TermsView />;
}
