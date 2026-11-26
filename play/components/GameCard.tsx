"use client";

import Link from "next/link";
import { displayFee, repeatTag } from "@/lib/format";
import { FEE_NOTICE } from "@/lib/legal";
import { TIER } from "@/lib/tier";
import type { Game } from "@/lib/types";
import { usePlay } from "@/lib/play-context";
import { canJoinGame, displayField, visibilityLabel } from "@/lib/visibility";
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
  const access = canJoinGame(game, user);

  async function leave() {
    if (!user) return;
    await repo.leaveGame(game.id, user);
    showToast(`You dropped out of ${game.title}`);
  }

  async function join() {
    if (requireUser()) return;
    if (access.reason === "vip") {
      openModal({ type: "vip" });
      showToast(`This game is for ${TIER.productName} members`);
      return;
    }
    if (access.reason === "invite") {
      if (!user) return;
      await repo.requestJoin(game.id, user);
      showToast("Request sent. The host will share the field if they approve you.");
      return;
    }
    if (access.reason === "pending") {
      showToast("Waiting on the host to approve you");
      return;
    }
    openModal({ type: "waiver", gameId: game.id });
  }

  return (
    <article className="card">
      <div className="row between">
        <span className={`tag ${game.repeat === "One-off" ? "" : "rec"}`}>
          {repeatTag(game.repeat)}
        </span>
        <span className="row">
          {game.visibility !== "public" ? (
            <span className={`tag ${game.visibility === "vip" ? "vip" : ""}`}>
              {visibilityLabel(game.visibility)}
            </span>
          ) : null}
          {full ? <span className="tag full">Full</span> : <span className="tag">{game.format}</span>}
        </span>
      </div>
      {game.sample ? <span className="tag sample">Sample</span> : null}
      <h3>
        <Link href={`/games/${game.id}`}>{game.title}</Link>
      </h3>
      <div className="meta">
        <span>{game.when}</span>
        <span>{displayField(game, user)}</span>
        <span>
          {game.city}
          {game.country ? `, ${game.country}` : ""} · {game.zip}
        </span>
        <span>
          Host: {game.hostName}
        </span>
        <span>{displayFee(game)}</span>
      </div>
      <p className="small muted">{FEE_NOTICE}</p>
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
              disabled={full && access.ok}
            >
              {full
                ? "Full"
                : access.reason === "pending"
                  ? "Requested"
                  : access.reason === "invite"
                    ? "Request a spot"
                    : access.reason === "vip"
                      ? `${TIER.name} to join`
                      : "Add my name"}
            </button>
          )}
        </span>
      </div>
      {showSheet ? <SignUpSheet game={game} myName={myName} /> : null}
    </article>
  );
}
