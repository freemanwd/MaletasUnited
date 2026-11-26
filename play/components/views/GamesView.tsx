"use client";

import Link from "next/link";
import { filterGames, filterListings } from "@/lib/data/local-repository";
import { SAMPLE_DISCLAIMER } from "@/lib/data/seed";
import { GAME_TZ_LABEL } from "@/lib/format";
import { TIER } from "@/lib/tier";
import { FORMATS } from "@/lib/types";
import { usePlay } from "@/lib/play-context";
import { AdSlot } from "../AdSlot";
import { GameCard } from "../GameCard";
import { ListingCard } from "../ListingCard";
import { MatchmakerNotice } from "../MatchmakerNotice";

export function GamesView() {
  const { state, vip, user, repo, openModal, requireUser } = usePlay();
  const cities = [
    "All",
    ...Array.from(new Set([...state.games.map((game) => game.city), ...state.listings.map((row) => row.city)])),
  ];
  const filters = {
    city: state.city,
    format: state.format,
    zipPrefix: state.zip,
  };
  const list = filterGames(state.games, filters);
  const listings = filterListings(state.listings, filters);
  const banner = state.ads.find((ad) => ad.placement === "banner");
  const gameAds = vip ? [] : state.ads.filter((ad) => ad.placement === "games");

  function host() {
    if (requireUser()) return;
    openModal({ type: "host" });
  }

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>
            Find a game. <em>Anywhere.</em>
          </h1>
          <p>
            Maletas is a matchmaker that collates soccer opportunities around the globe. Hosts open
            sheets, public pickup and leagues are listed from the web, and Jacksonville, Florida is
            the first hub.
          </p>
          <form
            className="search"
            onSubmit={(event) => {
              event.preventDefault();
              const zip = String(new FormData(event.currentTarget).get("zip") ?? "").trim();
              void repo.setFilters({ city: "All", zip });
            }}
          >
            <input
              id="zipq"
              name="zip"
              type="text"
              inputMode="text"
              placeholder="City, ZIP or postcode, e.g. 32204"
              defaultValue={state.zip}
              aria-label="ZIP or postcode"
            />
            <button className="btn primary" type="submit">
              Search
            </button>
          </form>
          <p className="plusline">
            Searching and browsing by city, ZIP and format is free for everyone.
            {state.zip ? (
              <>
                {" "}
                Filtering {state.zip}.{" "}
                <button type="button" className="btn sm" onClick={() => repo.setFilters({ zip: "" })}>
                  Clear
                </button>
              </>
            ) : null}{" "}
            Kick-off times are shown in {GAME_TZ_LABEL} (America/New_York). Open Play is free.
            Private games and alerts are{" "}
            <Link href={TIER.path}>
              <strong>{TIER.productName}</strong>
            </Link>
            .
          </p>
          {user ? null : (
            <p>
              <Link className="btn primary" href="/signup">
                Join / Sign up
              </Link>
            </p>
          )}
        </div>
      </section>
      <div className="wrap">
        {banner && !vip ? <AdSlot ad={banner} banner /> : null}
        {vip && banner ? <AdSlot ad={banner} banner light /> : null}
        <div className="row between">
          <h2>Games this week</h2>
          <button className="btn pitch" type="button" onClick={host}>
            Host a game
          </button>
        </div>
        <div className="chips" role="group" aria-label="City">
          {cities.map((city) => (
            <button
              key={city}
              className="chip"
              type="button"
              aria-pressed={state.city === city}
              onClick={() => repo.setFilters({ city })}
            >
              {city === "All" ? "All cities" : city}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Format">
          {["All", ...FORMATS].map((fmt) => (
            <button
              key={fmt}
              className="chip"
              type="button"
              aria-pressed={state.format === fmt}
              onClick={() => repo.setFilters({ format: fmt })}
            >
              {fmt === "All" ? "Any format" : fmt}
            </button>
          ))}
        </div>
        {list.length || listings.length ? (
          <div className="grid">
            {list.map((game, index) => (
              <span key={game.id} style={{ display: "contents" }}>
                <GameCard game={game} />
                {!vip && gameAds[index] && index === 1 ? <AdSlot ad={gameAds[0]!} /> : null}
              </span>
            ))}
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
            {!vip && gameAds[1] ? <AdSlot ad={gameAds[1]!} /> : null}
          </div>
        ) : (
          <div className="banner">
            No games match yet. Clear a filter, or host the first one here.
          </div>
        )}
        <MatchmakerNotice />
        <p className="small muted">{SAMPLE_DISCLAIMER}</p>
      </div>
    </>
  );
}
