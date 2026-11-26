import Link from "next/link";
import type { Ad } from "@/lib/types";

export function AdSlot({
  ad,
  banner = false,
  light = false,
}: {
  ad: Ad;
  banner?: boolean;
  light?: boolean;
}) {
  return (
    <article className={banner ? "ad-banner" : "card ad-card"}>
      <span className="tag ad">{light ? "Local sponsor · light" : "Ad · sample"}</span>
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
