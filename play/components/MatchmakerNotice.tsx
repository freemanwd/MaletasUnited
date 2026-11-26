import Link from "next/link";
import { HOST_NOTICE, LEGAL_DRAFT_BANNER, MATCHMAKER_SHORT, SIGNUP_NOTICE } from "@/lib/legal";

export function MatchmakerNotice({
  variant = "default",
}: {
  variant?: "default" | "host" | "signup" | "game";
}) {
  const copy =
    variant === "host" ? HOST_NOTICE : variant === "signup" ? SIGNUP_NOTICE : MATCHMAKER_SHORT;
  return (
    <p className="notice">
      {copy}{" "}
      <Link href="/terms">Terms / Disclaimer</Link>
      {" · "}
      <span className="legal-draft">{LEGAL_DRAFT_BANNER}</span>
    </p>
  );
}
