"use client";

import Link from "next/link";
import { repeatTag } from "@/lib/format";
import { SAMPLE_DISCLAIMER } from "@/lib/data/seed";
import { usePlay } from "@/lib/play-context";
import { SignUpSheet } from "../SignUpSheet";

export function GameDetailView({ id }: { id: string }) {
  const { ready, state, myName, isOnSheet, user, requireUser, openModal, repo, showToast } =
    usePlay();
  const game = state.games.find((item) => item.id === id);

  if (!ready) {
    return (
      <div className="wrap">
        <p className="muted">Loading sheet…</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="wrap">
        <h2>Game not found</h2>
        <p className="muted">That sheet is not in this browser&apos;s sample data.</p>
        <Link className="btn pitch" href="/">
          Back to games
        </Link>
      </div>
    );
  }

  const n = game.roster.length;
  const full = n >= game.spots;
  const me = isOnSheet(game);
  const gameId = game.id;
  const gameTitle = game.title;

  async function leave() {
    if (!user) return;
    await repo.leaveGame(gameId, user);
    showToast(`You dropped out of ${gameTitle}`);
  }

  function join() {
    if (requireUser()) return;
    openModal({ type: "waiver", gameId });
  }

  return (
    <div className="wrap">
      <p className="small muted">
        <Link href="/">Games</Link> / sign-up sheet
      </p>
      <div className="row between">
        <h2>{game.title}</h2>
        <span className={`tag ${game.repeat === "One-off" ? "" : "rec"}`}>
          {repeatTag(game.repeat)}
        </span>
      </div>
      {game.sample ? <span className="tag sample">Sample data</span> : null}
      <div className="meta">
        <span>{game.when}</span>
        <span>{game.field}</span>
        <span>
          {game.city}
          {game.country ? `, ${game.country}` : ""} · {game.zip}
        </span>
        <span>Host: {game.hostName}</span>
        <span>{game.format}</span>
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
        {me ? (
          <button className="btn" type="button" onClick={leave}>
            Drop out
          </button>
        ) : (
          <button className="btn primary" type="button" onClick={join} disabled={full}>
            {full ? "Sheet is full" : "Add my name"}
          </button>
        )}
      </div>
      <SignUpSheet game={game} myName={myName} />
      <p className="small muted">
        Adding your name asks you to acknowledge a play-at-your-own-risk waiver. {SAMPLE_DISCLAIMER}
      </p>
    </div>
  );
}
