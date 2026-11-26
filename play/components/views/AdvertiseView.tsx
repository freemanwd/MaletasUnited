import Link from "next/link";

export function AdvertiseView() {
  return (
    <div className="wrap">
      <p className="small muted">
        <Link href="/">Games</Link> / Advertise
      </p>
      <h2>Advertise with Maletas</h2>
      <p className="muted">
        Local sponsors — fields, pubs, and shops — can buy labelled placements next to games and
        the clubhouse. This page is a demo; no insertion orders are live.
      </p>
      <div className="grid">
        <article className="card">
          <h3>Fields</h3>
          <p>Pitch operators who want weekday 7s or Saturday 11s filled from nearby ZIP codes.</p>
        </article>
        <article className="card">
          <h3>Pubs</h3>
          <p>
            Watch-party hosts for FIFA World Cup and pro league matches. Culhane&apos;s Irish Pub
            was Maletas&apos; 2026 World Cup spot — an example of the kind of local listing{" "}
            Club alerts can point at, not an ad sale.
          </p>
        </article>
        <article className="card">
          <h3>Shops</h3>
          <p>Local gear and recovery shops. Outbound or affiliate links, clearly labelled.</p>
        </article>
      </div>
      <div className="card">
        <h3>How ads work in this preview</h3>
        <p>
          Sponsor cards in the games list and clubhouse, plus one banner slot. Open Play sees ads.
          Club members see light local sponsor units only. Production options (direct local
          sponsorships, Google AdSense / Ad Manager, affiliate programs) are listed in
          ARCHITECTURE.md.
        </p>
        <p className="small muted">No form is sent. This is sample copy for the matchmaker preview.</p>
        <button className="btn primary" type="button" disabled>
          Request a kit (demo)
        </button>
      </div>
    </div>
  );
}
