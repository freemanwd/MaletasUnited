"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { friendsOf, isBlocked } from "@/lib/visibility";
import { usePlay } from "@/lib/play-context";
import { AdSlot } from "../AdSlot";
import { ClubhousePost } from "../ClubhousePost";

export function ClubhouseView() {
  const { state, user, repo, requireUser, showToast } = usePlay();
  const [tab, setTab] = useState<"near" | "friends">("near");
  const [preview, setPreview] = useState("");
  const [composerKey, setComposerKey] = useState(0);
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
    if (!text && !preview) {
      showToast("Write a thought or add a photo");
      return;
    }
    await repo.createPost(text || "Photo", user, preview);
    setPreview("");
    setComposerKey((n) => n + 1);
  }

  function onPhoto(file: File | undefined) {
    if (!file) {
      setPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("Choose a photo (image file)");
      return;
    }
    if (file.size > 1_500_000) {
      showToast("Keep photos under 1.5 MB in this demo");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
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
          <form className="card composer" action={post} key={composerKey}>
            <h3>Post a thought or photo</h3>
            <label htmlFor="postText">What is on your mind?</label>
            <textarea
              id="postText"
              name="text"
              placeholder="Need two more for Saturday. Who is in?"
            />
            <label htmlFor="postPhoto">
              Photo
              <input
                id="postPhoto"
                name="photo"
                type="file"
                accept="image/*"
                onChange={(event) => onPhoto(event.target.files?.[0])}
              />
            </label>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="post-photo composer-photo" src={preview} alt="Selected" />
            ) : null}
            <p className="small muted">Photos stay in this browser as a demo data URL.</p>
            <div className="row between">
              <span className="small muted">
                {user ? (
                  `Posting as ${user.name}`
                ) : (
                  <Link href="/signup">Join / Sign up to post</Link>
                )}
              </span>
              <button className="btn primary sm" type="submit" disabled={!user}>
                Post
              </button>
            </div>
          </form>
          {posts.length ? (
            posts.map((item) => <ClubhousePost post={item} key={item.id} />)
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
          {feedAd && user?.vip ? <AdSlot ad={feedAd} light /> : null}
        </aside>
      </div>
    </div>
  );
}
