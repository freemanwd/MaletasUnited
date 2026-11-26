"use client";

import Link from "next/link";
import { initials } from "@/lib/format";
import { usePlay } from "@/lib/play-context";

export function ClubhouseView() {
  const { state, user, repo, requireUser, showToast } = usePlay();

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

  return (
    <div className="wrap">
      <h2>Clubhouse</h2>
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
          {state.posts.map((item) => (
            <article className="card post" key={item.id}>
              <div className="hd">
                <div className={`av ${item.role === "Player" ? "" : "host"}`}>
                  {initials(item.who)}
                </div>
                <div>
                  <strong>{item.who}</strong>
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
              </div>
            </article>
          ))}
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
          <div className="card">
            <span className="tag ad">Ad · sample</span>
            <h3>Example Bibs Co.</h3>
            <p className="muted">
              Ten numbered bibs, one bag. Sponsored placements like this one help keep Maletas
              free. Sample listing, not a real partner.
            </p>
            <Link className="btn sm" href="/shop">
              See in shop
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
