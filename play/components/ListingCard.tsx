import type { ExternalListing } from "@/lib/types";

export function ListingCard({ listing }: { listing: ExternalListing }) {
  return (
    <article className="card listing-card">
      <div className="row between">
        <span className="tag web">Listed from the web</span>
        <span className="tag sample">{listing.kind}</span>
      </div>
      <h3>{listing.title}</h3>
      <div className="meta">
        <span>{listing.when}</span>
        <span>
          {listing.city} · {listing.zip}
        </span>
        <span>{listing.format}</span>
        <span>
          Source: {listing.sourceName} · checked {listing.lastChecked}
        </span>
      </div>
      <p className="small muted">{listing.notes}</p>
      <a className="btn sm" href={listing.sourceUrl} rel="noopener noreferrer" target="_blank">
        Open source site
      </a>
    </article>
  );
}
