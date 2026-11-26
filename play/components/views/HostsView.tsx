"use client";

import Link from "next/link";
import { initials } from "@/lib/format";
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
        <button className="btn pitch" type="button" onClick={listField}>
          List your field
        </button>
      </div>
      <p className="muted">
        Hosts own the field time. They set the format, the fee and how often it repeats
        (one-off, weekly, or every 2 weeks), and Maletas fills the sheet.
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
