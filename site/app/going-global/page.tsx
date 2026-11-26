import type { Metadata } from "next";
import { InterestForm } from "@/components/InterestForm";
import { PlayLink } from "@/components/PlayLink";
import { moreInfoCopy } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Going global",
  description:
    "Maletas Play is an early preview of a host-and-player pickup soccer app — a spoke and hub model. Try the beta, or email to host or play. Play at your own risk.",
  alternates: { canonical: "/going-global" },
};

export default function GoingGlobalPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-leather">
            Early preview
          </p>
          <h1 className="mt-3 font-display text-4xl text-pitch sm:text-5xl">
            Going global
          </h1>
          <p className="mt-6 text-lg leading-relaxed">{moreInfoCopy.global}</p>

          <PlayLink className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 text-sm font-extrabold uppercase tracking-[0.08em] text-pitch">
            {siteConfig.playNavLabel}
            <span className="rounded-full bg-pitch px-2 py-0.5 text-[10px] font-bold normal-case tracking-wide text-gold">
              Beta
            </span>
          </PlayLink>

          <div className="mt-8 overflow-hidden rounded-[2rem] bg-pitch p-6 text-cream">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Hub and spoke, now in beta
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="rounded-3xl border border-white/15 p-5">
                <p className="font-display text-2xl">Hosts</p>
                <p className="mt-2 text-sm text-mist">
                  The hub: people who can put on a pickup game.
                </p>
              </div>
              <p className="hidden text-center text-gold sm:block" aria-hidden>
                ↔
              </p>
              <div className="rounded-3xl border border-white/15 p-5">
                <p className="font-display text-2xl">Players</p>
                <p className="mt-2 text-sm text-mist">
                  The spokes: older (and young-at-heart) players looking for a
                  pickup kickabout.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-mist">
              Ideally free or minimal cost to players and hosts. Totally “play at
              your own risk.” Maletas Play is an early preview of that idea —
              try the beta, then email if you want to host or play.
            </p>
            <PlayLink className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-extrabold uppercase tracking-[0.08em] text-pitch">
              Open Maletas Play
            </PlayLink>
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl text-pitch">
            Interested in supporting it?
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Email {siteConfig.email}. Tell us if you are more of a future host
            or a future player.
          </p>
          <div className="mt-5">
            <InterestForm defaultInterest="global" />
          </div>
        </div>
      </div>
    </div>
  );
}
