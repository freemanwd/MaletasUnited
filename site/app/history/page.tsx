import type { Metadata } from "next";
import Link from "next/link";
import { historyCopy } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "History",
  description:
    "Maletas means suitcase in Spanish — a name coined about 20 years ago by Carlos V. for a rag-tag Jacksonville pickup soccer group.",
  alternates: { canonical: "/history" },
};

const stops = [
  {
    title: "A suitcase of a name",
    body: "Carlos V. coined “Maletas” about 20 years ago. In Spanish it literally means suitcase, and here it meant an untalented, rag-tag pickup side. The name stuck.",
  },
  {
    title: "Emerson Road, by the tracks",
    body: "The original field was not pretty: off Emerson Road in Jacksonville, FL, near some train tracks.",
  },
  {
    title: "Jacksonville Golf and Country Club",
    body: "They ran into O.G. Maleta Mr K Patel, who later hosted at Jacksonville Golf and Country Club for a while.",
  },
  {
    title: "A private field since 2012",
    body: "Then a nicer private Jacksonville field. Since 2012 a host rekindled a super-selected group. Over the last 2–3 years the hosts rotate. The address stays private.",
  },
];

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-leather">
        About 20 years of rag-tag soccer
      </p>
      <h1 className="mt-3 font-display text-4xl text-pitch sm:text-5xl">
        {historyCopy.title}
      </h1>
      <p className="mt-6 text-lg leading-relaxed">{historyCopy.nameOrigin}</p>
      <p className="mt-5 text-lg leading-relaxed">{historyCopy.fields}</p>

      <ol className="mt-12 space-y-4">
        {stops.map((stop, index) => (
          <li
            key={stop.title}
            className="rounded-3xl bg-paper p-5 ring-1 ring-pitch/10"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-1 font-display text-2xl text-pitch">{stop.title}</h2>
            <p className="mt-2 text-ink-soft">{stop.body}</p>
          </li>
        ))}
      </ol>

      <aside className="mt-10 rounded-3xl bg-pitch px-5 py-6 text-cream">
        <h2 className="font-display text-2xl">Joke awards, taken seriously</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          The Facebook page hosts the annual Maleta Supreme — for the player who
          is actually regressing in soccer skills and not progressing — plus
          Least Likely to Pass the Ball, Best Striker, Best Defender, and the
          Uncoachable B@stard award.
        </p>
        <a
          className="mt-4 inline-flex rounded-full bg-gold px-5 py-2 text-sm font-extrabold uppercase tracking-[0.12em] text-pitch"
          href={siteConfig.facebook}
          rel="noopener noreferrer"
          target="_blank"
        >
          Facebook page
        </a>
      </aside>

      <p className="mt-8 text-sm text-ink-soft">
        Looking for the pictures?{" "}
        <Link className="font-semibold text-turf underline" href="/photos">
          Photos over the years
        </Link>
        .
      </p>
    </div>
  );
}
