"use client";

import Link from "next/link";
import { initials } from "@/lib/format";
import { TIER } from "@/lib/tier";
import { usePlay } from "@/lib/play-context";

export function HostsView() {
  const { state, user, requireUser, openModal } = usePlay();

  function listField() {
    if (requireUser()) return;
    openModal({ type: "host" });
  }

  const mine = user ? state.games.filter((game) => game.hostName === user.name) : [];

  return (
    <div className="wrap">
      <div className="row between">
        <h2>Hosts and fields</h2>
        <span className="row">
          <Link className="btn" href="/hosts/vouchers">
            Guest {TIER.name} vouchers
          </Link>
          <button className="btn pitch" type="button" onClick={listField}>
            List your field
          </button>
        </span>
      </div>
      <p className="muted">
        Maletas is a matchmaker, not a host. Each host names their own fee model (per game,
        semester, session series, season, month, free or donation), visibility, terms and waiver.
        Fees are between host and player. You, not Maletas, run the field. Any host can gift a
        1-year {TIER.productName} voucher so a guest does not pay $1.99/month.
      </p>
      <div className="grid">
        {state.hosts.map((host) => {
          const games = state.games.filter((game) => game.hostId === host.id);
          return (
            <article className="card" key={host.id}>
              <div className="post">
                <div className="hd">
                  <div className="av host">{initials(host.name)}</div>
                  <div>
                    <strong>{host.name}</strong>
                    <div className="small muted">
                      {host.city} · hosting since {host.since}
                      {host.sample ? " · sample" : ""}
                    </div>
                  </div>
                </div>
              </div>
              <div className="meta">
                <span>{host.fields}</span>
                <span>{host.surface}</span>
              </div>
              {games.map((game) => (
                <div className="row between" key={game.id}>
                  <span>
                    {game.title} <span className="small muted">· {game.when}</span>
                  </span>
                  <Link className="btn sm" href={`/games/${game.id}`}>
                    View
                  </Link>
                </div>
              ))}
            </article>
          );
        })}
        {mine.length ? (
          <article className="card">
            <div className="post">
              <div className="hd">
                <div className="av host">{initials(user!.name)}</div>
                <div>
                  <strong>{user!.name}</strong>
                  <div className="small muted">{user!.profile.city} · you</div>
                </div>
              </div>
            </div>
            {mine.map((game) => (
              <div className="row between" key={game.id}>
                <span>
                  {game.title} <span className="small muted">· {game.when}</span>
                </span>
                <Link className="btn sm" href={`/games/${game.id}`}>
                  View
                </Link>
              </div>
            ))}
          </article>
        ) : null}
      </div>
    </div>
  );
}
