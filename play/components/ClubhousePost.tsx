"use client";

import Link from "next/link";
import { initials } from "@/lib/format";
import type { Post } from "@/lib/types";
import { hasWorkoutStats } from "@/lib/fitness";
import { usePlay } from "@/lib/play-context";
import { ShareButton } from "./ShareButton";
import { WorkoutStatStrip } from "./WorkoutStatStrip";

export function ClubhousePost({ post }: { post: Post }) {
  const { user, repo, requireUser, showToast } = usePlay();

  async function comment(formData: FormData) {
    if (requireUser() || !user) return;
    const text = String(formData.get("comment") ?? "").trim();
    if (!text) return;
    await repo.addComment(post.id, text, user);
  }

  return (
    <article className="card post">
      <div className="hd">
        <div className={`av ${post.role === "Player" ? "" : "host"}`}>{initials(post.who)}</div>
        <div>
          <strong>
            {post.authorHandle ? (
              <Link href={`/players/${post.authorHandle}`}>{post.who}</Link>
            ) : (
              post.who
            )}
          </strong>
          <div className="small muted">
            {post.role} · {post.city}
            {post.sample ? " · sample" : ""}
          </div>
        </div>
      </div>
      <p>{post.text}</p>
      {post.imageDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="post-photo" src={post.imageDataUrl} alt="" />
      ) : null}
      {hasWorkoutStats(post.workout) ? <WorkoutStatStrip stats={post.workout!} /> : null}
      <div className="row">
        <button
          className="btn sm"
          type="button"
          aria-pressed={post.liked}
          onClick={() => repo.toggleLike(post.id)}
        >
          {post.liked ? "Liked" : "Like"} · <span className="num">{post.likes}</span>
        </button>
        <ShareButton body={post.text} path={`/p/${post.id}`} imageDataUrl={post.imageDataUrl || undefined} />
        {user && post.authorId !== user.id ? (
          <button
            className="btn sm"
            type="button"
            onClick={async () => {
              await repo.reportTarget(user.id, "post", post.id, "Clubhouse report");
              showToast("Report saved in this browser (demo)");
            }}
          >
            Report
          </button>
        ) : null}
      </div>
      <div className="comments">
        {post.comments.map((item) => (
          <p className="comment" key={item.id}>
            <strong>
              {item.authorHandle ? (
                <Link href={`/players/${item.authorHandle}`}>{item.authorName}</Link>
              ) : (
                item.authorName
              )}
            </strong>{" "}
            {item.text}
          </p>
        ))}
        <form className="comment-form" action={comment}>
          <label className="sr-only" htmlFor={`c-${post.id}`}>
            Comment
          </label>
          <input
            id={`c-${post.id}`}
            name="comment"
            type="text"
            placeholder="Write a comment"
            required
          />
          <button className="btn sm" type="submit">
            Comment
          </button>
        </form>
      </div>
    </article>
  );
}
