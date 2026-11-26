import Link from "next/link";
import { Crest } from "@/components/Crest";
import { PlayLink } from "@/components/PlayLink";
import { nav } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-pitch text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Crest className="h-12 w-12" />
            <div>
              <p className="font-display text-2xl font-semibold">Maletas United</p>
              <p className="text-sm text-gold-soft">{siteConfig.tagline}</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
            Pickup soccer in Jacksonville, FL. Older gentlemen, no entrance
            fees, not a nonprofit. Games have historically been weekends —
            mostly Saturday mornings — plus some weeknights when there&apos;s
            enough daylight. No fixed schedule. The field address stays private.
            Play at your own risk.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Wander
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link className="hover:text-gold-soft" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <PlayLink className="hover:text-gold-soft">
                  {siteConfig.playNavLabel}{" "}
                  <span className="text-gold">(beta)</span>
                </PlayLink>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Write
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  className="hover:text-gold-soft"
                  href={`mailto:${siteConfig.email}`}
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-gold-soft"
                  href={siteConfig.facebook}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Facebook page
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-mist/80 sm:px-6">
        A rag-tag pickup side in {siteConfig.location}. Letter from Freeman.
      </div>
    </footer>
  );
}
