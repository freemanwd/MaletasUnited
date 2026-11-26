"use client";

import Link from "next/link";
import { displayRole, initials, shortName } from "@/lib/format";
import { areFriends, canViewProfile, friendRequestBetween, friendsOf, isBlocked } from "@/lib/visibility";
import { usePlay } from "@/lib/play-context";

export function PlayerProfileView({ handle }: { handle: string }) {
  const { state, user, repo, requireUser, showToast } = usePlay();
  const player = state.players.find((row) => row.handle.toLowerCase() === handle.toLowerCase());

  if (!player) {
    return (
      <div className="wrap">
        <h2>Player not found</h2>
        <p className="muted">Sample profiles live on this preview. Try @dave or @river.</p>
        <Link className="btn pitch" href="/">
          Back to games
        </Link>
      </div>
    );
  }

  const blocked = user ? isBlocked(state, user.id, player.id) : false;
  const visible = canViewProfile(player, user, state);
  const mine = user?.id === player.id;
  const request = user ? friendRequestBetween(state, user.id, player.id) : undefined;
  const friends = areFriends(state, user?.id ?? "", player.id);
  const friendIds = friendsOf(state, player.id);
  const friendPeople = state.players.filter((row) => friendIds.includes(row.id));
  const played = state.games.filter(
    (game) =>
      game.rosterIds.includes(player.id) || game.roster.includes(shortName(player.name)),
  );
  const hosted = state.games.filter(
    (game) => game.hostId === player.id || game.hostName === player.name,
  );
  const posts = state.posts.filter((post) => post.authorId === player.id);
  const playerId = player.id;

  async function addFriend() {
    if (requireUser() || !user) return;
    await repo.sendFriendRequest(user.id, playerId);
    showToast("Friend request sent");
  }

  async function accept() {
    if (!user) return;
    await repo.acceptFriendRequest(user.id, playerId);
    showToast("You are friends");
  }

  return (
    <div className="wrap">
      <p className="small muted">
        <Link href="/">Games</Link> / @{player.handle}
        {player.sample ? " · sample player" : ""}
      </p>
      <div className="pcard">
        <div className="row between">
          <span className="pos">
            {player.position} · {displayRole(player.roles)}
          </span>
          <div className={`av host`}>{initials(player.name)}</div>
        </div>
        <h2>{player.name}</h2>
        <div>
          @{player.handle} · {player.city}
          {player.zip ? ` · ${player.zip}` : ""} · {player.privacy}
        </div>
        {visible ? (
          <>
            {player.bio ? <p>{player.bio}</p> : null}
            {player.social ? (
              <a href={player.social} rel="noopener noreferrer">
                {player.social.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </>
        ) : (
          <p className="muted">This profile is friends-only. Add them as a friend to see more.</p>
        )}
      </div>
      {!mine ? (
        <div className="row">
          {friends ? (
            <span className="tag">Friends</span>
          ) : request && user && request.fromId === user.id ? (
            <span className="tag">Pending</span>
          ) : request && user && request.toId === user.id ? (
            <button className="btn primary sm" type="button" onClick={accept}>
              Accept friend
            </button>
          ) : (
            <button className="btn primary sm" type="button" onClick={addFriend}>
              Add friend
            </button>
          )}
          {user && blocked ? (
            <button className="btn sm" type="button" onClick={() => repo.unblockPlayer(user.id, player.id)}>
              Unblock
            </button>
          ) : user ? (
            <button
              className="btn sm"
              type="button"
              onClick={async () => {
                await repo.blockPlayer(user.id, player.id);
                showToast("Blocked in this browser");
              }}
            >
              Block
            </button>
          ) : null}
          {user ? (
            <button
              className="btn sm"
              type="button"
              onClick={async () => {
                await repo.reportTarget(user.id, "player", player.id, "Profile report");
                showToast("Report saved in this browser (demo)");
              }}
            >
              Report
            </button>
          ) : null}
        </div>
      ) : (
        <Link className="btn sm" href="/me">
          Edit your card
        </Link>
      )}
      {visible ? (
        <div className="cols">
          <div className="stack">
            <div className="card">
              <h3>Games played</h3>
              {played.length ? (
                played.map((game) => (
                  <div className="row between" key={game.id}>
                    <span>{game.title}</span>
                    <Link className="btn sm" href={`/games/${game.id}`}>
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <p className="muted">No sheets yet.</p>
              )}
            </div>
            <div className="card">
              <h3>Games hosted</h3>
              {hosted.length ? (
                hosted.map((game) => (
                  <div className="row between" key={game.id}>
                    <span>{game.title}</span>
                    <Link className="btn sm" href={`/games/${game.id}`}>
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <p className="muted">Not hosting right now.</p>
              )}
            </div>
            <div className="card">
              <h3>Posts</h3>
              {posts.length ? (
                posts.map((post) => (
                  <p key={post.id}>
                    {post.text} <span className="small muted">· {post.city}</span>
                  </p>
                ))
              ) : (
                <p className="muted">No posts yet.</p>
              )}
            </div>
          </div>
          <aside className="stack">
            <div className="card">
              <h3>Friends</h3>
              {friendPeople.length ? (
                friendPeople.map((friend) => (
                  <div className="row between" key={friend.id}>
                    <Link href={`/players/${friend.handle}`}>{friend.name}</Link>
                    <span className="small muted">@{friend.handle}</span>
                  </div>
                ))
              ) : (
                <p className="muted">No friends listed.</p>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
