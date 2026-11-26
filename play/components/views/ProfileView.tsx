"use client";

import Link from "next/link";
import { displayRole, shortName } from "@/lib/format";
import { friendsOf } from "@/lib/visibility";
import { usePlay } from "@/lib/play-context";
import { VipCard } from "../VipCard";

export function ProfileView() {
  const { user, vip, state, openModal, repo, showToast } = usePlay();

  if (!user) {
    return (
      <div className="wrap">
        <h2>Your player card</h2>
        <div className="card">
          <p>
            Create a profile to put your name on sign-up sheets, host games, add friends, and post
            in the clubhouse. It is free.
          </p>
          <div>
            <button className="btn primary" type="button" onClick={() => openModal({ type: "signup" })}>
              Join Maletas
            </button>
          </div>
        </div>
        <VipCard compact />
      </div>
    );
  }

  const mine = state.games.filter(
    (game) => game.rosterIds.includes(user.id) || game.roster.includes(shortName(user.name)),
  );
  const hosted = state.games.filter((game) => game.hostId === user.id || game.hostName === user.name);
  const invitePath = `/join/${user.profile.inviteCode}`;
  const inviteCount =
    state.referralCounts[user.profile.inviteCode] ?? user.profile.invites;
  const friendIds = friendsOf(state, user.id);
  const friends = state.players.filter((player) => friendIds.includes(player.id));
  const incoming = state.friendships.filter(
    (row) => row.status === "pending" && row.toId === user.id,
  );

  async function copyInvite() {
    const url = `${window.location.origin}${invitePath}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Invite link copied");
    } catch {
      showToast("Select the link to copy it");
    }
  }

  return (
    <div className="wrap">
      <h2>Your player card</h2>
      <div className="cols">
        <div className="stack">
          <div className="pcard">
            <span className="pos">
              {user.profile.position || "Utility"} · {displayRole(user.roles)}
            </span>
            <h2>{user.name}</h2>
            <div>
              @{user.profile.handle} · {user.profile.city}
              {user.profile.zip ? ` · ${user.profile.zip}` : ""}
              {vip ? (
                <>
                  {" "}
                  <span className="tag vip">VIP</span>
                </>
              ) : null}
              {" "}
              <span className="tag">{user.profile.privacy}</span>
            </div>
            {user.profile.bio ? <p>{user.profile.bio}</p> : null}
            {user.profile.social ? (
              <a href={user.profile.social} rel="noopener noreferrer">
                {user.profile.social.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </div>
          <div className="row">
            <Link className="btn sm primary" href={`/players/${user.profile.handle}`}>
              Public profile
            </Link>
            <button className="btn sm" type="button" onClick={() => openModal({ type: "signup" })}>
              Edit profile
            </button>
            <button className="btn sm" type="button" onClick={() => repo.signOut()}>
              Sign out
            </button>
          </div>
          <div className="card">
            <h3>Your games</h3>
            {mine.length ? (
              mine.map((game) => (
                <div className="row between" key={game.id}>
                  <span>
                    {game.title}{" "}
                    <span className="small muted">
                      · {game.when} · {game.city}
                    </span>
                  </span>
                  <Link className="btn sm" href={`/games/${game.id}`}>
                    View
                  </Link>
                </div>
              ))
            ) : (
              <>
                <p className="muted">You are not on a sheet yet.</p>
                <div>
                  <Link className="btn sm pitch" href="/">
                    Find a game
                  </Link>
                </div>
              </>
            )}
          </div>
          {hosted.length ? (
            <div className="card">
              <h3>Games you host</h3>
              {hosted.map((game) => (
                <div className="row between" key={game.id}>
                  <span>{game.title}</span>
                  <Link className="btn sm" href={`/games/${game.id}`}>
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : null}
          <div className="card">
            <h3>Friends</h3>
            {incoming.map((row) => {
              const other = state.players.find((player) => player.id === row.fromId);
              if (!other) return null;
              return (
                <div className="row between" key={row.id}>
                  <Link href={`/players/${other.handle}`}>{other.name}</Link>
                  <button
                    className="btn sm primary"
                    type="button"
                    onClick={() => repo.acceptFriendRequest(user.id, other.id)}
                  >
                    Accept
                  </button>
                </div>
              );
            })}
            {friends.length ? (
              friends.map((friend) => (
                <div className="row between" key={friend.id}>
                  <Link href={`/players/${friend.handle}`}>{friend.name}</Link>
                  <span className="small muted">@{friend.handle}</span>
                </div>
              ))
            ) : (
              <p className="muted">No friends yet. Open a sample player profile to add one.</p>
            )}
          </div>
        </div>
        <aside className="stack">
          <div className="card">
            <h3>Bring your team</h3>
            <p className="muted">
              Share your link. Every player or host who joins with it counts toward your invites.
              Referral tracking is a client-side stand-in until production.
            </p>
            <div className="row">
              <span className="code" id="invite">
                maletas.com{invitePath}
              </span>
              <button className="btn sm" type="button" onClick={copyInvite}>
                Copy
              </button>
            </div>
            <div className="small muted num">{inviteCount} joined with your link</div>
          </div>
          <VipCard compact />
        </aside>
      </div>
    </div>
  );
}
