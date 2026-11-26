import Link from "next/link";
import type { Ad } from "@/lib/types";

export function AdSlot({ ad, banner = false }: { ad: Ad; banner?: boolean }) {
  return (
    <article className={banner ? "ad-banner" : "card ad-card"}>
      <span className="tag ad">Ad · sample</span>
      <h3>{ad.headline}</h3>
      <p className="muted">
        {ad.advertiser}. {ad.blurb}
      </p>
      <Link className="btn sm" href={ad.href}>
        {ad.href === "/advertise" ? "Advertise with Maletas" : "Learn more"}
      </Link>
    </article>
  );
}
