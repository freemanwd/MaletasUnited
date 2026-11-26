"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { initials } from "@/lib/format";
import { friendsOf, isBlocked } from "@/lib/visibility";
import { usePlay } from "@/lib/play-context";
import { AdSlot } from "../AdSlot";

export function ClubhouseView() {
  const { state, user, repo, requireUser, showToast } = usePlay();
  const [tab, setTab] = useState<"near" | "friends">("near");
  const friendIds = user ? friendsOf(state, user.id) : [];
  const city = user?.profile.city ?? "Jacksonville";

  const posts = useMemo(() => {
    return state.posts.filter((post) => {
      if (user && isBlocked(state, user.id, post.authorId)) return false;
      if (tab === "near") return post.city === city || post.city === state.city;
      if (!user) return false;
      return friendIds.includes(post.authorId) || post.authorId === user.id;
    });
  }, [state, tab, city, friendIds, user]);

  async function post(formData: FormData) {
    if (requireUser() || !user) return;
    const text = String(formData.get("text") ?? "").trim();
    if (!text) return;
    await repo.createPost(text, user);
  }

  async function newsletter() {
    if (requireUser() || !user) return;
    const next = !state.newsletter;
    await repo.setNewsletter(next);
    showToast(next ? `Weekly email on for ${user.profile.city}` : "Weekly email off");
  }

  const feedAd = state.ads.find((ad) => ad.placement === "feed");

  return (
    <div className="wrap">
      <h2>Clubhouse</h2>
      <div className="chips" role="tablist" aria-label="Feed">
        <button
          className="chip"
          type="button"
          aria-pressed={tab === "near"}
          onClick={() => setTab("near")}
        >
          Near me
        </button>
        <button
          className="chip"
          type="button"
          aria-pressed={tab === "friends"}
          onClick={() => setTab("friends")}
        >
          Friends
        </button>
      </div>
      <div className="cols">
        <div className="stack">
          <form className="card" action={post}>
            <label htmlFor="postText">Post to your local clubhouse</label>
            <textarea
              id="postText"
              name="text"
              placeholder="Need two more for Saturday. Who is in?"
              required
            />
            <div className="row between">
              <span className="small muted">
                {user ? `Posting as ${user.name}` : "Join to post"}
              </span>
              <button className="btn primary sm" type="submit">
                Post
              </button>
            </div>
          </form>
          {posts.length ? (
            posts.map((item) => (
              <article className="card post" key={item.id}>
                <div className="hd">
                  <div className={`av ${item.role === "Player" ? "" : "host"}`}>
                    {initials(item.who)}
                  </div>
                  <div>
                    <strong>
                      {item.authorHandle ? (
                        <Link href={`/players/${item.authorHandle}`}>{item.who}</Link>
                      ) : (
                        item.who
                      )}
                    </strong>
                    <div className="small muted">
                      {item.role} · {item.city}
                      {item.sample ? " · sample" : ""}
                    </div>
                  </div>
                </div>
                <p>{item.text}</p>
                <div className="row">
                  <button
                    className="btn sm"
                    type="button"
                    aria-pressed={item.liked}
                    onClick={() => repo.toggleLike(item.id)}
                  >
                    {item.liked ? "Liked" : "Like"} · <span className="num">{item.likes}</span>
                  </button>
                  {user && item.authorId !== user.id ? (
                    <button
                      className="btn sm"
                      type="button"
                      onClick={async () => {
                        await repo.reportTarget(user.id, "post", item.id, "Clubhouse report");
                        showToast("Report saved in this browser (demo)");
                      }}
                    >
                      Report
                    </button>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="banner">
              {tab === "friends"
                ? "No friend posts yet. Add friends from a player profile."
                : "No posts near you yet."}
            </div>
          )}
        </div>
        <aside className="stack">
          <div className="card">
            <h3>Local newsletter</h3>
            <p className="muted">
              A weekly email for your region: new games and hosts, and local soccer news.
            </p>
            <button className="btn pitch" type="button" onClick={newsletter}>
              {state.newsletter ? "Subscribed" : "Get the weekly email"}
            </button>
          </div>
          {feedAd && !user?.vip ? <AdSlot ad={feedAd} /> : null}
          {user?.vip ? <p className="small muted">VIP: fewer ads in the clubhouse.</p> : null}
        </aside>
      </div>
    </div>
  );
}
