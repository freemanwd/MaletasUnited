import Link from "next/link";
import { LEGAL_DRAFT_BANNER, MATCHMAKER_ONE_LINER, termsSections } from "@/lib/legal";

export function TermsView() {
  return (
    <div className="wrap">
      <p className="small muted">
        <Link href="/">Games</Link> / Terms
      </p>
      <h2>Terms / Disclaimer</h2>
      <p className="legal-draft banner">{LEGAL_DRAFT_BANNER}</p>
      <p>{MATCHMAKER_ONE_LINER}</p>
      {termsSections.map((section) => (
        <article className="card" key={section.heading}>
          <h3>{section.heading}</h3>
          <p>{section.body}</p>
        </article>
      ))}
      <p className="small muted">
        Last updated for this preview. Counsel has not signed off.{" "}
        <Link href="/advertise">Advertise with Maletas</Link> · <Link href="/vip">VIP</Link>
      </p>
    </div>
  );
}
