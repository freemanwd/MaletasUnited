"use client";

import Link from "next/link";
import { repeatTag } from "@/lib/format";
import type { Game } from "@/lib/types";
import { usePlay } from "@/lib/play-context";
import { SignUpSheet } from "./SignUpSheet";

export function GameCard({
  game,
  showSheet = false,
}: {
  game: Game;
  showSheet?: boolean;
}) {
  const { myName, isOnSheet, user, requireUser, openModal, repo, showToast } = usePlay();
  const n = game.roster.length;
  const full = n >= game.spots;
  const me = isOnSheet(game);

  async function leave() {
    if (!user) return;
    await repo.leaveGame(game.id, user);
    showToast(`You dropped out of ${game.title}`);
  }

  function join() {
    if (requireUser()) return;
    openModal({ type: "waiver", gameId: game.id });
  }

  return (
    <article className="card">
      <div className="row between">
        <span className={`tag ${game.repeat === "One-off" ? "" : "rec"}`}>
          {repeatTag(game.repeat)}
        </span>
        {full ? <span className="tag full">Full</span> : <span className="tag">{game.format}</span>}
      </div>
      {game.sample ? <span className="tag sample">Sample</span> : null}
      <h3>
        <Link href={`/games/${game.id}`}>{game.title}</Link>
      </h3>
      <div className="meta">
        <span>{game.when}</span>
        <span>{game.field}</span>
        <span>
          {game.city}
          {game.country ? `, ${game.country}` : ""} · {game.zip}
        </span>
        <span>Host: {game.hostName}</span>
        <span>{game.fee}</span>
      </div>
      <div
        className={`meter ${full ? "full" : ""}`}
        role="img"
        aria-label={`${n} of ${game.spots} spots taken`}
      >
        <b style={{ width: `${Math.min(100, (n / game.spots) * 100)}%` }} />
      </div>
      <div className="row between">
        <span className="small muted num">
          {n} of {game.spots} signed up
        </span>
        <span className="row">
          <Link className="btn sm" href={`/games/${game.id}`}>
            {showSheet ? "Full sheet" : "Sign-up sheet"}
          </Link>
          {me ? (
            <button className="btn sm" type="button" onClick={leave}>
              Drop out
            </button>
          ) : (
            <button
              className="btn sm primary"
              type="button"
              onClick={join}
              disabled={full}
            >
              {full ? "Full" : "Add my name"}
            </button>
          )}
        </span>
      </div>
      {showSheet ? <SignUpSheet game={game} myName={myName} /> : null}
    </article>
  );
}
