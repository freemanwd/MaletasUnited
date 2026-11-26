import type { Metadata } from "next";
import { InterestForm } from "@/components/InterestForm";
import { moreInfoCopy } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Going global",
  description:
    "Maletas United hopes to create a future free or low-cost host-and-player pickup soccer app — a spoke and hub model. Stay tuned. Play at your own risk.",
  alternates: { canonical: "/going-global" },
};

export default function GoingGlobalPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-leather">
            Stay tuned
          </p>
          <h1 className="mt-3 font-display text-4xl text-pitch sm:text-5xl">
            Going global
          </h1>
          <p className="mt-6 text-lg leading-relaxed">{moreInfoCopy.global}</p>

          <div className="mt-8 overflow-hidden rounded-[2rem] bg-pitch p-6 text-cream">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Hub and spoke, someday
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
                  Sunday kickabout.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-mist">
              Ideally free or minimal cost to players and hosts. Totally “play at
              your own risk.” There is no app yet and no waitlist backend — just
              this note and an email.
            </p>
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
