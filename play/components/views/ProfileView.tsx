"use client";

import Link from "next/link";
import { displayRole, shortName } from "@/lib/format";
import { usePlay } from "@/lib/play-context";
import { PlusCard } from "../PlusCard";

export function ProfileView() {
  const { user, plus, state, openModal, repo, showToast } = usePlay();

  if (!user) {
    return (
      <div className="wrap">
        <h2>Your player card</h2>
        <div className="card">
          <p>
            Create a profile to put your name on sign-up sheets, host games, and post in the
            clubhouse. It is free.
          </p>
          <div>
            <button className="btn primary" type="button" onClick={() => openModal({ type: "signup" })}>
              Join Maletas
            </button>
          </div>
        </div>
        <PlusCard compact />
      </div>
    );
  }

  const mine = state.games.filter((game) => game.roster.includes(shortName(user.name)));
  const invitePath = `/join/${user.profile.inviteCode}`;
  const inviteCount =
    state.referralCounts[user.profile.inviteCode] ?? user.profile.invites;

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
              {user.profile.city}
              {user.profile.zip ? ` · ${user.profile.zip}` : ""}
              {plus ? (
                <>
                  {" "}
                  <span className="tag plus">Plus</span>
                </>
              ) : null}
            </div>
            {user.profile.bio ? <p>{user.profile.bio}</p> : null}
            {user.profile.social ? (
              <a href={user.profile.social} rel="noopener noreferrer">
                {user.profile.social.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </div>
          <div className="row">
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
          <PlusCard compact />
        </aside>
      </div>
    </div>
  );
}
