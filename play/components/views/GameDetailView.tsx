"use client";

import Link from "next/link";
import { displayFee, repeatTag } from "@/lib/format";
import { TIER } from "@/lib/tier";
import { SAMPLE_DISCLAIMER } from "@/lib/data/seed";
import { usePlay } from "@/lib/play-context";
import { canJoinGame, displayField, visibilityLabel } from "@/lib/visibility";
import { MatchmakerNotice } from "../MatchmakerNotice";
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
  const access = canJoinGame(game, user);
  const isHost = Boolean(user && (user.id === game.hostId || user.name === game.hostName));
  const pendingPeople = game.pendingIds
    .map((pid) => state.players.find((player) => player.id === pid))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  async function leave() {
    if (!user) return;
    await repo.leaveGame(gameId, user);
    showToast(`You dropped out of ${gameTitle}`);
  }

  async function join() {
    if (requireUser()) return;
    if (access.reason === "vip") {
      openModal({ type: "club" });
      showToast(`This game is for ${TIER.productName} members`);
      return;
    }
    if (access.reason === "invite") {
      if (!user) return;
      await repo.requestJoin(gameId, user);
      showToast("Request sent. The host will share the field if they approve you.");
      return;
    }
    if (access.reason === "pending") {
      showToast("Waiting on the host to approve you");
      return;
    }
    openModal({ type: "waiver", gameId });
  }

  return (
    <div className="wrap">
      <p className="small muted">
        <Link href="/">Games</Link> / sign-up sheet
      </p>
      <div className="row between">
        <h2>{game.title}</h2>
        <span className="row">
          <span className={`tag ${game.repeat === "One-off" ? "" : "rec"}`}>
            {repeatTag(game.repeat)}
          </span>
          {game.visibility !== "public" ? (
            <span className={`tag ${game.visibility === "vip" ? "club" : ""}`}>
              {visibilityLabel(game.visibility)}
            </span>
          ) : null}
        </span>
      </div>
      {game.sample ? <span className="tag sample">Sample data</span> : null}
      <div className="meta">
        <span>{game.when}</span>
        <span>{displayField(game, user)}</span>
        <span>
          {game.city}
          {game.country ? `, ${game.country}` : ""} · {game.zip}
        </span>
        <span>
          Host:{" "}
          {state.players.find(
            (player) => player.id === game.hostId || player.name === game.hostName,
          ) ? (
            <Link
              href={`/players/${state.players.find((player) => player.id === game.hostId || player.name === game.hostName)?.handle}`}
            >
              {game.hostName}
            </Link>
          ) : (
            game.hostName
          )}
        </span>
        <span>{game.format}</span>
        <span>{displayFee(game)}</span>
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
          <button className="btn primary" type="button" onClick={join} disabled={full && access.ok}>
            {full
              ? "Sheet is full"
              : access.reason === "pending"
                ? "Requested"
                : access.reason === "invite"
                  ? "Request a spot"
                  : access.reason === "vip"
                    ? `${TIER.name} to join`
                    : "Add my name"}
          </button>
        )}
      </div>
      {game.hostTerms ? (
        <div className="card">
          <h3>Host terms</h3>
          <p>{game.hostTerms}</p>
        </div>
      ) : null}
      {isHost && pendingPeople.length ? (
        <div className="card">
          <h3>Pending requests</h3>
          {pendingPeople.map((player) => (
            <div className="row between" key={player.id}>
              <Link href={`/players/${player.handle}`}>{player.name}</Link>
              <button
                className="btn sm primary"
                type="button"
                onClick={async () => {
                  if (!user) return;
                  await repo.approveJoin(gameId, player.id, user);
                  showToast(`${player.name} is on the sheet`);
                }}
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <SignUpSheet game={game} myName={myName} />
      <MatchmakerNotice variant="game" />
      <p className="small muted">
        Adding your name asks you to accept this host’s waiver and the matchmaker notice.{" "}
        {SAMPLE_DISCLAIMER}
      </p>
    </div>
  );
}
