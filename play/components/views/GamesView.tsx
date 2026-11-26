"use client";

import Link from "next/link";
import { filterGames } from "@/lib/data/local-repository";
import { SAMPLE_DISCLAIMER } from "@/lib/data/seed";
import { FORMATS } from "@/lib/types";
import { usePlay } from "@/lib/play-context";
import { GameCard } from "../GameCard";

export function GamesView() {
  const { state, plus, repo, openModal, requireUser } = usePlay();
  const cities = ["All", ...Array.from(new Set(state.games.map((game) => game.city)))];
  const list = filterGames(state.games, {
    city: state.city,
    format: state.format,
    zipPrefix: plus ? state.zip : "",
  });

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
            Pickup soccer, fútbol, football. Hosts open their fields, players put their names on
            the sheet, and the game is on. Jacksonville, Florida is the first hub.
          </p>
          <form
            className="search"
            onSubmit={(event) => {
              event.preventDefault();
              const zip = String(new FormData(event.currentTarget).get("zip") ?? "").trim();
              if (!zip) {
                void repo.setFilters({ city: "All", zip: "" });
                return;
              }
              if (!plus) {
                openModal({ type: "plus" });
                return;
              }
              void repo.setFilters({ city: "All", zip });
            }}
          >
            <input
              id="zipq"
              name="zip"
              type="text"
              inputMode="text"
              placeholder="ZIP or postcode, e.g. 32204"
              defaultValue={state.zip}
              aria-label="ZIP or postcode"
            />
            <button className="btn primary" type="submit">
              Near me
            </button>
          </form>
          <p className="plusline">
            {plus ? (
              <>
                <span className="tag plus">Plus</span> ZIP and region search is on.
                {state.zip ? (
                  <>
                    {" "}
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => repo.setFilters({ zip: "" })}
                    >
                      Clear ZIP
                    </button>
                  </>
                ) : null}
              </>
            ) : (
              <>
                Browsing by city is free. Search by ZIP and region with{" "}
                <Link href="/plus">
                  <strong>Maletas Plus, $1.99 a month</strong>
                </Link>
                .
              </>
            )}
          </p>
        </div>
      </section>
      <div className="wrap">
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
        {list.length ? (
          <div className="grid">
            {list.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="banner">
            No games match yet. Clear a filter, or host the first one here.
          </div>
        )}
        <p className="small muted">{SAMPLE_DISCLAIMER}</p>
      </div>
    </>
  );
}
