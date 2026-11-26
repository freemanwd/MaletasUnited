import Image from "next/image";
import Link from "next/link";
import { Crest } from "@/components/Crest";
import { homeLetter } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="pitch-stripes relative overflow-hidden text-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
              Sunday mornings · Jacksonville, FL
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Crest className="h-16 w-16 sm:h-20 sm:w-20" />
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                Maletas United
              </h1>
            </div>
            <p className="mt-5 max-w-xl font-display text-2xl leading-snug text-gold-soft sm:text-3xl">
              {homeLetter.headline.replace("Anyways, It is ", "")}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-mist">
              {homeLetter.kicker} A pickup soccer group of enthusiastic
              gentlemen. No entrance fees. Not a nonprofit. The laughter after a
              missed goal is the serious part.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/join"
                className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-6 text-sm font-extrabold uppercase tracking-[0.12em] text-pitch"
              >
                Want to play?
              </Link>
              <Link
                href="/history"
                className="inline-flex h-12 items-center justify-center rounded-full border border-cream/30 px-6 text-sm font-bold text-cream"
              >
                How a suitcase became a team
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2 text-sm">
              {[
                "Sunday mornings",
                "No entrance fees",
                "Older gentlemen",
                "Not a nonprofit",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <figure className="relative overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <Image
              src="/photos/field-group.jpg"
              alt="Maletas United players posed on a grassy field among pine trees"
              width={960}
              height={720}
              priority
              className="h-full w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pitch to-transparent px-4 pb-4 pt-16 text-sm text-cream">
              A Maletas United group photo. The field address stays private.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-leather">
          A letter from Freeman
        </p>
        <article className="paper-grain mt-6 rounded-[2rem] border border-pitch/10 px-5 py-8 shadow-[0_24px_60px_rgba(16,38,28,0.08)] sm:px-10 sm:py-12">
          <p className="font-display text-xl text-pitch sm:text-2xl">
            {homeLetter.kicker}
          </p>
          <p className="mt-2 font-display text-2xl leading-snug text-leather sm:text-3xl">
            {homeLetter.headline}
          </p>
          <p className="mt-8 text-lg">{homeLetter.greeting}</p>
          <p className="mt-4 text-lg leading-relaxed">{homeLetter.opener}</p>
          {homeLetter.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mt-5 text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
          <p className="mt-8 text-lg">{homeLetter.signOff}</p>
          <p className="mt-4 font-display text-2xl text-pitch">
            {homeLetter.signature}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{homeLetter.title}</p>
        </article>
      </section>

      <section className="border-t border-pitch/10 bg-mist/50">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6">
          <Link
            href="/photos"
            className="rounded-3xl bg-paper p-6 shadow-sm ring-1 ring-pitch/10"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-leather">
              Photos
            </p>
            <p className="mt-2 font-display text-2xl text-pitch">
              Group shots, Ole Boots, Fogo de Chao
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              2016, Maleta Supreme around 2018 and 2023, awards night Nov 4th
              2023.
            </p>
          </Link>
          <Link
            href="/join"
            className="rounded-3xl bg-paper p-6 shadow-sm ring-1 ring-pitch/10"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-leather">
              Join
            </p>
            <p className="mt-2 font-display text-2xl text-pitch">
              Roster is limited. Email first.
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Occasional VIP guests. We can often point you to other Jacksonville
              games, including Plantation.
            </p>
          </Link>
          <Link
            href="/going-global"
            className="rounded-3xl bg-paper p-6 shadow-sm ring-1 ring-pitch/10"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-leather">
              Going global
            </p>
            <p className="mt-2 font-display text-2xl text-pitch">
              A future host-and-player app
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Hub and spoke. Free or low-cost. Stay tuned.
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
