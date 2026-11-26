import type { Metadata } from "next";
import Link from "next/link";
import { InterestForm } from "@/components/InterestForm";
import { moreInfoCopy, scheduleCopy } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Join / More Info",
  description:
    "Interested in playing with Maletas United in Jacksonville? Email maletasunited@gmail.com. The roster is limited. Play at your own risk. Field address stays private.",
  alternates: { canonical: "/join" },
};

export default function JoinPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-leather">
          More Info.
        </p>
        <h1 className="mt-3 font-display text-4xl text-pitch sm:text-5xl">
          Want to kick a ball around?
        </h1>
        <p className="mt-6 text-lg leading-relaxed">{moreInfoCopy.vips}</p>
        <p className="mt-5 text-lg leading-relaxed">{moreInfoCopy.play}</p>

        <ul className="mt-8 space-y-3 text-sm">
          <li className="rounded-2xl bg-paper px-4 py-3 ring-1 ring-pitch/10">
            {scheduleCopy} Email for the latest.
          </li>
          <li className="rounded-2xl bg-paper px-4 py-3 ring-1 ring-pitch/10">
            The roster is limited. Email first — we cannot guarantee room.
          </li>
          <li className="rounded-2xl bg-paper px-4 py-3 ring-1 ring-pitch/10">
            The field address is private. If there is a spot, details come by
            email.
          </li>
          <li className="rounded-2xl bg-paper px-4 py-3 ring-1 ring-pitch/10">
            Play at your own risk. This is pickup soccer among older gentlemen,
            not a league and not a nonprofit.
          </li>
          <li className="rounded-2xl bg-paper px-4 py-3 ring-1 ring-pitch/10">
            Other Jacksonville games (e.g., Plantation) can often be shared if
            the Maletas list is full.
          </li>
        </ul>

        <p className="mt-8 text-sm text-ink-soft">
          Curious about the future host-and-player app?{" "}
          <Link className="font-semibold text-turf underline" href="/going-global">
            Going global
          </Link>
          .
        </p>
      </div>

      <div>
        <h2 className="font-display text-2xl text-pitch">Email for interest</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Or write {siteConfig.email} yourself. Same inbox either way.
        </p>
        <div className="mt-5">
          <InterestForm defaultInterest="play" />
        </div>
      </div>
    </div>
  );
}
